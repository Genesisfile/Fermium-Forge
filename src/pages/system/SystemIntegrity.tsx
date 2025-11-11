import React from 'react';
import { useAgentStore } from '../../context/AgentContext';
import { SystemEvent, SystemEventType } from '../../types';
import { formatDistanceToNow } from '../../lib/utils';
import { PlusCircleIcon, SparklesIcon, CampaignsIcon, ShieldCheckIcon, XCircleIcon, CheckCircleIcon, AlertTriangleIcon, InfoIcon, GitBranchIcon } from '../../components/icons';

const eventVisuals: Record<SystemEventType, { icon: React.ElementType; color: string }> = {
    AGENT_CREATED: { icon: PlusCircleIcon, color: 'text-accent' },
    AGENT_EVOLVED: { icon: SparklesIcon, color: 'text-primary' },
    CAMPAIGN_STARTED: { icon: CampaignsIcon, color: 'text-blue-400' },
    AGENT_DEPLOYED: { icon: ShieldCheckIcon, color: 'text-green-400' },
    AGENT_ERROR: { icon: XCircleIcon, color: 'text-red-400' },
    CAMPAIGN_COMPLETED: { icon: CheckCircleIcon, color: 'text-green-500' },
    // FIX: Add missing SystemEventType values
    ALERT_CONFIGURED: { icon: AlertTriangleIcon, color: 'text-yellow-500' },
    STATUS_CHANGE: { icon: GitBranchIcon, color: 'text-gray-500' },
    INFO: { icon: InfoIcon, color: 'text-blue-500' },
};

const EventItem: React.FC<{ event: SystemEvent }> = ({ event }) => {
    const { icon: Icon, color } = eventVisuals[event.type];
    return (
        <div className="flex items-start p-4 bg-surface-light rounded-lg">
            <Icon className={`h-6 w-6 mr-4 flex-shrink-0 ${color}`} />
            <div className="flex-grow">
                <p className="text-text-primary">{event.message}</p>
                <p className="text-xs text-text-secondary mt-1">{formatDistanceToNow(event.timestamp)}</p>
            </div>
        </div>
    );
};

const SystemIntegrity: React.FC = () => {
    const { state } = useAgentStore();
    const { systemEvents } = state;

    return (
        <div>
            <h2 className="text-2xl font-bold text-text-primary mb-6">Global Event Stream</h2>
            {systemEvents.length > 0 ? (
                <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                    {systemEvents.map(event => (
                        <EventItem key={event.id} event={event} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 bg-surface-light rounded-lg border border-dashed border-border-color">
                    <h3 className="text-xl font-semibold text-text-primary">No System Events</h3>
                    <p className="mt-2 text-text-secondary">System activity and agent events will appear here.</p>
                </div>
            )}
        </div>
    );
};

export default SystemIntegrity;