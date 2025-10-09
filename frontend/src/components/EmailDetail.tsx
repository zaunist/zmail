import React, { useState, useEffect, useContext, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { API_BASE_URL } from '../config';
import { MailboxContext } from '../contexts/MailboxContext';

interface EmailDetailProps {
  emailId: string;
  onClose: () => void;
}

interface Attachment {
  id: string;
  emailId: string;
  filename: string;
  mimeType: string;
  size: number;
  createdAt: number;
  isLarge: boolean;
  chunksCount: number;
}

const EmailDetail: React.FC<EmailDetailProps> = ({ emailId, onClose }) => {
  const { t } = useTranslation();
  // fix: 从 context 中获取全局通知函数
  const { emailCache, addToEmailCache, handleMailboxNotFound, showErrorMessage, showSuccessMessage } = useContext(MailboxContext);
  const [email, setEmail] = useState<Email | null>(null);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingAttachments, setIsLoadingAttachments] = useState(false);
  
  useEffect(() => {
    const fetchEmail = async () => {
      try {
        // 首先检查缓存中是否有该邮件
        if (emailCache[emailId]) {
          setEmail(emailCache[emailId].email);
          setAttachments(emailCache[emailId].attachments);
          setIsLoading(false);
          return;
        }
        
        setIsLoading(true);
        const response = await fetch(`${API_BASE_URL}/api/emails/${emailId}`);
        
        if (!response.ok) {
          // 如果邮箱不存在（404），则清除本地缓存并创建新邮箱
          if (response.status === 404) {
            await handleMailboxNotFound();
            onClose(); // 关闭邮件详情
            return;
          }
          throw new Error('Failed to fetch email');
        }
        
        const data = await response.json();
        if (data.success) {
          setEmail(data.email);
          
          // 如果邮件有附件，获取附件列表
          if (data.email.hasAttachments) {
            await fetchAttachments(emailId, data.email);
          } else {
            // 没有附件，将邮件添加到缓存
            addToEmailCache(emailId, data.email, []);
          }
        } else {
          throw new Error(data.error || 'Unknown error');
        }
      } catch (error) {
        // fix: 使用全局通知函数
        showErrorMessage(t('email.fetchFailed'));
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchEmail();
  }, [emailId, t, emailCache, addToEmailCache, handleMailboxNotFound, onClose, showErrorMessage]);
  
  const fetchAttachments = async (emailId: string, emailData?: Email) => {
    try {
      setIsLoadingAttachments(true);
      const response = await fetch(`${API_BASE_URL}/api/emails/${emailId}/attachments`);
      
      if (!response.ok) {
        // 如果邮箱不存在（404），则清除本地缓存并创建新邮箱
        if (response.status === 404) {
          await handleMailboxNotFound();
          onClose(); // 关闭邮件详情
          return;
        }
        throw new Error('Failed to fetch attachments');
      }
      
      const data = await response.json();
      if (data.success) {
        setAttachments(data.attachments);
        
        // 将邮件和附件添加到缓存
        if (emailData) {
          addToEmailCache(emailId, emailData, data.attachments);
        }
      } else {
        throw new Error(data.error || 'Unknown error');
      }
    } catch (error) {
      console.error('Error fetching attachments:', error);
    } finally {
      setIsLoadingAttachments(false);
    }
  };
  
  const handleDelete = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/emails/${emailId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete email');
      }
      
      const data = await response.json();
      if (data.success) {
        // fix: 使用全局通知函数
        showSuccessMessage(t('email.deleteSuccess'));
        
        // 2秒后关闭邮件详情
        setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        throw new Error(data.error || 'Unknown error');
      }
    } catch (error) {
      // fix: 使用全局通知函数
      showErrorMessage(t('email.deleteFailed'));
    }
  };
  
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    return new Intl.DateTimeFormat(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(date);
  };
  
  // 格式化文件大小
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  
  // 判断文件类型
  const getFileType = (mimeType: string): string => {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.startsWith('audio/')) return 'audio';
    if (mimeType === 'application/pdf') return 'pdf';
    if (mimeType.includes('text/')) return 'text';
    return 'file';
  };
  
  // 获取文件图标
  const getFileIcon = (mimeType: string): string => {
    const fileType = getFileType(mimeType);
    switch (fileType) {
      case 'image': return 'fa-file-image';
      case 'video': return 'fa-file-video';
      case 'audio': return 'fa-file-audio';
      case 'pdf': return 'fa-file-pdf';
      case 'text': return 'fa-file-alt';
      default: return 'fa-file';
    }
  };
  
  // 获取附件下载链接
  const getAttachmentUrl = (attachmentId: string, download: boolean = false): string => {
    return `${API_BASE_URL}/api/attachments/${attachmentId}${download ? '?download=true' : ''}`;
  };
  
  // 渲染附件预览
  const renderAttachmentPreview = (attachment: Attachment) => {
    const fileType = getFileType(attachment.mimeType);
    const attachmentUrl = getAttachmentUrl(attachment.id, true);
    
    switch (fileType) {
      case 'image':
        return (
          <div className="mt-2 max-w-full overflow-hidden">
            <img 
              src={attachmentUrl} 
              alt={attachment.filename} 
              className="max-w-full max-h-[300px] object-contain rounded border"
            />
          </div>
        );
      case 'video':
        return (
          <div className="mt-2">
            <video 
              src={attachmentUrl} 
              controls 
              className="max-w-full max-h-[300px] rounded border"
            >
              {t('email.videoNotSupported')}
            </video>
          </div>
        );
      case 'audio':
        return (
          <div className="mt-2">
            <audio 
              src={attachmentUrl} 
              controls 
              className="w-full"
            >
              {t('email.audioNotSupported')}
            </audio>
          </div>
        );
      case 'pdf':
        return (
          <div className="mt-2">
            <iframe 
              src={attachmentUrl} 
              className="w-full h-[400px] border rounded"
              title={attachment.filename}
            />
          </div>
        );
      default:
        return null;
    }
  };
  
  return (
    <div className="border rounded-lg p-6">
      {/* fix: 移除局部的错误和成功提示，使用全局通知 */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : email ? (
        <div className="space-y-6">
          {/* 邮件头部信息 */}
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-semibold mb-2">
                {email.subject || t('email.noSubject')}
              </h2>
              <div className="text-sm text-muted-foreground">
                <p><strong>{t('email.from')}:</strong> {email.fromAddress}</p>
                <p><strong>{t('email.to')}:</strong> {email.toAddress}</p>
                <p><strong>{t('email.date')}:</strong> {formatDate(email.receivedAt)}</p>
              </div>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={onClose}
                className="p-2 rounded-md hover:bg-muted"
                title={t('common.close')}
              >
                <i className="fas fa-times"></i>
              </button>
              <button
                onClick={handleDelete}
                className="p-2 rounded-md hover:bg-red-100 text-red-600"
                title={t('common.delete')}
              >
                <i className="fas fa-trash-alt"></i>
              </button>
            </div>
          </div>
          
          {/* 分隔线 */}
          <hr />
          
          {/* 邮件内容 */}
          <div>
            <h3 className="font-medium mb-2">{t('email.content')}</h3>
            {email.htmlContent ? (
              <div 
                className="prose max-w-none border rounded-md p-4 bg-white"
                dangerouslySetInnerHTML={{ __html: email.htmlContent }}
              />
            ) : email.textContent ? (
              <pre className="whitespace-pre-wrap border rounded-md p-4 bg-white font-sans">
                {email.textContent}
              </pre>
            ) : (
              <p className="text-muted-foreground italic">
                {t('email.noContent')}
              </p>
            )}
          </div>
          
          {/* 附件 */}
          {email.hasAttachments && (
            <div>
              <h3 className="font-medium mb-2">
                {t('email.attachments')} 
                {isLoadingAttachments && (
                  <span className="ml-2 inline-block animate-spin h-4 w-4 border-b-2 border-primary rounded-full"></span>
                )}
              </h3>
              
              {attachments.length > 0 ? (
                <div className="space-y-3">
                  {attachments.map(attachment => (
                    <div key={attachment.id} className="border rounded-md p-3 bg-white">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-3">
                          <i className={`fas ${getFileIcon(attachment.mimeType)} text-primary text-lg`}></i>
                          <div>
                            <p className="font-medium">{attachment.filename}</p>
                            <p className="text-xs text-muted-foreground">{formatFileSize(attachment.size)}</p>
                          </div>
                        </div>
                        <a 
                          href={getAttachmentUrl(attachment.id, true)}
                          download={attachment.filename}
                          className="px-3 py-1 bg-primary text-primary-foreground rounded-md text-sm hover:bg-primary/90"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {t('email.download')}
                        </a>
                      </div>
                      
                      {/* 附件预览 */}
                      {renderAttachmentPreview(attachment)}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground italic">
                  {t('email.noAttachments')}
                </p>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">
            {t('email.notFound')}
          </p>
        </div>
      )}
    </div>
  );
};

export default EmailDetail; 