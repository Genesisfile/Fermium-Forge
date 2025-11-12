

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useAgentStore } from '../hooks/useAgentStore';
import type { Agent, AgentType } from '../types';
import {
  BuildIcon,
  SolutionIcon,
  DataStreamIcon,
  CreativeIcon,
  SearchIcon,
  SparklesIcon,
  SyncIcon, 
  MegaphoneIcon,
  RobotIcon, // NEW
  ArchitectureIcon, // NEW
  CodeEditorIcon, // NEW
  SpeedometerIcon, // NEW
  CrownIcon, // NEW: Elite Agent Icon
  OutsourceIcon, // NEW: Outsourcing Orchestrator Icon
} from '../components/icons/Icons'; // Updated imports
import { getStatusColorClasses } from '../utils/helpers';

/**
 * Renders an icon based on the agent's type.
 */
const getTypeIcon = (type: AgentType): React.ReactElement => { // Changed return type to React.ReactElement
  switch (type) {
    case 'Creative':
      return <span role="img" aria-label="Creative">🎨</span>;
    case 'Analytical':
      return <span role="img" aria-label="Analytical">🔬</span>;
    case 'Strategist':
      return <span role="img" aria-label="Strategist">🖥️</span>;
    case 'ClientSide':
      return <span role="img" aria-label="Client-Side">🌐</span>;
    case 'Developer':
      return <span role="img" aria-label="Developer">💻</span>;
    case 'Accelerator':
      return <span role="img" aria-label="Accelerator">⚡</span>;
    case 'Elite': // NEW
      return <CrownIcon className="text-yellow-400" />;
    case 'Standard':
    default:
      return <span role="img" aria-label="Standard">⚙️</span>;
  }
};

/**
 * Renders an icon for a given feature engine ID.
 */
const EngineIcon: React.FC<{ engineId: string }> = ({ engineId }) => {
  const iconMap: { [key: string]: React.ReactElement } = {
    engine_solution_finder: <SolutionIcon />,
    engine_data_stream: <DataStreamIcon />,
    engine_creative_suite: <CreativeIcon />,
    capability_googleSearch: <SearchIcon />,
    engine_ad_publisher: <MegaphoneIcon />,
    engine_autonomous_dev_system: <RobotIcon />, // NEW
    engine_enterprise_solution_architect: <ArchitectureIcon />, // NEW
    engine_code_generation_suite: <CodeEditorIcon />, // NEW
    engine_process_accelerator: <SpeedometerIcon />, // NEW
    engine_outsourcing_orchestrator: <OutsourceIcon />, // NEW
  };

  const displayName = engineId.startsWith('capability_') ? engineId.substring('capability_'.length).replace(/_/g, ' ') : engineId.replace(/_/g, ' ');

  return (
    <div className="text-text-secondary/80" title={displayName}>
      {iconMap[engineId] || <span className="text-sm">⚙️</span>}
    </div>
  );
};

/**
 * Renders a card for a single agent, displaying its status and integrated engines.
 */
const AgentCard: React.FC<{ agent: Agent }> = ({ agent }) => {
  const navigate = useNavigate();
  // Update destination logic: if agent status is 'CompletedTask', go to root (UnifiedForgeStudio)
  const destination = (agent.status === 'Live' || agent.status === 'Optimized') ? `/?view=chat&agentId=${agent._id}` : (agent.status === 'CompletedTask' ? `/?view=forge` : `/deploy`);

  return (
    <div
      onClick={() => navigate(destination)}
      className={`bg-surface p-6 rounded-xl border border-border-color shadow-lg hover:shadow-primary/30 hover:border-primary-focus transition-all duration-300 cursor-pointer flex flex-col justify-between`}
      aria-label={`View agent ${agent.name}. Status: ${agent.status}. Objective: ${agent.objective}. Click to ${agent.status === 'Live' || agent.status === 'Optimized' ? 'chat with agent' : (agent.status === 'CompletedTask' ? 'review mission' : 'manage deployment')}.`}
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
        <p className="text-text-secondary text-sm mb-4 h-12 line-clamp-3"> {/* Changed h-10 to h-12, added line-clamp-3 */}
          {agent.objective}
        </p>
      </div>
      <div>
        {['Evolving', 'Certifying', 'Deploying', 'Optimizing', 'ReEvolving', 'ExecutingStrategy', 'AutoEvolving', 'EstablishAlignment'].includes(agent.status) && (
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
  const { state } = useAgentStore();
  const navigate = useNavigate();

  const validatedAgents = Array.isArray(state.agents) ? state.agents : [];

  const showcaseAgentIds = [
    'agent_code_companion', 'agent_brand_strategist', 'agent_market_pulse',
    'agent_game_master', 'agent_knowledge_synth', 'agent_omni_solution',
    'agent_autonomous_engineer', 'agent_cloud_architect', 'agent_integration_optimiser',
    'agent_global_orchestrator', // NEW
  ];

  const showcaseAgents = validatedAgents.filter(agent => showcaseAgentIds.includes(agent._id));
  const userAgents = validatedAgents.filter(agent => !showcaseAgentIds.includes(agent._id));

  return (
    <div className="container mx-auto py-10"> {/* Increased padding */}
      <h1 className="text-4xl font-bold mb-10">Agent Dashboard</h1> {/* Increased margin */}

      <div className="mb-14"> {/* Increased margin */}
        <h2 className="text-2xl font-semibold mb-6 text-text-primary">Your Agents</h2> {/* Increased margin */}
        {userAgents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"> {/* Increased gap */}
            {userAgents.map(agent => (
              <AgentCard key={agent._id} agent={agent} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-surface rounded-xl border border-dashed border-border-color">
            <h2 className="text-2xl font-semibold text-text-primary mb-2">No Agents Forged Yet</h2>
            <p className="text-text-secondary mb-6">Get started by forging your first personalized AI agent.</p>
            <button
              onClick={() => navigate('/')}
              className="bg-primary text-white font-bold py-3 px-8 rounded-lg hover:bg-primary-focus transition-colors flex items-center justify-center space-x-2"
            >
              <SparklesIcon className="w-5 h-5"/>
              <span>Forge Your First AI</span>
            </button>
          </div>
        )}
      </div>

      <div className="mb-14"> {/* Increased margin */}
        <h2 className="text-2xl font-semibold mb-6 text-text-primary">Showcase Agents</h2> {/* Increased margin */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"> {/* Increased gap */}
          {showcaseAgents.map(agent => (
            <AgentCard key={agent._id} agent={agent} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;