import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAgentStore } from '../hooks/useAgentStore';
// FIX: Add getAiAssistedDesign to the import statement
import { getAiAssistedDesign } from '../services/geminiService';
import type { AgentType, FeatureEngine, Strategy } from '../types'; // Added Strategy import
import { LightbulbIcon, StrategyIcon, InfoIcon, StrategyPlanIcon } from '../components/icons/Icons'; // Import marked for Markdown rendering, NEW: StrategyPlanIcon
import { marked } from 'marked'; // Import marked for Markdown rendering
import { initialStrategies, initialFeatureEngines as allFeatureEnginesConstants, CAPABILITY_PREFIX } from '../utils/constants'; // NEW: Import CAPABILITY_PREFIX

type DesignState = 'idle' | 'designing' | 'designed' | 'launching';

const StrategyOperations: React.FC = () => {
    const { strategies, featureEngines, createAgentWithStrategy, addLog } = useAgentStore();
    const navigate = useNavigate();

    const [concept, setConcept] = useState('');
    const [designState, setDesignState] = useState<DesignState>('idle');
    const [agentDesign, setAgentDesign] = useState<{
        name: string;
        objective: string;
        type: AgentType;
        recommendedStrategyId: string;
        recommendedEngineIds: string[];
        recommendRealtimeFeedback: boolean;
    } | null>(null);

    const handleDesign = async () => {
        if (!concept.trim()) return;
        setDesignState('designing');
        try {
            // Passing allFeatureEnginesConstants to getAiAssistedDesign for proper capability assignment
            const design = await getAiAssistedDesign(concept, allFeatureEnginesConstants, addLog); // Pass addLog here
            setAgentDesign(design);
            setDesignState('designed');
        } catch (error) {
            console.error("Failed to get AI-assisted design", error);
            setDesignState('idle');
            // TODO: Add user feedback here, e.g., via a toast notification.
        }
    };
    
    const handleLaunch = () => {
        if (!agentDesign) return;
        setDesignState('launching');
        const newAgent = createAgentWithStrategy(
            agentDesign.name,
            agentDesign.objective,
            agentDesign.type,
            agentDesign.recommendedStrategyId,
            agentDesign.recommendedEngineIds,
            agentDesign.recommendRealtimeFeedback
        );
        navigate(`/agent/${newAgent._id}/lifecycle`);
    };

    // Helper function to generate capability text
    const getCapabilitiesDescription = (design: typeof agentDesign, allStrategies: Strategy[], allEngines: FeatureEngine[]) => {
        if (!design) return "";

        const descriptions: string[] = [];

        // Core Strategy Implication
        const selectedStrategy = allStrategies.find(s => s._id === design.recommendedStrategyId);
        if (selectedStrategy) {
            descriptions.push(`**Strategy:** Your agent will autonomously execute the '${selectedStrategy.name}' lifecycle, handling stages like ${selectedStrategy.steps.map(s => s.type).join(', ')}. This ensures a structured and automated path from inception to deployment and optimization.`);
        }

        // Real-time Feedback for Auto-Evolution
        if (design.recommendRealtimeFeedback) {
            descriptions.push(`**Auto-Evolution:** Enabled for continuous improvement, your agent will analyze real-time feedback and trigger its own re-evolution cycles. This makes your agent highly adaptive and persistent, learning and growing without constant manual intervention.`);
        }

        // Integrated Feature Engines
        if (design.recommendedEngineIds && design.recommendedEngineIds.length > 0) {
            const engineNames = design.recommendedEngineIds.map(id => {
                const engine = allEngines.find(fe => fe._id === id);
                // Ensure CAPABILITY_PREFIX is removed for display name if it's a capability
                const displayName = engine ? engine.name.startsWith(CAPABILITY_PREFIX) ? engine.name.substring(CAPABILITY_PREFIX.length).replace(/_/g, ' ') : engine.name : id;
                return engine ? `**${displayName}** (${engine.description})` : id;
            }).join(';\n*   ');
            descriptions.push(`**Feature Engines:** Integrated with powerful capabilities:\n*   ${engineNames}. These specialized tools augment your agent's core intelligence.`);
        } else {
            descriptions.push(`**No Feature Engines:** This agent will rely solely on its core LLM's capabilities without specialized integrations. This might be suitable for simpler, general-purpose tasks.`);
        }

        // Agent Type implications
        if (design.type === 'Analytical') {
            descriptions.push(`**Analytical Core:** Highly optimized for data analysis, complex problem-solving, logical reasoning, and structured output. Expect precise, data-driven responses.`);
        } else if (design.type === 'Creative') {
            descriptions.push(`**Creative Core:** Designed for generating novel content, imaginative ideas, engaging narratives, and diverse media formats. Ideal for brainstorming and content creation.`);
        } else if (design.type === 'Strategist') { // NEW: Strategist type implication
            descriptions.push(`**Strategic Core:** Specialized in high-level planning and continuous analysis. This agent will formulate and refine optimal development strategy plans, focusing on system-wide improvements and evolution protocols.`);
        }
        else { // Standard
            descriptions.push(`**Standard Core:** A balanced foundation for general-purpose tasks, information retrieval, and flexible adaptation across various domains. A versatile choice for many applications.`);
        }

        return descriptions.join('\n\n');
    };

    if (designState === 'designed' && agentDesign) {
        return (
             <div className="container mx-auto py-12 max-w-4xl animate-fade-in">
                <h1 className="text-4xl font-extrabold text-center mb-4">Agent Blueprint</h1>
                <p className="text-center text-lg text-text-secondary mb-10">Review the AI-generated blueprint for your agent. You can make adjustments before launching.</p>
                
                <div className="bg-surface p-8 rounded-xl border border-border-color shadow-lg space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1">Agent Name</label>
                        <input type="text" value={agentDesign.name} onChange={(e) => setAgentDesign({...agentDesign, name: e.target.value})} className="w-full bg-surface-light border border-border-color rounded-lg p-3 text-2xl font-bold"/>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1">Mission Objective</label>
                        <textarea value={agentDesign.objective} onChange={(e) => setAgentDesign({...agentDesign, objective: e.target.value})} rows={3} className="w-full bg-surface-light border border-border-color rounded-lg p-3"/>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-1">Agent Type</label>
                            <select value={agentDesign.type} onChange={(e) => setAgentDesign({...agentDesign, type: e.target.value as AgentType})} className="w-full bg-surface-light border border-border-color rounded-lg p-3">
                                <option value="Standard">Standard</option>
                                <option value="Creative">Creative</option>
                                <option value="Analytical">Analytical</option>
                                <option value="Strategist">Strategist</option> {/* NEW: Strategist type option */}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-1">Lifecycle Strategy</label>
                            <select value={agentDesign.recommendedStrategyId} onChange={(e) => setAgentDesign({...agentDesign, recommendedStrategyId: e.target.value})} className="w-full bg-surface-light border border-border-color rounded-lg p-3">
                                {strategies.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-2">Feature Engines</label>
                        <div className="grid grid-cols-2 gap-4">
                            {featureEngines.map(engine => (
                                <label key={engine._id} className="flex items-center space-x-3 bg-surface-light p-3 rounded-lg border border-border-color">
                                    <input type="checkbox"
                                        checked={agentDesign.recommendedEngineIds.includes(engine._id)}
                                        onChange={(e) => {
                                            const newIds = e.target.checked
                                                ? [...agentDesign.recommendedEngineIds, engine._id]
                                                : agentDesign.recommendedEngineIds.filter(id => id !== engine._id);
                                            setAgentDesign({ ...agentDesign, recommendedEngineIds: newIds });
                                        }}
                                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                    />
                                    <span>{engine.name}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                    
                    <div>
                         <label className="flex items-center space-x-3 bg-surface-light p-3 rounded-lg border border-border-color">
                            <input type="checkbox"
                                checked={agentDesign.recommendRealtimeFeedback}
                                onChange={(e) => setAgentDesign({ ...agentDesign, recommendRealtimeFeedback: e.target.checked })}
                                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                            />
                            <span>Enable Real-time Feedback Loop for Auto-Evolution</span>
                        </label>
                    </div>

                    {/* NEW SECTION: Understanding Your Agent's Capabilities */}
                    <div className="mt-6">
                        <h2 className="text-xl font-bold mb-3 flex items-center space-x-2">
                            <InfoIcon className="w-6 h-6 text-primary"/>
                            <span>Understanding Your Agent's Capabilities</span>
                        </h2>
                        <div className="bg-blue-500/20 text-blue-300 p-4 rounded-lg border border-blue-500/50 text-sm">
                            <p className="mb-2">Based on your blueprint, here's what your agent is uniquely designed to do:</p>
                            <div className="markdown-content" dangerouslySetInnerHTML={{ __html: marked.parse(getCapabilitiesDescription(agentDesign, initialStrategies, allFeatureEnginesConstants)) }}></div>
                            <p className="mt-4 text-xs text-text-secondary">
                                For more details, explore the <a href="#/dashboard" onClick={(e) => { e.preventDefault(); navigate('/dashboard'); }} className="text-blue-300 hover:underline">Dashboard</a> and individual Agent Detail pages after launch.
                            </p>
                        </div>
                    </div>

                    <div className="flex justify-between items-center pt-4">
                         <button onClick={() => setDesignState('idle')} className="text-text-secondary hover:text-text-primary">
                            &larr; Back to Concept
                        </button>
                        <button onClick={handleLaunch} disabled={designState === 'launching'} className="bg-primary text-white font-bold py-3 px-8 rounded-lg hover:bg-primary-focus transition-colors flex items-center space-x-2 disabled:bg-gray-500">
                            <StrategyIcon/>
                            <span>{designState === 'launching' ? 'Launching...' : 'Launch Agent'}</span>
                        </button>
                    </div>
                </div>
             </div>
        )
    }

    return (
        <div className="container mx-auto py-12 text-center animate-fade-in">
            <div className="max-w-3xl mx-auto">
                <div className="bg-primary/20 text-primary p-4 rounded-full w-16 h-16 mx-auto mb-6 flex items-center justify-center">
                    <LightbulbIcon/>
                </div>
                <h1 className="text-5xl font-extrabold mb-4">Create Agent from a Blueprint</h1>
                <p className="text-lg text-text-secondary mb-8">
                    Describe your agent in plain English. Our AI will generate a complete operational blueprint, including its name, mission, and optimal configuration.
                </p>

                <div className="bg-surface p-8 rounded-xl border border-border-color shadow-lg">
                    <textarea
                        value={concept}
                        onChange={(e) => setConcept(e.target.value)}
                        rows={5}
                        className="w-full bg-surface-light border border-border-color rounded-lg p-4 text-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="e.g., An AI that can research any topic, generate a detailed report with sources, and create a presentation summary."
                    />
                    <button
                        onClick={handleDesign}
                        disabled={!concept.trim() || designState === 'designing'}
                        className="mt-6 w-full bg-primary text-white font-bold py-4 text-lg rounded-lg hover:bg-primary-focus transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed"
                    >
                        {designState === 'designing' ? 'Generating...' : 'Generate Blueprint'}
                    </button>
                </div>
                 <button onClick={() => navigate('/dashboard')} className="mt-8 text-sm text-text-secondary hover:text-primary transition-colors">
                    &larr; Back to Dashboard
                </button>
            </div>
        </div>
    );
};

export default StrategyOperations;