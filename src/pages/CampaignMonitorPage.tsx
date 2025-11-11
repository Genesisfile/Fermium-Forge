import React from 'react';
import { Link } from 'react-router-dom';
import { useAgentStore } from '../context/AgentContext';
import { Campaign, CampaignStatus } from '../types';
import { ChevronRightIcon, CampaignsIcon, PlusIcon } from '../components/icons';

const statusStyles: Record<CampaignStatus, { indicator: string; text: string }> = {
  PLANNING: { indicator: 'bg-gray-500', text: 'text-gray-400' },
  RUNNING: { indicator: 'bg-blue-500', text: 'text-blue-400' },
  COMPLETED: { indicator: 'bg-green-500', text: 'text-green-400' },
  FAILED: { indicator: 'bg-red-500', text: 'text-red-400' },
};

const CampaignStatusBadge: React.FC<{ status: CampaignStatus }> = ({ status }) => (
  <div className="flex items-center">
    <span className={`h-2.5 w-2.5 rounded-full ${statusStyles[status].indicator} mr-2 animate-pulse`}></span>
    <span className={`text-sm font-medium ${statusStyles[status].text} capitalize`}>{status.toLowerCase()}</span>
  </div>
);

const CampaignCard: React.FC<{ campaign: Campaign }> = ({ campaign }) => (
  <Link to={`/campaigns/${campaign.id}`} className="block bg-surface rounded-lg border border-border-color p-6 group hover:border-primary transition-all duration-300">
    <div className="flex justify-between items-start">
      <div>
        <h3 className="text-lg font-bold text-text-primary group-hover:text-primary transition-colors">{campaign.name}</h3>
        <p className="text-sm text-text-secondary mt-1">{campaign.agentIds.length} Agent(s) Assigned</p>
      </div>
      <ChevronRightIcon className="h-6 w-6 text-text-secondary group-hover:text-primary transition-all duration-300 transform group-hover:translate-x-1" />
    </div>
    <p className="mt-4 text-text-secondary text-sm leading-relaxed h-10 overflow-hidden text-ellipsis">{campaign.objective}</p>
    <div className="mt-4 pt-4 border-t border-border-color">
      <CampaignStatusBadge status={campaign.status} />
    </div>
  </Link>
);

const CampaignMonitorPage: React.FC = () => {
    const { state } = useAgentStore();
    const { campaigns } = state;

    return (
    <div>
      <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
        <div>
            <h1 className="text-3xl font-bold text-text-primary">Campaign Monitor</h1>
            <p className="text-text-secondary mt-1">Oversee all multi-agent operations.</p>
        </div>
        <Link 
            to="/campaigns/command"
            className="inline-flex items-center justify-center bg-primary text-white font-semibold px-4 py-2 text-sm rounded-lg shadow-lg hover:bg-primary-focus transition-transform transform hover:-translate-y-0.5 duration-300"
        >
            <PlusIcon className="h-5 w-5 mr-2" />
            New Campaign
        </Link>
      </div>
      
      {campaigns.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {campaigns.map((campaign) => (
            <CampaignCard key={campaign.id} campaign={campaign} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-surface rounded-lg border border-dashed border-border-color">
            <CampaignsIcon className="h-12 w-12 mx-auto text-text-secondary" />
            <h2 className="mt-4 text-xl font-semibold text-text-primary">No Active Campaigns</h2>
            <p className="mt-2 text-text-secondary">Initiate a new campaign to begin orchestrating your agents.</p>
            <Link to="/campaigns/command" className="mt-6 inline-block bg-primary text-white font-semibold px-6 py-2 rounded-lg shadow-md hover:bg-primary-focus transition-all">
                Launch First Campaign
            </Link>
        </div>
      )}
    </div>
  );
};
export default CampaignMonitorPage;
