import React, { useState, useContext } from 'react';
import { useParams, Navigate, Link } from 'react-router-dom';
import { useAgentStore } from '../context/AgentContext';
import { useToast } from '../context/ToastContext';
import { ApiKeyContext } from '../context/ApiKeyContext';
import { Agent, Deployment, DeploymentStatus, SentinelAnalysis } from '../types';
import { generateSentinelAnalysis } from '../lib/gemini';
import LoadingSpinner from '../components/LoadingSpinner';
import { formatDistanceToNow } from '../lib/utils';
import { ClockIcon, ServerIcon, SparklesIcon, AlertTriangleIcon, CheckCircleIcon, XCircleIcon, InfoIcon } from '../components/icons';

const statusStyles: Record<DeploymentStatus, { bg: string; text: string; icon: React.ReactNode }> = {
  ACTIVE: { bg: 'bg-green-500/10', text: 'text-green-400', icon: <CheckCircleIcon className="h-5 w-5 mr-2" /> },
  DEGRADED: { bg: 'bg-yellow-500/10', text: 'text-yellow-400', icon: <AlertTriangleIcon className="h-5 w-5 mr-2" /> },
  OFFLINE: { bg: 'bg-red-500/10', text: 'text-red-400', icon: <XCircleIcon className="h-5 w-5 mr-2" /> },
};

const DeploymentStatusPill: React.FC<{ status: DeploymentStatus }> = ({ status }) => (
  <div className={`px-3 py-1 text-sm font-medium rounded-full inline-flex items-center ${statusStyles[status].bg} ${statusStyles[status].text}`}>
    {statusStyles[status].icon}
    <span className="capitalize">{status.toLowerCase()}</span>
  </div>
);

const SentinelAnalysisResult: React.FC<{ analysis: SentinelAnalysis }> = ({ analysis }) => (
    <div className="space-y-6 animate-fade-in">
        <div>
            <h4 className="font-bold text-lg text-text-primary mb-3">Root Cause Analysis</h4>
            <div className="p-4 bg-surface rounded-md border border-border-color text-text-secondary">
                <p>{analysis.rootCauseAnalysis}</p>
            </div>
        </div>
        <div>
            <h4 className="font-bold text-lg text-text-primary mb-3">Corrective Actions</h4>
             <ul className="space-y-2">
                {analysis.correctiveActions.map((action, index) => (
                    <li key={index} className="p-3 bg-surface rounded-md border border-border-color text-text-secondary flex items-start">
                        <CheckCircleIcon className="h-5 w-5 text-accent mr-3 mt-0.5 flex-shrink-0" />
                        <span>{action}</span>
                    </li>
                ))}
            </ul>
        </div>
        <div>
            <h4 className="font-bold text-lg text-text-primary mb-3">Evolution Suggestions</h4>
            <ul className="space-y-2">
                {analysis.evolutionSuggestions.map((suggestion, index) => (
                     <li key={index} className="p-3 bg-surface rounded-md border border-border-color text-text-secondary flex items-start">
                        <SparklesIcon className="h-5 w-5 text-primary mr-3 mt-0.5 flex-shrink-0" />
                        <span>{suggestion}</span>
                    </li>
                ))}
            </ul>
        </div>
    </div>
);

const DeploymentDetailPage: React.FC = () => {
    const { deploymentId } = useParams<{ deploymentId: string }>();
    const { state } = useAgentStore();
    const { callGeminiApi } = useContext(ApiKeyContext);
    const { showToast } = useToast();

    const [isLoading, setIsLoading] = useState(false);
    const [analysis, setAnalysis] = useState<SentinelAnalysis | null>(null);

    let agent: Agent | undefined;
    let deployment: Deployment | undefined;

    for (const ag of state.agents) {
        const dep = ag.deployments?.find(d => d.id === deploymentId);
        if (dep) {
            agent = ag;
            deployment = dep;
            break;
        }
    }

    const handleRunDiagnostic = async () => {
        if (!agent || !deployment) return;
        setIsLoading(true);
        setAnalysis(null);
        showToast("Sentinel is analyzing deployment logs...", "info");
        try {
            const result = await callGeminiApi(() => generateSentinelAnalysis(agent.name, deployment.logs));
            if (result) {
                setAnalysis(result);
                showToast("Sentinel analysis complete.", "success");
            }
        } catch (error) {
            console.error("Sentinel Analysis failed", error);
            showToast("Sentinel analysis failed.", "error");
        } finally {
            setIsLoading(false);
        }
    };

    if (!agent || !deployment) {
        return <Navigate to="/deployments" replace />;
    }

    return (
        <div className="space-y-8">
            <header className="bg-surface p-6 rounded-lg border border-border-color">
                <div className="flex justify-between items-start flex-wrap gap-4">
                    <div>
                        <Link to={`/agent/${agent.id}`} className="text-primary hover:underline font-semibold">{agent.name} <span className="text-text-secondary font-normal">v{deployment.agentVersion}</span></Link>
                        <h1 className="text-3xl font-bold text-text-primary">{deployment.environment}</h1>
                        <p className="text-text-secondary mt-1">Deployment ID: {deployment.id}</p>
                    </div>
                    <DeploymentStatusPill status={deployment.status} />
                </div>
                 <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-6 text-center border-t border-border-color pt-6">
                    <div>
                        <p className="text-sm text-text-secondary">Tasks Processed</p>
                        <p className="text-2xl font-bold text-text-primary">{deployment.metrics.tasksProcessed.toLocaleString()}</p>
                    </div>
                     <div>
                        <p className="text-sm text-text-secondary">Error Rate</p>
                        <p className="text-2xl font-bold text-text-primary">{deployment.metrics.errorRate}%</p>
                    </div>
                     <div>
                        <p className="text-sm text-text-secondary">Last Heartbeat</p>
                        <p className="text-2xl font-bold text-text-primary">{formatDistanceToNow(deployment.lastHeartbeat)}</p>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-surface p-6 rounded-lg border border-border-color">
                    <h2 className="text-2xl font-bold text-text-primary mb-6">Sentinel Analysis</h2>
                     {isLoading ? (
                        <div className="flex justify-center items-center h-full min-h-[300px]">
                            <LoadingSpinner text="Sentinel is analyzing..." />
                        </div>
                    ) : analysis ? (
                        <SentinelAnalysisResult analysis={analysis} />
                    ) : (
                        <div className="text-center flex flex-col items-center justify-center h-full min-h-[300px]">
                             <SparklesIcon className="h-12 w-12 text-primary" />
                             <p className="text-text-secondary my-4 max-w-sm">Run AI-powered diagnostics to identify issues and get optimization suggestions.</p>
                             <button onClick={handleRunDiagnostic} className="inline-flex items-center justify-center bg-primary text-white font-semibold px-6 py-2 rounded-lg shadow-lg hover:bg-primary-focus transition-transform transform hover:-translate-y-0.5 duration-300">
                                <SparklesIcon className="h-5 w-5 mr-2" />
                                Run Sentinel Diagnostic
                            </button>
                        </div>
                    )}
                </div>

                <div className="bg-surface p-6 rounded-lg border border-border-color">
                     <h2 className="text-2xl font-bold text-text-primary mb-6">Activity Logs</h2>
                     <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                        {deployment.logs.length > 0 ? deployment.logs.map(log => (
                            <div key={log.id} className="text-sm font-mono p-3 bg-surface-light rounded-md flex items-start">
                                {log.type === 'SUCCESS' && <CheckCircleIcon className="h-4 w-4 text-green-500 mr-3 mt-0.5 flex-shrink-0" />}
                                {log.type === 'ERROR' && <XCircleIcon className="h-4 w-4 text-red-500 mr-3 mt-0.5 flex-shrink-0" />}
                                {log.type === 'INFO' && <InfoIcon className="h-4 w-4 text-blue-500 mr-3 mt-0.5 flex-shrink-0" />}
                                <span className={log.type === 'ERROR' ? 'text-red-400' : 'text-text-secondary'}>{log.message}</span>
                            </div>
                        )) : (
                             <p className="text-text-secondary text-center py-8">No logs available for this deployment.</p>
                        )}
                     </div>
                </div>
            </div>
        </div>
    );
};

export default DeploymentDetailPage;
