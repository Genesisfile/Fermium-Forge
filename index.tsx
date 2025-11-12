import React, { Suspense, lazy } from 'react';
import ReactDOM from 'react-dom/client';

import { AgentProvider } from './hooks/useAgentStore';
import LoadingSpinner from './components/LoadingSpinner';

const LazyApp = lazy(() => import('./App'));

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Could not find root element to mount to');
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <Suspense fallback={<LoadingSpinner />}>
      <AgentProvider>
        <LazyApp />
      </AgentProvider>
    </Suspense>
  </React.StrictMode>
);