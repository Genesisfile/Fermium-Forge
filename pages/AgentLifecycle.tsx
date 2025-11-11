

import React from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { useAgentStore } from '../hooks/useAgentStore';
import type { Agent, Strategy, StrategyStep, AgentStatus } from '../types';
import { CheckCircleIcon, RefreshIcon, BuildIcon, DeployIcon, AnalysisIcon, PlaygroundIcon } from '../components/icons/Icons'; // Added BuildIcon, DeployIcon, AnalysisIcon, PlaygroundIcon

// Reused LifecycleStep from former BuildAndEvolve.tsx
const LifecycleStep: React.FC<{
    stepNumber: number; // Renamed from 'step' to avoid conflict with 'step' variable
    title: string;
    description: string;
    status: 'pending' | 'in-progress' | 'completed' | 'skipped';
    progress?: number;
    tasks?: { name: string; progress: number }[];
    onStart?: () => void;
    currentStepActive?: boolean;
    isManual?: boolean; // New prop to indicate if the step can be manually started
    agentStatus: AgentStatus; // Pass agent's overall status
}> = ({ stepNumber, title, description, status, progress = 0, tasks, onStart, currentStepActive, isManual = false, agentStatus }) => {
    const isClickable = isManual && status === 'pending' && !currentStepActive;

    const getStatusClasses = () => {
        switch (status) {
            case 'completed': return 'bg-green-500/20 text-green-400 border-green-500/50';
            case 'in-progress': return 'bg-blue-500/20 text-blue-400 border-blue-500/50 animate-pulse-light';
            case 'pending': return 'bg-gray-700/20 text-gray-400 border-gray-700/50';
            case 'skipped': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
            default: return 'bg-gray-700/20 text-gray-400 border-gray-700/50';
        }
    };

    const getProgressBarColor = () => {
        switch (status) {
            case 'completed': return 'bg-green-500';
            case 'in-progress': return 'bg-blue-500';
            default: return 'bg-gray-500';
        }
    };

    const isProcessingOverall = ['Evolving', 'Certifying', 'Deploying', 'Optimizing', 'ReEvolving', 'ExecutingStrategy', 'AutoEvolving'].includes(agentStatus);

    return (
        <div className={`relative flex items-start space-x-4 p-4 rounded-xl border ${getStatusClasses()} ${isClickable ? 'cursor-pointer hover:border-primary-focus' : ''}`} onClick={isClickable ? onStart : undefined}>
            <div className={`flex items-center justify-center w-8 h-8 rounded-full flex-shrink-0 ${status === 'completed' ? 'bg-green-500' : (status === 'in-progress' ? 'bg-blue-500' : 'bg-gray-500')} text-white text-sm font-bold z-10`}>
                {status === 'completed' ? <CheckCircleIcon /> : stepNumber}
            </div>
            <div className="flex-grow">
                <h3 className={`font-semibold text-lg ${status === 'completed' ? 'text-green-300' : 'text-text-primary'}`}>{title}</h3>
                <p className="text-sm text-text-secondary">{description}</p>
                {status === 'in-progress' && (
                    <div className="mt-2">
                        <div className="w-full bg-surface-light rounded-full h-2.5">
                            <div className={`${getProgressBarColor()} h-2.5 rounded-full`} style={{ width: `${progress}%` }}></div>
                        </div>
                        <p className="text-xs text-text-secondary mt-1">{Math.round(progress)}% Complete</p>
                        {tasks && tasks.length > 0 && (
                            <ul className="text-xs text-text-secondary mt-2 space-y-1">
                                {tasks.map((task, idx) => (
                                    <li key={idx} className="flex justify-between items-center">
                                        <span>- {task.name}</span>
                                        <span>{Math.round(task.progress)}%</span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                )}
                {isManual && status === 'pending' && !isProcessingOverall && (
                    <button
                        onClick={onStart}
                        className="mt-3 px-4 py-2 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary-focus transition-colors disabled:bg-gray-500/50 disabled:cursor-not-allowed"
                        disabled={isProcessingOverall}
                    >
                        Start {title}
                    </button>
                )}
            </div>
        </div>
    );
};


const AgentLifecycle: React.FC = () => {
    const agent = useOutletContext<Agent>();
    const { getLogsForAgent, getStrategy, startEvolution, startDeployment, startOptimization, startReEvolution, updateAgent, forceStartCurrentStrategyStep } = useAgentStore();
    const navigate = useNavigate();

    if (!agent) {
        return <div>Loading agent data...</div>;
    }

    const agentLogs = getLogsForAgent(agent._id);
    const strategy = agent.strategyId ? getStrategy(agent.strategyId) : undefined;
    const isProcessing = ['Evolving', 'Certifying', 'Deploying', 'Optimizing', 'ReEvolving', 'ExecutingStrategy', 'AutoEvolving'].includes(agent.status);

    const handleStartManualStep = (status: AgentStatus, strategyStep?: number) => {
        if (strategyStep !== undefined) {
             // For strategy-based agents, explicitly restart the simulator for the current step.
            // The reducer will then handle setting the correct status and step and restarting the simulator.
            forceStartCurrentStrategyStep(agent._id);
            updateAgent({ _id: agent._id, status: status, currentStrategyStep: strategyStep, progress: 0, parallelTasks: [], restartSimulator: true });
        } else {
            // For manual lifecycle agents, just update the status. The simulator will pick it up.
            updateAgent({ _id: agent._id, status: status, progress: 0, parallelTasks: [], restartSimulator: true });
        }
    };

    const getManualLifecycleSteps = () => {
        const manualSteps: { title: string; description: string; expectedStatus: AgentStatus; action?: () => void; isManual: boolean; }[] = [
            { title: 'Conception', description: 'The initial phase where the agent\'s core purpose and initial parameters are defined.', expectedStatus: 'Conception', isManual: false },
            { title: 'Evolution', description: 'The agent learns and develops its core intelligence through simulated training and parameter tuning.', expectedStatus: 'Evolving', action: () => startEvolution(agent._id), isManual: true },
            { title: 'Certification', description: 'The agent undergoes rigorous testing to ensure it meets performance, safety, and compliance benchmarks.', expectedStatus: 'Certifying', isManual: true },
            { title: 'Deployment', description: 'Once certified, the agent is deployed to a live, scalable API endpoint, making it accessible for integration.', expectedStatus: 'Deploying', action: () => startDeployment(agent._id), isManual: true },
            { title: 'Live Operation', description: 'The agent is actively serving requests and interacting with the environment.', expectedStatus: 'Live', isManual: false },
            { title: 'Optimization', description: 'Ongoing refinement to improve efficiency, reduce costs, and enhance overall performance.', expectedStatus: 'Optimizing', action: () => startOptimization(agent._id), isManual: true },
            { title: 'Re-Evolution', description: 'Triggered by new data or significant performance shifts, the agent re-enters an evolution cycle to adapt and improve.', expectedStatus: 'ReEvolving', action: () => startReEvolution(agent._id), isManual: true },
        ];

        return manualSteps.map((step, index) => {
            let status: 'pending' | 'in-progress' | 'completed' | 'skipped' = 'pending';
            let currentProgress = 0;
            let currentTasks = [];

            const isCurrentStep = agent.status === step.expectedStatus ||
                                  (agent.status === 'Certifying' && step.expectedStatus === 'Evolving' && agent.progress === 100); // Special case for Evolving -> Certifying auto-transition

            if (agent.status === step.expectedStatus) {
                status = 'in-progress';
                currentProgress = agent.progress || 0;
                currentTasks = agent.parallelTasks || [];
            } else if (agent.status === 'Certified' && step.expectedStatus === 'Certifying') { // Special handling for Certified status after Certifying step
                status = 'completed';
                currentProgress = 100;
            } else if (agent.status === 'Optimized' && step.expectedStatus === 'Optimizing') { // FIX: Changed 'Optimization' to 'Optimizing'
                status = 'completed';
                currentProgress = 100;
            } else if (agent.status === 'Live' && step.expectedStatus === 'Deploying') { // FIX: Changed 'Deployment' to 'Deploying'
                status = 'completed';
                currentProgress = 100;
            } else if (manualSteps.slice(0, index).some(s => s.expectedStatus === agent.status)) {
                // If the current agent status is one of the previous steps, then this step is pending
                status = 'pending';
            } else if (manualSteps.slice(index + 1).some(s => s.expectedStatus === agent.status) ||
                       (agent.status === 'Certified' && index < manualSteps.findIndex(s => s.expectedStatus === 'Certifying')) ||
                       (agent.status === 'Live' && index < manualSteps.findIndex(s => s.expectedStatus === 'Live')) ||
                       (agent.status === 'Optimized' && index < manualSteps.findIndex(s => s.expectedStatus === 'Optimized'))
                       ) {
                // If the agent status is a later step, this one is completed
                status = 'completed';
                currentProgress = 100; // Assume 100% if completed
            }

            // Determine if the action button should be shown for a manual step
            const showActionButton = step.isManual && (
                (step.expectedStatus === 'Evolving' && agent.status === 'Conception') ||
                (step.expectedStatus === 'Certifying' && agent.status === 'Evolving' && agent.progress === 100) ||
                (step.expectedStatus === 'Deploying' && agent.status === 'Certified') ||
                (step.expectedStatus === 'Optimizing' && agent.status === 'Live') ||
                (step.expectedStatus === 'ReEvolving' && agent.status === 'AwaitingReEvolution')
            );
            
            return (
                <LifecycleStep
                    key={index}
                    stepNumber={index + 1}
                    title={step.title}
                    description={step.description}
                    status={status}
                    progress={currentProgress}
                    tasks={currentTasks}
                    onStart={showActionButton && step.action ? step.action : undefined}
                    currentStepActive={isCurrentStep}
                    isManual={step.isManual}
                    agentStatus={agent.status}
                />
            );
        });
    };

    const getStrategyLifecycleSteps = (strategy: Strategy) => {
        const currentStepIndex = agent.currentStrategyStep ?? 0;

        return strategy.steps.map((step, index) => {
            let status: 'pending' | 'in-progress' | 'completed' | 'skipped' = 'pending';
            let currentProgress = 0;
            let currentTasks = [];

            if (index < currentStepIndex) {
                status = 'completed';
                currentProgress = 100;
            } else if (index === currentStepIndex && agent.status === 'ExecutingStrategy') {
                status = 'in-progress';
                currentProgress = agent.progress || 0;
                currentTasks = agent.parallelTasks || [];
            } else if (index === currentStepIndex && agent.status === 'Live') { // If agent is 'Live' and this is the last step
                if (currentStepIndex === strategy.steps.length -1) {
                    status = 'completed';
                    currentProgress = 100;
                } else { // Should not happen if strategy fully completes before going 'Live'
                    status = 'skipped';
                }
            }
            
            const stepTitleMap: { [key in StrategyStep['type']]: string } = {
                IngestData: 'Ingest Data',
                Evolve: 'Evolve Agent',
                Certify: 'Certify Agent',
                Deploy: 'Deploy Agent',
                Optimize: 'Optimize Agent',
                ResearchMarket: 'Research Market',
                GenerateConcepts: 'Generate Concepts',
                RefineIdentity: 'Refine Identity',
                Orchestrate: 'Orchestrate Tasks',
                MonitorAndRefine: 'Monitor & Refine Strategy',
            };

            const stepDescriptionMap: { [key in StrategyStep['type']]: string } = {
                IngestData: `Ingest ${step.config?.dataPoints || 'new'} data points to train the agent.`,
                Evolve: `Evolve agent through ${step.config?.generations || 'many'} generations.`,
                Certify: 'Certify agent against performance and safety benchmarks.',
                Deploy: 'Deploy agent to a live API endpoint.',
                Optimize: 'Optimize agent for efficiency and cost reduction.',
                ResearchMarket: 'Conduct market research and competitor analysis for brand strategy.',
                GenerateConcepts: 'Generate brand names, visual concepts, and messaging frameworks.',
                RefineIdentity: 'Refine brand identity based on feedback and cohesion checks.',
                Orchestrate: step.config?.task || 'Receive and delegate complex tasks to specialized agents.',
                MonitorAndRefine: step.config?.task || 'Continuously analyze system health and logs to refine development strategy.',
            };

            // Only allow manual restart if the agent is currently stuck on this step
            const showActionButton = agent.status === 'ExecutingStrategy' && index === currentStepIndex && agent.restartSimulator;

            return (
                <LifecycleStep
                    key={index}
                    stepNumber={index + 1}
                    title={stepTitleMap[step.type] || step.type}
                    description={stepDescriptionMap[step.type]}
                    status={status}
                    progress={currentProgress}
                    tasks={currentTasks}
                    onStart={showActionButton ? () => handleStartManualStep('ExecutingStrategy', index) : undefined}
                    currentStepActive={index === currentStepIndex}
                    isManual={false} // Strategy steps are automated
                    agentStatus={agent.status}
                />
            );
        });
    };

    const displaySteps = strategy ? getStrategyLifecycleSteps(strategy) : getManualLifecycleSteps();
    const isManualLifecycle = !strategy;

    const isFullyOperational = (isManualLifecycle && agent.status === 'Live') ||
                               (!isManualLifecycle && agent.status === 'Live' && agent.currentStrategyStep === strategy?.steps.length);
    
    // Determine the primary action button's state and text
    const primaryActionButtonEnabled = (
        (agent.status === 'Conception' && !isProcessing) ||
        (agent.status === 'Evolving' && agent.progress === 100 && !isProcessing) ||
        (agent.status === 'Certified' && !isProcessing) ||
        (agent.status === 'Live' && !isProcessing && isManualLifecycle) || // Manual optimization for Live
        (agent.status === 'AwaitingReEvolution' && !isProcessing) // Manual re-evolution
    );

    const getPrimaryActionButtonText = () => {
        if (agent.status === 'Conception') return 'Start Evolution';
        if (agent.status === 'Evolving' && agent.progress === 100) return 'Start Certification';
        if (agent.status === 'Certified') return 'Start Deployment';
        if (agent.status === 'Live' && isManualLifecycle) return 'Start Optimization';
        if (agent.status === 'AwaitingReEvolution') return 'Start Re-Evolution';
        if (isProcessing) {
            if (agent.status === 'Evolving') return 'Evolving...';
            if (agent.status === 'Certifying') return 'Certifying...';
            if (agent.status === 'Deploying') return 'Deploying...';
            if (agent.status === 'Optimizing') return 'Optimizing...';
            if (agent.status === 'ReEvolving') return 'Re-Evolving...';
            if (agent.status === 'ExecutingStrategy') return 'Executing Strategy...';
        }
        return 'Ready for Next Step';
    };

    const handlePrimaryActionButtonClick = () => {
        if (agent.status === 'Conception') startEvolution(agent._id);
        else if (agent.status === 'Evolving' && agent.progress === 100) updateAgent({ _id: agent._id, status: 'Certifying' }); // Direct status update
        else if (agent.status === 'Certified') startDeployment(agent._id);
        else if (agent.status === 'Live' && isManualLifecycle) startOptimization(agent._id);
        else if (agent.status === 'AwaitingReEvolution') startReEvolution(agent._id);
    };

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold">Agent Lifecycle</h1>
                <p className="text-text-secondary mt-1">
                    {strategy ?
                     `Agent is executing the '${strategy.name}' strategy.` :
                     `Manually guiding '${agent.name}' through its lifecycle.`
                    }
                </p>
            </div>

            {/* Overall Lifecycle Progress / Action */}
            <div className="bg-surface p-6 rounded-xl border border-border-color shadow-lg">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                    <div>
                        <h2 className="text-xl font-bold">Overall Progress</h2>
                        {isFullyOperational ? (
                             <p className="text-sm text-green-400 font-semibold mt-1">Agent is fully operational and {strategy ? 'strategy completed.' : 'ready for continuous operation.'}</p>
                        ) : (
                            <p className="text-sm text-text-secondary mt-1">
                                {isProcessing ? `Current status: ${agent.status} (${Math.round(agent.progress || 0)}%)` : `Next step: ${getPrimaryActionButtonText()}`}
                            </p>
                        )}
                    </div>
                    {isManualLifecycle && !isFullyOperational && (
                        <button
                            onClick={handlePrimaryActionButtonClick}
                            disabled={!primaryActionButtonEnabled}
                            className="flex-shrink-0 flex items-center space-x-2 bg-primary text-white font-bold py-3 px-6 rounded-lg hover:bg-primary-focus transition-colors disabled:bg-gray-500/50 disabled:cursor-not-allowed"
                        >
                            {isProcessing ? <RefreshIcon className="animate-spin" /> : <BuildIcon />}
                            <span>{getPrimaryActionButtonText()}</span>
                        </button>
                    )}
                    {!isManualLifecycle && agent.status === 'ExecutingStrategy' && agent.restartSimulator && (
                         <button
                            onClick={() => handleStartManualStep('ExecutingStrategy', agent.currentStrategyStep)}
                            className="flex-shrink-0 flex items-center space-x-2 bg-primary text-white font-bold py-3 px-6 rounded-lg hover:bg-primary-focus transition-colors"
                        >
                            <RefreshIcon className="animate-spin" />
                            <span>Restart Current Step</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Lifecycle Steps */}
            <div className="space-y-6">
                {displaySteps}
            </div>

            {/* Quick Actions after strategy completion or manual live */}
            {isFullyOperational && (
                <div className="bg-surface p-6 rounded-xl border border-border-color shadow-lg">
                    <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <button
                            onClick={() => navigate(`/playground?agentId=${agent._id}`)}
                            className="flex items-center justify-center space-x-2 bg-accent text-white font-bold py-3 px-6 rounded-lg hover:bg-accent-focus transition-colors"
                        >
                            <PlaygroundIcon />
                            <span>Go to Playground</span>
                        </button>
                        <button
                            onClick={() => navigate(`/deploy`)}
                            className="flex items-center justify-center space-x-2 bg-secondary text-white font-bold py-3 px-6 rounded-lg hover:bg-secondary-focus transition-colors"
                        >
                            <DeployIcon />
                            <span>Deployment Hub</span>
                        </button>
                        <button
                            onClick={() => navigate(`/agent/${agent._id}/analysis`)}
                            className="flex items-center justify-center space-x-2 bg-purple-500/20 text-purple-400 font-bold py-3 px-6 rounded-lg hover:bg-purple-500/40 transition-colors"
                        >
                            <AnalysisIcon />
                            <span>Analysis & Optimization</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AgentLifecycle;