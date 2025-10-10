import React, { createContext, useState, useEffect, ReactNode, useRef } from 'react';
import {
  createRandomMailbox,
  getMailboxFromLocalStorage,
  saveMailboxToLocalStorage,
  removeMailboxFromLocalStorage,
  getEmails,
  deleteMailbox as apiDeleteMailbox
} from '../utils/api';
import { useTranslation } from 'react-i18next';
import { DEFAULT_AUTO_REFRESH, AUTO_REFRESH_INTERVAL } from '../config';

// 邮件详情缓存接口
interface EmailCache {
  [emailId: string]: {
    email: Email;
    attachments: any[];
    timestamp: number;
  }
}

interface MailboxContextType {
  mailbox: Mailbox | null;
  setMailbox: (mailbox: Mailbox) => void;
  isLoading: boolean;
  emails: Email[];
  setEmails: (emails: Email[]) => void;
  selectedEmail: string | null;
  setSelectedEmail: (id: string | null) => void;
  isEmailsLoading: boolean;
  setIsEmailsLoading: (loading: boolean) => void;
  autoRefresh: boolean;
  setAutoRefresh: (autoRefresh: boolean) => void;
  createNewMailbox: () => Promise<void>;
  deleteMailbox: () => Promise<void>;
  refreshEmails: (isManual?: boolean) => Promise<void>; // feat: 添加一个参数以区分手动刷新
  emailCache: EmailCache;
  addToEmailCache: (emailId: string, email: Email, attachments: any[]) => void;
  clearEmailCache: () => void;
  handleMailboxNotFound: () => Promise<void>;
  errorMessage: string | null;
  successMessage: string | null;
  // feat: 添加用于显示全局通知的函数
  showSuccessMessage: (message: string) => void;
  showErrorMessage: (message: string) => void;
}

export const MailboxContext = createContext<MailboxContextType>({
  mailbox: null,
  setMailbox: () => {},
  isLoading: false,
  emails: [],
  setEmails: () => {},
  selectedEmail: null,
  setSelectedEmail: () => {},
  isEmailsLoading: false,
  setIsEmailsLoading: () => {},
  autoRefresh: DEFAULT_AUTO_REFRESH,
  setAutoRefresh: () => {},
  createNewMailbox: async () => {},
  deleteMailbox: async () => {},
  refreshEmails: async () => {},
  emailCache: {},
  addToEmailCache: () => {},
  clearEmailCache: () => {},
  handleMailboxNotFound: async () => {},
  errorMessage: null,
  successMessage: null,
  // feat: 提供默认空函数
  showSuccessMessage: () => {},
  showErrorMessage: () => {},
});

interface MailboxProviderProps {
  children: ReactNode;
}

export const MailboxProvider: React.FC<MailboxProviderProps> = ({ children }) => {
  const { t } = useTranslation();
  const [mailbox, setMailbox] = useState<Mailbox | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [emails, setEmails] = useState<Email[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<string | null>(null);
  const [isEmailsLoading, setIsEmailsLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(DEFAULT_AUTO_REFRESH);
  const [emailCache, setEmailCache] = useState<EmailCache>({});
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const errorTimeoutRef = useRef<number | null>(null);
  const successTimeoutRef = useRef<number | null>(null);

  // feat: 创建显示成功消息的函数
  const showSuccessMessage = (message: string) => {
    setSuccessMessage(message);
    if (successTimeoutRef.current) {
      window.clearTimeout(successTimeoutRef.current);
    }
    successTimeoutRef.current = window.setTimeout(() => {
      setSuccessMessage(null);
    }, 3000);
  };

  // feat: 创建显示错误消息的函数
  const showErrorMessage = (message: string) => {
    setErrorMessage(message);
    if (errorTimeoutRef.current) {
      window.clearTimeout(errorTimeoutRef.current);
    }
    errorTimeoutRef.current = window.setTimeout(() => {
      setErrorMessage(null);
    }, 3000);
  };


  // 清除提示的定时器
  useEffect(() => {
    return () => {
      if (errorTimeoutRef.current) {
        window.clearTimeout(errorTimeoutRef.current);
      }
      if (successTimeoutRef.current) {
        window.clearTimeout(successTimeoutRef.current);
      }
    };
  }, []);

  // 初始化：检查本地存储或创建新邮箱
  useEffect(() => {
    const initMailbox = async () => {
      // 检查本地存储中是否有未过期的邮箱
      const savedMailbox = getMailboxFromLocalStorage();

      if (savedMailbox) {
        setMailbox(savedMailbox);
        setIsLoading(false);
      } else {
        // 创建新邮箱
        await createNewMailbox();
      }
    };

    initMailbox();
  }, []);

  // 创建新邮箱
  const createNewMailbox = async () => {
    try {
      // 清除之前的错误和成功信息
      setErrorMessage(null);
      setSuccessMessage(null);
      setIsLoading(true);
      const result = await createRandomMailbox();
      if (result.success && result.mailbox) {
        setMailbox(result.mailbox);
        saveMailboxToLocalStorage(result.mailbox);
        // [fix]: 创建新邮箱后，清空旧的邮件列表和缓存
        setEmails([]);
        setSelectedEmail(null);
        clearEmailCache();
        // feat: 创建新邮箱也给出提示
        showSuccessMessage(t('mailbox.createSuccess'));
      } else {
        // fix: 使用全局通知函数
        showErrorMessage(t('mailbox.createFailed'));
        throw new Error('Failed to create mailbox');
      }
    } catch (error) {
      console.error('createNewMailbox: Error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // 删除邮箱
  const deleteMailbox = async () => {
    if (!mailbox) return;

    try {
      // 清除之前的错误和成功信息
      setErrorMessage(null);
      setSuccessMessage(null);

      // 调用API删除邮箱
      const result = await apiDeleteMailbox(mailbox.address);

      if (result.success) {
        // fix: 使用全局通知函数
        showSuccessMessage(t('mailbox.deleteSuccess'));

        // 清除本地数据
        setMailbox(null);
        setEmails([]);
        setSelectedEmail(null);
        removeMailboxFromLocalStorage();
        clearEmailCache();

        // 创建新邮箱
        await createNewMailbox();
      } else {
        // fix: 使用全局通知函数
        showErrorMessage(t('mailbox.deleteFailed'));
      }
    } catch (error) {
      console.error('Error deleting mailbox:', error);

      // fix: 使用全局通知函数
      showErrorMessage(t('mailbox.deleteFailed'));
    }
  };

  // feat: 增加 isManual 参数，只有手动点击刷新时才显示Toast
  const refreshEmails = async (isManual = false) => {
    if (!mailbox || isEmailsLoading) return;
    setIsEmailsLoading(true);

    try {
      const result = await getEmails(mailbox.address);

      if (result.success) {
        setEmails(result.emails);
        // feat: 手动刷新成功时显示Toast
        if (isManual) {
          showSuccessMessage(t('email.refreshSuccess'));
        }
      } else if (result.notFound) {
        // [fix]: 如果邮箱不存在，调用 handleMailboxNotFound 进行平滑处理，而不是强制刷新页面
        await handleMailboxNotFound();
      } else {
        // feat: 刷新失败时也显示Toast
        if (isManual) {
          showErrorMessage(t('email.fetchFailed'));
        }
      }
    } catch (error) {
      // 错误处理
      console.error('Error refreshing emails:', error);
      if (isManual) {
        showErrorMessage(t('email.fetchFailed'));
      }
    } finally {
      setIsEmailsLoading(false);
    }
  };

  // 自动刷新邮件
  useEffect(() => {
    if (!mailbox || isLoading) return;
    refreshEmails(); // 初始加载不显示 a Toast
    let intervalId: number | undefined;
    if (autoRefresh) {
      intervalId = window.setInterval(() => refreshEmails(), AUTO_REFRESH_INTERVAL); // 自动刷新不显示 a Toast
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [mailbox, autoRefresh, isLoading]);

  // [fix]: 重构处理邮箱不存在的逻辑，避免页面刷新
  const handleMailboxNotFound = async () => {
    // fix: 使用全局通知函数
    showSuccessMessage(t('mailbox.creatingNew'));
    
    // 清除当前无效的邮箱信息
    removeMailboxFromLocalStorage();
    clearEmailCache();
    
    // 异步创建新邮箱，并更新应用状态
    await createNewMailbox();
  };

  // 添加邮件到缓存
  const addToEmailCache = (emailId: string, email: Email, attachments: any[]) => {
    setEmailCache(prev => ({
      ...prev,
      [emailId]: {
        email,
        attachments,
        timestamp: Date.now()
      }
    }));

    // 保存到localStorage
    try {
      const mailboxAddress = mailbox?.address;
      if (mailboxAddress) {
        const cacheKey = `emailCache_${mailboxAddress}`;
        const updatedCache = {
          ...emailCache,
          [emailId]: {
            email,
            attachments,
            timestamp: Date.now()
          }
        };
        localStorage.setItem(cacheKey, JSON.stringify(updatedCache));
      }
    } catch (error) {
      console.error('Error saving email cache to localStorage:', error);
    }
  };

  // 清除邮件缓存
  const clearEmailCache = () => {
    setEmailCache({});

    // 清除localStorage中的缓存
    try {
      const mailboxAddress = mailbox?.address;
      if (mailboxAddress) {
        const cacheKey = `emailCache_${mailboxAddress}`;
        localStorage.removeItem(cacheKey);
      }
    } catch (error) {
      console.error('Error clearing email cache from localStorage:', error);
    }
  };

  // 从localStorage加载邮件缓存
  useEffect(() => {
    if (!mailbox) return;

    try {
      const cacheKey = `emailCache_${mailbox.address}`;
      const cachedData = localStorage.getItem(cacheKey);

      if (cachedData) {
        const parsedCache = JSON.parse(cachedData);
        setEmailCache(parsedCache);
      }
    } catch (error) {
      console.error('Error loading email cache from localStorage:', error);
    }
  }, [mailbox]);

  // 设置邮箱并保存到localStorage
  const handleSetMailbox = (newMailbox: Mailbox) => {
    setMailbox(newMailbox);
    saveMailboxToLocalStorage(newMailbox);
  };

  return (
    <MailboxContext.Provider
      value={{
        mailbox,
        setMailbox: handleSetMailbox,
        isLoading,
        emails,
        setEmails,
        selectedEmail,
        setSelectedEmail,
        isEmailsLoading,
        setIsEmailsLoading,
        autoRefresh,
        setAutoRefresh,
        createNewMailbox,
        deleteMailbox,
        refreshEmails,
        emailCache,
        addToEmailCache,
        clearEmailCache,
        handleMailboxNotFound,
        errorMessage,
        successMessage,
        // feat: 将函数添加到 context value 中
        showSuccessMessage,
        showErrorMessage,
      }}
    >
      {/* [feat] 全局通知组件 */}
      {(errorMessage || successMessage) && (
        <div
          className={`fixed bottom-4 right-4 z-50 p-3 rounded-md shadow-lg max-w-md ${
            errorMessage
              ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
              : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
          }`}
        >
          {errorMessage || successMessage}
        </div>
      )}
      {children}
    </MailboxContext.Provider>
  );
}; 