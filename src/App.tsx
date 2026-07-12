import React from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="font-serif italic text-zinc-500 text-lg">
          Loading Alluvial Site Manager...
        </div>
      </div>
    );
  }

  return user ? <Dashboard /> : <Login />;
}

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </LanguageProvider>
  );
}
