import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * 主题切换组件
 * 用于在明亮和暗黑模式之间切换
 */
const ThemeSwitcher: React.FC = () => {
  const { t } = useTranslation();
  
  // 从 localStorage 获取初始主题，如果不存在则默认为 'light'
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme || 'light';
  });

  // 使用 useEffect 监听 theme 状态的变化，并应用到 <html> 元素上
  useEffect(() => {
    const root = window.document.documentElement;
    // 先移除旧的 class，以防万一
    root.classList.remove(theme === 'light' ? 'dark' : 'light');
    // 添加当前主题的 class
    root.classList.add(theme);
    // 将当前主题保存到 localStorage
    localStorage.setItem('theme', theme);
  }, [theme]);

  // 定义切换主题的函数
  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  return (
    <button
      onClick={toggleTheme}
      className="w-8 h-8 flex items-center justify-center rounded-md transition-all duration-200 hover:bg-primary/20 hover:text-primary hover:scale-110"
      aria-label={t('settings.toggleTheme', '切换主题')}
      title={t('settings.toggleTheme', '切换主题')}
    >
      {/* 根据当前主题显示不同的图标 */}
      {theme === 'light' ? (
        <i className="fas fa-moon text-base"></i> // 亮色模式下，显示月亮图标以切换到暗色
      ) : (
        <i className="fas fa-sun text-base"></i> // 暗色模式下，显示太阳图标以切换到亮色
      )}
    </button>
  );
};

export default ThemeSwitcher;