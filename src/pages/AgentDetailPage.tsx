import React, { useState, useContext } from 'react';
import { Outlet, useParams, NavLink, Navigate } from 'react-router-dom';
import { useAgentStore } from '../context/AgentContext';
import { useToast } from '../context/ToastContext';
import { AgentStatus } from '../types';
import { certifyAgent, evolveAgent } from '../lib/gemini';
import { ApiKeyContext } from '../context/ApiKeyContext';
import LoadingSpinner from '../components/LoadingSpinner';
import { ShieldCheckIcon, SparklesIcon } from '../components/icons';

const statusColors: Record<AgentStatus, { bg: string; text: string }> = {
  IDLE: { bg: 'bg-gray-500/10', text: 'text-gray-400' },
  TRAINING: { bg: 'bg-blue-500/10', text: 'text-blue-400' },
  DEPLOYED: { bg: 'bg-green-500/10', text: 'text-green-400' },
  CERTIFYING: { bg: 'bg-yellow-500/10', text: 'text-yellow-400' },
  ERROR: { bg: 'bg-red-500/10', text: 'text-red-400' },
};

const AgentStatusPill: React.FC<{ status: AgentStatus }> = ({ status }) => (
  <div className={`px-3 py-1 text-sm font-medium rounded-full inline-flex items-center ${statusColors[status].bg} ${statusColors[status].text}`}>
    <span className="capitalize">{status.toLowerCase()}</span>
  </div>
);

const AgentDetailPage: React.FC = () => {
    const { agentId } = useParams<{ agentId: string }>();
    const { state, dispatch } = useAgentStore();
    const { callGeminiApi } = useContext(ApiKeyContext);
    const { showToast } = useToast();
    const [isCertifying, setIsCertifying] = useState(false);
    const [isEvolving, setIsEvolving] = useState(false);
    
    const agent = state.agents.find(a => a.id === agentId);

    const navLinkClass = ({ isActive }: { isActive: boolean }) =>
        `px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
        isActive
            ? 'bg-surface-light text-text-primary'
            : 'text-text-secondary hover:bg-surface hover:text-text-primary'
        }`;
        
    const handleCertify = async () => {
        if (!agent) return;
        setIsCertifying(true);
        dispatch({ type: 'UPDATE_AGENT_STATUS', payload: { agentId: agent.id, status: 'CERTIFYING' } });
        try {
            const report = await callGeminiApi(() => certifyAgent(agent));
            if (report) {
                dispatch({ type: 'ADD_CERTIFICATION_REPORT', payload: { agentId: agent.id, report } });
                dispatch({ type: 'UPDATE_AGENT_STATUS', payload: { agentId: agent.id, status: 'DEPLOYED' } });
                showToast("Agent certified and deployed successfully!", "success");
            } else {
                // If callGeminiApi returns null due to API key error, reset status
                dispatch({ type: 'UPDATE_AGENT_STATUS', payload: { agentId: agent.id, status: 'IDLE' } });
            }
        } catch (error) {
            console.error("Certification failed", error);
            showToast("Agent certification failed.", "error");
            dispatch({ type: 'UPDATE_AGENT_STATUS', payload: { agentId: agent.id, status: 'ERROR' } });
        } finally {
            setIsCertifying(false);
        }
    };

    const handleEvolve = async () => {
        if (!agent) return;
        setIsEvolving(true);
        showToast("AI is analyzing evolution paths...", "info");
        try {
            const evolvedData = await callGeminiApi(() => evolveAgent(agent));
            if (evolvedData) {
                dispatch({
                    type: 'EVOLVE_AGENT',
                    payload: {
                        agentId: agent.id,
                        newSpecifications: evolvedData.newSpecifications,
                        evolution: {
                            newVersion: evolvedData.newVersion,
                            rationale: evolvedData.rationale,
                            timestamp: new Date().toISOString(),
                        },
                    },
                });
                showToast(`Agent evolved to v${evolvedData.newVersion}!`, "success");
            }
        } catch (error) {
            console.error("Evolution failed", error);
            showToast("Agent evolution failed.", "error");
        } finally {
            setIsEvolving(false);
        }
    };

    if (!agent) {
        return <Navigate to="/dashboard" replace />;
    }

    const navItems = [
        { path: 'lifecycle', label: 'Lifecycle' },
        { path: 'analysis', label: 'Analysis' },
        { path: 'spec', label: 'Specifications' },
    ];

    return (
        <div className="space-y-8">
            <header className="bg-surface p-6 rounded-lg border border-border-color">
                <div className="flex justify-between items-start flex-wrap gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-text-primary">{agent.name}</h1>
                        <p className="text-text-secondary mt-1">Version {agent.version} &bull; ID: {agent.id}</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <AgentStatusPill status={agent.status} />
                         {(agent.status === 'IDLE' || agent.status === 'DEPLOYED') && (
                            <button onClick={handleEvolve} disabled={isEvolving || isCertifying} className="inline-flex items-center justify-center bg-primary text-white font-semibold px-4 py-2 text-sm rounded-lg shadow-lg hover:bg-primary-focus transition-transform transform hover:-translate-y-0.5 duration-300 disabled:opacity-50 disabled:cursor-not-allowed">
                                {isEvolving ? <LoadingSpinner size={5} /> : <><SparklesIcon className="h-5 w-5 mr-2" /> Evolve Agent</>}
                            </button>
                         )}
                         {agent.status === 'IDLE' && (
                             <button onClick={handleCertify} disabled={isCertifying || isEvolving} className="inline-flex items-center justify-center bg-accent text-white font-semibold px-4 py-2 text-sm rounded-lg shadow-lg hover:bg-accent-focus transition-transform transform hover:-translate-y-0.5 duration-300 disabled:opacity-50 disabled:cursor-not-allowed">
                                 {isCertifying ? <LoadingSpinner size={5} /> : <><ShieldCheckIcon className="h-5 w-5 mr-2" /> Certify Agent</>}
                             </button>
                         )}
                    </div>
                </div>
                <p className="mt-4 text-text-secondary max-w-3xl">{agent.description}</p>
            </header>

            <nav className="flex items-center space-x-2 p-2 bg-surface rounded-lg border border-border-color">
                {navItems.map(item => (
                     <NavLink key={item.path} to={item.path} className={navLinkClass}>
                        {item.label}
                    </NavLink>
                ))}
            </nav>

            <div className="bg-surface p-6 rounded-lg border border-border-color min-h-[300px]">
                 <Outlet context={{ agent }} />
            </div>
        </div>
    );
};

export default AgentDetailPage;