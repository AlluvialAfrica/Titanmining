import React, { Suspense, lazy } from 'react';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import ErrorBoundary from './components/ErrorBoundary';

const Login = lazy(() => import('./pages/Login'));
const Dashboard = lazy(() => import('./pages/Dashboard'));

function AppContent() {
  const { user, loading } = useAuth();
  const { t } = useLanguage();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="font-serif italic text-zinc-500 text-lg">
          {t('app.loading')}
        </div>
      </div>
    );
  }

  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="font-serif italic text-zinc-500 text-lg">Loading...</div>
      </div>
    }>
      {user ? <Dashboard /> : <Login />}
    </Suspense>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <LanguageProvider>
        <AuthProvider>
          <AppContent />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 5000,
              style: { fontFamily: 'Inter, sans-serif', fontSize: '13px' },
              error: { duration: 7000 },
            }}
          />
        </AuthProvider>
      </LanguageProvider>
    </ErrorBoundary>
  );
}
