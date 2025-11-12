

import React, { lazy, Suspense } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';

import { ToastProvider } from './hooks/useToast';
import Toast from './components/Toast';
import AppHeader from './components/AppHeader';
import LoadingSpinner from './components/LoadingSpinner';

// Fix: Lazy-load UnifiedForgeStudio component, explicitly referencing the default export
const LazyUnifiedForgeStudio = lazy(() => import('./pages/UnifiedForgeStudio').then(module => ({ default: module.default })));

const App: React.FC = () => {
  return (
    <HashRouter>
      <ToastProvider>
        <div className="min-h-screen bg-background text-text-primary font-sans">
          {/* Global fixed header wrapper */}
          <header className="fixed top-0 left-0 right-0 z-50 bg-surface/80 backdrop-blur-md border-b border-border-color">
            <AppHeader />
          </header>
          <main className="min-h-screen pt-20"> {/* Add padding for fixed header */}
            <Routes>
              {/* Fix: Use LazyUnifiedForgeStudio with Suspense fallback */}
              <Route path="/" element={<Suspense fallback={<LoadingSpinner />}><LazyUnifiedForgeStudio /></Suspense>} />
              
              {/* Redirect any old invalid paths to the new forge studio */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
        <Toast />
      </ToastProvider>
    </HashRouter>
  );
};

export default App;