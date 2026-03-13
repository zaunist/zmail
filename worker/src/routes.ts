import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { Env } from './types';
import {
  createMailbox,
  getMailbox,
  deleteMailbox,
  getEmails,
  getEmail,
  deleteEmail,
  getAttachments,
  getAttachment,
  createApiKey,
  listApiKeys,
  getApiKeyByKey,
  getApiKeyById,
  updateApiKey,
  disableApiKey,
  incrementUsageIfUnderQuota,
} from './database';
import { generateRandomAddress, getCurrentTimestamp } from './utils';

const app = new Hono<{ Bindings: Env }>();

// CORS
app.use('/*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'x-api-key', 'Authorization'],
  maxAge: 86400,
}));

// Admin auth middleware
app.use('/admin/*', async (c, next) => {
  const token = c.req.header('Authorization');
  const expected = c.env.ADMIN_TOKEN;
  if (!expected) return c.json({ success: false, error: 'admin_token_missing' }, 401);
  if (!token || !token.startsWith('Bearer ')) return c.json({ success: false, error: 'unauthorized' }, 401);
  const provided = token.slice('Bearer '.length).trim();
  if (provided !== expected) return c.json({ success: false, error: 'unauthorized' }, 401);
  return next();
});

// API key middleware (anonymous allowed)
app.use('/api/*', async (c, next) => {
  const providedKey = c.req.header('x-api-key') || c.req.query('apiKey');
  if (!providedKey) return next();

  const now = getCurrentTimestamp();
  const incremented = await incrementUsageIfUnderQuota(c.env.DB, providedKey, now);
  if (incremented) return next();

  // fallback: check record to emit precise error
  const record = await getApiKeyByKey(c.env.DB, providedKey);
  if (record) {
    if (record.status !== 'active') return c.json({ success: false, error: 'unauthorized' }, 401);
    if (record.expiresAt !== null && record.expiresAt <= now) return c.json({ success: false, error: 'unauthorized' }, 401);
    if (record.usage >= record.quota) return c.json({ success: false, error: 'quota_exceeded' }, 429);
  }

  // legacy allowlist compatibility
  const legacy = (c.env.API_KEYS || '')
    .split(',')
    .map(k => k.trim())
    .filter(Boolean);
  if (legacy.length > 0 && legacy.includes(providedKey)) return next();

  return c.json({ success: false, error: 'unauthorized' }, 401);
});

// 健康检查
app.get('/', (c) => c.json({ status: 'ok', message: '临时邮箱系统API正常运行' }));

// 系统配置
app.get('/api/config', (c) => {
  const emailDomains = c.env.VITE_EMAIL_DOMAIN || '';
  const domains = emailDomains.split(',').map((d) => d.trim()).filter(Boolean);
  return c.json({ success: true, config: { emailDomains: domains } });
});

// 创建邮箱
app.post('/api/mailboxes', async (c) => {
  try {
    const body = await c.req.json();
    if (body.address && typeof body.address !== 'string') {
      return c.json({ success: false, error: '无效的邮箱地址' }, 400);
    }
    const expiresInHours = 24;
    const ip = c.req.header('CF-Connecting-IP') || 'unknown';
    const address = body.address || generateRandomAddress();
    const existing = await getMailbox(c.env.DB, address);
    if (existing) return c.json({ success: false, error: '邮箱地址已存在' }, 400);
    const mailbox = await createMailbox(c.env.DB, { address, expiresInHours, ipAddress: ip });
    return c.json({ success: true, mailbox });
  } catch (error) {
    console.error('创建邮箱失败:', error);
    return c.json({ success: false, error: '创建邮箱失败', message: error instanceof Error ? error.message : String(error) }, 400);
  }
});

// 获取邮箱信息
app.get('/api/mailboxes/:address', async (c) => {
  try {
    const address = c.req.param('address');
    const mailbox = await getMailbox(c.env.DB, address);
    if (!mailbox) return c.json({ success: false, error: '邮箱不存在' }, 404);
    return c.json({ success: true, mailbox });
  } catch (error) {
    console.error('获取邮箱失败:', error);
    return c.json({ success: false, error: '获取邮箱失败', message: error instanceof Error ? error.message : String(error) }, 500);
  }
});

// 删除邮箱
app.delete('/api/mailboxes/:address', async (c) => {
  try {
    const address = c.req.param('address');
    await deleteMailbox(c.env.DB, address);
    return c.json({ success: true });
  } catch (error) {
    console.error('删除邮箱失败:', error);
    return c.json({ success: false, error: '删除邮箱失败', message: error instanceof Error ? error.message : String(error) }, 500);
  }
});

// 获取邮件列表
app.get('/api/mailboxes/:address/emails', async (c) => {
  try {
    const address = c.req.param('address');
    const mailbox = await getMailbox(c.env.DB, address);
    if (!mailbox) return c.json({ success: false, error: '邮箱不存在' }, 404);
    const emails = await getEmails(c.env.DB, mailbox.id);
    return c.json({ success: true, emails });
  } catch (error) {
    console.error('获取邮件列表失败:', error);
    return c.json({ success: false, error: '获取邮件列表失败', message: error instanceof Error ? error.message : String(error) }, 500);
  }
});

// 获取邮件详情
app.get('/api/emails/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const email = await getEmail(c.env.DB, id);
    if (!email) return c.json({ success: false, error: '邮件不存在' }, 404);
    return c.json({ success: true, email });
  } catch (error) {
    console.error('获取邮件详情失败:', error);
    return c.json({ success: false, error: '获取邮件详情失败', message: error instanceof Error ? error.message : String(error) }, 500);
  }
});

// 获取邮件的附件列表
app.get('/api/emails/:id/attachments', async (c) => {
  try {
    const id = c.req.param('id');
    const email = await getEmail(c.env.DB, id);
    if (!email) return c.json({ success: false, error: '邮件不存在' }, 404);
    const attachments = await getAttachments(c.env.DB, id);
    return c.json({ success: true, attachments });
  } catch (error) {
    console.error('获取附件列表失败:', error);
    return c.json({ success: false, error: '获取附件列表失败', message: error instanceof Error ? error.message : String(error) }, 500);
  }
});

// 获取附件详情
app.get('/api/attachments/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const attachment = await getAttachment(c.env.DB, id);
    if (!attachment) return c.json({ success: false, error: '附件不存在' }, 404);
    const download = c.req.query('download') === 'true';
    if (download) {
      const binary = atob(attachment.content);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
      c.header('Content-Type', attachment.mimeType);
      c.header('Content-Disposition', `attachment; filename="${encodeURIComponent(attachment.filename)}"`);
      return c.body(bytes);
    }
    return c.json({ success: true, attachment: {
      id: attachment.id,
      emailId: attachment.emailId,
      filename: attachment.filename,
      mimeType: attachment.mimeType,
      size: attachment.size,
      createdAt: attachment.createdAt,
      isLarge: attachment.isLarge,
      chunksCount: attachment.chunksCount,
    }});
  } catch (error) {
    console.error('获取附件详情失败:', error);
    return c.json({ success: false, error: '获取附件详情失败', message: error instanceof Error ? error.message : String(error) }, 500);
  }
});

// 删除邮件
app.delete('/api/emails/:id', async (c) => {
  try {
    const id = c.req.param('id');
    await deleteEmail(c.env.DB, id);
    return c.json({ success: true });
  } catch (error) {
    console.error('删除邮件失败:', error);
    return c.json({ success: false, error: '删除邮件失败', message: error instanceof Error ? error.message : String(error) }, 500);
  }
});

// ---------------- Admin API Keys ----------------
app.get('/admin/api-keys', async (c) => {
  const list = await listApiKeys(c.env.DB);
  return c.json({ success: true, apiKeys: list });
});

app.post('/admin/api-keys', async (c) => {
  try {
    const body = await c.req.json();
    const { name, quota, expiresAt, status } = body || {};
    if (!name || typeof name !== 'string') return c.json({ success: false, error: 'invalid_name' }, 400);
    if (typeof quota !== 'number' || quota <= 0) return c.json({ success: false, error: 'invalid_quota' }, 400);
    const record = await createApiKey(c.env.DB, {
      name,
      quota,
      expiresAt: expiresAt === undefined ? null : expiresAt,
      status,
    });
    return c.json({ success: true, apiKey: record });
  } catch (error) {
    console.error('创建 API Key 失败:', error);
    return c.json({ success: false, error: 'create_failed', message: error instanceof Error ? error.message : String(error) }, 400);
  }
});

app.patch('/admin/api-keys/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const body = await c.req.json();
    const update = await updateApiKey(c.env.DB, {
      id,
      name: body.name,
      quota: body.quota,
      expiresAt: body.expiresAt,
      status: body.status,
    });
    if (!update) return c.json({ success: false, error: 'not_found' }, 404);
    return c.json({ success: true, apiKey: update });
  } catch (error) {
    console.error('更新 API Key 失败:', error);
    return c.json({ success: false, error: 'update_failed', message: error instanceof Error ? error.message : String(error) }, 400);
  }
});

app.delete('/admin/api-keys/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const existing = await getApiKeyById(c.env.DB, id);
    if (!existing) return c.json({ success: false, error: 'not_found' }, 404);
    await disableApiKey(c.env.DB, id);
    return c.json({ success: true });
  } catch (error) {
    console.error('禁用 API Key 失败:', error);
    return c.json({ success: false, error: 'disable_failed', message: error instanceof Error ? error.message : String(error) }, 400);
  }
});

export default app;
