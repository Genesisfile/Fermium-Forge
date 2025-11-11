import React, { useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Navbar from './components/Navbar';
import Toast from './components/Toast';
import LoadingSpinner from './components/LoadingSpinner';
import ApiKeyGate from './components/ApiKeyModal';
import { ApiKeyContext } from './context/ApiKeyContext';
import { useCampaignEngine } from './hooks/useCampaignEngine'; // New Import

// Page Imports
import HomePage from './pages/HomePage';
import DashboardPage from './pages/DashboardPage';
import CouncilPage from './pages/CouncilPage';
import CreateAgentPage from './pages/CreateAgentPage';
import AgentDetailPage from './pages/AgentDetailPage';
import AgentLifecyclePage from './pages/agent/AgentLifecyclePage';
import AgentAnalysisPage from './pages/agent/AgentAnalysisPage';
import AgentSpecEditorPage from './pages/agent/AgentSpecEditorPage';
import PlaygroundPage from './pages/PlaygroundPage';
import DeploymentsPage from './pages/DeploymentsPage';
import DeploymentDetailPage from './pages/DeploymentDetailPage';
import CampaignMonitorPage from './pages/CampaignMonitorPage';
import CampaignCommandPage from './pages/CampaignCommandPage';
import CampaignDetailPage from './pages/CampaignDetailPage'; // New Import
import SystemPage from './pages/SystemPage';
import Health from './pages/system/Health';
import SystemIntegrity from '../pages/SystemIntegrity'; // FIX: Updated to import from the root proxy pages/SystemIntegrity.tsx
import Diagnostics from './pages/system/Diagnostics';
import Integrations from './pages/system/Integrations';
import Account from './pages/system/Account';

const AppLayout = () => {
  useCampaignEngine(); // Initialize the campaign simulation engine
  return (
    <>
      <div className="flex flex-col min-h-screen bg-background text-text-primary font-sans">
        <Navbar />
        <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Outlet />
        </main>
        <Toast />
      </div>
    </>
  );
};

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

// FIX: Explicitly import Component and ErrorInfo from React
class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="h-screen w-screen flex flex-col items-center justify-center bg-background text-text-primary">
          <h1 className="text-2xl font-bold text-red-500">Application Error</h1>
          <p className="mt-2 text-text-secondary">Something went wrong. Please check the console.</p>
          <pre className="mt-4 p-4 bg-surface rounded-lg text-sm text-red-400 max-w-xl overflow-auto">
            {this.state.error?.stack}
          </pre>
        </div>
      );
    }

    return this.props.children;
  }
}

const App: React.FC = () => {
  const { hasApiKey, isApiKeyLoading } = useContext(ApiKeyContext);

  if (isApiKeyLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-background">
        <LoadingSpinner text="Initializing..." size={12} />
        {/*
          NOTE: Removed the closing tag for LoadingSpinner from the original file,
          as it was placed incorrectly, potentially causing other JSX parsing issues.
          Assuming the original intent was for the LoadingSpinner to self-close.
        */}
        <Routes>
          <Route path="/" element={<ApiKeyGate />} />
        </Routes>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <ErrorBoundary>
        {!hasApiKey ? (
          <ApiKeyGate />
        ) : (
          <Routes>
            <Route path="/" element={<AppLayout />}>
              <Route index element={<HomePage />} />
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="council" element={<CouncilPage />} />
              <Route path="create" element={<CreateAgentPage />} />
              <Route path="playground" element={<PlaygroundPage />} />
              <Route path="deployments" element={<DeploymentsPage />} />
              <Route path="deployments/:deploymentId" element={<DeploymentDetailPage />} />
              <Route path="campaigns" element={<CampaignMonitorPage />} />
              <Route path="campaigns/command" element={<CampaignCommandPage />} />
              <Route path="campaigns/:campaignId" element={<CampaignDetailPage />} />
              <Route path="agent/:agentId" element={<AgentDetailPage />}>
                <Route index element={<Navigate to="lifecycle" replace />} />
                <Route path="lifecycle" element={<AgentLifecyclePage />} />
                <Route path="analysis" element={<AgentAnalysisPage />} />
                <Route path="spec" element={<AgentSpecEditorPage />} />
              </Route>
              <Route path="system" element={<SystemPage />}>
                <Route index element={<Navigate to="health" replace />} />
                <Route path="health" element={<Health />} />
                <Route path="integrity" element={<SystemIntegrity />} />
                <Route path="diagnostics" element={<Diagnostics />} />
                <Route path="integrations" element={<Integrations />} />
                <Route path="account" element={<Account />} />
              </Route>
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        )}
      </ErrorBoundary>
    </BrowserRouter>
  );
};

export default App;