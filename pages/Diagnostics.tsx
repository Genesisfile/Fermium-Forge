
import React from 'react';
import { useAgentStore } from '../hooks/useAgentStore';
import type { Log } from '../types';

const getStageColor = (stage: Log['stage']) => {
    switch (stage) {
        case 'Diagnostics': return 'bg-purple-500/20 text-purple-400';
        case 'Info': return 'bg-blue-500/20 text-blue-400';
        case 'Chat': return 'bg-cyan-500/20 text-cyan-400';
        case 'Strategy': return 'bg-indigo-500/20 text-indigo-400';
        case 'Evolution': return 'bg-green-500/20 text-green-400';
        case 'Deployment': return 'bg-teal-500/20 text-teal-400';
        case 'Orchestration': return 'bg-pink-500/20 text-pink-400'; // NEW: Orchestration color
        case 'DevelopmentStrategy': return 'bg-yellow-500/20 text-yellow-400'; // NEW: DevelopmentStrategy color
        default: return 'bg-gray-500/20 text-gray-400';
    }
}

const Diagnostics: React.FC = () => {
    const { getLogsForAgent } = useAgentStore();
    const chronosLogs = getLogsForAgent('agent_chronos_diagnostics');

    return (
        <div className="container mx-auto py-8">
            <h1 className="text-4xl font-bold mb-2">System Diagnostics</h1>
            <p className="text-text-secondary mb-8">
                Live feed of all significant state changes and actions across the platform, monitored by the <span className="font-bold text-primary">Chronos</span> agent.
            </p>

            <div className="bg-surface rounded-xl border border-border-color shadow-lg overflow-hidden">
                <div className="p-4 bg-surface-light font-semibold grid grid-cols-12 gap-4">
                    <div className="col-span-3">Timestamp</div>
                    <div className="col-span-2">Stage</div>
                    <div className="col-span-7">Message</div>
                </div>
                <div className="max-h-[65vh] overflow-y-auto">
                    {chronosLogs.length > 0 ? (
                        chronosLogs.map(log => (
                            <div key={log._id} className="grid grid-cols-12 gap-4 p-4 border-t border-border-color text-sm hover:bg-surface-light/50 font-mono">
                                <div className="col-span-3 text-text-secondary">
                                    {new Date(log.timestamp).toLocaleString()}
                                </div>
                                <div className="col-span-2">
                                     <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${getStageColor(log.stage)}`}>
                                        {log.stage}
                                    </span>
                                </div>
                                <div className="col-span-7 text-text-primary">
                                    {log.message}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center p-12 text-text-secondary">
                            No diagnostic logs available.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Diagnostics;
