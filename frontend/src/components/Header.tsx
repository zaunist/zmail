import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher';
import HeaderMailbox from './HeaderMailbox';
import Container from './Container';
import { getEmailDomains, getDefaultEmailDomain, EMAIL_DOMAINS, DEFAULT_EMAIL_DOMAIN } from '../config';
import ThemeSwitcher from './ThemeSwitcher';

interface HeaderProps {
  mailbox: Mailbox | null;
  onMailboxChange?: (mailbox: Mailbox) => void;
  isLoading?: boolean;
  onOpenAdmin?: () => void;
}

const Header: React.FC<HeaderProps> = ({
  mailbox = null,
  onMailboxChange = () => {},
  isLoading = false,
  onOpenAdmin = () => {},
}) => {
  const { t } = useTranslation();
  const [emailDomains, setEmailDomains] = useState<string[]>(EMAIL_DOMAINS);
  const [defaultDomain, setDefaultDomain] = useState<string>(DEFAULT_EMAIL_DOMAIN);
  const [initialDomainLoaded, setInitialDomainLoaded] = useState(false);

  useEffect(() => {
    const loadConfig = async () => {
      try {
        const domains = await getEmailDomains();
        const defaultDom = await getDefaultEmailDomain();
        setEmailDomains(domains);
        setDefaultDomain(defaultDom);
      } catch (error) {
        console.error('加载邮箱域名配置失败:', error);
      } finally {
        setInitialDomainLoaded(true);
      }
    };
    loadConfig();
  }, []);

  const shouldShowMailbox = mailbox && initialDomainLoaded;

  return (
    <header className="border-b">
      <Container>
        <div className="flex items-center justify-between py-3">
          <Link to="/" className="text-2xl font-bold">
            {t('app.title')}
          </Link>
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenAdmin}
              className="w-9 h-9 flex items-center justify-center rounded-md transition-all duration-200 bg-muted hover:bg-primary/20 hover:text-primary hover:scale-110"
              title="Admin"
              aria-label="Admin"
            >
              <i className="fas fa-key text-sm" />
            </button>
            {shouldShowMailbox && (
              <div className="flex items-center bg-muted/70 rounded-md px-3 py-1.5">
                <HeaderMailbox
                  mailbox={mailbox}
                  onMailboxChange={onMailboxChange}
                  domain={defaultDomain}
                  domains={emailDomains}
                  isLoading={isLoading}
                />
                <div className="ml-3 pl-3 border-l border-muted-foreground/20 flex items-center">
                  <ThemeSwitcher />
                  <LanguageSwitcher />
                  <a
                    href="https://github.com/zaunist/zmail"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 flex items-center justify-center rounded-md transition-all duration-200 hover:bg-primary/20 hover:text-primary hover:scale-110 ml-1"
                    aria-label="GitHub"
                    title="GitHub"
                  >
                    <i className="fab fa-github text-base"></i>
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </Container>
    </header>
  );
};

export default Header;
