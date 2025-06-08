import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

interface MailboxSwitcherProps {
  currentMailbox: Mailbox;
  onSwitchMailbox: (mailbox: Mailbox) => void;
  domain: string;
}

const MailboxSwitcher: React.FC<MailboxSwitcherProps> = ({
  currentMailbox,
  onSwitchMailbox,
  domain
}) => {
  const { t } = useTranslation();
  const [savedMailboxes, setSavedMailboxes] = useState<Mailbox[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 组件挂载时加载保存的邮箱
  useEffect(() => {
    loadSavedMailboxes();
  }, []);

  // 当前邮箱变化时，更新保存的邮箱列表
  useEffect(() => {
    if (currentMailbox) {
      updateSavedMailboxes(currentMailbox);
    }
  }, [currentMailbox]);

  // 点击外部关闭下拉菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // 加载保存的邮箱列表
  const loadSavedMailboxes = () => {
    try {
      const savedData = localStorage.getItem('savedMailboxes');
      if (savedData) {
        const mailboxes = JSON.parse(savedData) as Mailbox[];
        // 过滤掉已过期的邮箱
        const now = Date.now() / 1000;
        const validMailboxes = mailboxes.filter(m => m.expiresAt > now);
        setSavedMailboxes(validMailboxes);
      }
    } catch (error) {
      console.error('Error loading saved mailboxes:', error);
    }
  };

  // 更新保存的邮箱列表
  const updateSavedMailboxes = (mailbox: Mailbox) => {
    try {
      const now = Date.now() / 1000;
      
      // 获取当前保存的邮箱
      let mailboxes: Mailbox[] = [];
      try {
        const savedData = localStorage.getItem('savedMailboxes');
        if (savedData) {
          mailboxes = JSON.parse(savedData) as Mailbox[];
        }
      } catch (error) {
        console.error('Error parsing saved mailboxes:', error);
      }
      
      // 过滤掉已过期的邮箱
      mailboxes = mailboxes.filter(m => m.expiresAt > now);
      
      // 检查当前邮箱是否已在列表中
      const mailboxIndex = mailboxes.findIndex(m => m.address === mailbox.address);
      
      if (mailboxIndex >= 0) {
        // 更新现有邮箱
        mailboxes[mailboxIndex] = mailbox;
      } else {
        // 添加新邮箱
        mailboxes.push(mailbox);
      }
      
      // 更新状态和本地存储
      setSavedMailboxes(mailboxes);
      localStorage.setItem('savedMailboxes', JSON.stringify(mailboxes));
    } catch (error) {
      console.error('Error updating saved mailboxes:', error);
    }
  };

  // 切换到选择的邮箱
  const handleSwitchMailbox = (mailbox: Mailbox) => {
    onSwitchMailbox(mailbox);
    setShowDropdown(false);
  };

  // 如果没有保存的邮箱或者只有当前邮箱，不显示切换按钮
  if (savedMailboxes.length <= 1) {
    return null;
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="w-8 h-8 flex items-center justify-center rounded-md transition-all duration-200 hover:bg-primary/20 hover:text-primary hover:scale-110 mr-1"
        aria-label={t('mailbox.switch') || "切换邮箱"}
        title={t('mailbox.switch') || "切换邮箱"}
      >
        <i className="fas fa-exchange-alt text-sm"></i>
      </button>

      {showDropdown && (
        <div className="absolute top-9 left-0 bg-white border rounded-md shadow-lg p-1 z-20 min-w-[200px]">
          <div className="text-xs font-medium px-2 py-1 text-muted-foreground">
            {t('mailbox.savedMailboxes') || "已保存的邮箱"}
          </div>
          <div className="max-h-[400px] overflow-y-auto">
            {savedMailboxes.map((m) => (
              <button
                key={m.address}
                onClick={() => handleSwitchMailbox(m)}
                className={`w-full text-left text-sm px-2 py-1.5 hover:bg-muted rounded-sm transition-colors truncate ${
                  m.address === currentMailbox.address ? 'bg-primary/10 text-primary font-medium' : ''
                }`}
              >
                {m.address}@{domain}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MailboxSwitcher;