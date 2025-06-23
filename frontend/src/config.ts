// 配置文件，用于管理域名和API地址设置

// 邮箱域名配置
export const EMAIL_DOMAINS = (import.meta.env.VITE_EMAIL_DOMAIN || '').split(',').map(domain => domain.trim());
export const DEFAULT_EMAIL_DOMAIN = EMAIL_DOMAINS[0] || '';

// API地址配置
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

// 其他配置
export const DEFAULT_AUTO_REFRESH = false;
export const AUTO_REFRESH_INTERVAL = 10000; // 10秒 