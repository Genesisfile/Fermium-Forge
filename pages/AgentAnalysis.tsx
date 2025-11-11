
import React from 'react';
import { useOutletContext } from 'react-router-dom';
import type { Agent } from '../types';
import { useAgentStore } from '../hooks/useAgentStore';
import { RefreshIcon } from '../components/icons/Icons';

// Mock chart component
const ChartPlaceholder: React.FC<{ title: string }> = ({ title }) => (
    <div className="bg-surface-light p-4 rounded-lg border border-border-color h-64 flex flex-col">
        <h4 className="text-sm font-semibold text-text-secondary mb-2">{title}</h4>
        <div className="flex-grow flex items-center justify-center">
            <p className="text-text-secondary/50">Chart data not available</p>
        </div>
    </div>
);

const AgentAnalysis: React.FC = () => {
    const agent = useOutletContext<Agent>();
    const { startOptimization, startReEvolution } = useAgentStore();

    if (!agent) {
        return <div>Loading agent data...</div>;
    }

    const isReEvolvable = agent.status === 'AwaitingReEvolution';
    const isOptimizable = agent.status === 'Live';
    const canTriggerCycle = isReEvolvable || isOptimizable;
    const isProcessing = agent.status === 'Optimizing' || agent.status === 'ReEvolving';

    const handleCycleStart = () => {
        if (isReEvolvable) {
            startReEvolution(agent._id);
        } else if (isOptimizable) {
            startOptimization(agent._id);
        }
    };

    const getCycleButtonText = () => {
        if (agent.status === 'Optimizing') return 'Optimizing...';
        if (agent.status === 'ReEvolving') return 'Re-Evolving...';
        if (isReEvolvable) return 'Start Re-Evolution';
        return 'Start Optimization';
    };

    const getCycleDescription = () => {
        if (agent.status === 'Optimized') return <p className="text-sm text-accent font-semibold mt-1">Agent is fully optimized based on current data.</p>;
        if (agent.status === 'Optimizing') return <p className="text-sm text-primary font-semibold animate-pulse mt-1">Optimization in progress... ({Math.round(agent.progress || 0)}%)</p>;
        if (agent.status === 'ReEvolving') return <p className="text-sm text-primary font-semibold animate-pulse mt-1">Re-evolution in progress... ({Math.round(agent.progress || 0)}%)</p>;
        if (isReEvolvable) return <p className="text-text-secondary text-sm mt-1">New data has been ingested. Re-evolve the agent to incorporate the new knowledge.</p>;
        if (isOptimizable) return <p className="text-text-secondary text-sm mt-1">Run a new optimization cycle to improve performance and reduce costs based on recent interactions.</p>;
        return null;
    }


    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold">Analysis & Optimization</h1>
                <p className="text-text-secondary mt-1">Review performance metrics and trigger optimization cycles.</p>
            </div>

            <div className="bg-surface p-6 rounded-xl border border-border-color shadow-lg">
                <h2 className="text-xl font-bold mb-4">Performance Overview</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-surface-light p-4 rounded-lg border border-border-color">
                        <p className="text-sm text-text-secondary">Avg. Response Time</p>
                        <p className="text-3xl font-bold text-primary">1.2s</p>
                    </div>
                    <div className="bg-surface-light p-4 rounded-lg border border-border-color">
                        <p className="text-sm text-text-secondary">Success Rate</p>
                        <p className="text-3xl font-bold text-primary">99.8%</p>
                    </div>
                    <div className="bg-surface-light p-4 rounded-lg border border-border-color">
                        <p className="text-sm text-text-secondary">Estimated Cost / 1k queries</p>
                        <p className="text-3xl font-bold text-primary">$0.15</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ChartPlaceholder title="Response Time Over Time (P95)" />
                <ChartPlaceholder title="Token Usage by Day" />
            </div>

            <div className="bg-surface p-6 rounded-xl border border-border-color shadow-lg">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                    <div>
                        <h2 className="text-xl font-bold">Improvement Cycle</h2>
                        {getCycleDescription()}
                    </div>
                    <button 
                        onClick={handleCycleStart} 
                        disabled={!canTriggerCycle}
                        className="flex-shrink-0 flex items-center space-x-2 bg-primary text-white font-bold py-3 px-6 rounded-lg hover:bg-primary-focus transition-colors disabled:bg-gray-500/50 disabled:cursor-not-allowed"
                    >
                         {isProcessing ? <RefreshIcon className="animate-spin" /> : <RefreshIcon />}
                        <span>{getCycleButtonText()}</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AgentAnalysis;
