import React from 'react';
import { useTranslation } from 'react-i18next';
import Container from "../components/Container";

const PrivacyPolicyPage: React.FC = () => {
  const { t } = useTranslation();
  
  return (
    <Container>
      <div className="prose max-w-none mx-auto">
        <h1 className="text-3xl font-bold mb-4 text-center">{t('privacy.title')}</h1>
        <p className="text-lg text-center mb-8 text-muted-foreground">{t('privacy.intro')}</p>
        
        <h2 className="text-xl font-semibold mt-8 mb-2">{t('privacy.section1.title')}</h2>
        <ul>
          <li>{t('privacy.section1.item1')}</li>
          <li>{t('privacy.section1.item2')}</li>
          <li>{t('privacy.section1.item3')}</li>
        </ul>
        
        <h2 className="text-xl font-semibold mt-8 mb-2">{t('privacy.section2.title')}</h2>
        <ul>
          <li>{t('privacy.section2.item1')}</li>
          <li>{t('privacy.section2.item2')}</li>
          <li>{t('privacy.section2.item3')}</li>
        </ul>
        
        <h2 className="text-xl font-semibold mt-8 mb-2">{t('privacy.section3.title')}</h2>
        <ul>
          <li>{t('privacy.section3.item1')}</li>
          <li>{t('privacy.section3.item2')}</li>
          <li>{t('privacy.section3.item3')}</li>
        </ul>
        
        <h2 className="text-xl font-semibold mt-8 mb-2">{t('privacy.section4.title')}</h2>
        <ul>
          <li>{t('privacy.section4.item1')}</li>
          <li>{t('privacy.section4.item2')}</li>
          <li>{t('privacy.section4.item3')}</li>
        </ul>
        
        <h2 className="text-xl font-semibold mt-8 mb-2">{t('privacy.section5.title')}</h2>
        <ul>
          <li>{t('privacy.section5.item1')}</li>
          <li>{t('privacy.section5.item2')}</li>
          <li>{t('privacy.section5.item3')}</li>
        </ul>
        
        <h2 className="text-xl font-semibold mt-8 mb-2">{t('privacy.section6.title')}</h2>
        <ul>
          <li>{t('privacy.section6.item1')}</li>
          <li>{t('privacy.section6.item2')}</li>
          <li>{t('privacy.section6.item3')}</li>
        </ul>
        
        <h2 className="text-xl font-semibold mt-8 mb-2">{t('privacy.section7.title')}</h2>
        <ul>
          <li>{t('privacy.section7.item1')}</li>
          <li>{t('privacy.section7.item2')}</li>
          <li>{t('privacy.section7.item3')}</li>
        </ul>
        
        <h2 className="text-xl font-semibold mt-8 mb-2">{t('privacy.section8.title')}</h2>
        <ul>
          <li>{t('privacy.section8.item1')}</li>
        </ul>
        
        <p className="text-center mt-10">{t('privacy.conclusion')}</p>
      </div>
    </Container>
  );
};

export default PrivacyPolicyPage;
