import React from 'react';
import { Link } from 'react-router-dom';
import { useAgentStore } from '../context/AgentContext';
import { Agent, AgentStatus } from '../types';
import { PlusIcon, ChevronRightIcon } from '../components/icons';

const statusColors: Record<AgentStatus, string> = {
  IDLE: 'bg-gray-500',
  TRAINING: 'bg-blue-500',
  DEPLOYED: 'bg-green-500',
  CERTIFYING: 'bg-yellow-500',
  ERROR: 'bg-red-500',
};

const AgentStatusBadge: React.FC<{ status: AgentStatus }> = ({ status }) => (
  <div className="flex items-center">
    <span className={`h-2.5 w-2.5 rounded-full ${statusColors[status]} mr-2`}></span>
    <span className="text-sm font-medium text-text-secondary capitalize">{status.toLowerCase()}</span>
  </div>
);

const AgentCard: React.FC<{ agent: Agent }> = ({ agent }) => (
  <Link to={`/agent/${agent.id}`} className="block bg-surface rounded-lg border border-border-color p-6 group hover:border-primary transition-all duration-300">
    <div className="flex justify-between items-start">
      <div>
        <h3 className="text-lg font-bold text-text-primary group-hover:text-primary transition-colors">{agent.name}</h3>
        <p className="text-sm text-text-secondary mt-1">v{agent.version}</p>
      </div>
      <ChevronRightIcon className="h-6 w-6 text-text-secondary group-hover:text-primary transition-all duration-300 transform group-hover:translate-x-1" />
    </div>
    <p className="mt-4 text-text-secondary text-sm leading-relaxed">{agent.description}</p>
    <div className="mt-4 pt-4 border-t border-border-color">
      <AgentStatusBadge status={agent.status} />
    </div>
  </Link>
);

const DashboardPage: React.FC = () => {
  const { state } = useAgentStore();
  const { agents } = state;

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-text-primary">Agent Dashboard</h1>
      </div>
      
      {agents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {agents.map((agent) => (
            <AgentCard key={agent.id} agent={agent} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-surface rounded-lg border border-dashed border-border-color">
            <h2 className="text-xl font-semibold text-text-primary">No Agents Found</h2>
            <p className="mt-2 text-text-secondary">Get started by creating your first AI agent.</p>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;