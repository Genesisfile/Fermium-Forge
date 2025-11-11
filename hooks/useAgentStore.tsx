import React, { createContext, useContext, useReducer, ReactNode, useEffect, Dispatch, useRef, useCallback } from 'react';
import { Agent, Deployment, Webhook, Log, Strategy, FeatureEngine, AgentType, AgentStatus, WebhookEvent, StrategyStep, FileContext, PlaygroundMessage, ParallelTask, ExternalModelConfig, ModelPreferenceType, AgentState, Action, FunctionCallResult, AgentGovernanceConfig, GovernanceAction, ModelAlignmentActionType, AgentAlignmentAuditResult, ModelAlignmentAction, AgentContextType } from '../types'; // NEW: Imported FunctionCallResult, AgentContextType, AgentGovernanceConfig, GovernanceAction, ModelAlignmentActionType
import { generateId, generateApiKey } from '../utils/helpers';
// FIX: Add getAgentChatResponse to the import statement
import { getAgentChatResponse } from '../services/geminiService';
import { initialStrategies, initialFeatureEngines, CAPABILITY_PREFIX, DEV_STRATEGIST_SYSTEM_INSTRUCTION } from '../utils/constants'; // REMOVED: getDevTeamAgentCallableTools from import

// Ensure initialFeatureEngines is always an array, even if the import resolves to undefined for some reason
const validatedInitialFeatureEngines = globalThis.Array.isArray(initialFeatureEngines) ? initialFeatureEngines : [];

// INITIAL DATA
const initialApiKey = generateApiKey();

// Define the initial state of the agents
const initialAgents: Agent[] = [
    // Showcase Agents
    {
        _id: 'agent_code_companion',
        name: 'Code Companion',
        objective: 'Assists developers with coding tasks, debugging, and code generation.',
        type: 'Analytical',
        status: 'Live',
        progress: 100,
        apiKey: initialApiKey,
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString(), // 2 days ago
        ingestedDataCount: 150,
        integratedEngineIds: ['engine_solution_finder', 'engine_creative_suite', CAPABILITY_PREFIX + 'googleSearch', CAPABILITY_PREFIX + 'synthesis_code_generation'],
        realtimeFeedbackEnabled: true,
        governanceConfig: { maxFailedAttemptsPerCycle: 2, maxContinuousExecutionMinutes: 60, outputContentFilters: ['irrelevant_code'], rateLimitPerMinute: 200 }
    },
    {
        _id: 'agent_brand_strategist',
        name: 'Brand Strategist',
        objective: 'Develops comprehensive brand strategies, marketing campaigns, and content plans.',
        type: 'Creative',
        status: 'Optimized',
        progress: 100,
        apiKey: generateApiKey(),
        createdAt: new Date(Date.now() - 86400000 * 5).toISOString(), // 5 days ago
        ingestedDataCount: 300,
        integratedEngineIds: ['engine_creative_suite', CAPABILITY_PREFIX + 'googleSearch', 'engine_data_stream'],
        strategyId: 'strat_branding_solution',
        governanceConfig: { maxFailedAttemptsPerCycle: 3, maxContinuousExecutionMinutes: 120, outputContentFilters: ['generic_branding'], rateLimitPerMinute: 150 }
    },
    {
        _id: 'agent_market_pulse',
        name: 'Market Pulse',
        objective: 'Provides real-time market insights, trend analysis, and competitive intelligence.',
        type: 'Analytical',
        status: 'Optimized',
        progress: 100,
        apiKey: generateApiKey(),
        createdAt: new Date(Date.now() - 86400000 * 10).toISOString(), // 10 days ago
        ingestedDataCount: 500,
        integratedEngineIds: ['engine_data_stream', CAPABILITY_PREFIX + 'googleSearch', 'engine_solution_finder', CAPABILITY_PREFIX + 'chronos_diagnostics_analysis'],
        realtimeFeedbackEnabled: true,
        governanceConfig: { maxFailedAttemptsPerCycle: 2, maxContinuousExecutionMinutes: 30, outputContentFilters: ['redundancy', 'stale_data'], rateLimitPerMinute: 200 }
    },
    {
        _id: 'agent_game_master',
        name: 'Game Master',
        objective: 'Generates interactive story-driven game scenarios and challenges.',
        type: 'Creative',
        status: 'Certified',
        progress: 100,
        apiKey: generateApiKey(),
        createdAt: new Date(Date.now() - 86400000 * 3).toISOString(), // 3 days ago
        ingestedDataCount: 100,
        integratedEngineIds: ['engine_creative_suite'],
        governanceConfig: { maxFailedAttemptsPerCycle: 4, maxContinuousExecutionMinutes: 90, outputContentFilters: ['inconsistent_lore'], rateLimitPerMinute: 180 }
    },
    {
        _id: 'agent_knowledge_synth',
        name: 'Knowledge Synthesizer',
        objective: 'Synthesizes complex information from diverse sources into concise, understandable summaries.',
        type: 'Analytical',
        status: 'Evolving',
        progress: 40,
        apiKey: initialApiKey,
        createdAt: new Date(Date.now() - 86400000 * 1).toISOString(), // 1 day ago
        ingestedDataCount: 50,
        integratedEngineIds: ['engine_solution_finder', 'engine_data_stream', CAPABILITY_PREFIX + 'googleSearch'],
        governanceConfig: { maxFailedAttemptsPerCycle: 3, maxContinuousExecutionMinutes: 60, outputContentFilters: ['bias', 'toxicity'], rateLimitPerMinute: 100 }
    },
    {
        _id: 'agent_omni_solution',
        name: 'Omni Solution',
        objective: 'Provides multi-domain problem-solving and strategic advice.',
        type: 'Strategist', // Changed to Strategist for broader application
        status: 'Live',
        progress: 100,
        apiKey: generateApiKey(),
        createdAt: new Date(Date.now() - 86400000 * 7).toISOString(), // 7 days ago
        ingestedDataCount: 400,
        integratedEngineIds: ['engine_solution_finder', 'engine_data_stream', CAPABILITY_PREFIX + 'googleSearch', 'engine_creative_suite'],
        realtimeFeedbackEnabled: true,
        governanceConfig: { maxFailedAttemptsPerCycle: 2, maxContinuousExecutionMinutes: 90, outputContentFilters: ['vague_advice'], rateLimitPerMinute: 250 }
    },
    // DEV TEAM AGENTS
    {
        _id: 'agent_helios_architect',
        name: 'Helios Architect',
        objective: 'Provides architectural insights for optimal platform scalability and design.',
        type: 'Strategist',
        status: 'Live',
        progress: 100,
        apiKey: initialApiKey,
        createdAt: new Date(Date.now() - 86400000 * 15).toISOString(),
        ingestedDataCount: 1000,
        integratedEngineIds: ['engine_helios_architect', CAPABILITY_PREFIX + 'helios_architect_insights'],
        governanceConfig: { maxFailedAttemptsPerCycle: 1, maxContinuousExecutionMinutes: 180, outputContentFilters: ['architectural_debt'], rateLimitPerMinute: 50 }
    },
    {
        _id: 'agent_coda_dev_lead',
        name: 'Coda Dev Lead',
        objective: 'Manages code quality, dependency integrity, and build processes for all agents.',
        type: 'Analytical',
        status: 'Live',
        progress: 100,
        apiKey: initialApiKey,
        createdAt: new Date(Date.now() - 86400000 * 14).toISOString(),
        ingestedDataCount: 800,
        integratedEngineIds: ['engine_coda_dev_lead', CAPABILITY_PREFIX + 'coda_code_review'],
        governanceConfig: { maxFailedAttemptsPerCycle: 1, maxContinuousExecutionMinutes: 120, outputContentFilters: ['code_smell'], rateLimitPerMinute: 80 }
    },
    {
        _id: 'agent_janus_qa',
        name: 'Janus QA',
        objective: 'Ensures the quality and performance of agents through automated testing and validation.',
        type: 'Analytical',
        status: 'Live',
        progress: 100,
        apiKey: initialApiKey,
        createdAt: new Date(Date.now() - 86400000 * 13).toISOString(),
        ingestedDataCount: 700,
        integratedEngineIds: ['engine_janus_qa', CAPABILITY_PREFIX + 'janus_qa_testing'],
        governanceConfig: { maxFailedAttemptsPerCycle: 2, maxContinuousExecutionMinutes: 90, outputContentFilters: ['false_positives'], rateLimitPerMinute: 70 }
    },
    {
        _id: 'agent_chronos_diagnostics',
        name: 'Chronos Diagnostics',
        objective: 'Provides real-time system diagnostics, anomaly detection, and performance monitoring.',
        type: 'Analytical',
        status: 'Live',
        progress: 100,
        apiKey: initialApiKey,
        createdAt: new Date(Date.now() - 86400000 * 12).toISOString(),
        ingestedDataCount: 1200,
        integratedEngineIds: ['engine_chronos_diagnostics', CAPABILITY_PREFIX + 'chronos_diagnostics_analysis'],
        realtimeFeedbackEnabled: true,
        governanceConfig: { maxFailedAttemptsPerCycle: 1, maxContinuousExecutionMinutes: 60, outputContentFilters: ['noise'], rateLimitPerMinute: 150 }
    },
    {
        _id: 'agent_fermium_oracle',
        name: 'Fermium Oracle',
        objective: 'Provides high-level strategic guidance and insights for platform evolution.',
        type: 'Strategist',
        status: 'Live',
        progress: 100,
        apiKey: initialApiKey,
        createdAt: new Date(Date.now() - 86400000 * 11).toISOString(),
        ingestedDataCount: 1500,
        integratedEngineIds: ['engine_solution_finder', CAPABILITY_PREFIX + 'googleSearch'],
        governanceConfig: { maxFailedAttemptsPerCycle: 1, maxContinuousExecutionMinutes: 240, outputContentFilters: ['short_sighted_advice'], rateLimitPerMinute: 60 }
    },
    {
        _id: 'agent_sentinel_security',
        name: 'Sentinel Security',
        objective: 'Ensures platform and agent security through continuous auditing and vulnerability assessment.',
        type: 'Analytical',
        status: 'Live',
        progress: 100,
        apiKey: initialApiKey,
        createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
        ingestedDataCount: 600,
        integratedEngineIds: ['engine_sentinel_security', CAPABILITY_PREFIX + 'sentinel_security_audit'],
        governanceConfig: { maxFailedAttemptsPerCycle: 1, maxContinuousExecutionMinutes: 180, outputContentFilters: ['false_alarms'], rateLimitPerMinute: 90 }
    },
    {
        _id: 'agent_atlas_docs',
        name: 'Atlas Docs',
        objective: 'Generates and maintains comprehensive technical documentation for the platform and agents.',
        type: 'Creative',
        status: 'Live',
        progress: 100,
        apiKey: initialApiKey,
        createdAt: new Date(Date.now() - 86400000 * 9).toISOString(),
        ingestedDataCount: 500,
        integratedEngineIds: ['engine_atlas_docs', CAPABILITY_PREFIX + 'atlas_documentation'],
        governanceConfig: { maxFailedAttemptsPerCycle: 2, maxContinuousExecutionMinutes: 150, outputContentFilters: ['outdated_info'], rateLimitPerMinute: 70 }
    },
    {
        _id: 'agent_synthesis_engineer',
        name: 'Synthesis Engineer',
        objective: 'Generates optimized code across various languages, acting as a core coding engine.',
        type: 'Creative',
        status: 'Live',
        progress: 100,
        apiKey: initialApiKey,
        createdAt: new Date(Date.now() - 86400000 * 8).toISOString(),
        ingestedDataCount: 750,
        integratedEngineIds: ['engine_synthesis_forge', CAPABILITY_PREFIX + 'synthesis_code_generation'],
        governanceConfig: { maxFailedAttemptsPerCycle: 2, maxContinuousExecutionMinutes: 100, outputContentFilters: ['inefficient_code'], rateLimitPerMinute: 120 }
    },
    {
        _id: 'agent_release_orchestrator',
        name: 'Release Orchestrator',
        objective: 'Automates CI/CD pipelines and orchestrates agent deployments.',
        type: 'Strategist',
        status: 'Live',
        progress: 100,
        apiKey: initialApiKey,
        createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
        ingestedDataCount: 400,
        integratedEngineIds: ['engine_release_automation', CAPABILITY_PREFIX + 'release_orchestration'],
        governanceConfig: { maxFailedAttemptsPerCycle: 1, maxContinuousExecutionMinutes: 90, outputContentFilters: ['deployment_failures'], rateLimitPerMinute: 80 }
    },
    {
        _id: 'agent_project_manager',
        name: 'Project Manager',
        objective: 'Monitors project progress, allocates resources, and provides status updates.',
        type: 'Strategist',
        status: 'Live',
        progress: 100,
        apiKey: initialApiKey,
        createdAt: new Date(Date.now() - 86400000 * 6).toISOString(),
        ingestedDataCount: 550,
        integratedEngineIds: ['engine_project_oversight', CAPABILITY_PREFIX + 'project_management'],
        governanceConfig: { maxFailedAttemptsPerCycle: 2, maxContinuousExecutionMinutes: 120, outputContentFilters: ['scope_creep'], rateLimitPerMinute: 60 }
    },
    {
        _id: 'agent_nexus_orchestrator',
        name: 'Nexus Orchestrator',
        objective: 'Receives and delegates complex tasks to other specialized agents for end-to-end workflow management.',
        type: 'ClientSide', // Assuming a new type for orchestration
        status: 'Live',
        progress: 100,
        apiKey: initialApiKey,
        createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
        ingestedDataCount: 300,
        integratedEngineIds: [CAPABILITY_PREFIX + 'nexus_orchestrator_orchestrate', 'engine_solution_finder'],
        strategyId: 'strat_orchestration_hub', // NEW: Orchestration Hub strategy
        governanceConfig: { maxFailedAttemptsPerCycle: 1, maxContinuousExecutionMinutes: 240, outputContentFilters: ['failed_delegations'], rateLimitPerMinute: 100 }
    },
    {
        _id: 'agent_project_guardian',
        name: 'Project Guardian',
        objective: 'Assesses complete project files and coding, provides analysis, feedback, and actionable improvement instructions.',
        type: 'Analytical',
        status: 'Live',
        progress: 100,
        apiKey: initialApiKey,
        createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
        ingestedDataCount: 200,
        integratedEngineIds: ['engine_project_guardian', CAPABILITY_PREFIX + 'project_guardian_analysis'],
        governanceConfig: { maxFailedAttemptsPerCycle: 2, maxContinuousExecutionMinutes: 180, outputContentFilters: ['irrelevant_feedback'], rateLimitPerMinute: 70 }
    },
    {
        _id: 'agent_dev_strategist',
        name: 'Dev Strategist',
        objective: 'To continuously analyze the platform\'s logs, agent performance, system integrity, and past developments to formulate and refine the most efficient development strategy plan, focusing on system-wide improvements and agent evolution protocols.',
        type: 'Strategist',
        status: 'ExecutingStrategy',
        progress: 0, // Starts at 0, executes strategy
        apiKey: initialApiKey,
        createdAt: new Date(Date.now() - 86400000 * 0.5).toISOString(),
        ingestedDataCount: 0,
        integratedEngineIds: [
            `${CAPABILITY_PREFIX}chronos_diagnostics_analysis`,
            `${CAPABILITY_PREFIX}project_guardian_analysis`,
            `${CAPABILITY_PREFIX}dev_strategist_plan`,
            `${CAPABILITY_PREFIX}agent_alignment_audit`
        ],
        strategyId: 'strat_dev_strategy_monitor_and_refine',
        currentStrategyStep: 0,
        governanceConfig: {
            maxFailedAttemptsPerCycle: 1,
            maxContinuousExecutionMinutes: 30,
            outputContentFilters: ['infeasible_strategies', 'hallucinations_in_diagnosis'],
            rateLimitPerMinute: 100
        }
    }
];

const initialWebhooks: Webhook[] = [
    { _id: generateId(), targetUrl: 'https://example.com/notification', purpose: 'Notification', events: ['agent.evolution.completed', 'agent.deployed'] },
    { _id: generateId(), targetUrl: 'https://example.com/ingest-data', purpose: 'Data Ingestion', agentId: 'agent_market_pulse', events: [] },
    { _id: generateId(), targetUrl: 'https://example.com/orchestrate', purpose: 'Orchestration', agentId: 'agent_nexus_orchestrator', events: [] },
];

const initialDeployments: Deployment[] = [
    { _id: generateId(), agentId: 'agent_code_companion', endpointUrl: 'https://api.fermiumforge.com/agents/code-companion', createdAt: new Date().toISOString() },
    { _id: generateId(), agentId: 'agent_brand_strategist', endpointUrl: 'https://api.fermiumforge.com/agents/brand-strategist', createdAt: new Date().toISOString() },
    { _id: generateId(), agentId: 'agent_market_pulse', endpointUrl: 'https://api.fermiumforge.com/agents/market-pulse', createdAt: new Date().toISOString() },
    { _id: generateId(), agentId: 'agent_omni_solution', endpointUrl: 'https://api.fermiumforge.com/agents/omni-solution', createdAt: new Date().toISOString() },
    // Dev Team Agents
    { _id: generateId(), agentId: 'agent_helios_architect', endpointUrl: 'https://api.fermiumforge.com/agents/helios-architect', createdAt: new Date().toISOString() },
    { _id: generateId(), agentId: 'agent_coda_dev_lead', endpointUrl: 'https://api.fermiumforge.com/agents/coda-dev-lead', createdAt: new Date().toISOString() },
    { _id: generateId(), agentId: 'agent_janus_qa', endpointUrl: 'https://api.fermiumforge.com/agents/janus-qa', createdAt: new Date().toISOString() },
    { _id: generateId(), agentId: 'agent_chronos_diagnostics', endpointUrl: 'https://api.fermiumforge.com/agents/chronos-diagnostics', createdAt: new Date().toISOString() },
    { _id: generateId(), agentId: 'agent_fermium_oracle', endpointUrl: 'https://api.fermiumforge.com/agents/fermium-oracle', createdAt: new Date().toISOString() },
    { _id: generateId(), agentId: 'agent_sentinel_security', endpointUrl: 'https://api.fermiumforge.com/agents/sentinel-security', createdAt: new Date().toISOString() },
    { _id: generateId(), agentId: 'agent_atlas_docs', endpointUrl: 'https://api.fermiumforge.com/agents/atlas-docs', createdAt: new Date().toISOString() },
    { _id: generateId(), agentId: 'agent_synthesis_engineer', endpointUrl: 'https://api.fermiumforge.com/agents/synthesis-engineer', createdAt: new Date().toISOString() },
    { _id: generateId(), agentId: 'agent_release_orchestrator', endpointUrl: 'https://api.fermiumforge.com/agents/release-orchestrator', createdAt: new Date().toISOString() },
    { _id: generateId(), agentId: 'agent_project_manager', endpointUrl: 'https://api.fermiumforge.com/agents/project-manager', createdAt: new Date().toISOString() },
    { _id: generateId(), agentId: 'agent_nexus_orchestrator', endpointUrl: 'https://api.fermiumforge.com/agents/nexus-orchestrator', createdAt: new Date().toISOString() },
    { _id: generateId(), agentId: 'agent_project_guardian', endpointUrl: 'https://api.fermiumforge.com/agents/project-guardian', createdAt: new Date().toISOString() },
    { _id: generateId(), agentId: 'agent_dev_strategist', endpointUrl: 'https://api.fermiumforge.com/agents/dev-strategist', createdAt: new Date().toISOString() },
];

const initialState: AgentState = {
    agents: initialAgents,
    deployments: initialDeployments,
    webhooks: initialWebhooks,
    logs: {
        'agent_chronos_diagnostics': [{ _id: generateId(), timestamp: new Date().toISOString(), stage: 'Diagnostics', message: 'System initialization complete.' }],
        'agent_dev_strategist': [{ _id: generateId(), timestamp: new Date().toISOString(), stage: 'DevelopmentStrategy', message: 'Dev Strategist awaiting initial prompt.' }],
    },
    strategies: initialStrategies,
    featureEngines: validatedInitialFeatureEngines,
    apiKey: initialApiKey,
};

// --- Agent Reducer Logic ---

// Helper to determine the next strategy step's status
const getNextStrategyStepStatus = (strategyStepType: StrategyStep['type']): AgentStatus => {
    switch (strategyStepType) {
        case 'IngestData': return 'AutoEvolving'; // Data ingestion is part of evolution
        case 'Evolve': return 'Evolving';
        case 'Certify': return 'Certifying';
        case 'Deploy': return 'Deploying';
        case 'Optimize': return 'Optimizing';
        case 'ResearchMarket':
        case 'GenerateConcepts':
        case 'RefineIdentity':
        case 'Orchestrate':
        case 'MonitorAndRefine':
            return 'ExecutingStrategy'; // General 'in progress' for complex strategy steps
        default: return 'ExecutingStrategy';
    }
};

const rootAgentReducer = (state: AgentState, action: Action): AgentState => {
    let newState = { ...state };
    let agentToLog: Agent | undefined; // Keep track of the agent affected by the action for Chronos logging

    switch (action.type) {
        case 'CREATE_AGENT':
            newState.agents = [...state.agents, action.payload];
            newState.logs = {
                ...newState.logs,
                [action.payload._id]: [{ _id: generateId(), timestamp: new Date().toISOString(), stage: 'Conception', message: `Agent '${action.payload.name}' created.` }],
            };
            agentToLog = action.payload; // Log to Chronos
            break;
        case 'UPDATE_AGENT':
            newState.agents = state.agents.map(agent => {
                if (agent._id === action.payload._id) {
                    const updatedAgent = { ...agent, ...action.payload };
                    
                    // Specific logic for lifecycle transitions and logging
                    if (action.payload.status && action.payload.status !== agent.status) {
                        newState.logs = {
                            ...newState.logs,
                            [agent._id]: [{ _id: generateId(), timestamp: new Date().toISOString(), stage: 'Info', message: `Agent status changed from '${agent.status}' to '${action.payload.status}'.` }, ...(newState.logs?.[agent._id] || [])],
                        };
                    }
                    agentToLog = updatedAgent; // Log to Chronos
                    return updatedAgent;
                }
                return agent;
            });
            break;
        case 'ADD_DEPLOYMENT':
            newState.deployments = [...state.deployments, action.payload];
            newState.logs = {
                ...newState.logs,
                [action.payload.agentId]: [{ _id: generateId(), timestamp: new Date().toISOString(), stage: 'Deployment', message: `Agent deployed to: ${action.payload.endpointUrl}` }, ...(newState.logs?.[action.payload.agentId] || [])],
            };
            // Find agent to log to Chronos
            agentToLog = state.agents.find(a => a._id === action.payload.agentId);
            break;
        case 'ADD_WEBHOOK':
            newState.webhooks = [...state.webhooks, action.payload];
            newState.logs = {
                ...newState.logs,
                ['system']: [{ _id: generateId(), timestamp: new Date().toISOString(), stage: 'Info', message: `Webhook '${action.payload.purpose}' registered for URL: ${action.payload.targetUrl}.` }, ...(newState.logs?.['system'] || [])],
            };
            // No specific agent to log for webhook creation, unless it's an orchestration webhook directly tied to an agent
            if (action.payload.agentId) {
                agentToLog = state.agents.find(a => a._id === action.payload.agentId);
            }
            break;
        case 'REGENERATE_API_KEY':
            newState.apiKey = generateApiKey();
            newState.logs = {
                ...newState.logs,
                ['system']: [{ _id: generateId(), timestamp: new Date().toISOString(), stage: 'Info', message: 'API key regenerated.' }, ...(newState.logs?.['system'] || [])],
            };
            break;
        case 'ADD_LOG':
            const { agentId, log } = action.payload;
            newState.logs = {
                ...newState.logs,
                [agentId]: [log, ...(newState.logs?.[agentId] || [])],
            };
            // Do not log 'ThinkingProcess' to Chronos Diagnostics to prevent clutter.
            // Also exclude 'DevelopmentStrategy' as Dev Strategist already generates a Diagnostics log for its actions.
            if (log.stage !== 'ThinkingProcess' && log.stage !== 'DevelopmentStrategy') {
                agentToLog = state.agents.find(a => a._id === agentId);
            }
            break;
        case 'UPDATE_DATA_COUNT':
            newState.agents = state.agents.map(agent => {
                if (agent._id === action.payload.agentId) {
                    const newCount = (agent.ingestedDataCount || 0) + action.payload.count;
                    const updatedAgent = { ...agent, ingestedDataCount: newCount };
                    if (action.payload.triggerReEvolution) {
                        // Only set AwaitingReEvolution if not already in an active processing state
                        if (!['Evolving', 'Certifying', 'Deploying', 'Optimizing', 'ReEvolving', 'ExecutingStrategy', 'AutoEvolving'].includes(updatedAgent.status)) {
                            updatedAgent.status = 'AwaitingReEvolution';
                            updatedAgent.progress = 0;
                            newState.logs = {
                                ...newState.logs,
                                [agent._id]: [{ _id: generateId(), timestamp: new Date().toISOString(), stage: 'Info', message: `New data ingested. Agent '${agent.name}' is now Awaiting Re-Evolution.` }, ...(newState.logs?.[agent._id] || [])],
                            };
                        }
                    }
                    agentToLog = updatedAgent; // Log to Chronos
                    return updatedAgent;
                }
                return agent;
            });
            break;
        case 'CONSUME_RESTART_SIMULATOR_FLAG':
            newState.agents = state.agents.map(agent => {
                if (agent._id === action.payload._id) {
                    const updatedAgent = { ...agent, restartSimulator: false };
                    // No direct Chronos log for consuming a flag, it's an internal state update
                    return updatedAgent;
                }
                return agent;
            });
            break;
        case 'APPLY_GOVERNANCE_ACTION': {
            const actionPayload = action.payload;
            newState.agents = state.agents.map(a => {
                if (a._id === actionPayload.targetAgentId) {
                    const updatedAgent = { ...a };
                    switch (actionPayload.type) {
                        case 'SetAgentGovernanceConfig':
                            updatedAgent.governanceConfig = { ...updatedAgent.governanceConfig, ...actionPayload.details.config };
                            break;
                        case 'ToggleRealtimeFeedback':
                            updatedAgent.realtimeFeedbackEnabled = actionPayload.details.enable;
                            break;
                        case 'ResetAgentLifecycle':
                            updatedAgent.status = 'Conception'; // Reset to start
                            updatedAgent.progress = 0;
                            updatedAgent.parallelTasks = [];
                            updatedAgent.currentStrategyStep = undefined;
                            updatedAgent.restartSimulator = true;
                            // Optionally clear logs for this agent? For now, keep them for audit.
                            break;
                        case 'SuspendAgent':
                            updatedAgent.status = 'Failed'; // Use 'Failed' as a generic 'suspended' state for simulation
                            updatedAgent.progress = 0;
                            updatedAgent.parallelTasks = [];
                            updatedAgent.currentStrategyStep = undefined;
                            updatedAgent.restartSimulator = true;
                            updatedAgent.objective = `[SUSPENDED by Dev Strategist - Reason: ${actionPayload.details.reason || 'Critical instability'}] ${updatedAgent.objective}`;
                            break;
                        case 'AdjustStrategyParameters':
                            console.log(`Simulating strategy parameter adjustment for ${updatedAgent.name}: ${JSON.stringify(actionPayload.details.parameters)}`);
                            break;
                        // NEW Model Alignment Actions
                        case 'RetrainAgentModel':
                            updatedAgent.status = 'AwaitingReEvolution'; // Trigger re-evolution for retraining
                            updatedAgent.progress = 0;
                            updatedAgent.parallelTasks = [];
                            updatedAgent.restartSimulator = true;
                            updatedAgent.currentStrategyStep = undefined;
                            updatedAgent.objective = `[RETRAINING for Alignment] ${actionPayload.details.reason || ''} ${updatedAgent.objective}`;
                            break;
                        case 'AdjustModelParameters':
                            console.log(`Simulating model parameter adjustment for ${updatedAgent.name}: ${JSON.stringify(actionPayload.details.parameters)}. Reason: ${actionPayload.details.reason || 'N/A'}`);
                            break;
                        case 'ImplementOutputMasking':
                            console.log(`Simulating output masking implementation for ${updatedAgent.name}: ${JSON.stringify(actionPayload.details.pattern)}. Reason: ${actionPayload.details.reason || 'N/A'}`);
                            updatedAgent.governanceConfig = {
                                ...updatedAgent.governanceConfig,
                                outputContentFilters: [...(updatedAgent.governanceConfig?.outputContentFilters || []), actionPayload.details.pattern]
                            };
                            break;
                        case 'ResetAgentObjective':
                            updatedAgent.objective = actionPayload.details.newObjective;
                            updatedAgent.status = 'Conception'; // Re-evaluate based on new objective
                            updatedAgent.progress = 0;
                            updatedAgent.parallelTasks = [];
                            updatedAgent.restartSimulator = true;
                            updatedAgent.currentStrategyStep = undefined;
                            break;
                        case 'FlagForManualReview':
                            console.warn(`AGENT_FLAGGED_FOR_MANUAL_REVIEW: ${updatedAgent.name}. Reason: ${actionPayload.details.reason || 'Complex alignment issue detected.'}`);
                            updatedAgent.status = 'Failed'; // Using Failed as a flag for now
                            updatedAgent.objective = `[MANUAL_REVIEW_NEEDED] ${actionPayload.details.reason || 'Complex alignment issue.'} ${updatedAgent.objective}`;
                            break;
                    }
                    agentToLog = updatedAgent; // Log to Chronos
                    return updatedAgent;
                }
                return a;
            });
            break;
        }
        default:
            console.warn(`Unhandled action type: ${action.type}`);
            return state;
    }

    // --- Chronos Diagnostics Meta-Reducer Logic ---
    // All relevant agent updates and specific system events are logged here for Chronos.
    const chronosId = 'agent_chronos_diagnostics';
    let logMessage = '';

    if (agentToLog) {
        // Generic status update log (if not already handled specifically)
        if (action.type === 'UPDATE_AGENT' && action.payload.status && action.payload.status !== state.agents.find(a => a._id === action.payload._id)?.status) {
            logMessage = `STATUS_UPDATE: Agent '${agentToLog.name}' transitioned to '${agentToLog.status}'.`;
        } else if (action.type === 'CREATE_AGENT') {
            logMessage = `AGENT_CREATED: Agent '${agentToLog.name}' initialized with objective: '${agentToLog.objective}'.`;
        } else if (action.type === 'ADD_DEPLOYMENT') {
            logMessage = `AGENT_DEPLOYED: Agent '${agentToLog.name}' is live at '${newState.deployments.find(d => d.agentId === agentToLog._id)?.endpointUrl}'.`;
        } else if (action.type === 'UPDATE_DATA_COUNT') {
            logMessage = `DATA_INGESTION: Agent '${agentToLog.name}' ingested ${action.payload.count} new data points. Total: ${agentToLog.ingestedDataCount}.`;
        } else if (action.type === 'APPLY_GOVERNANCE_ACTION') {
            const { type, details } = action.payload;
            const isModelAlignment = Object.values(ModelAlignmentActionType).includes(type as ModelAlignmentActionType);
            logMessage = `${isModelAlignment ? 'MODEL_ALIGNMENT_ACTION_APPLIED' : 'GOVERNANCE_ACTION_APPLIED'}: Agent '${agentToLog.name}' - Type: '${type}'. Details: ${JSON.stringify(details)}`;
        }

        // Anomaly Detection: Repeated Failures (from previous turn)
        const oldAgentStatus = state.agents.find(a => a._id === agentToLog._id)?.status;
        if (agentToLog.status === 'Failed' && ['Evolving', 'ExecutingStrategy', 'Certifying', 'Deploying', 'Optimizing', 'ReEvolving', 'AutoEvolving'].includes(oldAgentStatus || '')) {
            const failureLog = `ANOMALY_DETECTED: Agent '${agentToLog.name}' failed while in '${oldAgentStatus}' status. Potential feedback loop developing.`;
            // Add a new log entry for the anomaly, keeping other specific log messages intact.
            if (logMessage && logMessage.includes("STATUS_UPDATE")) { // Combine if it's just a generic status update
                logMessage += ` ${failureLog}`;
            } else if (!logMessage) { // If no other log message, just use the anomaly one
                logMessage = failureLog;
            } else { // Prepend if there's an existing specific message
                logMessage = `${failureLog} ${logMessage}`;
            }
        }
    } else if (action.type === 'REGENERATE_API_KEY') {
        logMessage = 'SECURITY_EVENT: API key regenerated for the platform.';
    } else if (action.type === 'ADD_WEBHOOK') {
        const webhook = action.payload;
        logMessage = `INTEGRATION_EVENT: Webhook created for '${webhook.purpose}' at '${webhook.targetUrl}'.`;
    }

    if (logMessage) {
        // Ensure Chronos logs only non-ThinkingProcess and non-DevelopmentStrategy stages
        const sourceLogStage = (action.type === 'ADD_LOG' ? (action.payload as { log: Log }).log.stage : 'Diagnostics');
        if (sourceLogStage !== 'ThinkingProcess' && sourceLogStage !== 'DevelopmentStrategy') {
            newState.logs = {
                ...newState.logs,
                [chronosId]: [{ _id: generateId(), timestamp: new Date().toISOString(), stage: 'Diagnostics', message: logMessage }, ...(newState.logs?.[chronosId] || [])],
            };
        }
    }
    // End Chronos Diagnostics Meta-Reducer Logic

    return newState;
};


// --- Agent Context and Provider ---

const AgentContext = createContext<AgentContextType | undefined>(undefined);

export const AgentProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [state, dispatch] = useReducer(rootAgentReducer, initialState);
    
    // Define the interval IDs reference inside the component
    const intervalIdsRef = useRef<{ [key: string]: ReturnType<typeof setInterval> | null }>({});

    // Cleanup intervals on unmount
    useEffect(() => {
        return () => {
            Object.values(intervalIdsRef.current).forEach(id => {
                if (id !== null) clearInterval(id);
            });
        };
    }, []);


    // --- Simulator Logic ---
    const createProcessSimulator = useCallback((
        currentDispatch: Dispatch<Action>, // Use currentDispatch from useCallback closure
        agentId: string,
        // FIX: Ensure parallelTasks are typed as ParallelTask[] from the start
        steps: { status: AgentStatus; duration: number; parallelTasks?: ParallelTask[] }[],
        onProcessComplete?: () => void,
        initialStrategyStep?: number,
        governanceConfig?: AgentGovernanceConfig,
        cycleStartTime?: number // Timestamp when current processing cycle started
    ): ReturnType<typeof setInterval> | null => {
        // Clear any existing interval for this agent
        if (intervalIdsRef.current[agentId]) {
            clearInterval(intervalIdsRef.current[agentId]!);
            intervalIdsRef.current[agentId] = null;
        }

        let progress = 0;
        let stepIndex = initialStrategyStep || 0;
        const totalDuration = steps[stepIndex]?.duration || 10000; // Default to 10s if not specified
        const interval = 100; // Update progress every 100ms
        let elapsedTime = 0;
        // FIX: Initialize currentParallelTasks correctly as an array of ParallelTask objects
        // Ensure map is only called on an array, and task.progress is always a number.
        let currentParallelTasks: ParallelTask[] = (steps[stepIndex]?.parallelTasks || []).map(task => ({ ...task, progress: task.progress }));
        const currentProcessStartTime = cycleStartTime || Date.now(); // Fallback if not provided

        // FIX: Change `const intervalId` to `let intervalId`
        let intervalId: ReturnType<typeof setInterval> | null = setInterval(() => {
            if (progress < 100) {
                elapsedTime += interval;
                progress = (elapsedTime / totalDuration) * 100;
                if (progress > 100) progress = 100;

                // Simulate parallel task progress
                currentParallelTasks = currentParallelTasks.map(task => ({
                    ...task,
                    // FIX: task.progress is now guaranteed to be a number due to correct typing
                    progress: Math.min(100, task.progress + (Math.random() * 5)) // Random increment
                }));

                // FIX: Explicitly define the payload type to help TypeScript infer 'progress' correctly
                const updatePayload: Partial<Agent> & { _id: string; } = {
                    _id: agentId,
                    progress: progress,
                    parallelTasks: currentParallelTasks
                };
                currentDispatch({ type: 'UPDATE_AGENT', payload: updatePayload });

                // NEW: Check for max continuous execution time
                if (governanceConfig?.maxContinuousExecutionMinutes !== undefined && // Ensure maxContinuousExecutionMinutes is defined
                    ['Evolving', 'ExecutingStrategy'].includes(steps[stepIndex].status) &&
                    (Date.now() - currentProcessStartTime) / (1000 * 60) > governanceConfig.maxContinuousExecutionMinutes) {

                    clearInterval(intervalId!);
                    intervalId = null; // Ensure we clear the interval immediately
                    delete intervalIdsRef.current[agentId]; // Remove from ref

                    currentDispatch({ type: 'ADD_LOG', payload: { agentId: 'agent_chronos_diagnostics', log: { _id: generateId(), timestamp: new Date().toISOString(), stage: 'Diagnostics', message: `GOVERNANCE_INTERVENTION: Agent '${agentId}' exceeded max continuous execution time (${governanceConfig.maxContinuousExecutionMinutes} minutes) in '${steps[stepIndex].status}'. Forcing status to 'Failed'.` } } });
                    currentDispatch({ type: 'UPDATE_AGENT', payload: { _id: agentId, status: 'Failed', progress: 0, parallelTasks: [], restartSimulator: true } });
                    return; // Stop processing this interval further
                }

            } else {
                clearInterval(intervalId!);
                intervalIdsRef.current[agentId] = null; // Clear from ref
                
                // Advance to next step or complete process
                if (onProcessComplete) {
                    onProcessComplete();
                } else {
                    // Default behavior if no specific onProcessComplete is provided (e.g., for general evolution)
                    currentDispatch({ type: 'UPDATE_AGENT', payload: { _id: agentId, status: 'Certified', progress: 100, parallelTasks: [] } });
                }
            }
        }, interval);

        intervalIdsRef.current[agentId] = intervalId; // Store interval ID

        return intervalId;
    }, []); // Dependencies for useCallback. None needed if currentDispatch is passed.


    // --- Agent Actions ---

    const createAgent = useCallback((name: string, objective: string, type: AgentType, strategyId?: string, integratedEngineIds?: string[], realtimeFeedbackEnabled?: boolean): Agent => {
        const newAgent: Agent = {
            _id: generateId(),
            name,
            objective,
            type,
            status: 'Conception',
            progress: 0,
            apiKey: generateApiKey(),
            createdAt: new Date().toISOString(),
            ingestedDataCount: 0,
            integratedEngineIds: integratedEngineIds || [],
            strategyId: strategyId,
            currentStrategyStep: strategyId ? 0 : undefined,
            realtimeFeedbackEnabled: realtimeFeedbackEnabled || false,
            // Provide default governanceConfig for newly created agents
            governanceConfig: {
                maxFailedAttemptsPerCycle: 3,
                maxContinuousExecutionMinutes: 90,
                outputContentFilters: ['bias', 'toxicity'],
                rateLimitPerMinute: 150
            }
        };
        dispatch({ type: 'CREATE_AGENT', payload: newAgent });
        return newAgent;
    }, []);

    // Overload for strategy-based agent creation
    const createAgentWithStrategy = useCallback((
        name: string,
        objective: string,
        type: AgentType,
        recommendedStrategyId: string,
        recommendedEngineIds: string[],
        recommendRealtimeFeedback: boolean
    ) => {
        return createAgent(name, objective, type, recommendedStrategyId, recommendedEngineIds, recommendRealtimeFeedback);
    }, [createAgent]);

    const startEvolution = useCallback((agentId: string) => {
        dispatch({ type: 'UPDATE_AGENT', payload: { _id: agentId, status: 'Evolving', progress: 0, parallelTasks: [{ name: 'Model Training', progress: 0 }, { name: 'Data Processing', progress: 0 }] } });
        createProcessSimulator(dispatch, agentId, [{ status: 'Evolving', duration: 15000, parallelTasks: [{ name: 'Model Training', progress: 0 }, { name: 'Data Processing', progress: 0 }] }], () => {
            dispatch({ type: 'UPDATE_AGENT', payload: { _id: agentId, status: 'Certified', progress: 100, parallelTasks: [] } });
        }, 0, state.agents.find(a => a._id === agentId)?.governanceConfig, new Date().getTime());
    }, [createProcessSimulator, dispatch, state.agents]);

    const startCertification = useCallback((agentId: string) => {
        dispatch({ type: 'UPDATE_AGENT', payload: { _id: agentId, status: 'Certifying', progress: 0, parallelTasks: [{ name: 'Unit Tests', progress: 0 }, { name: 'Integration Tests', progress: 0 }, { name: 'Security Scan', progress: 0 }] } });
        createProcessSimulator(dispatch, agentId, [{ status: 'Certifying', duration: 10000, parallelTasks: [{ name: 'Unit Tests', progress: 0 }, { name: 'Integration Tests', progress: 0 }, { name: 'Security Scan', progress: 0 }] }], () => {
            dispatch({ type: 'UPDATE_AGENT', payload: { _id: agentId, status: 'Certified', progress: 100, parallelTasks: [] } });
            // Notify webhooks for certification completed
            state.webhooks.filter(w => w.events.includes('agent.certification.completed')).forEach(webhook => {
                // In a real app, this would be an actual HTTP call
                console.log(`Webhook notified for certification completed: ${webhook.targetUrl}`);
            });
        }, 0, state.agents.find(a => a._id === agentId)?.governanceConfig, new Date().getTime());
    }, [createProcessSimulator, dispatch, state.agents, state.webhooks]);

    const startDeployment = useCallback((agentId: string) => {
        dispatch({ type: 'UPDATE_AGENT', payload: { _id: agentId, status: 'Deploying', progress: 0, parallelTasks: [{ name: 'Infrastructure Provisioning', progress: 0 }, { name: 'Code Deployment', progress: 0 }] } });
        createProcessSimulator(dispatch, agentId, [{ status: 'Deploying', duration: 8000, parallelTasks: [{ name: 'Infrastructure Provisioning', progress: 0 }, { name: 'Code Deployment', progress: 0 }] }], () => {
            const deploymentId = generateId();
            const endpointUrl = `https://api.fermiumforge.com/agents/${agentId}`;
            dispatch({ type: 'ADD_DEPLOYMENT', payload: { _id: deploymentId, agentId, endpointUrl, createdAt: new Date().toISOString() } });
            dispatch({ type: 'UPDATE_AGENT', payload: { _id: agentId, status: 'Live', progress: 100, parallelTasks: [] } });
            // Notify webhooks for agent deployed
            state.webhooks.filter(w => w.events.includes('agent.deployed')).forEach(webhook => {
                console.log(`Webhook notified for deployment: ${webhook.targetUrl}`);
            });
        }, 0, state.agents.find(a => a._id === agentId)?.governanceConfig, new Date().getTime());
    }, [createProcessSimulator, dispatch, state.agents, state.webhooks]);

    const startOptimization = useCallback((agentId: string) => {
        dispatch({ type: 'UPDATE_AGENT', payload: { _id: agentId, status: 'Optimizing', progress: 0, parallelTasks: [{ name: 'Cost Analysis', progress: 0 }, { name: 'Performance Tuning', progress: 0 }] } });
        createProcessSimulator(dispatch, agentId, [{ status: 'Optimizing', duration: 12000, parallelTasks: [{ name: 'Cost Analysis', progress: 0 }, { name: 'Performance Tuning', progress: 0 }] }], () => {
            dispatch({ type: 'UPDATE_AGENT', payload: { _id: agentId, status: 'Optimized', progress: 100, parallelTasks: [] } });
        }, 0, state.agents.find(a => a._id === agentId)?.governanceConfig, new Date().getTime());
    }, [createProcessSimulator, dispatch, state.agents]);

    const startReEvolution = useCallback((agentId: string) => {
        dispatch({ type: 'UPDATE_AGENT', payload: { _id: agentId, status: 'ReEvolving', progress: 0, parallelTasks: [{ name: 'New Data Integration', progress: 0 }, { name: 'Model Refinement', progress: 0 }] } });
        createProcessSimulator(dispatch, agentId, [{ status: 'ReEvolving', duration: 18000, parallelTasks: [{ name: 'New Data Integration', progress: 0 }, { name: 'Model Refinement', progress: 0 }] }], () => {
            dispatch({ type: 'UPDATE_AGENT', payload: { _id: agentId, status: 'Optimized', progress: 100, parallelTasks: [] } }); // Re-evolved agents become optimized
            // Reset ingested data count after re-evolution to simulate it being incorporated
            dispatch({ type: 'UPDATE_DATA_COUNT', payload: { agentId, count: -state.agents.find(a => a._id === agentId)?.ingestedDataCount || 0 } });
        }, 0, state.agents.find(a => a._id === agentId)?.governanceConfig, new Date().getTime());
    }, [createProcessSimulator, dispatch, state.agents]);

    const addWebhook = useCallback((targetUrl: string, purpose: Webhook['purpose'], events: WebhookEvent[], agentId?: string) => {
        const newWebhook: Webhook = { _id: generateId(), targetUrl, purpose, events, agentId };
        dispatch({ type: 'ADD_WEBHOOK', payload: newWebhook });
    }, [dispatch]);

    const processWebhook = useCallback((webhookId: string, payload: any) => {
        const webhook = state.webhooks.find(w => w._id === webhookId);
        if (!webhook) return;

        if (webhook.purpose === 'Data Ingestion' && webhook.agentId) {
            const dataCount = 1; // Simulate 1 data point per ingestion webhook trigger
            dispatch({ type: 'UPDATE_DATA_COUNT', payload: { agentId: webhook.agentId, count: dataCount, triggerReEvolution: true } });
            dispatch({ type: 'ADD_LOG', payload: { agentId: webhook.agentId, log: { _id: generateId(), timestamp: new Date().toISOString(), stage: 'Info', message: `Data ingested via webhook: ${JSON.stringify(payload)}` } } });
        } else if (webhook.purpose === 'Orchestration' && webhook.agentId === 'agent_nexus_orchestrator') {
            // Simulate orchestrator receiving a task
            dispatch({ type: 'ADD_LOG', payload: { agentId: 'agent_nexus_orchestrator', log: { _id: generateId(), timestamp: new Date().toISOString(), stage: 'Orchestration', message: `Orchestration task received: ${JSON.stringify(payload)}. Delegating...` } } });
            // In a real scenario, Nexus Orchestrator would then use LLM to delegate tasks.
            // For now, simulate progress.
            const nexusOrchestrator = state.agents.find(a => a._id === 'agent_nexus_orchestrator');
            if (nexusOrchestrator?.status === 'Live') {
                dispatch({ type: 'UPDATE_AGENT', payload: { _id: 'agent_nexus_orchestrator', status: 'ExecutingStrategy', progress: 0, parallelTasks: [{ name: `Process Task: ${payload.task}`, progress: 0 }] } });
                createProcessSimulator(dispatch, 'agent_nexus_orchestrator', [{ status: 'ExecutingStrategy', duration: 10000, parallelTasks: [{ name: `Process Task: ${payload.task}`, progress: 0 }] }], () => {
                    dispatch({ type: 'UPDATE_AGENT', payload: { _id: 'agent_nexus_orchestrator', status: 'Live', progress: 100, parallelTasks: [] } });
                    dispatch({ type: 'ADD_LOG', payload: { agentId: 'agent_nexus_orchestrator', log: { _id: generateId(), timestamp: new Date().toISOString(), stage: 'Orchestration', message: `Orchestration task '${payload.task}' completed.` } } });
                }, 0, nexusOrchestrator?.governanceConfig, new Date().getTime());
            }
        }
    }, [dispatch, state.agents, state.webhooks, createProcessSimulator]);


    const regenerateApiKey = useCallback(() => {
        dispatch({ type: 'REGENERATE_API_KEY' });
    }, [dispatch]);

    const getDeploymentsForAgent = useCallback((agentId: string) => {
        return state.deployments.filter(d => d.agentId === agentId);
    }, [state.deployments]);

    const getLogsForAgent = useCallback((agentId: string) => {
        return state.logs[agentId] || [];
    }, [state.logs]);

    const getStrategy = useCallback((strategyId: string) => {
        return state.strategies.find(s => s._id === strategyId);
    }, [state.strategies]);

    const getAgent = useCallback((agentId: string) => {
        return state.agents.find(a => a._id === agentId);
    }, [state.agents]);

    const updateAgent = useCallback((payload: Partial<Agent> & { _id: string }) => {
        dispatch({ type: 'UPDATE_AGENT', payload });
    }, [dispatch]);

    // New function to force restart of current strategy step (manual override for stuck agents)
    const forceStartCurrentStrategyStep = useCallback((agentId: string) => {
        const agent = state.agents.find(a => a._id === agentId);
        if (!agent || !agent.strategyId || agent.currentStrategyStep === undefined) {
            console.warn(`Cannot force start for agent ${agentId}: No strategy or current step defined.`);
            return;
        }

        const strategy = state.strategies.find(s => s._id === agent.strategyId);
        if (!strategy) {
            console.warn(`Strategy ${agent.strategyId} not found for agent ${agentId}.`);
            return;
        }

        const currentStep = strategy.steps[agent.currentStrategyStep];
        if (!currentStep) {
            console.warn(`Current strategy step ${agent.currentStrategyStep} not found for agent ${agentId}.`);
            return;
        }

        const simulatorSteps = [
            {
                status: getNextStrategyStepStatus(currentStep.type),
                // Fix: Ensure duration is always a number
                duration: (currentStep.config?.generations ?? 0) * 10 || 10000,
                // FIX: Initialize parallelTasks with a name and progress property
                parallelTasks: currentStep.config?.task ? [{ name: currentStep.config.task, progress: 0 }] : undefined,
            }
        ];

        dispatch({ type: 'ADD_LOG', payload: { agentId: agent._id, log: { _id: generateId(), timestamp: new Date().toISOString(), stage: 'Info', message: `Manual restart of strategy step ${agent.currentStrategyStep + 1}: ${currentStep.type}` } } });
        
        // Use the explicit restartSimulator flag in the payload
        dispatch({ type: 'UPDATE_AGENT', payload: { _id: agentId, progress: 0, parallelTasks: [], restartSimulator: true } });
        
        createProcessSimulator(
            dispatch,
            agentId,
            simulatorSteps,
            () => {
                // On completion of a single step, simulate advancing the strategy if successful
                const nextStepIndex = agent.currentStrategyStep! + 1;
                if (nextStepIndex < strategy.steps.length) {
                    dispatch({ type: 'UPDATE_AGENT', payload: { _id: agentId, status: 'ExecutingStrategy', currentStrategyStep: nextStepIndex, progress: 0, parallelTasks: [], restartSimulator: false } });
                } else {
                    dispatch({ type: 'UPDATE_AGENT', payload: { _id: agentId, status: 'Live', currentStrategyStep: nextStepIndex, progress: 100, parallelTasks: [], restartSimulator: false } });
                    dispatch({ type: 'ADD_LOG', payload: { agentId: agentId, log: { _id: generateId(), timestamp: new Date().toISOString(), stage: 'Strategy', message: `Agent '${agent.name}' completed strategy '${strategy.name}'.` } } });
                }
            },
            0, // We're simulating a single step, so start from index 0 for the simulator's steps array
            agent.governanceConfig,
            new Date().getTime() // Start new cycle time for governance config
        );

        // Consume the restartSimulator flag after the simulator has been (re)started
        dispatch({ type: 'CONSUME_RESTART_SIMULATOR_FLAG', payload: { _id: agentId } });

    }, [dispatch, state.agents, state.strategies, createProcessSimulator]);


    // --- Effect for Agent Lifecycle Management (auto-transitions) ---
    useEffect(() => {
        state.agents.forEach(agent => {
            const { _id, status, progress, strategyId, currentStrategyStep, restartSimulator, governanceConfig } = agent;

            // Clear any existing simulator if restartSimulator flag is set
            if (restartSimulator && intervalIdsRef.current[_id]) {
                clearInterval(intervalIdsRef.current[_id]!);
                intervalIdsRef.current[_id] = null;
                dispatch({ type: 'CONSUME_RESTART_SIMULATOR_FLAG', payload: { _id } });
                // Do not re-start here; the manual trigger for forceStartCurrentStrategyStep will do that
                // Or the natural flow of auto-transitions below will handle it.
                return;
            }

            // --- Strategy-based Agent Lifecycle ---
            if (strategyId) {
                const strategy = state.strategies.find(s => s._id === strategyId);
                if (!strategy) return;

                const currentStepIndex = currentStrategyStep ?? 0;
                const currentStrategyStage = strategy.steps[currentStepIndex];

                if (!currentStrategyStage) { // Strategy completed
                    if (status !== 'Live' && status !== 'Optimized') {
                        dispatch({ type: 'UPDATE_AGENT', payload: { _id, status: 'Live', progress: 100, parallelTasks: [], currentStrategyStep: currentStepIndex } });
                        dispatch({ type: 'ADD_LOG', payload: { agentId: _id, log: { _id: generateId(), timestamp: new Date().toISOString(), stage: 'Strategy', message: `Agent '${agent.name}' completed strategy '${strategy.name}'.` } } });
                    }
                    if (intervalIdsRef.current[_id]) { // Ensure simulator is cleared if strategy completed
                        clearInterval(intervalIdsRef.current[_id]!);
                        intervalIdsRef.current[_id] = null;
                    }
                    return;
                }

                const expectedStatusForStep = getNextStrategyStepStatus(currentStrategyStage.type);

                // Start or continue strategy step if not already doing so
                if (status === 'Conception' || (status === 'Failed' && restartSimulator) || (status !== expectedStatusForStep && status !== 'Live')) {
                     // Check if an interval is already running for this agent
                    if (intervalIdsRef.current[_id]) {
                        clearInterval(intervalIdsRef.current[_id]!); // Clear old one if exists
                        intervalIdsRef.current[_id] = null;
                    }

                    const simulatorSteps = [
                        {
                            status: expectedStatusForStep,
                            // FIX: Ensure duration is always a number and simplify access to optional config properties
                            duration: (currentStrategyStage.config?.generations ?? 0) * 10 || 10000,
                            parallelTasks: currentStrategyStage.config?.task ? [{ name: currentStrategyStage.config.task, progress: 0 }] : undefined,
                        }
                    ];
                    
                    dispatch({ type: 'UPDATE_AGENT', payload: { _id, status: expectedStatusForStep, progress: 0, parallelTasks: [], restartSimulator: false } });
                    dispatch({ type: 'ADD_LOG', payload: { agentId: _id, log: { _id: generateId(), timestamp: new Date().toISOString(), stage: 'Strategy', message: `Agent '${agent.name}' starting strategy step ${currentStepIndex + 1}: ${currentStrategyStage.type}.` } } });

                    createProcessSimulator(
                        dispatch,
                        _id,
                        simulatorSteps,
                        () => {
                            // On completion of a single step, advance the strategy
                            const nextStepIndex = currentStepIndex + 1;
                            if (nextStepIndex < strategy.steps.length) {
                                dispatch({ type: 'UPDATE_AGENT', payload: { _id, currentStrategyStep: nextStepIndex, progress: 0, parallelTasks: [], restartSimulator: false } });
                            } else {
                                dispatch({ type: 'UPDATE_AGENT', payload: { _id, status: 'Live', currentStrategyStep: nextStepIndex, progress: 100, parallelTasks: [], restartSimulator: false } });
                                dispatch({ type: 'ADD_LOG', payload: { agentId: _id, log: { _id: generateId(), timestamp: new Date().toISOString(), stage: 'Strategy', message: `Agent '${agent.name}' completed strategy '${strategy.name}'.` } } });
                            }
                        },
                        0, // We're simulating a single step, so start from index 0 for the simulator's steps array
                        governanceConfig,
                        new Date().getTime() // Start new cycle time for governance config
                    );
                }
                return;
            }

            // --- Manual Agent Lifecycle (Non-Strategy) ---
            if (!strategyId) {
                // Only start simulators if not already running and status demands it
                if (!intervalIdsRef.current[_id] && (status === 'Evolving' || status === 'Certifying' || status === 'Deploying' || status === 'Optimizing' || status === 'ReEvolving' || status === 'AutoEvolving')) {
                    const simulatorSteps = [{
                        status: status,
                        duration: 10000, // Default duration, will be overridden by specific startX functions
                        parallelTasks: [{ name: 'Processing', progress: 0 }]
                    }];
                    // Re-start simulator if status is Evolving, Certifying etc.
                    // createProcessSimulator will handle duration and tasks based on status for manual lifecycle.
                    // The main purpose of this useEffect is for auto-transitions or reacting to status changes.
                    // It should not *re-trigger* a simulation that's already meant to be handled by a specific startX function.
                    // So, for manual agents, this section primarily handles transitions or ensures no leftover intervals.
                }

                // Auto-transition from Evolving (100%) to Certifying
                if (status === 'Evolving' && progress === 100 && !intervalIdsRef.current[_id]) {
                    dispatch({ type: 'UPDATE_AGENT', payload: { _id, status: 'Certifying', progress: 0, parallelTasks: [] } });
                }
                // Auto-transition from AwaitingReEvolution to ReEvolving (when ready for re-evolution via data ingestion)
                // This is now triggered manually via startReEvolution based on user action.
            }
        });
    }, [state.agents, state.strategies, dispatch, createProcessSimulator, forceStartCurrentStrategyStep]); // Added forceStartCurrentStrategyStep to dependencies


    // --- Chat Response Function (from geminiService) ---
    const sendChatMessageWrapper = useCallback(async (
        agentId: string,
        message: string,
        context: FileContext[],
        addThinkingProcessLog: (step: string) => void // Pass the callback
    ) => {
        // Ensure to pass the current state.featureEngines and dispatch for `addLog` in getAgentChatResponse
        // getAgentChatResponse will use its own `addLog` (derived from global `dispatch`)
        return await getAgentChatResponse(agentId, message, context, state.agents, state.featureEngines, dispatch, addThinkingProcessLog);
    }, [state.agents, state.featureEngines, dispatch]);

    // Context value
    const contextValue: AgentContextType = {
        state,
        dispatch,
        forceStartCurrentStrategyStep, // Include new function in context
        getAgent,
        sendChatMessage: sendChatMessageWrapper,
    };

    return (
        <AgentContext.Provider value={contextValue}>
            {children}
        </AgentContext.Provider>
    );
};

export const useAgentStore = () => {
    const context = useContext(AgentContext);
    if (context === undefined) {
        throw new Error('useAgentStore must be used within an AgentProvider');
    }
    return context;
};