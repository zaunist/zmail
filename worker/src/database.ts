import { D1Database } from '@cloudflare/workers-types';
import {
  Mailbox,
  CreateMailboxParams,
  Email,
  SaveEmailParams,
  EmailListItem,
  Attachment,
  AttachmentListItem,
  SaveAttachmentParams,
  ApiKeyRecord,
  CreateApiKeyParams,
  UpdateApiKeyParams,
} from './types';
import {
  generateId,
  getCurrentTimestamp,
  calculateExpiryTimestamp,
  generateApiKey,
} from './utils';

// 附件分块大小（字节）
const CHUNK_SIZE = 500000; // 约500KB

/**
 * 初始化数据库
 */
export async function initializeDatabase(db: D1Database): Promise<void> {
  await db.exec(`CREATE TABLE IF NOT EXISTS mailboxes (id TEXT PRIMARY KEY, address TEXT UNIQUE NOT NULL, created_at INTEGER NOT NULL, expires_at INTEGER NOT NULL, ip_address TEXT, last_accessed INTEGER NOT NULL);`);
  await db.exec(`CREATE TABLE IF NOT EXISTS emails (id TEXT PRIMARY KEY, mailbox_id TEXT NOT NULL, from_address TEXT NOT NULL, from_name TEXT, to_address TEXT NOT NULL, subject TEXT, text_content TEXT, html_content TEXT, received_at INTEGER NOT NULL, has_attachments BOOLEAN DEFAULT FALSE, is_read BOOLEAN DEFAULT FALSE, FOREIGN KEY (mailbox_id) REFERENCES mailboxes(id) ON DELETE CASCADE);`);
  await db.exec(`CREATE TABLE IF NOT EXISTS attachments (id TEXT PRIMARY KEY, email_id TEXT NOT NULL, filename TEXT NOT NULL, mime_type TEXT NOT NULL, content TEXT, size INTEGER NOT NULL, created_at INTEGER NOT NULL, is_large BOOLEAN DEFAULT FALSE, chunks_count INTEGER DEFAULT 0, FOREIGN KEY (email_id) REFERENCES emails(id) ON DELETE CASCADE);`);
  await db.exec(`CREATE TABLE IF NOT EXISTS attachment_chunks (id TEXT PRIMARY KEY, attachment_id TEXT NOT NULL, chunk_index INTEGER NOT NULL, content TEXT NOT NULL, FOREIGN KEY (attachment_id) REFERENCES attachments(id) ON DELETE CASCADE);`);

  await db.exec(`CREATE TABLE IF NOT EXISTS api_keys (
    id TEXT PRIMARY KEY,
    key TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    quota INTEGER NOT NULL,
    usage INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL,
    expires_at INTEGER,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  );`);
  await db.exec(`CREATE INDEX IF NOT EXISTS idx_api_keys_key ON api_keys(key);`);
  await db.exec(`CREATE INDEX IF NOT EXISTS idx_api_keys_status ON api_keys(status);`);
  await db.exec(`CREATE INDEX IF NOT EXISTS idx_api_keys_created_at ON api_keys(created_at);`);

  await db.exec(`CREATE INDEX IF NOT EXISTS idx_mailboxes_expires_at ON mailboxes(expires_at);`);
  await db.exec(`CREATE INDEX IF NOT EXISTS idx_emails_mailbox_id ON emails(mailbox_id);`);
  await db.exec(`CREATE INDEX IF NOT EXISTS idx_emails_received_at ON emails(received_at);`);
  await db.exec(`CREATE INDEX IF NOT EXISTS idx_attachments_email_id ON attachments(email_id);`);
  await db.exec(`CREATE INDEX IF NOT EXISTS idx_attachment_chunks_attachment_id ON attachment_chunks(attachment_id);`);
  await db.exec(`CREATE INDEX IF NOT EXISTS idx_attachment_chunks_chunk_index ON attachment_chunks(chunk_index);`);
}

/** 创建邮箱 */
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
  await db.prepare(`INSERT INTO mailboxes (id, address, created_at, expires_at, ip_address, last_accessed) VALUES (?, ?, ?, ?, ?, ?)`).bind(
    mailbox.id,
    mailbox.address,
    mailbox.createdAt,
    mailbox.expiresAt,
    mailbox.ipAddress,
    mailbox.lastAccessed,
  ).run();
  return mailbox;
}

/** 获取邮箱 */
export async function getMailbox(db: D1Database, address: string): Promise<Mailbox | null> {
  const now = getCurrentTimestamp();
  const result = await db.prepare(`SELECT id, address, created_at, expires_at, ip_address, last_accessed FROM mailboxes WHERE address = ? AND expires_at > ?`).bind(address, now).first();
  if (!result) return null;
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

/** 获取 IP 下所有邮箱 */
export async function getMailboxes(db: D1Database, ipAddress: string): Promise<Mailbox[]> {
  const now = getCurrentTimestamp();
  const results = await db.prepare(`SELECT id, address, created_at, expires_at, ip_address, last_accessed FROM mailboxes WHERE ip_address = ? AND expires_at > ? ORDER BY created_at DESC`).bind(ipAddress, now).all();
  if (!results.results) return [];
  return results.results.map((row) => ({
    id: row.id as string,
    address: row.address as string,
    createdAt: row.created_at as number,
    expiresAt: row.expires_at as number,
    ipAddress: row.ip_address as string,
    lastAccessed: row.last_accessed as number,
  }));
}

/** 删除邮箱 */
export async function deleteMailbox(db: D1Database, address: string): Promise<void> {
  await db.prepare(`DELETE FROM mailboxes WHERE address = ?`).bind(address).run();
}

/** 清理孤立附件 */
async function cleanupOrphanedAttachments(db: D1Database): Promise<number> {
  try {
    const res = await db.prepare(`
      SELECT a.id FROM attachments a
      LEFT JOIN emails e ON a.email_id = e.id
      WHERE e.id IS NULL
    `).all<{ id: string }>();
    if (!res.results || res.results.length === 0) return 0;
    const ids = res.results.map((r) => r.id);
    const placeholders = ids.map(() => '?').join(',');
    await db.prepare(`DELETE FROM attachment_chunks WHERE attachment_id IN (${placeholders})`).bind(...ids).run();
    const del = await db.prepare(`DELETE FROM attachments WHERE id IN (${placeholders})`).bind(...ids).run();
    return del.meta?.changes || 0;
  } catch {
    return 0;
  }
}

/** 清理过期邮箱 */
export async function cleanupExpiredMailboxes(db: D1Database): Promise<number> {
  const now = getCurrentTimestamp();
  const res = await db.prepare(`DELETE FROM mailboxes WHERE expires_at <= ?`).bind(now).run();
  await cleanupOrphanedAttachments(db);
  return res.meta?.changes || 0;
}

/** 清理过期邮件 */
export async function cleanupExpiredMails(db: D1Database): Promise<number> {
  const now = getCurrentTimestamp();
  const oneDayAgo = now - 24 * 60 * 60;
  const res = await db.prepare(`DELETE FROM emails WHERE received_at <= ?`).bind(oneDayAgo).run();
  await cleanupOrphanedAttachments(db);
  return res.meta?.changes || 0;
}

/** 清理已读邮件 */
export async function cleanupReadMails(db: D1Database): Promise<number> {
  const res = await db.prepare(`DELETE FROM emails WHERE is_read = 1`).run();
  await cleanupOrphanedAttachments(db);
  return res.meta?.changes || 0;
}

/** 保存邮件 */
export async function saveEmail(db: D1Database, params: SaveEmailParams): Promise<Email> {
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
  await db.prepare(`INSERT INTO emails (id, mailbox_id, from_address, from_name, to_address, subject, text_content, html_content, received_at, has_attachments, is_read) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
    .bind(email.id, email.mailboxId, email.fromAddress, email.fromName, email.toAddress, email.subject, email.textContent, email.htmlContent, email.receivedAt, email.hasAttachments ? 1 : 0, email.isRead ? 1 : 0)
    .run();
  return email;
}

/** 保存附件 */
export async function saveAttachment(db: D1Database, params: SaveAttachmentParams): Promise<Attachment> {
  const now = getCurrentTimestamp();
  const attachmentId = generateId();
  const isLarge = params.content.length > CHUNK_SIZE;
  if (isLarge) {
    const chunksCount = Math.ceil(params.content.length / CHUNK_SIZE);
    const attachment: Attachment = {
      id: attachmentId,
      emailId: params.emailId,
      filename: params.filename,
      mimeType: params.mimeType,
      content: '',
      size: params.size,
      createdAt: now,
      isLarge: true,
      chunksCount,
    };
    await db.prepare(`INSERT INTO attachments (id, email_id, filename, mime_type, content, size, created_at, is_large, chunks_count) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`)
      .bind(attachment.id, attachment.emailId, attachment.filename, attachment.mimeType, attachment.content, attachment.size, attachment.createdAt, 1, attachment.chunksCount)
      .run();
    for (let i = 0; i < chunksCount; i++) {
      const chunkContent = params.content.substring(i * CHUNK_SIZE, Math.min((i + 1) * CHUNK_SIZE, params.content.length));
      await db.prepare(`INSERT INTO attachment_chunks (id, attachment_id, chunk_index, content) VALUES (?, ?, ?, ?)`)
        .bind(generateId(), attachment.id, i, chunkContent)
        .run();
    }
    return attachment;
  }
  const attachment: Attachment = {
    id: attachmentId,
    emailId: params.emailId,
    filename: params.filename,
    mimeType: params.mimeType,
    content: params.content,
    size: params.size,
    createdAt: now,
    isLarge: false,
    chunksCount: 0,
  };
  await db.prepare(`INSERT INTO attachments (id, email_id, filename, mime_type, content, size, created_at, is_large, chunks_count) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`)
    .bind(attachment.id, attachment.emailId, attachment.filename, attachment.mimeType, attachment.content, attachment.size, attachment.createdAt, 0, 0)
    .run();
  return attachment;
}

/** 获取邮件列表 */
export async function getEmails(db: D1Database, mailboxId: string): Promise<EmailListItem[]> {
  const res = await db.prepare(`SELECT id, mailbox_id, from_address, from_name, to_address, subject, received_at, has_attachments, is_read FROM emails WHERE mailbox_id = ? ORDER BY received_at DESC`).bind(mailboxId).all();
  if (!res.results) return [];
  return res.results.map((row) => ({
    id: row.id as string,
    mailboxId: row.mailbox_id as string,
    fromAddress: row.from_address as string,
    fromName: row.from_name as string,
    toAddress: row.to_address as string,
    subject: row.subject as string,
    receivedAt: row.received_at as number,
    hasAttachments: !!row.has_attachments,
    isRead: !!row.is_read,
  }));
}

/** 获取邮件详情 */
export async function getEmail(db: D1Database, id: string): Promise<Email | null> {
  const row = await db.prepare(`SELECT id, mailbox_id, from_address, from_name, to_address, subject, text_content, html_content, received_at, has_attachments, is_read FROM emails WHERE id = ?`).bind(id).first();
  if (!row) return null;
  await db.prepare(`UPDATE emails SET is_read = 1 WHERE id = ?`).bind(id).run();
  return {
    id: row.id as string,
    mailboxId: row.mailbox_id as string,
    fromAddress: row.from_address as string,
    fromName: row.from_name as string,
    toAddress: row.to_address as string,
    subject: row.subject as string,
    textContent: row.text_content as string,
    htmlContent: row.html_content as string,
    receivedAt: row.received_at as number,
    hasAttachments: !!row.has_attachments,
    isRead: true,
  };
}

/** 获取附件列表 */
export async function getAttachments(db: D1Database, emailId: string): Promise<AttachmentListItem[]> {
  const res = await db.prepare(`SELECT id, email_id, filename, mime_type, size, created_at, is_large, chunks_count FROM attachments WHERE email_id = ? ORDER BY created_at ASC`).bind(emailId).all();
  if (!res.results) return [];
  return res.results.map((row) => ({
    id: row.id as string,
    emailId: row.email_id as string,
    filename: row.filename as string,
    mimeType: row.mime_type as string,
    size: row.size as number,
    createdAt: row.created_at as number,
    isLarge: !!row.is_large,
    chunksCount: row.chunks_count as number,
  }));
}

/** 获取附件详情 */
export async function getAttachment(db: D1Database, id: string): Promise<Attachment | null> {
  const row = await db.prepare(`SELECT id, email_id, filename, mime_type, content, size, created_at, is_large, chunks_count FROM attachments WHERE id = ?`).bind(id).first();
  if (!row) return null;
  let content = row.content as string;
  const isLarge = !!row.is_large;
  if (isLarge) {
    content = await getAttachmentContent(db, id, row.chunks_count as number);
  }
  return {
    id: row.id as string,
    emailId: row.email_id as string,
    filename: row.filename as string,
    mimeType: row.mime_type as string,
    content,
    size: row.size as number,
    createdAt: row.created_at as number,
    isLarge,
    chunksCount: row.chunks_count as number,
  };
}

/** 获取大型附件内容 */
async function getAttachmentContent(db: D1Database, attachmentId: string, chunksCount: number): Promise<string> {
  let content = '';
  for (let i = 0; i < chunksCount; i++) {
    const chunk = await db.prepare(`SELECT content FROM attachment_chunks WHERE attachment_id = ? AND chunk_index = ?`).bind(attachmentId, i).first();
    if (chunk && chunk.content) content += chunk.content as string;
  }
  return content;
}

/** 删除邮件 */
export async function deleteEmail(db: D1Database, id: string): Promise<void> {
  await db.prepare(`DELETE FROM emails WHERE id = ?`).bind(id).run();
}

// ---------------- API Keys ----------------
function mapApiKey(row: any): ApiKeyRecord {
  return {
    id: row.id as string,
    key: row.key as string,
    name: row.name as string,
    quota: Number(row.quota),
    usage: Number(row.usage),
    status: row.status as ApiKeyRecord['status'],
    expiresAt: row.expires_at === null || row.expires_at === undefined ? null : Number(row.expires_at),
    createdAt: Number(row.created_at),
    updatedAt: Number(row.updated_at),
  };
}

export async function createApiKey(db: D1Database, params: CreateApiKeyParams): Promise<ApiKeyRecord> {
  const now = getCurrentTimestamp();
  const record: ApiKeyRecord = {
    id: generateId(),
    key: generateApiKey(),
    name: params.name,
    quota: params.quota,
    usage: 0,
    status: params.status || 'active',
    expiresAt: params.expiresAt ?? null,
    createdAt: now,
    updatedAt: now,
  };
  await db
    .prepare(`INSERT INTO api_keys (id, key, name, quota, usage, status, expires_at, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`)
    .bind(record.id, record.key, record.name, record.quota, record.usage, record.status, record.expiresAt, record.createdAt, record.updatedAt)
    .run();
  return record;
}

export async function listApiKeys(db: D1Database): Promise<ApiKeyRecord[]> {
  const res = await db.prepare(`SELECT * FROM api_keys ORDER BY created_at DESC`).all();
  if (!res.results) return [];
  return res.results.map(mapApiKey);
}

export async function getApiKeyByKey(db: D1Database, key: string): Promise<ApiKeyRecord | null> {
  const row = await db.prepare(`SELECT * FROM api_keys WHERE key = ?`).bind(key).first();
  return row ? mapApiKey(row) : null;
}

export async function getApiKeyById(db: D1Database, id: string): Promise<ApiKeyRecord | null> {
  const row = await db.prepare(`SELECT * FROM api_keys WHERE id = ?`).bind(id).first();
  return row ? mapApiKey(row) : null;
}

export async function updateApiKey(db: D1Database, params: UpdateApiKeyParams): Promise<ApiKeyRecord | null> {
  const existingRow = await db.prepare(`SELECT * FROM api_keys WHERE id = ?`).bind(params.id).first();
  if (!existingRow) return null;
  const now = getCurrentTimestamp();
  const existing = mapApiKey(existingRow);
  const merged: ApiKeyRecord = {
    ...existing,
    name: params.name ?? existing.name,
    quota: params.quota ?? existing.quota,
    expiresAt: params.expiresAt === undefined ? existing.expiresAt : params.expiresAt,
    status: params.status ?? existing.status,
    updatedAt: now,
  };
  await db
    .prepare(`UPDATE api_keys SET name = ?, quota = ?, expires_at = ?, status = ?, updated_at = ? WHERE id = ?`)
    .bind(merged.name, merged.quota, merged.expiresAt, merged.status, merged.updatedAt, merged.id)
    .run();
  return merged;
}

export async function disableApiKey(db: D1Database, id: string): Promise<void> {
  const now = getCurrentTimestamp();
  await db.prepare(`UPDATE api_keys SET status = 'disabled', updated_at = ? WHERE id = ?`).bind(now, id).run();
}

export async function incrementUsageIfUnderQuota(db: D1Database, key: string, now: number): Promise<ApiKeyRecord | null> {
  const res = await db
    .prepare(`UPDATE api_keys SET usage = usage + 1, updated_at = ? WHERE key = ? AND status = 'active' AND (expires_at IS NULL OR expires_at > ?) AND usage < quota`)
    .bind(now, key, now)
    .run();
  if (!res.meta || res.meta.changes !== 1) return null;
  return await getApiKeyByKey(db, key);
}
