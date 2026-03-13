// 配置文件，用于管理域名和API地址设置

// 邮箱域名配置 - 从 API 动态获取
let cachedEmailDomains: string[] | null = null;
let configLoaded = false;

// 从 API 获取邮箱域名配置
export async function getEmailDomains(): Promise<string[]> {
  if (cachedEmailDomains && configLoaded) {
    return cachedEmailDomains;
  }
  
  try {
    const response = await fetch('/api/config');
    if (response.ok) {
      const data = await response.json();
      if (data.success && data.config.emailDomains) {
        cachedEmailDomains = data.config.emailDomains;
        configLoaded = true;
        return cachedEmailDomains!;
      }
    }
  } catch (error) {
    console.error('获取邮箱域名配置失败:', error);
  }
  
  // 如果 API 获取失败，使用环境变量作为后备
  const fallbackDomains = (import.meta.env.VITE_EMAIL_DOMAIN || '').split(',').map(domain => domain.trim()).filter(domain => domain);
  cachedEmailDomains = fallbackDomains.length > 0 ? fallbackDomains : ['example.com'];
  configLoaded = true;
  return cachedEmailDomains!;
}

// 获取默认邮箱域名（随机选择一个，如果只有一个则返回它）
export async function getDefaultEmailDomain(): Promise<string> {
  const domains = await getEmailDomains();
  if (!domains.length) return 'example.com';
  if (domains.length === 1) return domains[0];
  const idx = Math.floor(Math.random() * domains.length);
  return domains[idx];
}

// 同步版本的邮箱域名配置（用于向后兼容）
export const EMAIL_DOMAINS = (import.meta.env.VITE_EMAIL_DOMAIN || '').split(',').map(domain => domain.trim()).filter(domain => domain) || ['example.com'];
export const DEFAULT_EMAIL_DOMAIN = EMAIL_DOMAINS.length > 1
  ? EMAIL_DOMAINS[Math.floor(Math.random() * EMAIL_DOMAINS.length)]
  : (EMAIL_DOMAINS[0] || 'example.com');

// API地址配置
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

// 其他配置
export const DEFAULT_AUTO_REFRESH = false;
export const AUTO_REFRESH_INTERVAL = 10000; // 10秒