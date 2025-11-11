import React from 'react';
import { Link } from 'react-router-dom';
import { useAgentStore } from '../context/AgentContext';
import { Agent, Deployment, DeploymentStatus } from '../types';
import { ChevronRightIcon, ServerIcon, ClockIcon } from '../components/icons';
import { formatDistanceToNow } from '../lib/utils';

const statusStyles: Record<DeploymentStatus, { indicator: string; text: string }> = {
  ACTIVE: { indicator: 'bg-green-500', text: 'text-green-400' },
  DEGRADED: { indicator: 'bg-yellow-500', text: 'text-yellow-400' },
  OFFLINE: { indicator: 'bg-red-500', text: 'text-red-400' },
};

const DeploymentStatusBadge: React.FC<{ status: DeploymentStatus }> = ({ status }) => (
  <div className="flex items-center">
    <span className={`h-2.5 w-2.5 rounded-full ${statusStyles[status].indicator} mr-2`}></span>
    <span className={`text-sm font-medium ${statusStyles[status].text} capitalize`}>{status.toLowerCase()}</span>
  </div>
);

const DeploymentCard: React.FC<{ deployment: Deployment; agent: Agent }> = ({ deployment, agent }) => (
  <Link to={`/deployments/${deployment.id}`} className="block bg-surface rounded-lg border border-border-color p-6 group hover:border-primary transition-all duration-300 flex flex-col justify-between">
    <div>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-semibold text-primary">{deployment.environment}</p>
          <h3 className="text-lg font-bold text-text-primary group-hover:text-primary transition-colors">{agent.name}</h3>
          <p className="text-sm text-text-secondary mt-1">v{deployment.agentVersion}</p>
        </div>
        <ChevronRightIcon className="h-6 w-6 text-text-secondary group-hover:text-primary transition-all duration-300 transform group-hover:translate-x-1" />
      </div>
      <p className="mt-4 text-text-secondary text-sm leading-relaxed">
        Deployment is currently <span className="font-semibold capitalize">{deployment.status.toLowerCase()}</span>.
      </p>
    </div>
    <div className="mt-4 pt-4 border-t border-border-color space-y-3 text-sm">
        <DeploymentStatusBadge status={deployment.status} />
        <div className="flex items-center text-text-secondary">
            <ClockIcon className="h-4 w-4 mr-2" />
            <span>Last heartbeat: {formatDistanceToNow(deployment.lastHeartbeat)}</span>
        </div>
    </div>
  </Link>
);

const DeploymentsPage: React.FC = () => {
  const { state } = useAgentStore();
  const allDeployments = state.agents.flatMap(agent => 
    (agent.deployments || []).map(deployment => ({ agent, deployment }))
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-text-primary">Deployments Hub</h1>
         <p className="text-text-secondary">Monitor all active agent deployments.</p>
      </div>
      
      {allDeployments.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {allDeployments.map(({ agent, deployment }) => (
            <DeploymentCard key={deployment.id} agent={agent} deployment={deployment} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-surface rounded-lg border border-dashed border-border-color">
            <ServerIcon className="h-12 w-12 mx-auto text-text-secondary" />
            <h2 className="mt-4 text-xl font-semibold text-text-primary">No Deployments Found</h2>
            <p className="mt-2 text-text-secondary">Deploy an agent to monitor its performance here.</p>
        </div>
      )}
    </div>
  );
};

export default DeploymentsPage;