import React, { useContext, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Header from './Header';
import Footer from './Footer';
import SEO from './SEO';
import { MailboxContext } from '../contexts/MailboxContext';
import InfoModal from './InfoModal';
import AdminPanel from './AdminPanel';

const Layout: React.FC = () => {
  const { t } = useTranslation();
  const { mailbox, setMailbox, isLoading } = useContext(MailboxContext);
  const location = useLocation();

  const [infoModal, setInfoModal] = useState<{ isOpen: boolean; type: 'privacy' | 'terms' | 'about' | null }>({ isOpen: false, type: null });
  const [adminOpen, setAdminOpen] = useState(false);

  const handleShowInfo = (type: 'privacy' | 'terms' | 'about') => setInfoModal({ isOpen: true, type });
  const handleCloseInfo = () => setInfoModal({ isOpen: false, type: null });

  const getSEOProps = () => {
    const path = location.pathname;
    const defaultProps = {
      title: 'ZMAIL-24小时匿名邮箱',
      description: '创建临时邮箱地址，接收邮件，无需注册，保护您的隐私安全',
      keywords: '临时邮箱,匿名邮箱,一次性邮箱,隐私保护,电子邮件,ZMAIL',
    };
    if (mailbox) {
      return {
        ...defaultProps,
        title: `ZMAIL-24小时匿名邮箱`,
        description: `查看 ${mailbox.address} 的临时邮箱收件箱，接收邮件，无需注册，保护您的隐私安全`,
      };
    }
    return defaultProps;
  };

  return (
    <div className="flex min-h-screen flex-col">
      <SEO {...getSEOProps()} />
      <Header mailbox={mailbox} onMailboxChange={setMailbox} isLoading={isLoading} onOpenAdmin={() => setAdminOpen(true)} />
      <main className="flex-1 py-6">
        <Outlet />
      </main>
      <Footer onShowInfo={handleShowInfo} />
      <InfoModal isOpen={infoModal.isOpen} onClose={handleCloseInfo} type={infoModal.type} />
      <AdminPanel isOpen={adminOpen} onClose={() => setAdminOpen(false)} />
    </div>
  );
};

export default Layout;
