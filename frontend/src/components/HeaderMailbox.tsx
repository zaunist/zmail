import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { createRandomMailbox, createCustomMailbox } from '../utils/api';
import MailboxSwitcher from './MailboxSwitcher';

interface HeaderMailboxProps {
  mailbox: Mailbox | null;
  onMailboxChange: (mailbox: Mailbox) => void;
  domain: string;
  domains: string[];
  isLoading: boolean;
}

const HeaderMailbox: React.FC<HeaderMailboxProps> = ({ 
  mailbox, 
  onMailboxChange,
  domain,
  domains,
  isLoading
}) => {
  const { t } = useTranslation();
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [customAddress, setCustomAddress] = useState('');
  const [selectedDomain, setSelectedDomain] = useState(domain);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [showCopyTooltip, setShowCopyTooltip] = useState(false);
  const [copyError, setCopyError] = useState<string | null>(null);
  const [refreshError, setRefreshError] = useState<string | null>(null);
  const [customAddressError, setCustomAddressError] = useState<string | null>(null);
  const [customAddressSuccess, setCustomAddressSuccess] = useState<string | null>(null);
  const [showRefreshSuccess, setShowRefreshSuccess] = useState(false);
  const copyTooltipTimeoutRef = useRef<number | null>(null);
  const refreshSuccessTimeoutRef = useRef<number | null>(null);
  const successMessageTimeoutRef = useRef<number | null>(null);
  const errorMessageTimeoutRef = useRef<number | null>(null);
  
  // 当props中的domain变化时更新selectedDomain
  useEffect(() => {
    setSelectedDomain(domain);
  }, [domain]);
  
  // 清除提示的定时器
  useEffect(() => {
    return () => {
      if (copyTooltipTimeoutRef.current) {
        window.clearTimeout(copyTooltipTimeoutRef.current);
      }
      if (refreshSuccessTimeoutRef.current) {
        window.clearTimeout(refreshSuccessTimeoutRef.current);
      }
      if (successMessageTimeoutRef.current) {
        window.clearTimeout(successMessageTimeoutRef.current);
      }
      if (errorMessageTimeoutRef.current) {
        window.clearTimeout(errorMessageTimeoutRef.current);
      }
    };
  }, []);
  
  if (!mailbox || isLoading) return null;
  
  // 复制邮箱地址到剪贴板
  const copyToClipboard = () => {
    // 清除之前的错误信息
    setCopyError(null);
    
    const fullAddress = mailbox.address.includes('@') ? mailbox.address : `${mailbox.address}@${selectedDomain}`;
    navigator.clipboard.writeText(fullAddress)
      .then(() => {
        // 显示复制成功提示
        setShowCopyTooltip(true);
        
        // 2秒后隐藏提示
        if (copyTooltipTimeoutRef.current) {
          window.clearTimeout(copyTooltipTimeoutRef.current);
        }
        copyTooltipTimeoutRef.current = window.setTimeout(() => {
          setShowCopyTooltip(false);
        }, 2000);
      })
      .catch(() => {
        // 显示复制失败错误
        setCopyError(t('mailbox.copyFailed'));
        
        // 3秒后隐藏错误
        if (errorMessageTimeoutRef.current) {
          window.clearTimeout(errorMessageTimeoutRef.current);
        }
        errorMessageTimeoutRef.current = window.setTimeout(() => {
          setCopyError(null);
        }, 3000);
      });
  };
  
  // 更换随机邮箱
  const handleRefreshMailbox = async () => {
    // 清除之前的错误信息
    setRefreshError(null);
    
    setIsActionLoading(true);
    const result = await createRandomMailbox();
    setIsActionLoading(false);
    
    if (result.success && result.mailbox) {
      onMailboxChange(result.mailbox);
      
      // 显示更新成功提示
      setShowRefreshSuccess(true);
      
      // 3秒后隐藏提示
      if (refreshSuccessTimeoutRef.current) {
        window.clearTimeout(refreshSuccessTimeoutRef.current);
      }
      refreshSuccessTimeoutRef.current = window.setTimeout(() => {
        setShowRefreshSuccess(false);
      }, 3000);
    } else {
      // 显示刷新失败错误
      setRefreshError(t('mailbox.refreshFailed'));
      
      // 3秒后隐藏错误
      if (errorMessageTimeoutRef.current) {
        window.clearTimeout(errorMessageTimeoutRef.current);
      }
      errorMessageTimeoutRef.current = window.setTimeout(() => {
        setRefreshError(null);
      }, 3000);
    }
  };
  
  // 创建自定义邮箱
  const handleCreateCustom = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 清除之前的错误和成功信息
    setCustomAddressError(null);
    setCustomAddressSuccess(null);
    
    if (!customAddress.trim()) {
      setCustomAddressError(t('mailbox.invalidAddress'));
      return;
    }
    
    setIsActionLoading(true);
    const result = await createCustomMailbox(customAddress);
    setIsActionLoading(false);
    
    if (result.success && result.mailbox) {
      onMailboxChange(result.mailbox);
      
      // 显示成功消息在表单下方
      setCustomAddressSuccess(t('mailbox.createSuccess'));
      
      // 3秒后自动关闭表单
      if (successMessageTimeoutRef.current) {
        window.clearTimeout(successMessageTimeoutRef.current);
      }
      successMessageTimeoutRef.current = window.setTimeout(() => {
        setIsCustomMode(false);
        setCustomAddress('');
        setCustomAddressSuccess(null);
      }, 3000);
    } else {
      // 检查错误信息是否包含"邮箱地址已存在"
      const isAddressExistsError = 
        result.error === 'Address already exists' || 
        String(result.error).includes('已存在');
      
      if (isAddressExistsError) {
        setCustomAddressError(t('mailbox.addressExists'));
      } else {
        setCustomAddressError(t('mailbox.createFailed'));
      }
    }
  };
  
  // 取消自定义模式
  const handleCancelCustom = () => {
    setIsCustomMode(false);
    setCustomAddress('');
    setCustomAddressError(null);
    setCustomAddressSuccess(null);
  };
  
  // 移动设备上的邮箱地址显示
  const renderMobileAddress = () => {
    const fullAddress = mailbox.address.includes('@') ? mailbox.address : `${mailbox.address}@${selectedDomain}`;
    const [username, domainPart] = fullAddress.split('@');
    
    // 如果用户名太长，截断显示
    const displayUsername = username.length > 10 ? `${username.substring(0, 8)}...` : username;
    
    return (
      <code className="bg-muted px-2 py-1 rounded text-xs font-medium truncate max-w-[120px]">
        {displayUsername}@{domainPart}
      </code>
    );
  };
  
  // 切换域名
  const handleDomainChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedDomain(e.target.value);
    // [fix] 切换域名后自动更换邮箱
    await handleRefreshMailbox();
  };
  
  // 按钮基础样式
  const buttonBaseClass = "flex items-center justify-center rounded-md transition-all duration-200";
  const copyButtonClass = `${buttonBaseClass} hover:bg-primary/20 hover:text-primary hover:scale-110 mx-1`;
  const refreshButtonClass = `${buttonBaseClass} bg-muted hover:bg-primary/20 hover:text-primary hover:scale-110 mr-1`;
  const customizeButtonClass = `${buttonBaseClass} bg-primary text-primary-foreground hover:bg-primary/80 hover:scale-110`;
  
  return (
    <div className="flex items-center">
      {isCustomMode ? (
        <form onSubmit={handleCreateCustom} className="flex flex-col space-y-2">
          <div className="flex items-center space-x-2">
            <div className="flex items-center">
              <input
                type="text"
                value={customAddress}
                onChange={(e) => {
                  setCustomAddress(e.target.value);
                  if (customAddressError) setCustomAddressError(null);
                  if (customAddressSuccess) setCustomAddressSuccess(null);
                }}
                className={`w-32 md:w-40 px-2 py-1 text-sm border rounded-l-md focus:outline-none focus:ring-1 focus:ring-primary ${
                  customAddressError ? 'border-red-500' : ''
                }`}
                placeholder={t('mailbox.customAddressPlaceholder')}
                disabled={isActionLoading}
                autoFocus
              />
              <span className="flex items-center px-2 py-1 text-sm border-y border-r rounded-r-md bg-muted">
                @
                {/* [fix]: 为select包裹一个relative容器，用于绝对定位自定义箭头 */}
                <div className="relative">
                  <select 
                    value={selectedDomain}
                    onChange={handleDomainChange}
                    // [fix]: 添加 appearance-none 移除原生样式，并增加padding-right为箭头留出空间
                    className="appearance-none bg-transparent border-none focus:outline-none pl-1 pr-5"
                  >
                    {domains.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                  {/* [fix]: 添加自定义的下拉箭头图标 */}
                  <i className="fas fa-chevron-down absolute right-0 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none"></i>
                </div>
              </span>
            </div>
            <button
              type="button"
              onClick={handleCancelCustom}
              className="px-2 py-1 text-sm rounded-md bg-muted text-muted-foreground hover:bg-muted/80 transition-colors"
              disabled={isActionLoading}
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              className="px-2 py-1 text-sm rounded-md bg-primary text-primary-foreground hover:bg-primary/80 transition-colors"
              disabled={isActionLoading}
            >
              {isActionLoading ? t('common.loading') : t('common.create')}
            </button>
          </div>
          
          {/* 错误信息显示 */}
          {customAddressError && (
            <div className="text-red-500 text-xs px-1">
              {customAddressError}
            </div>
          )}
          
          {/* 成功信息显示 */}
          {customAddressSuccess && (
            <div className="text-green-500 text-xs px-1">
              {customAddressSuccess}
            </div>
          )}
        </form>
      ) : (
        <>
          <div className="flex items-center">
            {/* 电脑端邮箱地址显示 */}
            <div className="hidden sm:flex items-center">
              <code className="bg-muted px-2 py-1 rounded text-sm font-medium flex items-center">
                {mailbox.address}@
                {/* [fix]: 为select包裹一个relative容器，用于绝对定位自定义箭头 */}
                <div className="relative">
                  <select 
                    value={selectedDomain}
                    onChange={handleDomainChange}
                    // [fix]: 添加 appearance-none 移除原生样式，并增加padding-right为箭头留出空间
                    className="appearance-none bg-transparent border-none focus:outline-none pl-1 pr-4 font-medium"
                  >
                    {domains.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                  {/* [fix]: 添加自定义的下拉箭头图标 */}
                  <i className="fas fa-chevron-down absolute right-0 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none"></i>
                </div>
              </code>
              
              {/* 添加邮箱切换组件 */}
              <MailboxSwitcher 
                currentMailbox={mailbox}
                onSwitchMailbox={onMailboxChange}
                domain={selectedDomain}
              />
              
              <div className="relative">
              <button 
                onClick={copyToClipboard}
                  className={`w-8 h-8 ${copyButtonClass}`}
                  aria-label={t('common.copy')}
                  title={t('common.copy')}
              >
                  <i className="fas fa-copy text-sm"></i>
                </button>
                
                {/* 复制成功提示 */}
                {showCopyTooltip && (
                  <div className="absolute top-9 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground text-xs py-1 px-2 rounded shadow-lg whitespace-nowrap z-10">
                    {t('mailbox.copySuccess')}
                    <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-primary rotate-45"></div>
                  </div>
                )}
              </div>
              
              <div className="relative">
                <button
                  onClick={handleRefreshMailbox}
                  className={`w-8 h-8 ${refreshButtonClass}`}
                  disabled={isActionLoading}
                  title={t('mailbox.refresh')}
                >
                  <i className="fas fa-sync-alt text-sm"></i>
                </button>
                
                {/* 更新成功提示 */}
                {showRefreshSuccess && (
                  <div className="absolute top-9 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground text-xs py-1 px-2 rounded shadow-lg whitespace-nowrap z-10">
                    {t('mailbox.refreshSuccess')}
                    <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-primary rotate-45"></div>
                  </div>
                )}
              </div>
              
              <button
                onClick={() => setIsCustomMode(true)}
                className={`w-8 h-8 ${customizeButtonClass}`}
                disabled={isActionLoading}
                title={t('mailbox.customize')}
              >
                <i className="fas fa-edit text-sm"></i>
              </button>
            </div>
            
            {/* 错误信息显示 */}
            {(copyError || refreshError) && (
              <div className="text-red-500 text-xs mt-1">
                {copyError || refreshError}
              </div>
            )}
          </div>
          
          {/* 移动版显示 */}
          <div className="flex sm:hidden items-center flex-col">
            {/* 邮箱地址和操作按钮 */}
            <div className="flex items-center">
              {renderMobileAddress()}
              
              {/* 添加移动版邮箱切换组件 */}
              <div className="transform scale-75 origin-right -mr-1">
                <MailboxSwitcher 
                  currentMailbox={mailbox}
                  onSwitchMailbox={onMailboxChange}
                  domain={selectedDomain}
                />
              </div>
              
              <div className="relative">
              <button 
                onClick={copyToClipboard}
                  className={`w-6 h-6 ${copyButtonClass}`}
                  aria-label={t('common.copy')}
                  title={t('common.copy')}
              >
                  <i className="fas fa-copy text-xs"></i>
                </button>
                
                {/* 复制成功提示 */}
                {showCopyTooltip && (
                  <div className="absolute top-7 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground text-xs py-1 px-2 rounded shadow-lg whitespace-nowrap z-10">
                    {t('mailbox.copySuccess')}
                    <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-primary rotate-45"></div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex items-center">
              <div className="relative">
                <button
                  onClick={handleRefreshMailbox}
                    className={`w-6 h-6 ${refreshButtonClass}`}
                  disabled={isActionLoading}
                    title={t('mailbox.refresh')}
                >
                    <i className="fas fa-sync-alt text-xs"></i>
                </button>
                
                  {/* 更新成功提示 */}
                {showRefreshSuccess && (
                    <div className="absolute top-7 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground text-xs py-1 px-2 rounded shadow-lg whitespace-nowrap z-10">
                    {t('mailbox.refreshSuccess')}
                      <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-primary rotate-45"></div>
                  </div>
                )}
              </div>
      
              <button
                onClick={() => setIsCustomMode(true)}
                    className={`w-6 h-6 ${customizeButtonClass}`}
                disabled={isActionLoading}
                    title={t('mailbox.customize')}
              >
                    <i className="fas fa-edit text-xs"></i>
              </button>
            </div>
          </div>
      
          {/* 错误信息显示 */}
          {(copyError || refreshError) && (
                <div className="text-red-500 text-xs mt-1">
              {copyError || refreshError}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default HeaderMailbox; 