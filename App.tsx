import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import DeploymentHub from './pages/DeploymentHub';
import Integrations from './pages/Integrations';
import Account from './pages/Account';
import StrategyOperations from './pages/StrategyOperations';
import Health from './pages/Health';
import SystemIntegrity from './pages/SystemIntegrity';
import Diagnostics from './pages/Diagnostics';
import { ToastProvider } from './hooks/useToast';
import Toast from './components/Toast';
import AgentDetail from './pages/AgentDetail';
import AgentLifecycle from './pages/AgentLifecycle'; // RENAMED IMPORT: AgentStrategy -> AgentLifecycle
import AgentAnalysis from './pages/AgentAnalysis';
import Playground from './pages/Playground'; // FIX: Imported Playground component
// import AgentModelRoutingConfig from './pages/AgentModelRoutingConfig'; // REMOVED

const App: React.FC = () => {
  return (
    <HashRouter>
      <ToastProvider>
        <div className="min-h-screen bg-background text-text-primary font-sans">
          <Navbar />
          <main className="pt-20 px-4 sm:px-6 lg:px-8">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/strategy" element={<StrategyOperations />} />
              <Route path="/deploy" element={<DeploymentHub />} />
              <Route path="/health" element={<Health />} />
              <Route path="/integrity" element={<SystemIntegrity />} />
              <Route path="/diagnostics" element={<Diagnostics />} />
              <Route path="/integrations" element={<Integrations />} />
              <Route path="/account" element={<Account />} />
              <Route path="/playground" element={<Playground />} />
              
              <Route path="/agent/:agentId" element={<AgentDetail />}>
                <Route index element={<Navigate to="lifecycle" replace />} /> {/* Default to new unified lifecycle page */}
                <Route path="lifecycle" element={<AgentLifecycle />} /> {/* NEW: Unified lifecycle page */}
                <Route path="analysis" element={<AgentAnalysis />} />
                {/* <Route path="model-routing" element={<AgentModelRoutingConfig />} /> */} {/* REMOVED */}
              </Route>
            </Routes>
          </main>
        </div>
        <Toast />
      </ToastProvider>
    </HashRouter>
  );
};

export default App;