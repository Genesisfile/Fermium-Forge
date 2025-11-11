import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { marked } from 'marked';
import { Agent, AgentStatus } from '../../types';
import { formatDistanceToNow } from '../../lib/utils';
import { PlusCircleIcon, ArrowUpCircleIcon, GitBranchIcon, CheckCircleIcon, InfoIcon, ShieldCheckIcon, SparklesIcon } from '../../components/icons';

interface AgentDetailContext {
  agent: Agent;
}

type LifecycleEvent = {
  id: string;
  type: 'CREATED' | 'STATUS_CHANGE' | 'VERSION_UPDATE' | 'SPEC_ADDED' | 'CERTIFIED';
  title: string;
  description: string;
  timestamp: string;
  status?: AgentStatus;
  details?: string; // For markdown content
};

const generateMockLifecycleEvents = (agent: Agent): LifecycleEvent[] => {
    const events: LifecycleEvent[] = [];
    const baseDate = new Date(agent.createdAt);

    events.push({
        id: `evt-0`,
        type: 'CREATED',
        title: 'Agent Genesis',
        description: `Agent "${agent.name}" was created.`,
        timestamp: agent.createdAt,
    });
    
    if (agent.evolutions) {
        agent.evolutions.forEach((evo, index) => {
            events.push({
                id: `evt-evo-${index}`,
                type: 'VERSION_UPDATE',
                title: `Evolved to Version ${evo.newVersion}`,
                description: evo.rationale,
                timestamp: evo.timestamp,
            });
        });
    }
    
    const addDays = (date: Date, days: number) => {
        const result = new Date(date);
        result.setDate(result.getDate() + days);
        return result;
    };

    if (agent.certificationReport) {
        // Find the latest evolution to attach the certification to it, or use the base date
        const lastEventTime = Math.max(...events.map(e => new Date(e.timestamp).getTime()));
        const certTimestamp = new Date(lastEventTime + 60000); // 1 minute after last event

        events.push({
            id: 'evt-cert',
            type: 'CERTIFIED',
            title: 'Certification Report Generated',
            description: 'AI analysis of agent design and capabilities complete.',
            timestamp: certTimestamp.toISOString(),
            details: agent.certificationReport,
        });
    }

    if (agent.status === 'DEPLOYED' && agent.certificationReport) {
         const lastEventTime = Math.max(...events.map(e => new Date(e.timestamp).getTime()));
         const deployTimestamp = new Date(lastEventTime + 60000); // 1 minute after last event

         events.push({
            id: `evt-deploy`,
            type: 'STATUS_CHANGE',
            title: 'Deployment Successful',
            description: `Agent status changed to DEPLOYED after certification.`,
            timestamp: deployTimestamp.toISOString(),
            status: 'DEPLOYED',
        });
    }

    return events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};

const eventIcons: Record<LifecycleEvent['type'], React.ElementType> = {
  CREATED: PlusCircleIcon,
  STATUS_CHANGE: GitBranchIcon,
  VERSION_UPDATE: SparklesIcon,
  SPEC_ADDED: CheckCircleIcon,
  CERTIFIED: ShieldCheckIcon,
};

const statusColors: Record<AgentStatus, string> = {
  IDLE: 'bg-gray-500',
  TRAINING: 'bg-blue-500',
  DEPLOYED: 'bg-green-500',
  CERTIFYING: 'bg-yellow-500',
  ERROR: 'bg-red-500',
};

const LifecycleEventItem: React.FC<{ event: LifecycleEvent; isLast: boolean }> = ({ event, isLast }) => {
    const Icon = eventIcons[event.type] || InfoIcon;
    return (
        <div className="relative flex items-start">
            {!isLast && <div className="absolute left-5 top-5 -ml-px h-full w-0.5 bg-border-color" />}
            <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-surface-light flex items-center justify-center border border-border-color">
                    <Icon className="h-5 w-5 text-primary" />
                </div>
            </div>
            <div className="ml-4 flex-grow">
                <div className="flex justify-between items-center">
                    <h3 className="font-bold text-text-primary">{event.title}</h3>
                    <p className="text-xs text-text-secondary">{formatDistanceToNow(event.timestamp)}</p>
                </div>
                <p className="mt-1 text-sm text-text-secondary">{event.description}</p>
                 {event.type === 'STATUS_CHANGE' && event.status && (
                    <div className="mt-2 flex items-center">
                       <span className={`h-2 w-2 rounded-full ${statusColors[event.status]} mr-2`}></span>
                       <span className="text-xs font-medium text-text-secondary capitalize">{event.status.toLowerCase()}</span>
                    </div>
                )}
                {event.details && (
                    <div 
                        className="prose prose-sm prose-invert mt-4 p-4 bg-surface rounded-md border border-border-color max-w-none"
                        dangerouslySetInnerHTML={{ __html: marked.parse(event.details) as string }}
                    />
                )}
            </div>
        </div>
    );
};

const AgentLifecyclePage: React.FC = () => {
    const { agent } = useOutletContext<AgentDetailContext>();
    const [events, setEvents] = useState<LifecycleEvent[]>([]);

    useEffect(() => {
        if (agent) {
            setEvents(generateMockLifecycleEvents(agent));
        }
    }, [agent]);

    if (!agent) {
        return <div>Loading agent data...</div>;
    }

    return (
        <div>
            <h2 className="text-2xl font-bold text-text-primary mb-6">Agent Lifecycle</h2>
            {events.length > 0 ? (
                <div className="space-y-8">
                    {events.map((event, index) => (
                        <LifecycleEventItem key={event.id} event={event} isLast={index === events.length - 1} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-12 bg-surface-light rounded-lg border border-dashed border-border-color">
                    <h3 className="text-xl font-semibold text-text-primary">No Lifecycle Events</h3>
                    <p className="mt-2 text-text-secondary">This agent has not had any significant lifecycle events recorded yet.</p>
                </div>
            )}
        </div>
    );
};

export default AgentLifecyclePage;