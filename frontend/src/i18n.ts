import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// 导入翻译文件
import zhCN from '../i18n/locales/zh-CN.json';
import en from '../i18n/locales/en.json';

// 配置i18next
i18n
  // 检测用户语言
  .use(LanguageDetector)
  // 将i18n实例传递给react-i18next
  .use(initReactI18next)
  // 初始化i18next
  .init({
    resources: {
      'zh-CN': {
        translation: zhCN,
      },
      en: {
        translation: en,
      },
    },
    fallbackLng: 'en',
    debug: import.meta.env.MODE === 'development',
    interpolation: {
      escapeValue: false, // 不转义HTML
    },
    detection: {
      order: ['navigator', 'htmlTag', 'path', 'localStorage'],
      caches: ['localStorage'],
    },
  });

export default i18n;