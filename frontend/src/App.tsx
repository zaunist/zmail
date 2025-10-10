import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import NotFoundPage from './pages/NotFoundPage';
import { MailboxProvider } from './contexts/MailboxContext';

const App: React.FC = () => {

  return (
      <MailboxProvider>
        <div className="min-h-screen bg-background">
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<HomePage />} />
              {/* 移除了 privacy-policy, terms, 和 about 的路由 */}
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>
        </div>
      </MailboxProvider>
  );
};

export default App;
