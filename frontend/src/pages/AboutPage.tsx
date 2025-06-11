import React from "react";
import { useTranslation } from 'react-i18next';
import Container from "../components/Container";

const AboutPage: React.FC = () => {
  const { t } = useTranslation();
  
  return (
    <Container>
      <div className="prose max-w-none mx-auto">
        <h1 className="text-3xl font-bold mb-4 text-center">{t('about.title')}</h1>
        <p className="text-lg text-center mb-8 text-muted-foreground">{t('about.subtitle')}</p>
        
        <h2 className="text-xl font-semibold mt-8 mb-2">{t('about.intro.title')}</h2>
        <p>{t('about.intro.content')}</p>
        
        <h2 className="text-xl font-semibold mt-8 mb-2">{t('about.features.title')}</h2>
        <ul>
          <li><strong>{t('about.features.free.title')}</strong>：{t('about.features.free.desc')}</li>
          <li><strong>{t('about.features.instant.title')}</strong>：{t('about.features.instant.desc')}</li>
          <li><strong>{t('about.features.autodestroy.title')}</strong>：{t('about.features.autodestroy.desc')}</li>
          <li><strong>{t('about.features.realtime.title')}</strong>：{t('about.features.realtime.desc')}</li>
          <li><strong>{t('about.features.opensource.title')}</strong>：{t('about.features.opensource.desc')}</li>
        </ul>
        
        <h2 className="text-xl font-semibold mt-8 mb-2">{t('about.usecases.title')}</h2>
        <ul>
          <li>{t('about.usecases.registration')}</li>
          <li>{t('about.usecases.download')}</li>
          <li>{t('about.usecases.temporary')}</li>
          <li>{t('about.usecases.spam')}</li>
        </ul>
        
        <h2 className="text-xl font-semibold mt-8 mb-2">{t('about.tech.title')}</h2>
        <p>{t('about.tech.intro')}</p>
        <ul>
          <li><strong>{t('about.tech.frontend.title')}</strong>：{t('about.tech.frontend.desc')}</li>
          <li><strong>{t('about.tech.backend.title')}</strong>：{t('about.tech.backend.desc')}</li>
          <li><strong>{t('about.tech.email.title')}</strong>：{t('about.tech.email.desc')}</li>
          <li><strong>{t('about.tech.storage.title')}</strong>：{t('about.tech.storage.desc')}</li>
        </ul>
        
        <h2 className="text-xl font-semibold mt-8 mb-2">{t('about.opensource.title')}</h2>
        <p>{t('about.opensource.intro')}</p>
        <ul>
          <li><strong>{t('about.opensource.github.title')}</strong>：<a href="https://github.com/zaunist/zmail" className="text-blue-600 hover:underline">https://github.com/zaunist/zmail</a></li>
          <li><strong>{t('about.opensource.license.title')}</strong>：{t('about.opensource.license.desc')}</li>
          <li><strong>{t('about.opensource.contribute.title')}</strong>：{t('about.opensource.contribute.desc')}</li>
        </ul>
        
        <h2 className="text-xl font-semibold mt-8 mb-2">{t('about.contact.title')}</h2>
        <p>{t('about.contact.intro')}</p>
        <ul>
          <li><strong>{t('about.contact.github.title')}</strong>：{t('about.contact.github.desc')}</li>
          <li><strong>{t('about.contact.email.title')}</strong>：y.bz@foxmail.com</li>
        </ul>
        
        <p className="text-center mt-10">{t('about.conclusion')}</p>
      </div>
    </Container>
  );
};

export default AboutPage;
