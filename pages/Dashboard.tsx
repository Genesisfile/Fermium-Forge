
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAgentStore } from '../hooks/useAgentStore';
import type { Agent, AgentType } from '../types';
import { BuildIcon, SolutionIcon, DataStreamIcon, CreativeIcon, SearchIcon, ChevronDownIcon, SyncIcon, StrategyIcon, CheckCircleIcon, InfoIcon, SystemIntegrityIcon, FileTextIcon, CodeIcon, DeployIcon, ClipboardCheckIcon, OrchestrateIcon, AnalysisIcon, StrategyPlanIcon } from '../components/icons/Icons'; // NEW: OrchestrateIcon, AnalysisIcon, StrategyPlanIcon
import { getStatusColorClasses } from '../utils/helpers';

const getTypeIcon = (type: AgentType) => {
    switch (type) {
        case 'Creative': return '🎨';
        case 'Analytical': return '🔬';
        case 'Strategist': return '📊'; // NEW: Icon for Strategist type
        case 'Standard':
        default: return '⚙️';
    }
}

const EngineIcon: React.FC<{ engineId: string }> = ({ engineId }) => {
    const iconMap: { [key: string]: React.ReactElement } = {
        'engine_solution_finder': <SolutionIcon />,
        'engine_data_stream': <DataStreamIcon />,
        'engine_creative_suite': <CreativeIcon />,
        'engine_live_grounding': <SearchIcon />,
        // DEV TEAM ENGINE ICONS (using existing icons for now)
        'engine_helios_architect': <StrategyIcon />,
        'engine_coda_dev_lead': <BuildIcon />,
        'engine_janus_qa': <CheckCircleIcon />, // Reusing CheckCircleIcon
        'engine_chronos_diagnostics': <InfoIcon />, // Reusing InfoIcon
        'engine_sentinel_security': <SystemIntegrityIcon />, // Reusing SystemIntegrityIcon for security
        'engine_atlas_docs': <FileTextIcon />, // Reusing FileTextIcon for documentation
        'engine_synthesis_forge': <CodeIcon />, // For code generation agent
        'engine_release_automation': <DeployIcon />, // For release orchestration
        'engine_project_oversight': <ClipboardCheckIcon />, // For project management
        'engine_project_guardian': <AnalysisIcon />, // NEW: Project Guardian icon
        'engine_dev_strategist': <StrategyPlanIcon />, // NEW: Dev Strategist engine icon
        // NEW CAPABILITY ICONS FOR DEV TEAM AGENTS
        'capability_helios_architect_insights': <StrategyIcon />,
        'capability_coda_code_review': <BuildIcon />,
        'capability_janus_qa_testing': <CheckCircleIcon />,
        'capability_chronos_diagnostics_analysis': <InfoIcon />,
        'capability_sentinel_security_audit': <SystemIntegrityIcon />,
        'capability_atlas_documentation': <FileTextIcon />,
        'capability_synthesis_code_generation': <CodeIcon />,
        'capability_release_orchestration': <DeployIcon />,
        'capability_project_management': <ClipboardCheckIcon />,
        'capability_nexus_orchestrator_orchestrate': <OrchestrateIcon />, // NEW: Orchestrator capability icon
        'capability_project_guardian_analysis': <AnalysisIcon />, // NEW: Project Guardian capability icon
        'capability_dev_strategist_plan': <StrategyPlanIcon />, // NEW: Dev Strategist capability icon
    };

    return <div className="text-text-secondary/80" title={engineId.replace(/_/g, ' ')}>{iconMap[engineId] || <span className="text-sm">⚙️</span>}</div>;
};

const AgentCard: React.FC<{ agent: Agent }> = ({ agent }) => {
    const navigate = useNavigate();
    // NEW: Always navigate to the unified lifecycle page
    const destination = `/agent/${agent._id}/lifecycle`;
    return (
        <div
            onClick={() => navigate(destination)}
            className={`bg-surface p-6 rounded-xl border border-border-color shadow-lg hover:shadow-primary/20 hover:border-primary transition-all duration-300 cursor-pointer flex flex-col justify-between`}
        >
            <div>
                <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold text-text-primary flex items-center">
                       <span className="text-2xl mr-2">{getTypeIcon(agent.type)}</span> {agent.name}
                    </h3>
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColorClasses(agent.status)}`}>
                        {agent.status}
                    </span>
                </div>
                <p className="text-text-secondary text-sm mb-4 h-10 overflow-hidden text-ellipsis">
                    {agent.objective}
                </p>
            </div>
            <div>
                {['Evolving', 'Certifying', 'Deploying', 'Optimizing', 'ReEvolving', 'ExecutingStrategy', 'AutoEvolving'].includes(agent.status) && (
                    <div className="w-full bg-surface-light rounded-full h-2.5 mb-4">
                        <div className="bg-primary h-2.5 rounded-full" style={{ width: `${agent.progress}%` }}></div>
                    </div>
                )}
                 <div className="flex justify-between items-center text-xs text-text-secondary/70">
                    <div className="flex items-center space-x-2">
                        {agent.integratedEngineIds?.map(id => <EngineIcon key={id} engineId={id} />)}
                        {agent.realtimeFeedbackEnabled && <div className="text-primary" title="Real-time Feedback Enabled"><SyncIcon /></div>}
                    </div>
                    {agent.ingestedDataCount && agent.ingestedDataCount > 0 ? (
                        <span className="font-mono bg-surface-light px-2 py-0.5 rounded">
                            Data: {agent.ingestedDataCount}
                        </span>
                    ) : null}
                </div>
            </div>
        </div>
    );
};

const Dashboard: React.FC = () => {
    const { agents } = useAgentStore();
    const navigate = useNavigate();
    const [isDevTeamVisible, setIsDevTeamVisible] = useState(true);

    // Add defensive check for agents array
    const validatedAgents = Array.isArray(agents) ? agents : [];

    // Updated devTeamIds to include Oracle and new specialized agents
    const devTeamIds = [
        'agent_helios_architect', 'agent_coda_dev_lead', 'agent_janus_qa',
        'agent_chronos_diagnostics', 'agent_fermium_oracle',
        'agent_sentinel_security', 'agent_atlas_docs',
        'agent_synthesis_engineer',
        'agent_release_orchestrator', // NEW
        'agent_project_manager', // NEW
        'agent_nexus_orchestrator', // NEW: Nexus Orchestrator
        'agent_project_guardian', // NEW: Project Guardian Agent
        'agent_dev_strategist', // NEW: Dev Strategist Agent
    ];
    const showcaseAgentIds = ['agent_code_companion', 'agent_brand_strategist', 'agent_market_pulse', 'agent_game_master', 'agent_knowledge_synth', 'agent_omni_solution'];

    const devTeamAgents = validatedAgents.filter(agent => devTeamIds.includes(agent._id));
    const showcaseAgents = validatedAgents.filter(agent => showcaseAgentIds.includes(agent._id));
    // User agents are now simply those not in devTeamIds or showcaseAgentIds
    const userAgents = validatedAgents.filter(agent => !devTeamIds.includes(agent._id) && !showcaseAgentIds.includes(agent._id));


    return (
        <div className="container mx-auto py-8">
            <h1 className="text-4xl font-bold mb-8">Agent Dashboard</h1>

            <div className="mb-12">
                <h2 className="text-2xl font-semibold mb-4 text-text-primary">Your Agents</h2>
                {userAgents.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {userAgents.map(agent => (
                            <AgentCard key={agent._id} agent={agent} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-surface rounded-xl border border-dashed border-border-color">
                        <h2 className="text-2xl font-semibold text-text-primary mb-2">No Agents Found</h2>
                        <p className="text-text-secondary mb-6">Get started by creating your first personalized AI agent.</p>
                        <button
                            onClick={() => navigate('/strategy')}
                            className="bg-primary text-white font-bold py-3 px-8 rounded-lg hover:bg-primary-focus transition-colors"
                        >
                            Create Your First AI
                        </button>
                    </div>
                )}
            </div>

            <div className="mb-12">
                 <h2 className="text-2xl font-semibold mb-4 text-text-primary">Showcase Agents</h2>
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {showcaseAgents.map(agent => (
                        <AgentCard key={agent._id} agent={agent} />
                    ))}
                </div>
            </div>

            <div className="pt-8 border-t border-border-color/50">
                <button
                    onClick={() => setIsDevTeamVisible(!isDevTeamVisible)}
                    className="w-full flex justify-between items-center text-left text-text-secondary hover:text-text-primary transition-colors py-2"
                >
                    <h2 className="text-lg font-semibold">Dev Team Agents (Internal Tools)</h2>
                    <ChevronDownIcon />
                </button>
                {isDevTeamVisible && (
                     <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {devTeamAgents.map(agent => (
                            <AgentCard key={agent._id} agent={agent} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
