
import React, { useState, useEffect } from 'react';
import { useAgentStore } from '../hooks/useAgentStore';

type ServiceStatus = 'Operational' | 'Degraded Performance' | 'Partial Outage' | 'Major Outage';

interface Service {
    name: string;
    status: ServiceStatus;
    metric: string;
    value: number;
    unit: string;
}

const initialServices: Service[] = [
    { name: 'API Gateway', status: 'Operational', metric: 'Latency', value: 45, unit: 'ms' },
    { name: 'Agent Core Services', status: 'Operational', metric: 'Active Processes', value: 142, unit: '' },
    { name: 'Database Cluster', status: 'Operational', metric: 'Read IOPS', value: 8700, unit: '' },
    { name: 'Message Queue', status: 'Operational', metric: 'Queue Size', value: 12, unit: 'msgs' },
];

const getStatusColor = (status: ServiceStatus): { bg: string; text: string; dot: string } => {
    switch (status) {
        case 'Operational':
            return { bg: 'bg-green-500/10', text: 'text-green-400', dot: 'bg-green-500' };
        case 'Degraded Performance':
            return { bg: 'bg-yellow-500/10', text: 'text-yellow-400', dot: 'bg-yellow-500' };
        case 'Partial Outage':
            return { bg: 'bg-orange-500/10', text: 'text-orange-400', dot: 'bg-orange-500' };
        case 'Major Outage':
            return { bg: 'bg-red-500/10', text: 'text-red-400', dot: 'bg-red-500' };
        default:
            return { bg: 'bg-gray-500/10', text: 'text-gray-400', dot: 'bg-gray-500' };
    }
};

const ServiceStatusCard: React.FC<{ service: Service }> = ({ service }) => {
    const colors = getStatusColor(service.status);
    return (
        <div className={`bg-surface p-6 rounded-xl border border-border-color shadow-lg ${colors.bg}`}>
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-text-primary">{service.name}</h3>
                <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${colors.dot}`}></div>
                    <span className={`text-sm font-semibold ${colors.text}`}>{service.status}</span>
                </div>
            </div>
            <div>
                <p className="text-sm text-text-secondary">{service.metric}</p>
                <p className="text-3xl font-bold text-text-primary">{service.value.toLocaleString()} <span className="text-lg font-normal text-text-secondary">{service.unit}</span></p>
            </div>
        </div>
    );
};

const KPICard: React.FC<{ title: string; value: string; description: string }> = ({ title, value, description }) => (
    <div className="bg-surface p-6 rounded-xl border border-border-color shadow-lg">
        <p className="text-sm font-semibold text-text-secondary">{title}</p>
        <p className="text-4xl font-bold text-primary my-2">{value}</p>
        <p className="text-xs text-text-secondary">{description}</p>
    </div>
);


const Health: React.FC = () => {
    const { agents } = useAgentStore();
    const [services, setServices] = useState<Service[]>(initialServices);
    const [lastUpdated, setLastUpdated] = useState(new Date());

    const activeAgentsCount = agents.filter(a => ['Live', 'Optimized'].includes(a.status)).length;

    useEffect(() => {
        const interval = setInterval(() => {
            setServices(prevServices => prevServices.map(service => {
                let newValue = service.value;
                switch (service.name) {
                    case 'API Gateway':
                        newValue = Math.max(20, service.value + (Math.random() - 0.5) * 10);
                        break;
                    case 'Agent Core Services':
                        newValue = Math.max(100, service.value + (Math.random() - 0.4) * 5);
                        break;
                    case 'Database Cluster':
                        newValue = Math.max(5000, service.value + (Math.random() - 0.5) * 500);
                        break;
                    case 'Message Queue':
                        newValue = Math.max(0, service.value + (Math.random() - 0.3) * 10);
                        break;
                }
                
                // Occasionally degrade a service
                let newStatus = service.status;
                if(Math.random() < 0.02) { // 2% chance to change status
                    newStatus = 'Degraded Performance';
                } else if (service.status === 'Degraded Performance' && Math.random() < 0.5) {
                    newStatus = 'Operational';
                }

                return { ...service, value: Math.round(newValue), status: newStatus };
            }));
            setLastUpdated(new Date());
        }, 2500);

        return () => clearInterval(interval);
    }, []);

    const allSystemsOperational = services.every(s => s.status === 'Operational');

    return (
        <div className="container mx-auto py-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-4xl font-bold">Platform Health Status</h1>
                    <p className="text-text-secondary">Live overview of Fermium Forge core components and KPIs.</p>
                </div>
                 <div className="text-right">
                    <div className={`px-4 py-2 rounded-lg text-sm font-semibold ${allSystemsOperational ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                        {allSystemsOperational ? 'All Systems Operational' : 'Degraded Performance Detected'}
                    </div>
                    <p className="text-xs text-text-secondary mt-1">Last updated: {lastUpdated.toLocaleTimeString()}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                {services.map(service => (
                    <ServiceStatusCard key={service.name} service={service} />
                ))}
            </div>

            <div>
                <h2 className="text-2xl font-bold mb-6">Overall Key Performance Indicators</h2>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <KPICard title="Uptime (90 Days)" value="99.98%" description="Calculated across all core services." />
                    <KPICard title="Average API Response" value={`${Math.round(services[0].value)}ms`} description="P95 latency for all public endpoints." />
                    <KPICard title="Active Deployed Agents" value={activeAgentsCount.toString()} description="Total agents currently in a 'Live' or 'Optimized' state." />
                </div>
            </div>

        </div>
    );
};

export default Health;
