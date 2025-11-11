import React from 'react';
import { useAgentStore } from '../hooks/useAgentStore';
import { Agent, FeatureEngine, ModelPreferenceType } from '../types';
import {
    SolutionIcon, DataStreamIcon, CreativeIcon, SearchIcon, // Feature Engines
    StrategyIcon, BuildIcon, CheckCircleIcon, InfoIcon, SystemIntegrityIcon, FileTextIcon, CodeIcon, DeployIcon, ClipboardCheckIcon, AnalysisIcon, StrategyPlanIcon, // Dev Team Engines & Capabilities, NEW: StrategyPlanIcon
    SettingsIcon, LightbulbIcon, SyncIcon // Fallback icon and new model icons
} from './icons/Icons'; // Import all necessary icons

interface Vitals {
    thinkingSteps: string[];
    activeEngine: string | null;
    confidence: number;
    latency: number;
    currentModelType: ModelPreferenceType | 'DefaultGemini' | 'ClientSide' | null; // New field
}

interface AgentVitalsProps {
    agent: Agent;
    vitals: Vitals;
    isLoading: boolean;
}

const getModelTypeName = (type: ModelPreferenceType | 'DefaultGemini' | 'ClientSide' | null) => {
    switch(type) {
        // FIX: ModelPreferenceType is now imported as a value.
        case ModelPreferenceType.GeminiFlash: return 'Gemini Flash';
        // FIX: ModelPreferenceType is now imported as a value.
        case ModelPreferenceType.GeminiPro: return 'Gemini Pro';
        // FIX: ModelPreferenceType is now imported as a value.
        case ModelPreferenceType.External: return 'External LLM';
        case ModelPreferenceType.ClientSide: return 'Client-Side Logic'; // NEW: Client-Side
        case 'DefaultGemini': return 'Default Gemini';
        default: return 'Unknown Model';
    }
};

const EngineIcon: React.FC<{ engine: FeatureEngine; isActive: boolean }> = ({ engine, isActive }) => {
    const iconMap: { [key: string]: React.ReactElement } = {
        'solution': <SolutionIcon />,
        'data': <DataStreamIcon />,
        'creative': <CreativeIcon />,
        'search': <SearchIcon />, // Now maps to `Live Web Grounding` via `capability_googleSearch`
        // NEW DEV TEAM ENGINE ICONS (mapping to existing icons for now)
        'strategy': <StrategyIcon />, // Helios Architect & Insights
        'build': <BuildIcon />, // Coda Dev Lead & Code Review
        'check': <CheckCircleIcon />, // Janus QA & QA Testing
        'info': <InfoIcon />, // Chronos Diagnostics & Diagnostics Analysis
        'shield': <SystemIntegrityIcon />, // Sentinel Security & Security Audit
        'document': <FileTextIcon />, // Atlas Docs & Documentation
        'code': <CodeIcon />, // Synthesis Forge & Code Generation
        'deploy': <DeployIcon />, // Release Automation & Orchestration
        'clipboard-check': <ClipboardCheckIcon />, // Project Oversight & Management
        'analyze': <AnalysisIcon />, // NEW: Project Guardian
        'strategy_plan': <StrategyPlanIcon />, // NEW: Dev Strategist
        // Virtual Model Engine Icons (not actual FeatureEngine IDs, but for display)
        'external_model': <SyncIcon />,
        'gemini_flash_model': <LightbulbIcon />,
        'gemini_pro_model': <LightbulbIcon />,
        'client_side_model': <BuildIcon />, // Reusing BuildIcon for client-side logic
    };

    return (
        <div className={`flex items-center space-x-3 p-3 rounded-lg transition-colors duration-300 ${isActive ? 'bg-primary/20 border-primary' : 'bg-surface-light border-border-color'} border`}>
            <div className={`${isActive ? 'text-primary' : 'text-text-secondary'}`}>{iconMap[engine.icon] || iconMap[engine._id.split('_').slice(0, 2).join('_')] || <SettingsIcon />}</div> {/* Fallback to iconMap[engine._id] */}
            <div>
                <p className={`font-semibold text-sm ${isActive ? 'text-primary' : 'text-text-primary'}`}>{engine.name}</p>
                <p className="text-xs text-text-secondary">{isActive ? 'Active' : 'Idle'}</p>
            </div>
        </div>
    );
};

const AgentVitals: React.FC<AgentVitalsProps> = ({ agent, vitals, isLoading }) => {
    const { state: { featureEngines: allEnginesInSystem } } = useAgentStore(); // Get all feature engines from store

    // Filter to only display engines integrated with *this* agent
    let agentIntegratedEngines = allEnginesInSystem.filter(fe =>
        agent.integratedEngineIds?.includes(fe._id)
    );
    
    // Dynamically add the currently active LLM as a 'virtual engine' for display purposes
    const currentActiveModelType = vitals.currentModelType || agent.type; // Fallback to agent.type

    if (currentActiveModelType === ModelPreferenceType.External && !agentIntegratedEngines.some(e => e._id === 'external_model')) {
        agentIntegratedEngines.push({ _id: 'external_model', name: 'External LLM', description: 'User-configured external language model.', icon: 'external_model' as any });
    } else if (currentActiveModelType === ModelPreferenceType.GeminiFlash && !agentIntegratedEngines.some(e => e._id === 'gemini_flash_model')) {
        agentIntegratedEngines.push({ _id: 'gemini_flash_model', name: 'Gemini Flash', description: 'Google Gemini Flash LLM.', icon: 'gemini_flash_model' as any });
    } else if (currentActiveModelType === ModelPreferenceType.GeminiPro && !agentIntegratedEngines.some(e => e._id === 'gemini_pro_model')) {
        agentIntegratedEngines.push({ _id: 'gemini_pro_model', name: 'Gemini Pro', description: 'Google Gemini Pro LLM.', icon: 'gemini_pro_model' as any });
    } else if (currentActiveModelType === ModelPreferenceType.ClientSide && !agentIntegratedEngines.some(e => e._id === 'client_side_model')) {
        agentIntegratedEngines.push({ _id: 'client_side_model', name: 'Client-Side Logic', description: 'Rule-based logic executed directly in browser.', icon: 'client_side_model' as any });
    } else if (currentActiveModelType === 'DefaultGemini' && !agentIntegratedEngines.some(e => e._id === 'gemini_pro_model')) { // Default is Gemini Pro if not specified
        agentIntegratedEngines.push({ _id: 'gemini_pro_model', name: 'Gemini Pro (Default)', description: 'Google Gemini Pro LLM (default).', icon: 'gemini_pro_model' as any });
    }

    // Sort integrated engines alphabetically by name
    agentIntegratedEngines.sort((a, b) => a.name.localeCompare(b.name));


    return (
        <div className="bg-surface rounded-xl border border-border-color shadow-lg p-6 h-full flex flex-col">
            <h2 className="text-xl font-bold mb-1 text-text-primary">{agent.name} Vitals</h2>
            <p className="text-sm text-text-secondary mb-6 border-b border-border-color pb-4">Real-time performance and reasoning analysis</p>

            <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-surface-light p-3 rounded-lg text-center">
                    <p className="text-xs text-text-secondary">Confidence</p>
                    <p className="text-2xl font-bold text-primary">{isLoading ? '...' : `${vitals.confidence}%`}</p>
                </div>
                <div className="bg-surface-light p-3 rounded-lg text-center">
                    <p className="text-xs text-text-secondary">Latency</p>
                    <p className="text-2xl font-bold text-primary">{isLoading ? '...' : `${vitals.latency}ms`}</p>
                </div>
            </div>

            <div className="mb-6">
                <h3 className="font-semibold text-text-primary mb-3">Active Model</h3>
                <div className="bg-surface-light p-3 rounded-lg border border-border-color">
                    <p className="text-sm font-semibold text-primary">
                        {/* Determine active model type for display */}
                        {isLoading ? '...' : getModelTypeName(
                            vitals.currentModelType ||
                            (agent.externalModelConfig ? ModelPreferenceType.External :
                                (agent.type === 'ClientSide' ? ModelPreferenceType.ClientSide :
                                    (agent.type === 'Analytical' || agent.type === 'Strategist' ? ModelPreferenceType.GeminiPro :
                                        (agent.type === 'Creative' || agent.type === 'Standard' ? ModelPreferenceType.GeminiFlash :
                                            'DefaultGemini'
                                        )
                                    )
                                )
                            )
                        )}
                    </p>
                    <p className="text-xs text-text-secondary">
                        {isLoading ? 'Attempting connection...' : 'Currently responding.'}
                    </p>
                </div>
            </div>

            <div className="mb-6">
                <h3 className="font-semibold text-text-primary mb-3">Integrated Engines</h3>
                <div className="space-y-3">
                    {agentIntegratedEngines.length > 0 ? (
                        agentIntegratedEngines.map(engine => (
                            <EngineIcon
                                key={engine._id}
                                engine={engine}
                                // Check if the engine is active based on vitals.activeEngine or currentModelType
                                isActive={
                                    vitals.activeEngine === engine._id || // Direct engine activation (e.g., capability call)
                                    // Check if currentModelType matches an engine representing an LLM
                                    ((vitals.currentModelType === ModelPreferenceType.External && engine._id === 'external_model')) ||
                                    ((vitals.currentModelType === ModelPreferenceType.GeminiFlash && engine._id === 'gemini_flash_model')) ||
                                    ((vitals.currentModelType === ModelPreferenceType.GeminiPro && engine._id === 'gemini_pro_model')) ||
                                    ((vitals.currentModelType === ModelPreferenceType.ClientSide && engine._id === 'client_side_model')) ||
                                    ((vitals.currentModelType === 'DefaultGemini' && engine._id === 'gemini_pro_model'))
                                }
                            />
                        ))
                    ) : (
                        <p className="text-sm text-text-secondary text-center py-4">No engines integrated.</p>
                    )}
                </div>
            </div>

            <div className="flex-grow flex flex-col min-h-0">
                <h3 className="font-semibold text-text-primary mb-3">Thought Process</h3>
                <div className="flex-grow bg-black/50 p-3 rounded-lg font-mono text-xs text-text-secondary overflow-y-auto min-h-[150px]">
                    {vitals.thinkingSteps.map((step, index) => (
                        <p key={index} className="animate-fade-in">&gt; {step}</p>
                    ))}
                    {isLoading && vitals.thinkingSteps.length === 0 && <p className="animate-pulse">&gt; Initializing model...</p>}
                    {!isLoading && vitals.thinkingSteps.length > 0 && <p className="text-green-400">&gt; <span className="inline-flex items-center gap-1">Done <CheckCircleIcon/></span></p>}
                </div>
            </div>
        </div>
    );
};

export default AgentVitals;