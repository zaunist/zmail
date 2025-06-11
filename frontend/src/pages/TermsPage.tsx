import React from 'react';
import { useTranslation } from 'react-i18next';
import Container from '../components/Container';

const TermsPage: React.FC = () => {
  const { t } = useTranslation();
  
  return (
    <Container>
      <div className="prose max-w-none mx-auto">
        <h1 className="text-3xl font-bold mb-4 text-center">{t('terms.title')}</h1>
        <p className="text-lg text-center mb-8 text-muted-foreground">{t('terms.subtitle')}</p>
        
        <h2 className="text-xl font-semibold mt-8 mb-2">{t('terms.section1.title')}</h2>
        <ul>
          <li>{t('terms.section1.item1')}</li>
          <li>{t('terms.section1.item2')}</li>
        </ul>
        
        <h2 className="text-xl font-semibold mt-8 mb-2">{t('terms.section2.title')}</h2>
        <ul>
          <li>{t('terms.section2.item1')}</li>
          <li>{t('terms.section2.item2')}</li>
        </ul>
        
        <h2 className="text-xl font-semibold mt-8 mb-2">{t('terms.section3.title')}</h2>
        <ul>
          <li>{t('terms.section3.item1')}</li>
          <li>{t('terms.section3.item2')}</li>
          <li>{t('terms.section3.item3')}</li>
        </ul>
        
        <h2 className="text-xl font-semibold mt-8 mb-2">{t('terms.section4.title')}</h2>
        <ul>
          <li>{t('terms.section4.item1')}</li>
          <li>{t('terms.section4.item2')}</li>
        </ul>
        
        <h2 className="text-xl font-semibold mt-8 mb-2">{t('terms.section5.title')}</h2>
        <ul>
          <li>{t('terms.section5.item1')}</li>
          <li>{t('terms.section5.item2')}</li>
        </ul>
        
        <h2 className="text-xl font-semibold mt-8 mb-2">{t('terms.section6.title')}</h2>
        <ul>
          <li>{t('terms.section6.item1')}</li>
        </ul>
        
        <h2 className="text-xl font-semibold mt-8 mb-2">{t('terms.section7.title')}</h2>
        <ul>
          <li>{t('terms.section7.item1')}</li>
        </ul>
        
        <p className="text-center mt-10">{t('terms.conclusion')}</p>
      </div>
    </Container>
  );
};

export default TermsPage;