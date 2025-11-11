import React, { useState, useEffect, useCallback, useContext } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { useAgentStore } from '../context/AgentContext';
import { Campaign, CampaignStatus, CampaignLog, Agent } from '../types';
import { formatDistanceToNow } from '../lib/utils';
import { CampaignsIcon, ClockIcon, CheckCircleIcon, XCircleIcon, InfoIcon, SparklesIcon } from '../components/icons';
import { useToast } from '../context/ToastContext';
import { ApiKeyContext } from '../context/ApiKeyContext';
import { generateEvolutionProposal } from '../lib/gemini';
import LoadingSpinner from '../components/LoadingSpinner';

const statusStyles: Record<CampaignStatus, { indicator: string; text: string; icon: React.ReactNode }> = {
    PLANNING: { indicator: 'bg-gray-500/10', text: 'text-gray-400', icon: <InfoIcon className="h-5 w-5 mr-2" /> },
    RUNNING: { indicator: 'bg-blue-500/10', text: 'text-blue-400', icon: <SparklesIcon className="h-5 w-5 mr-2 animate-pulse" /> },
    COMPLETED: { indicator: 'bg-green-500/10', text: 'text-green-400', icon: <CheckCircleIcon className="h-5 w-5 mr-2" /> },
    FAILED: { indicator: 'bg-red-500/10', text: 'text-red-400', icon: <XCircleIcon className="h-5 w-5 mr-2" /> },
};

const CampaignStatusPill: React.FC<{ status: CampaignStatus }> = ({ status }) => (
    <div className={`px-3 py-1 text-sm font-medium rounded-full inline-flex items-center ${statusStyles[status].bg} ${statusStyles[status].text}`}>
        {statusStyles[status].icon}
        <span className="capitalize">{status.toLowerCase()}</span>
    </div>
);

const CampaignLogEntry: React.FC<{ log: CampaignLog }> = ({ log }) => {
    return (
        <div className="text-sm p-3 bg-surface-light rounded-md flex items-start">
            <ClockIcon className="h-4 w-4 text-text-secondary mr-3 mt-0.5 flex-shrink-0" />
            <div>
                <p className="text-text-primary">
                    <span className="font-semibold">{log.agentName}:</span> {log.message}
                </p>
                <p className="text-xs text-text-secondary mt-0.5">{formatDistanceToNow(log.timestamp)}</p>
            </div>
        </div>
    );
};

const CampaignDetailPage: React.FC = () => {
    const { campaignId } = useParams<{ campaignId: string }>();
    const { state, dispatch } = useAgentStore();
    const { showToast } = useToast();
    const { callGeminiApi } = useContext(ApiKeyContext);

    const campaign = state.campaigns.find(c => c.id === campaignId);
    const assignedAgents = campaign?.agentIds.map(agentId => state.agents.find(a => a.id === agentId)).filter(Boolean) as Agent[] || [];

    const [isLoadingProposal, setIsLoadingProposal] = useState(false);
    const [evolutionProposal, setEvolutionProposal] = useState<{ agentId: string; proposal: string } | null>(null);

    const handleGenerateEvolutionProposal = useCallback(async (agent: Agent) => {
        setIsLoadingProposal(true);
        setEvolutionProposal(null);
        showToast(`Generating evolution proposal for agent ${agent.name}...`, 'info');

        try {
            // This is a simplification; a real system would analyze campaign performance
            // Here, we just use a generic prompt to get an evolution proposal
            const dummyRecommendation = `Agent ${agent.name} needs to improve its efficiency and focus in multi-agent tasks.`;
            const proposalData = await callGeminiApi(() => generateEvolutionProposal(agent, dummyRecommendation));

            if (proposalData) {
                const proposalText = `New Version: ${proposalData.newVersion}\nRationale: ${proposalData.rationale}\n\nNew Specifications:\n${proposalData.newSpecifications.map(s => `- ${s.name}: ${s.description}`).join('\n')}`;
                setEvolutionProposal({ agentId: agent.id, proposal: proposalText });
                showToast(`Evolution proposal generated for ${agent.name}!`, 'success');

                // Optionally, automatically evolve the agent after proposal generation (for demo purposes)
                dispatch({
                    type: 'EVOLVE_AGENT',
                    payload: {
                        agentId: agent.id,
                        newSpecifications: proposalData.newSpecifications,
                        evolution: {
                            newVersion: proposalData.newVersion,
                            rationale: proposalData.rationale,
                            timestamp: new Date().toISOString(),
                        },
                    },
                });
                showToast(`Agent ${agent.name} automatically evolved to v${proposalData.newVersion}.`, 'info');
            } else {
                showToast(`Failed to generate evolution proposal for ${agent.name}.`, 'error');
            }
        } catch (error) {
            console.error(`Error generating evolution proposal for agent ${agent.name}:`, error);
            showToast(`Error generating evolution proposal for ${agent.name}.`, 'error');
        } finally {
            setIsLoadingProposal(false);
        }
    }, [callGeminiApi, showToast, dispatch, state.agents]); // Added state.agents to dependencies to ensure up-to-date agent data for dispatch.

    const handleCompleteCampaign = () => {
        if (campaign) {
            dispatch({ type: 'UPDATE_CAMPAIGN_STATUS', payload: { campaignId: campaign.id, status: 'COMPLETED' } });
            showToast(`Campaign "${campaign.name}" marked as completed.`, 'success');
        }
    };

    const handleFailCampaign = () => {
        if (campaign) {
            dispatch({ type: 'UPDATE_CAMPAIGN_STATUS', payload: { campaignId: campaign.id, status: 'FAILED' } });
            showToast(`Campaign "${campaign.name}" marked as failed.`, 'error');
        }
    };

    if (!campaign) {
        return <Navigate to="/campaigns" replace />;
    }

    return (
        <div className="space-y-8">
            <header className="bg-surface p-6 rounded-lg border border-border-color">
                <div className="flex justify-between items-start flex-wrap gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-text-primary">{campaign.name}</h1>
                        <p className="text-text-secondary mt-1">Campaign ID: {campaign.id}</p>
                    </div>
                    <CampaignStatusPill status={campaign.status} />
                </div>
                <p className="mt-4 text-text-secondary max-w-3xl">{campaign.objective}</p>
                <div className="mt-6 pt-6 border-t border-border-color flex flex-wrap gap-4 items-center justify-end">
                    {campaign.status === 'RUNNING' && (
                        <>
                            <button
                                onClick={handleCompleteCampaign}
                                className="inline-flex items-center justify-center bg-green-600 text-white font-semibold px-4 py-2 text-sm rounded-lg shadow-lg hover:bg-green-700 transition-transform transform hover:-translate-y-0.5 duration-300"
                            >
                                <CheckCircleIcon className="h-5 w-5 mr-2" /> Complete Campaign
                            </button>
                            <button
                                onClick={handleFailCampaign}
                                className="inline-flex items-center justify-center bg-red-600 text-white font-semibold px-4 py-2 text-sm rounded-lg shadow-lg hover:bg-red-700 transition-transform transform hover:-translate-y-0.5 duration-300"
                            >
                                <XCircleIcon className="h-5 w-5 mr-2" /> Fail Campaign
                            </button>
                        </>
                    )}
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="bg-surface p-6 rounded-lg border border-border-color lg:col-span-1">
                    <h2 className="text-2xl font-bold text-text-primary mb-6">Assigned Agents</h2>
                    {assignedAgents.length > 0 ? (
                        <ul className="space-y-3">
                            {assignedAgents.map(agent => (
                                <li key={agent.id} className="p-3 bg-surface-light rounded-md border border-border-color">
                                    <h3 className="font-semibold text-text-primary">{agent.name} <span className="text-text-secondary text-sm">v{agent.version}</span></h3>
                                    <p className="text-xs text-text-secondary mt-1">{agent.description}</p>
                                    <button
                                        onClick={() => handleGenerateEvolutionProposal(agent)}
                                        disabled={isLoadingProposal}
                                        className="mt-3 text-sm text-primary hover:underline flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isLoadingProposal && evolutionProposal?.agentId === agent.id ? <LoadingSpinner size={4} /> : <SparklesIcon className="h-4 w-4 mr-2" />}
                                        {isLoadingProposal && evolutionProposal?.agentId === agent.id ? 'Generating...' : 'Propose Evolution'}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-text-secondary text-center py-8">No agents assigned to this campaign.</p>
                    )}
                </div>

                <div className="bg-surface p-6 rounded-lg border border-border-color lg:col-span-2">
                    <h2 className="text-2xl font-bold text-text-primary mb-6">Campaign Activity Log</h2>
                    <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                        {campaign.logs.length > 0 ? (
                            campaign.logs.slice().reverse().map((log) => ( // Reverse to show newest first
                                <CampaignLogEntry key={log.id} log={log} />
                            ))
                        ) : (
                            <p className="text-text-secondary text-center py-8">No activity logs yet for this campaign.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CampaignDetailPage;
