import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAgentStore } from '../context/AgentContext';
import { useToast } from '../context/ToastContext';
import { Campaign, Agent } from '../types';
import { CampaignsIcon, PlusIcon } from '../components/icons';

const CampaignCommandPage: React.FC = () => {
    const { state, dispatch } = useAgentStore();
    const { agents } = state;
    const navigate = useNavigate();
    const { showToast } = useToast();

    const [name, setName] = useState('');
    const [objective, setObjective] = useState('');
    const [selectedAgentIds, setSelectedAgentIds] = useState<string[]>([]);

    const handleAgentSelection = (agentId: string) => {
        setSelectedAgentIds(prev =>
            prev.includes(agentId)
                ? prev.filter(id => id !== agentId)
                : [...prev, agentId]
        );
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || !objective.trim() || selectedAgentIds.length === 0) {
            showToast("Please fill all fields and select at least one agent.", "warning");
            return;
        }

        const newCampaign: Campaign = {
            id: `camp-${Date.now()}`,
            name,
            objective,
            agentIds: selectedAgentIds,
            status: 'RUNNING', // Start campaigns immediately
            createdAt: new Date().toISOString(),
            logs: [],
        };

        dispatch({ type: 'CREATE_CAMPAIGN', payload: newCampaign });
        showToast(`Campaign "${name}" launched!`, "success");
        navigate('/campaigns/monitor');
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-bold text-text-primary">Launch a New Campaign</h1>
                <p className="mt-4 text-lg text-text-secondary max-w-2xl mx-auto">
                    Define the objective for a multi-agent operation and assign agents to the task.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="bg-surface p-8 rounded-lg border border-border-color space-y-8">
                <div>
                    <label htmlFor="campaignName" className="block text-sm font-medium text-text-primary mb-2">Campaign Name</label>
                    <input
                        id="campaignName"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g., Q3 Market Analysis Operation"
                        className="w-full bg-surface-light border border-border-color rounded-lg p-3 text-text-primary focus:ring-2 focus:ring-primary focus:border-primary transition"
                        required
                    />
                </div>
                <div>
                    <label htmlFor="campaignObjective" className="block text-sm font-medium text-text-primary mb-2">Primary Objective</label>
                    <textarea
                        id="campaignObjective"
                        value={objective}
                        onChange={(e) => setObjective(e.target.value)}
                        placeholder="Describe the main goal of this campaign..."
                        className="w-full bg-surface-light border border-border-color rounded-lg p-3 text-text-primary focus:ring-2 focus:ring-primary focus:border-primary transition min-h-[120px] resize-y"
                        rows={4}
                        required
                    />
                </div>

                <div>
                    <h3 className="text-sm font-medium text-text-primary mb-2">Assign Agents</h3>
                    {agents.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 max-h-60 overflow-y-auto p-4 bg-surface-light rounded-lg border border-border-color">
                            {agents.map(agent => (
                                <label key={agent.id} className="flex items-center p-3 bg-surface rounded-md cursor-pointer hover:bg-surface-light border border-transparent has-[:checked]:border-primary transition-colors">
                                    <input
                                        type="checkbox"
                                        checked={selectedAgentIds.includes(agent.id)}
                                        onChange={() => handleAgentSelection(agent.id)}
                                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                    />
                                    <span className="ml-3 text-sm font-medium text-text-primary">{agent.name}</span>
                                </label>
                            ))}
                        </div>
                    ) : (
                        <p className="text-text-secondary text-sm">No agents available to assign. Please create an agent first.</p>
                    )}
                </div>

                <div className="pt-5">
                    <button
                        type="submit"
                        className="w-full flex items-center justify-center bg-primary text-white font-semibold py-3 px-6 rounded-lg shadow-lg hover:bg-primary-focus transition-all duration-300 disabled:bg-primary/50 disabled:cursor-not-allowed"
                        disabled={!name.trim() || !objective.trim() || selectedAgentIds.length === 0}
                    >
                        <CampaignsIcon className="h-5 w-5 mr-2" />
                        Launch Campaign
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CampaignCommandPage;
