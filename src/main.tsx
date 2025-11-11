import React from 'react';
import ReactDOM from 'react-dom/client';
import { AgentProvider } from './context/AgentContext';
import { ToastProvider } from './context/ToastContext';
import { ApiKeyProvider } from './context/ApiKeyContext';
import App from '../App'; // FIX: Changed to import from the root proxy App.tsx

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ApiKeyProvider>
      <AgentProvider>
        <ToastProvider>
          <App />
        </ToastProvider>
      </AgentProvider>
    </ApiKeyProvider>
  </React.StrictMode>
);