import { D1Database } from '@cloudflare/workers-types';

// 环境变量类型
export interface Env {
  DB: D1Database;
  VITE_EMAIL_DOMAIN?: string;
}

// 邮箱类型
export interface Mailbox {
  id: string;
  address: string;
  createdAt: number;
  expiresAt: number;
  ipAddress: string;
  lastAccessed: number;
}

// 创建邮箱参数
export interface CreateMailboxParams {
  address: string;
  expiresInHours: number;
  ipAddress: string;
}

// 邮件类型
export interface Email {
  id: string;
  mailboxId: string;
  fromAddress: string;
  fromName: string;
  toAddress: string;
  subject: string;
  textContent?: string;
  htmlContent?: string;
  receivedAt: number;
  hasAttachments: boolean;
  isRead: boolean;
}

// 保存邮件参数
export interface SaveEmailParams {
  mailboxId: string;
  fromAddress: string;
  fromName?: string;
  toAddress: string;
  subject?: string;
  textContent?: string;
  htmlContent?: string;
  hasAttachments?: boolean;
}

// 邮件列表项（不包含内容）
export interface EmailListItem {
  id: string;
  mailboxId: string;
  fromAddress: string;
  fromName: string;
  toAddress: string;
  subject: string;
  receivedAt: number;
  hasAttachments: boolean;
  isRead: boolean;
}

// 附件类型
export interface Attachment {
  id: string;
  emailId: string;
  filename: string;
  mimeType: string;
  content: string; // Base64编码的内容，仅用于小型附件
  size: number;
  createdAt: number;
  isLarge: boolean; // 是否为大型附件
  chunksCount: number; // 分块数量
}

// 附件块类型
export interface AttachmentChunk {
  id: string;
  attachmentId: string;
  chunkIndex: number;
  content: string; // 分块的Base64内容
}

// 附件列表项（不包含内容）
export interface AttachmentListItem {
  id: string;
  emailId: string;
  filename: string;
  mimeType: string;
  size: number;
  createdAt: number;
  isLarge: boolean;
  chunksCount: number;
}

// 保存附件参数
export interface SaveAttachmentParams {
  emailId: string;
  filename: string;
  mimeType: string;
  content: string; // Base64编码的内容
  size: number;
}

// API 响应类型
export interface ApiResponse {
  success: boolean;
  error?: string;
  message?: string;
  [key: string]: any;
}

// 解析后的邮件类型
export interface ParsedEmail {
  html?: string;
  text?: string;
  subject?: string;
  from: {
    address: string;
    name?: string;
  };
  to: Array<{
    address: string;
    name?: string;
  }>;
  attachments?: Array<{
    filename: string;
    mimeType: string;
    content: ArrayBuffer;
    size?: number;
  }>;
}

// 发送邮件参数
export interface SendEmailParams {
  fromAddress: string;  // 发件人地址（临时邮箱地址）
  toAddress: string;    // 收件人地址
  toName?: string;      // 收件人名称
  subject: string;      // 邮件主题
  textContent?: string; // 纯文本内容
  htmlContent?: string; // HTML内容
}