import { D1Database } from '@cloudflare/workers-types';
import { 
  Mailbox, 
  CreateMailboxParams, 
  Email, 
  SaveEmailParams, 
  EmailListItem,
  Attachment,
  AttachmentListItem,
  SaveAttachmentParams
} from './types';
import { 
  generateId, 
  getCurrentTimestamp, 
  calculateExpiryTimestamp 
} from './utils';

// 附件分块大小（字节）
const CHUNK_SIZE = 500000; // 约500KB

/**
 * 初始化数据库
 * @param db 数据库实例
 */
export async function initializeDatabase(db: D1Database): Promise<void> {
  try {
    // 创建邮箱表
    await db.exec(`CREATE TABLE IF NOT EXISTS mailboxes (id TEXT PRIMARY KEY, address TEXT UNIQUE NOT NULL, created_at INTEGER NOT NULL, expires_at INTEGER NOT NULL, ip_address TEXT, last_accessed INTEGER NOT NULL);`);
    
    // 创建邮件表
    await db.exec(`CREATE TABLE IF NOT EXISTS emails (id TEXT PRIMARY KEY, mailbox_id TEXT NOT NULL, from_address TEXT NOT NULL, from_name TEXT, to_address TEXT NOT NULL, subject TEXT, text_content TEXT, html_content TEXT, received_at INTEGER NOT NULL, has_attachments BOOLEAN DEFAULT FALSE, is_read BOOLEAN DEFAULT FALSE, FOREIGN KEY (mailbox_id) REFERENCES mailboxes(id) ON DELETE CASCADE);`);
    
    // 创建附件表
    await db.exec(`CREATE TABLE IF NOT EXISTS attachments (id TEXT PRIMARY KEY, email_id TEXT NOT NULL, filename TEXT NOT NULL, mime_type TEXT NOT NULL, content TEXT, size INTEGER NOT NULL, created_at INTEGER NOT NULL, is_large BOOLEAN DEFAULT FALSE, chunks_count INTEGER DEFAULT 0, FOREIGN KEY (email_id) REFERENCES emails(id) ON DELETE CASCADE);`);
    
    // 创建附件块表
    await db.exec(`CREATE TABLE IF NOT EXISTS attachment_chunks (id TEXT PRIMARY KEY, attachment_id TEXT NOT NULL, chunk_index INTEGER NOT NULL, content TEXT NOT NULL, FOREIGN KEY (attachment_id) REFERENCES attachments(id) ON DELETE CASCADE);`);
    
    // 创建索引
    await db.exec(`CREATE INDEX IF NOT EXISTS idx_mailboxes_address ON mailboxes(address);`);
    await db.exec(`CREATE INDEX IF NOT EXISTS idx_mailboxes_expires_at ON mailboxes(expires_at);`);
    await db.exec(`CREATE INDEX IF NOT EXISTS idx_emails_mailbox_id ON emails(mailbox_id);`);
    await db.exec(`CREATE INDEX IF NOT EXISTS idx_emails_received_at ON emails(received_at);`);
    await db.exec(`CREATE INDEX IF NOT EXISTS idx_attachments_email_id ON attachments(email_id);`);
    await db.exec(`CREATE INDEX IF NOT EXISTS idx_attachment_chunks_attachment_id ON attachment_chunks(attachment_id);`);
    await db.exec(`CREATE INDEX IF NOT EXISTS idx_attachment_chunks_chunk_index ON attachment_chunks(chunk_index);`);
    
    console.log('数据库初始化成功');
  } catch (error) {
    console.error('数据库初始化失败:', error);
    // 抛出错误，让上层处理
    throw new Error(`数据库初始化失败: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * 创建邮箱
 * @param db 数据库实例
 * @param params 参数
 * @returns 创建的邮箱
 */
export async function createMailbox(db: D1Database, params: CreateMailboxParams): Promise<Mailbox> {
  const now = getCurrentTimestamp();
  const mailbox: Mailbox = {
    id: generateId(),
    address: params.address,
    createdAt: now,
    expiresAt: calculateExpiryTimestamp(params.expiresInHours),
    ipAddress: params.ipAddress,
    lastAccessed: now,
  };
  
  await db.prepare(`INSERT INTO mailboxes (id, address, created_at, expires_at, ip_address, last_accessed) VALUES (?, ?, ?, ?, ?, ?)`).bind(mailbox.id, mailbox.address, mailbox.createdAt, mailbox.expiresAt, mailbox.ipAddress, mailbox.lastAccessed).run();
  
  return mailbox;
}

/**
 * 获取邮箱信息
 * @param db 数据库实例
 * @param address 邮箱地址
 * @returns 邮箱信息
 */
export async function getMailbox(db: D1Database, address: string): Promise<Mailbox | null> {
  const now = getCurrentTimestamp();
  const result = await db.prepare(`SELECT id, address, created_at, expires_at, ip_address, last_accessed FROM mailboxes WHERE address = ? AND expires_at > ?`).bind(address, now).first();
  
  if (!result) return null;
  
  // 更新最后访问时间
  await db.prepare(`UPDATE mailboxes SET last_accessed = ? WHERE id = ?`).bind(now, result.id).run();
  
  return {
    id: result.id as string,
    address: result.address as string,
    createdAt: result.created_at as number,
    expiresAt: result.expires_at as number,
    ipAddress: result.ip_address as string,
    lastAccessed: now,
  };
}

/**
 * 获取用户的所有邮箱
 * @param db 数据库实例
 * @param ipAddress IP地址
 * @returns 邮箱列表
 */
export async function getMailboxes(db: D1Database, ipAddress: string): Promise<Mailbox[]> {
  const now = getCurrentTimestamp();
  const results = await db.prepare(`SELECT id, address, created_at, expires_at, ip_address, last_accessed FROM mailboxes WHERE ip_address = ? AND expires_at > ? ORDER BY created_at DESC`).bind(ipAddress, now).all();
  
  if (!results.results) return [];
  
  return results.results.map(result => ({
    id: result.id as string,
    address: result.address as string,
    createdAt: result.created_at as number,
    expiresAt: result.expires_at as number,
    ipAddress: result.ip_address as string,
    lastAccessed: result.last_accessed as number,
  }));
}

/**
 * 删除邮箱
 * @param db 数据库实例
 * @param address 邮箱地址
 */
export async function deleteMailbox(db: D1Database, address: string): Promise<void> {
  // [feat] 由于外键设置了 ON DELETE CASCADE，直接删除邮箱即可级联删除相关邮件和附件
  await db.prepare(`DELETE FROM mailboxes WHERE address = ?`).bind(address).run();
}

/**
 * 清理孤立的附件（没有关联到任何邮件的附件）
 * @param db 数据库实例
 * @returns 删除的附件数量
 */
async function cleanupOrphanedAttachments(db: D1Database): Promise<number> {
    // [refactor] 优化孤立附件的清理逻辑
    try {
        // 一次性查询所有孤立附件及其分块信息
        const orphanedAttachmentsResult = await db.prepare(`
            SELECT a.id 
            FROM attachments a 
            LEFT JOIN emails e ON a.email_id = e.id 
            WHERE e.id IS NULL
        `).all<{ id: string }>();

        if (!orphanedAttachmentsResult.results || orphanedAttachmentsResult.results.length === 0) {
            return 0;
        }

        const attachmentIds = orphanedAttachmentsResult.results.map(row => row.id);
        const placeholders = attachmentIds.map(() => '?').join(',');

        console.log(`找到 ${attachmentIds.length} 个孤立附件，准备清理...`);

        // 批量删除附件分块
        await db.prepare(`DELETE FROM attachment_chunks WHERE attachment_id IN (${placeholders})`).bind(...attachmentIds).run();
        console.log(`已清理孤立附件的所有分块`);

        // 批量删除附件记录
        const deleteResult = await db.prepare(`DELETE FROM attachments WHERE id IN (${placeholders})`).bind(...attachmentIds).run();
        const deletedCount = deleteResult.meta?.changes || 0;
        console.log(`已清理 ${deletedCount} 个孤立附件记录`);

        return deletedCount;
    } catch (error) {
        console.error('清理孤立附件时出错:', error);
        return 0;
    }
}

/**
 * 清理过期邮箱
 * @param db 数据库实例
 * @returns 删除的邮箱数量
 */
export async function cleanupExpiredMailboxes(db: D1Database): Promise<number> {
  const now = getCurrentTimestamp();
  // [refactor] 由于数据库 schema 中设置了 ON DELETE CASCADE，
  // 删除 mailboxes 表中的记录会自动删除 emails, attachments, 和 attachment_chunks 中所有相关的记录。
  // 这大大简化了清理逻辑，并提高了性能。
  const result = await db.prepare(`DELETE FROM mailboxes WHERE expires_at <= ?`).bind(now).run();
  
  // 清理可能由于异常情况产生的孤立附件
  await cleanupOrphanedAttachments(db);
  
  return result.meta?.changes || 0;
}

/**
 * 清理过期邮件
 * @param db 数据库实例
 * @returns 删除的邮件数量
 */
export async function cleanupExpiredMails(db: D1Database): Promise<number> {
  const now = getCurrentTimestamp();
  const oneDayAgo = now - 24 * 60 * 60; // 24小时前的时间戳（秒）
  
  // [refactor] 同样利用 ON DELETE CASCADE 特性简化逻辑
  const result = await db.prepare(`DELETE FROM emails WHERE received_at <= ?`).bind(oneDayAgo).run();
  
  await cleanupOrphanedAttachments(db);
  
  return result.meta?.changes || 0;
}

/**
 * 清理已被阅读的邮件
 * @param db 数据库实例
 * @returns 删除的邮件数量
 */
export async function cleanupReadMails(db: D1Database): Promise<number> {
  // [refactor] 同样利用 ON DELETE CASCADE 特性简化逻辑
  const result = await db.prepare(`DELETE FROM emails WHERE is_read = 1`).run();
  
  await cleanupOrphanedAttachments(db);
  
  return result.meta?.changes || 0;
}

/**
 * 清理指定邮件的所有附件
 * @param db 数据库实例
 * @param emailId 邮件ID
 */
async function cleanupAttachments(db: D1Database, emailId: string): Promise<void> {
  // [refactor] 利用 ON DELETE CASCADE，此函数在删除邮件时不再需要手动调用。
  // 但保留此函数以备其他需要单独清理附件的场景。
  try {
    // 获取邮件的所有附件ID
    const attachmentsResult = await db.prepare(`SELECT id FROM attachments WHERE email_id = ?`).bind(emailId).all<{ id: string }>();
    
    if (attachmentsResult.results && attachmentsResult.results.length > 0) {
      const attachmentIds = attachmentsResult.results.map(row => row.id);
      const placeholders = attachmentIds.map(() => '?').join(',');

      console.log(`邮件 ${emailId} 有 ${attachmentIds.length} 个附件需要清理`);
      
      // 批量删除所有分块
      await db.prepare(`DELETE FROM attachment_chunks WHERE attachment_id IN (${placeholders})`).bind(...attachmentIds).run();
      console.log(`已清理附件的所有分块`);
      
      // 批量删除所有附件记录
      await db.prepare(`DELETE FROM attachments WHERE id IN (${placeholders})`).bind(...attachmentIds).run();
      console.log(`已清理邮件 ${emailId} 的所有附件`);
    }
  } catch (error) {
    console.error(`清理邮件 ${emailId} 的附件时出错:`, error);
  }
}

/**
 * 保存邮件
 * @param db 数据库实例
 * @param params 参数
 * @returns 保存的邮件
 */
export async function saveEmail(db: D1Database, params: SaveEmailParams): Promise<Email> {
  try {
    console.log('开始保存邮件...');
    
    const now = getCurrentTimestamp();
    const email: Email = {
      id: generateId(),
      mailboxId: params.mailboxId,
      fromAddress: params.fromAddress,
      fromName: params.fromName || '',
      toAddress: params.toAddress,
      subject: params.subject || '',
      textContent: params.textContent || '',
      htmlContent: params.htmlContent || '',
      receivedAt: now,
      hasAttachments: params.hasAttachments || false,
      isRead: false,
    };
    
    console.log('准备插入邮件:', email.id);
    
    await db.prepare(`INSERT INTO emails (id, mailbox_id, from_address, from_name, to_address, subject, text_content, html_content, received_at, has_attachments, is_read) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).bind(email.id, email.mailboxId, email.fromAddress, email.fromName, email.toAddress, email.subject, email.textContent, email.htmlContent, email.receivedAt, email.hasAttachments ? 1 : 0, email.isRead ? 1 : 0).run();
    
    console.log('邮件保存成功:', email.id);
    
    return email;
  } catch (error) {
    console.error('保存邮件失败:', error);
    throw new Error(`保存邮件失败: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * 保存附件
 * @param db 数据库实例
 * @param params 参数
 * @returns 保存的附件
 */
export async function saveAttachment(db: D1Database, params: SaveAttachmentParams): Promise<Attachment> {
  try {
    console.log('开始保存附件...');
    
    const now = getCurrentTimestamp();
    const attachmentId = generateId();
    
    // 检查附件大小，决定是否需要分块存储
    const isLarge = params.content.length > CHUNK_SIZE;
    console.log(`附件大小: ${params.content.length} 字节, 是否为大型附件: ${isLarge}`);
    
    if (isLarge) {
      // 大型附件，需要分块存储
      const contentLength = params.content.length;
      const chunksCount = Math.ceil(contentLength / CHUNK_SIZE);
      console.log(`将附件分为 ${chunksCount} 块存储`);
      
      // 创建附件记录，但不存储内容
      const attachment: Attachment = {
        id: attachmentId,
        emailId: params.emailId,
        filename: params.filename,
        mimeType: params.mimeType,
        content: '', // 大型附件不在主表存储内容
        size: params.size,
        createdAt: now,
        isLarge: true,
        chunksCount: chunksCount
      };
      
      // 插入附件记录
      await db.prepare(`INSERT INTO attachments (id, email_id, filename, mime_type, content, size, created_at, is_large, chunks_count) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`).bind(attachment.id, attachment.emailId, attachment.filename, attachment.mimeType, attachment.content, attachment.size, attachment.createdAt, attachment.isLarge ? 1 : 0, attachment.chunksCount).run();
      
      // 分块存储附件内容
      for (let i = 0; i < chunksCount; i++) {
        const start = i * CHUNK_SIZE;
        const end = Math.min(start + CHUNK_SIZE, contentLength);
        const chunkContent = params.content.substring(start, end);
        const chunkId = generateId();
        
        await db.prepare(`INSERT INTO attachment_chunks (id, attachment_id, chunk_index, content) VALUES (?, ?, ?, ?)`).bind(chunkId, attachment.id, i, chunkContent).run();
        console.log(`保存附件块 ${i+1}/${chunksCount}`);
      }
      
      console.log('大型附件保存成功:', attachment.id);
      return attachment;
    } else {
      // 小型附件，直接存储
      const attachment: Attachment = {
        id: attachmentId,
        emailId: params.emailId,
        filename: params.filename,
        mimeType: params.mimeType,
        content: params.content,
        size: params.size,
        createdAt: now,
        isLarge: false,
        chunksCount: 0
      };
      
      await db.prepare(`INSERT INTO attachments (id, email_id, filename, mime_type, content, size, created_at, is_large, chunks_count) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`).bind(attachment.id, attachment.emailId, attachment.filename, attachment.mimeType, attachment.content, attachment.size, attachment.createdAt, attachment.isLarge ? 1 : 0, attachment.chunksCount).run();
      
      console.log('小型附件保存成功:', attachment.id);
      return attachment;
    }
  } catch (error) {
    console.error('保存附件失败:', error);
    throw new Error(`保存附件失败: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * 获取邮件列表
 * @param db 数据库实例
 * @param mailboxId 邮箱ID
 * @returns 邮件列表
 */
export async function getEmails(db: D1Database, mailboxId: string): Promise<EmailListItem[]> {
  const results = await db.prepare(`SELECT id, mailbox_id, from_address, from_name, to_address, subject, received_at, has_attachments, is_read FROM emails WHERE mailbox_id = ? ORDER BY received_at DESC`).bind(mailboxId).all();
  
  if (!results.results) return [];
  
  return results.results.map(result => ({
    id: result.id as string,
    mailboxId: result.mailbox_id as string,
    fromAddress: result.from_address as string,
    fromName: result.from_name as string,
    toAddress: result.to_address as string,
    subject: result.subject as string,
    receivedAt: result.received_at as number,
    hasAttachments: !!result.has_attachments,
    isRead: !!result.is_read,
  }));
}

/**
 * 获取邮件详情
 * @param db 数据库实例
 * @param id 邮件ID
 * @returns 邮件详情
 */
export async function getEmail(db: D1Database, id: string): Promise<Email | null> {
  const result = await db.prepare(`SELECT id, mailbox_id, from_address, from_name, to_address, subject, text_content, html_content, received_at, has_attachments, is_read FROM emails WHERE id = ?`).bind(id).first();
  
  if (!result) return null;
  
  // 标记为已读
  await db.prepare(`UPDATE emails SET is_read = 1 WHERE id = ?`).bind(id).run();
  
  return {
    id: result.id as string,
    mailboxId: result.mailbox_id as string,
    fromAddress: result.from_address as string,
    fromName: result.from_name as string,
    toAddress: result.to_address as string,
    subject: result.subject as string,
    textContent: result.text_content as string,
    htmlContent: result.html_content as string,
    receivedAt: result.received_at as number,
    hasAttachments: !!result.has_attachments,
    isRead: true,
  };
}

/**
 * 获取附件列表
 * @param db 数据库实例
 * @param emailId 邮件ID
 * @returns 附件列表
 */
export async function getAttachments(db: D1Database, emailId: string): Promise<AttachmentListItem[]> {
  const results = await db.prepare(`SELECT id, email_id, filename, mime_type, size, created_at, is_large, chunks_count FROM attachments WHERE email_id = ? ORDER BY created_at ASC`).bind(emailId).all();
  
  if (!results.results) return [];
  
  return results.results.map(result => ({
    id: result.id as string,
    emailId: result.email_id as string,
    filename: result.filename as string,
    mimeType: result.mime_type as string,
    size: result.size as number,
    createdAt: result.created_at as number,
    isLarge: !!result.is_large,
    chunksCount: result.chunks_count as number
  }));
}

/**
 * 获取附件详情
 * @param db 数据库实例
 * @param id 附件ID
 * @returns 附件详情
 */
export async function getAttachment(db: D1Database, id: string): Promise<Attachment | null> {
  const result = await db.prepare(`SELECT id, email_id, filename, mime_type, content, size, created_at, is_large, chunks_count FROM attachments WHERE id = ?`).bind(id).first();
  
  if (!result) return null;
  
  const isLarge = !!result.is_large;
  let content = result.content as string;
  
  // 如果是大型附件，需要从块表中获取内容
  if (isLarge) {
    const chunksCount = result.chunks_count as number;
    content = await getAttachmentContent(db, id, chunksCount);
  }
  
  return {
    id: result.id as string,
    emailId: result.email_id as string,
    filename: result.filename as string,
    mimeType: result.mime_type as string,
    content: content,
    size: result.size as number,
    createdAt: result.created_at as number,
    isLarge: isLarge,
    chunksCount: result.chunks_count as number
  };
}

/**
 * 获取大型附件的内容
 * @param db 数据库实例
 * @param attachmentId 附件ID
 * @param chunksCount 块数量
 * @returns 完整的附件内容
 */
async function getAttachmentContent(db: D1Database, attachmentId: string, chunksCount: number): Promise<string> {
  let content = '';
  
  // 按顺序获取所有块
  for (let i = 0; i < chunksCount; i++) {
    const chunk = await db.prepare(`SELECT content FROM attachment_chunks WHERE attachment_id = ? AND chunk_index = ?`).bind(attachmentId, i).first();
    if (chunk && chunk.content) {
      content += chunk.content as string;
    }
  }
  
  return content;
}

/**
 * 删除邮件
 * @param db 数据库实例
 * @param id 邮件ID
 */
export async function deleteEmail(db: D1Database, id: string): Promise<void> {
  // [refactor] 由于外键设置了 ON DELETE CASCADE，直接删除邮件即可
  await db.prepare(`DELETE FROM emails WHERE id = ?`).bind(id).run();
}