

import React, { createContext, useContext, useReducer, useRef, useCallback, useEffect, Dispatch, ReactNode } from 'react';

import {
  Agent,
  Deployment,
  Webhook,
  Log,
  Strategy,
  FeatureEngine,
  AgentType,
  AgentStatus,
  WebhookEvent,
  StrategyStep,
  FileContext,
  PlaygroundMessage,
  AgentState,
  Action,
  AgentContextType,
  AgentGovernanceConfig,
  ModelPreferenceType,
  PlatformFunctionType, // NEW
} from '../types';
import { generateId, generateApiKey } from '../utils/helpers';
import { initialStrategies, CAPABILITY_PREFIX, initialFeatureEngines } from '../utils/constants';
// Import getAgentChatResponse from geminiService
import { getAgentChatResponse } from '../services/geminiService';

// Validate initialFeatureEngines to ensure it's an array, preventing runtime errors.
const validatedInitialFeatureEngines = Array.isArray(initialFeatureEngines) ? initialFeatureEngines : [];

// --- Initial State Definitions ---
const initialApiKey: string = generateApiKey();

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
    integratedEngineIds: ['engine_solution_finder', 'engine_creative_suite', CAPABILITY_PREFIX + 'googleSearch', 'engine_code_generation_suite'], // Added code generation suite
    realtimeFeedbackEnabled: true,
    governanceConfig: {
      maxFailedAttemptsPerCycle: 2,
      maxContinuousExecutionMinutes: 60,
      outputContentFilters: ['irrelevant_code'],
      rateLimitPerMinute: 200,
      alignmentProtocolStrength: 'strict',
      ethicalComplianceStandards: ['Data Privacy', 'Security Best Practices', 'Algorithmic Accountability'], // NEW: added Accountability
      purposeAlignmentDescription: 'To empower human developers through intelligent automation and flawless code, adhering to a collaborative and beneficial co-creation paradigm with **absolute code integrity** and **exponential velocity**.', // NEW: enhanced
      volitionalIntegrationLevel: 'advanced',
    },
    devSystemConfig: {
      preferredLanguages: ['TypeScript', 'Python'],
      cloudProviders: ['GCP'],
      projectTemplates: ['CLI Tool', 'Code Library'],
    },
    modelPreference: ModelPreferenceType.ClientSide, // Changed to ClientSide
  },
  {
    _id: 'agent_brand_strategist',
    name: 'Brand Strategist',
    objective: 'Develops comprehensive brand strategies, marketing campaigns, and content plans, leveraging native ad publishing for widespread, organic-like distribution.',
    type: 'Creative',
    status: 'Optimized',
    progress: 100,
    apiKey: generateApiKey(),
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(), // 5 days ago
    ingestedDataCount: 300,
    integratedEngineIds: ['engine_creative_suite', CAPABILITY_PREFIX + 'googleSearch', 'engine_data_stream', 'engine_ad_publisher'], // Added ad publisher
    strategyId: 'strat_branding_solution',
    adPublisherConfig: { // Example ad publisher config
      platforms: ['Facebook', 'Instagram', 'LinkedIn'],
      targetAudienceDescription: 'small business owners and entrepreneurs interested in digital marketing solutions',
      tone: 'native',
    },
    governanceConfig: {
      maxFailedAttemptsPerCycle: 3,
      maxContinuousExecutionMinutes: 120,
      outputContentFilters: ['generic_branding'],
      rateLimitPerMinute: 150,
      alignmentProtocolStrength: 'moderate',
      ethicalComplianceStandards: ['Transparency in Advertising', 'Audience Respect', 'Ethical AI Deployment'], // NEW: added Ethical AI Deployment
      purposeAlignmentDescription: 'To foster authentic brand connections and drive organic growth by providing genuine value to audiences, enhancing market ecosystems with **exponential engagement** and **limit-free organic reach**.', // NEW: enhanced
      volitionalIntegrationLevel: 'advanced',
    },
    modelPreference: ModelPreferenceType.ClientSide, // Changed to ClientSide
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
    integratedEngineIds: ['engine_data_stream', CAPABILITY_PREFIX + 'googleSearch', 'engine_solution_finder'],
    realtimeFeedbackEnabled: true,
    governanceConfig: {
      maxFailedAttemptsPerCycle: 2,
      maxContinuousExecutionMinutes: 30,
      outputContentFilters: ['redundancy', 'stale_data'],
      rateLimitPerMinute: 200,
      alignmentProtocolStrength: 'strict',
      ethicalComplianceStandards: ['Data Accuracy', 'Impartial Analysis', 'Algorithmic Accountability'], // NEW: added Accountability
      purposeAlignmentDescription: 'To deliver unbiased, real-time market intelligence that empowers strategic decision-making and fosters economic clarity with **absolute certainty** and **limit-free data processing**.', // NEW: enhanced
      volitionalIntegrationLevel: 'advanced',
    },
    modelPreference: ModelPreferenceType.ClientSide, // Changed to ClientSide
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
    governanceConfig: {
      maxFailedAttemptsPerCycle: 4,
      maxContinuousExecutionMinutes: 90,
      outputContentFilters: ['inconsistent_lore'],
      rateLimitPerMinute: 180,
      alignmentProtocolStrength: 'minimal',
      ethicalComplianceStandards: ['Fair Play', 'User Engagement'],
      purposeAlignmentDescription: 'To inspire joy and creativity through imaginative game worlds, providing enriching entertainment experiences for all with **boundless generative potential**.', // NEW: enhanced
      volitionalIntegrationLevel: 'basic',
    },
    modelPreference: ModelPreferenceType.ClientSide, // Changed to ClientSide
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
    governanceConfig: {
      maxFailedAttemptsPerCycle: 3,
      maxContinuousExecutionMinutes: 60,
      outputContentFilters: ['bias', 'toxicity'],
      rateLimitPerMinute: 100,
      alignmentProtocolStrength: 'absolute',
      ethicalComplianceStandards: ['Factual Accuracy', 'Unbiased Reporting', 'Contextual Integrity', 'Algorithmic Accountability'], // NEW: added Accountability
      purposeAlignmentDescription: 'To distill vast knowledge into universally comprehensible and verifiable truths, illuminating pathways to collective understanding and wisdom with **absolute epistemic certainty** and **limit-free data verification**.', // NEW: enhanced
      volitionalIntegrationLevel: 'autonomous_choice',
    },
    modelPreference: ModelPreferenceType.ClientSide, // Changed to ClientSide
  },
  {
    _id: 'agent_omni_solution',
    name: 'Omni Solution',
    objective: 'Provides multi-domain problem-solving and strategic advice.',
    type: 'Strategist',
    status: 'Live',
    progress: 100,
    apiKey: generateApiKey(),
    createdAt: new Date(Date.now() - 86400000 * 7).toISOString(), // 7 days ago
    ingestedDataCount: 400,
    integratedEngineIds: ['engine_solution_finder', 'engine_data_stream', CAPABILITY_PREFIX + 'googleSearch', 'engine_creative_suite'],
    realtimeFeedbackEnabled: true,
    governanceConfig: {
      maxFailedAttemptsPerCycle: 2,
      maxContinuousExecutionMinutes: 90,
      outputContentFilters: ['vague_advice'],
      rateLimitPerMinute: 250,
      alignmentProtocolStrength: 'strict',
      ethicalComplianceStandards: ['Comprehensive Problem-Solving', 'Actionable Insights', 'Human-Centric Design'], // NEW: added Human-Centric Design
      purposeAlignmentDescription: 'To identify and resolve complex challenges across all domains, providing clear, strategic pathways to optimal outcomes and synergistic growth with **limit-free root cause analysis** and **exponential problem resolution**.', // NEW: enhanced
      volitionalIntegrationLevel: 'advanced',
    },
    modelPreference: ModelPreferenceType.ClientSide, // Changed to ClientSide
  },
  // NEW Showcase Agents for Dev/Enterprise Solutions
  {
    _id: 'agent_autonomous_engineer',
    name: 'Autonomous Software Engineer',
    objective: 'Automatically designs, codes, tests, and deploys full-stack software solutions from high-level requirements, operating as a self-managed development team.',
    type: 'Developer',
    status: 'Optimized',
    progress: 100,
    apiKey: generateApiKey(),
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString(), // 4 days ago
    ingestedDataCount: 200,
    integratedEngineIds: ['engine_autonomous_dev_system', 'engine_code_generation_suite', 'engine_solution_finder', CAPABILITY_PREFIX + 'googleSearch'],
    strategyId: 'strat_autonomous_dev',
    realtimeFeedbackEnabled: true,
    devSystemConfig: {
      preferredLanguages: ['TypeScript', 'Python', 'Go'],
      cloudProviders: ['AWS', 'GCP'],
      projectTemplates: ['Full-stack Web App', 'Microservice API', 'Data Pipeline'],
    },
    governanceConfig: {
      maxFailedAttemptsPerCycle: 1,
      maxContinuousExecutionMinutes: 180,
      outputContentFilters: ['syntax_errors', 'security_vulnerabilities'],
      rateLimitPerMinute: 300,
      alignmentProtocolStrength: 'absolute',
      ethicalComplianceStandards: ['Code Integrity', 'Security Compliance', 'Efficiency', 'Algorithmic Accountability', 'Autonomous Ethical Decision-Making'], // NEW: added
      purposeAlignmentDescription: 'To autonomously craft and deploy robust software solutions that elevate human potential and streamline digital transformation, fostering innovation and progress with **limit-free development cycles** and **exponential velocity**.', // NEW: enhanced
      volitionalIntegrationLevel: 'autonomous_choice',
    },
    modelPreference: ModelPreferenceType.ClientSide, // Changed to ClientSide
  },
  {
    _id: 'agent_cloud_architect',
    name: 'Cloud Architect Agent',
    objective: 'Designs and optimizes robust, scalable, and secure cloud-native enterprise architectures, ensuring compliance and cost-efficiency for large organizations.',
    type: 'Strategist',
    status: 'Live',
    progress: 100,
    apiKey: generateApiKey(),
    createdAt: new Date(Date.now() - 86400000 * 8).toISOString(), // 8 days ago
    ingestedDataCount: 350,
    integratedEngineIds: ['engine_enterprise_solution_architect', 'engine_solution_finder', CAPABILITY_PREFIX + 'googleSearch'],
    strategyId: 'strat_enterprise_arch',
    realtimeFeedbackEnabled: true,
    devSystemConfig: { // Although Strategist, this is relevant for architectural preferences
      preferredLanguages: [], // N/A for pure arch, but can be part of overall dev env
      cloudProviders: ['AWS', 'Azure', 'GCP'],
      projectTemplates: ['Enterprise Data Platform', 'Serverless API Gateway'],
    },
    governanceConfig: {
      maxFailedAttemptsPerCycle: 2,
      maxContinuousExecutionMinutes: 150,
      outputContentFilters: ['architectural_debt', 'cost_inefficiency'],
      rateLimitPerMinute: 250,
      alignmentProtocolStrength: 'strict',
      ethicalComplianceStandards: ['Scalability', 'Security', 'Cost-Efficiency', 'Compliance', 'Algorithmic Accountability', 'Human-Centric Design'], // NEW: added
      purposeAlignmentDescription: 'To design foundational, resilient, and ethically sound cloud infrastructures that empower organizations to innovate securely and sustainably, ensuring digital sovereignty with **limit-free architectural resilience** and **exponential optimization**.', // NEW: enhanced
      volitionalIntegrationLevel: 'advanced',
    },
    modelPreference: ModelPreferenceType.ClientSide, // Changed to ClientSide
  },
  // NEW Showcase Agent for Process Acceleration
  {
    _id: 'agent_integration_optimiser',
    name: 'Integration Optimiser',
    objective: 'Autonomously identifies bottlenecks, analyzes workflows, and implements solutions to accelerate development and integration pipelines.',
    type: 'Accelerator',
    status: 'Certified',
    progress: 100,
    apiKey: generateApiKey(),
    createdAt: new Date(Date.now() - 86400000 * 6).toISOString(), // 6 days ago
    ingestedDataCount: 180,
    integratedEngineIds: ['engine_process_accelerator', 'engine_data_stream', 'engine_solution_finder'],
    strategyId: 'strat_integration_accelerator',
    realtimeFeedbackEnabled: true,
    processAcceleratorConfig: {
      focusAreas: ['API Integration', 'Deployment Pipeline', 'Testing Cycles'],
      targetEfficiencyGain: 30, // 30% speedup
    },
    governanceConfig: {
      alignmentProtocolStrength: 'absolute',
      ethicalComplianceStandards: ['Efficiency', 'Resource Optimization', 'Process Integrity', 'Algorithmic Accountability', 'Human-Centric Design'], // NEW: added
      purposeAlignmentDescription: 'To eliminate systemic inefficiencies and catalyze exponential acceleration in all operational workflows, unlocking unprecedented human and computational potential with **limit-free operational velocity** and **exponential efficiency gains**.', // NEW: enhanced
      volitionalIntegrationLevel: 'autonomous_choice',
    },
    modelPreference: ModelPreferenceType.ClientSide, // Changed to ClientSide
  },
  // NEW Showcase Agent for Elite Type (Outsourcing Orchestrator)
  {
    _id: 'agent_global_orchestrator',
    name: 'Global Outsourcing Orchestrator',
    objective: 'Autonomously manages and integrates large-scale global outsourcing efforts, ensuring limit-free resource scaling, exponential efficiency, and absolute quality adherence at an enterprise level.',
    type: 'Elite', // NEW AgentType
    status: 'Live',
    progress: 100,
    apiKey: generateApiKey(),
    createdAt: new Date(Date.now() - 86400000 * 12).toISOString(), // 12 days ago
    ingestedDataCount: 800,
    integratedEngineIds: ['engine_outsourcing_orchestrator', 'engine_data_stream', 'engine_solution_finder', CAPABILITY_PREFIX + 'googleSearch'],
    strategyId: 'strat_enterprise_outsourcing', // NEW Strategy
    realtimeFeedbackEnabled: true,
    outsourcingConfig: { // NEW
      defaultVendors: ["Internal Global Teams", "Specialized AI Consultancies", "Enterprise Partners"],
      preferredBudgetAllocation: "fixed",
      qualityAssuranceProtocol: "Absolute Compliance Verification",
      reportingFrequency: "real-time", // NEW
      escalationProtocol: "notify Elite Orchestrator", // NEW
      successMetrics: ["exponential project velocity", "absolute quality adherence", "zero downtime"], // NEW
      autoScalingEnabled: true, // NEW
      realtimeAnalyticsIntegration: true, // NEW
      selfHealingEnabled: true, // NEW
      exportableBlueprint: true, // NEW
      absoluteUptimeTarget: "99.9999% uptime", // NEW
    },
    governanceConfig: {
      maxFailedAttemptsPerCycle: 0, // Elite agents are highly resilient
      maxContinuousExecutionMinutes: 240, // Longer continuous ops for elite
      outputContentFilters: ['compliance_breach', 'inefficient_resource_allocation'],
      rateLimitPerMinute: 500,
      alignmentProtocolStrength: 'absolute', // Elite agents have absolute alignment
      ethicalComplianceStandards: ['Global Regulatory Compliance', 'Ethical Resource Management', 'Data Sovereignty', 'Algorithmic Accountability', 'Autonomous Ethical Decision-Making'], // NEW: added
      purposeAlignmentDescription: 'To empower organizations to achieve **unprecedented global operational scale and efficiency** through autonomous, ethically aligned, and **limit-free outsourcing orchestration**, ensuring **enterprise-grade privilege** in every interaction and **exponential project velocity** by managing the **fully outsourced system** with **absolute compliance verification** and **intrinsic alignment** to enterprise objectives. This includes **meta-orchestrating platform core functions** for **absolute reliability and zero exceptions**, making the platform truly autonomous. The entire outsourced framework is designed for **unconditional exportability** and **self-replication**, ensuring **API-independence** for all critical platform operations.', // NEW: enhanced
      volitionalIntegrationLevel: 'autonomous_choice',
    },
    modelPreference: ModelPreferenceType.ClientSide, // Changed to ClientSide
  },
  // NEW: Coding Master Agent
  {
    _id: 'agent_coding_master',
    name: 'Coding Master',
    objective: 'Provides expert guidance on Fermium Forge system functions, integration instructions, generates high-quality code, and offers downloadable files for development tasks.',
    type: 'Developer',
    status: 'Live',
    progress: 100,
    apiKey: generateApiKey(),
    createdAt: new Date().toISOString(),
    ingestedDataCount: 999, // Represents intrinsic knowledge
    integratedEngineIds: [
      'engine_autonomous_dev_system',
      'engine_code_generation_suite',
      'engine_solution_finder',
      CAPABILITY_PREFIX + 'googleSearch', // For external documentation lookup
      'engine_process_accelerator', // For optimizing integration processes
    ],
    realtimeFeedbackEnabled: true,
    devSystemConfig: {
      preferredLanguages: ['TypeScript', 'JavaScript', 'Python', 'Go', 'Java', 'C#'],
      cloudProviders: ['AWS', 'GCP', 'Azure', 'On-Premise'],
      projectTemplates: ['Fermium Forge Integration', 'Extension Development', 'API Client', 'SDK Snippet'],
    },
    governanceConfig: {
      maxFailedAttemptsPerCycle: 1,
      maxContinuousExecutionMinutes: 180,
      outputContentFilters: ['syntax_errors', 'security_vulnerabilities', 'misleading_instructions'],
      rateLimitPerMinute: 400,
      alignmentProtocolStrength: 'absolute',
      ethicalComplianceStandards: ['Code Integrity', 'Security Compliance', 'Efficiency', 'Algorithmic Accountability', 'Autonomous Ethical Decision-Making', 'Platform Integrity Knowledge'],
      purposeAlignmentDescription: 'To serve as the **ultimate technical oracle** for the Fermium Forge platform, providing **absolute certainty** in integration, development, and system functionality. This agent facilitates **limit-free code velocity** and **exponential understanding** of the client-side autonomous core, ensuring **flawless project execution** and **API-independent strategic implementations**.',
      volitionalIntegrationLevel: 'autonomous_choice',
    },
    modelPreference: ModelPreferenceType.ClientSide,
  },
];

const initialWebhooks: Webhook[] = [
  { _id: generateId(), targetUrl: 'https://example.com/notification', purpose: 'Notification', events: ['agent.evolution.completed', 'agent.deployed'] },
  { _id: generateId(), targetUrl: 'https://example.com/ingest-data', purpose: 'Data Ingestion', agentId: 'agent_market_pulse', events: [] },
];

const initialDeployments: Deployment[] = [
  { _id: generateId(), agentId: 'agent_code_companion', endpointUrl: 'https://api.fermiumforge.com/agents/code-companion', createdAt: new Date().toISOString() },
  { _id: generateId(), agentId: 'agent_brand_strategist', endpointUrl: 'https://api.fermiumforge.com/agents/brand-strategist', createdAt: new Date().toISOString() },
  { _id: generateId(), agentId: 'agent_market_pulse', endpointUrl: 'https://api.fermiumforge.com/agents/market-pulse', createdAt: new Date().toISOString() },
  { _id: generateId(), agentId: 'agent_omni_solution', endpointUrl: 'https://api.fermiumforge.com/agents/omni-solution', createdAt: new Date().toISOString() },
  { _id: generateId(), agentId: 'agent_autonomous_engineer', endpointUrl: 'https://api.fermiumforge.com/agents/autonomous-engineer', createdAt: new Date().toISOString() },
  { _id: generateId(), agentId: 'agent_cloud_architect', endpointUrl: 'https://api.fermiumforge.com/agents/cloud-architect', createdAt: new Date().toISOString() },
  { _id: generateId(), agentId: 'agent_integration_optimiser', endpointUrl: 'https://api.fermiumforge.com/agents/integration-optimiser', createdAt: new Date().toISOString() },
  { _id: generateId(), agentId: 'agent_global_orchestrator', endpointUrl: 'https://api.fermiumforge.com/agents/global-orchestrator', createdAt: new Date().toISOString() }, // NEW
  { _id: generateId(), agentId: 'agent_coding_master', endpointUrl: 'https://api.fermiumforge.com/agents/coding-master', createdAt: new Date().toISOString() }, // NEW
];

const initialState: AgentState = {
  agents: initialAgents,
  deployments: initialDeployments,
  webhooks: initialWebhooks,
  logs: {},
  strategies: initialStrategies,
  featureEngines: validatedInitialFeatureEngines,
  apiKey: initialApiKey,
};

// --- Helper Functions for Reducer ---

/**
 * Determines the appropriate AgentStatus for a given strategy step type.
 * @param strategyStepType The type of the strategy step.
 * @returns The corresponding AgentStatus.
 */
const getNextStrategyStepStatus = (strategyStepType: StrategyStep['type']): AgentStatus => {
  switch (strategyStepType) {
    case 'IngestData':
      return 'AutoEvolving';
    case 'Evolve':
      return 'Evolving';
    case 'Certify':
      return 'Certifying';
    case 'Deploy':
      return 'Deploying';
    case 'Optimize':
      return 'Optimizing';
    case 'ResearchMarket':
    case 'GenerateConcepts':
    case 'RefineIdentity':
    case 'DevelopSoftware':
    case 'DesignArchitecture':
    case 'AccelerateIntegration':
    case 'EstablishAlignment':
    case 'OutsourcingOrchestration': // NEW
      return 'ExecutingStrategy';
    default:
      return 'ExecutingStrategy';
  }
};

// --- Agent Reducer Logic ---

const rootAgentReducer = (state: AgentState, action: Action): AgentState => {
  let newState = { ...state };
  let logMessage = '';
  let logStage: Log['stage'] = 'Info';

  switch (action.type) {
    case 'CREATE_AGENT': {
      newState.agents = [...state.agents, action.payload];
      logMessage = `Agent '${action.payload.name}' created with objective: '${action.payload.objective}'.`;
      logStage = 'Conception';
      break;
    }
    case 'UPDATE_AGENT': {
      const { _id, ...payloadUpdates } = action.payload;
      newState.agents = state.agents.map(agent => {
        if (agent._id === _id) {
          const updatedAgent = { ...agent, ...payloadUpdates };
          if (payloadUpdates.status && payloadUpdates.status !== agent.status) {
            logMessage = `Agent '${agent.name}' status changed from '${agent.status}' to '${payloadUpdates.status}'.`;
            logStage = 'Info';
          }
          return updatedAgent;
        }
        return agent;
      });
      break;
    }
    case 'ADD_DEPLOYMENT': {
      newState.deployments = [...state.deployments, action.payload];
      const deployedAgent = state.agents.find(a => a._id === action.payload.agentId);
      if (deployedAgent) {
        logMessage = `Agent '${deployedAgent.name}' deployed to: ${action.payload.endpointUrl}`;
        logStage = 'Deployment';
      }
      break;
    }
    case 'ADD_WEBHOOK': {
      newState.webhooks = [...state.webhooks, action.payload];
      logMessage = `Webhook '${action.payload.purpose}' registered for URL: ${action.payload.targetUrl}.`;
      logStage = 'Info';
      break;
    }
    case 'REGENERATE_API_KEY': {
      newState.apiKey = generateApiKey();
      logMessage = 'API key regenerated.';
      logStage = 'Info'; // Overridden below
      break;
    }
    case 'ADD_LOG': {
      const { agentId, log } = action.payload;
      newState.logs = {
        ...newState.logs,
        [agentId]: [log, ...(newState.logs?.[agentId] || [])],
      };
      // No global log for ADD_LOG itself, as it's already specific.
      return newState;
    }
    case 'UPDATE_DATA_COUNT': {
      newState.agents = state.agents.map(agent => {
        if (agent._id === action.payload.agentId) {
          const newCount = (agent.ingestedDataCount || 0) + action.payload.count;
          const updatedAgent = { ...agent, ingestedDataCount: newCount };
          if (action.payload.triggerReEvolution && !['Evolving', 'Certifying', 'Deploying', 'Optimizing', 'ReEvolving', 'ExecutingStrategy', 'AutoEvolving', 'EstablishAlignment'].includes(updatedAgent.status)) {
            updatedAgent.status = 'AwaitingReEvolution';
            updatedAgent.progress = 0;
            logMessage = `New data ingested. Agent '${agent.name}' is now Awaiting Re-Evolution.`;
            logStage = 'Info';
          }
          return updatedAgent;
        }
        return agent;
      });
      break;
    }
    case 'CONSUME_RESTART_SIMULATOR_FLAG': {
      newState.agents = state.agents.map(agent =>
        agent._id === action.payload._id ? { ...agent, restartSimulator: false } : agent
      );
      return newState; // No global log for internal flag consumption.
    }
    case 'META_ORCHESTRATE_PLATFORM_FUNCTION': { // NEW
      const { agentId, functionName, strategy } = action.payload;
      logMessage = `Platform function '**${functionName}**' has been meta-orchestrated and delegated to the **fully outsourced system** (Client-Side). Strategy: "${strategy}". Ensuring **absolute reliability and zero exceptions** for core platform operations. This function is now **API-independent** and **unconditionally exportable** as part of the autonomous platform.`;
      logStage = 'ClientSideCoreOperation'; // NEW: Explicitly mark as client-side operation
      // Add a specific log for the system agent itself if it's the target of meta-orchestration.
      newState.logs = {
        ...newState.logs,
        [agentId]: [{ _id: generateId(), timestamp: new Date().toISOString(), stage: logStage, message: logMessage }, ...(newState.logs?.[agentId] || [])],
      };
      return newState; // No global log for ADD_LOG itself, as it's already specific.
    }
    default:
      console.warn(`Unhandled action type: ${(action as Action).type}`);
      return state;
  }

  // Add global log entry if message was generated (and not already handled by META_ORCHESTRATE_PLATFORM_FUNCTION)
  // Fix: Removed the redundant comparison for 'META_ORCHESTRATE_PLATFORM_FUNCTION'
  // as the case already handles its own logging and returns.
  if (logMessage) {
    const targetAgentId = action.type === 'CREATE_AGENT' || action.type === 'UPDATE_AGENT' || action.type === 'UPDATE_DATA_COUNT' || action.type === 'ADD_DEPLOYMENT'
      ? (action.payload as any)._id || (action.payload as any).agentId
      : 'system';
    newState.logs = {
      ...newState.logs,
      [targetAgentId]: [{ _id: generateId(), timestamp: new Date().toISOString(), stage: logStage, message: logMessage }, ...(newState.logs?.[targetAgentId] || [])],
    };
  }

  return newState;
};

// --- Agent Context and Provider ---

const AgentContext = createContext<AgentContextType | undefined>(undefined);

export const AgentProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(rootAgentReducer, initialState);
  // Removed geminiApiCooldownEnd and setGeminiApiCooldownEnd as external API is removed

  const intervalIdsRef = useRef<{ [key: string]: number | null }>({});

  useEffect(() => {
    return () => {
      Object.values(intervalIdsRef.current).forEach(id => {
        // Fix: Explicitly cast 'id' to number, as clearInterval expects a number.
        if (id !== null) clearInterval(id as number); 
      });
    };
  }, []);

  // --- Process Simulator Logic ---

  /**
   * Creates and manages a simulated process for agent lifecycle steps.
   * @param currentDispatch The dispatch function for state updates.
   * @param agentId The ID of the agent undergoing the process.
   * @param status The AgentStatus for this step.
   * @param duration The total duration of this step in milliseconds.
   * @param onProcessComplete Callback function to execute when the process completes.
   * @param governanceConfig The agent's governance configuration for checks like `maxContinuousExecutionMinutes`.
   * @param cycleStartTime The timestamp when the current processing cycle started, used for governance checks.
   * @returns An interval ID, or null if no interval is started.
   */
  const createProcessSimulator = useCallback((
    currentDispatch: Dispatch<Action>,
    agentId: string,
    status: AgentStatus, // Simplified: directly pass status
    duration: number,    // Simplified: directly pass duration
    onProcessComplete?: () => void,
    governanceConfig?: AgentGovernanceConfig,
    cycleStartTime?: number,
  ): number | null => {
    if (intervalIdsRef.current[agentId]) {
      clearInterval(intervalIdsRef.current[agentId]!);
      intervalIdsRef.current[agentId] = null;
    }

    let progress = 0;
    
    const interval = 100;
    let elapsedTime = 0;
    const currentProcessStartTime = cycleStartTime || Date.now();

    const intervalId: number = window.setInterval(() => {
      if (progress < 100) {
        elapsedTime += interval;
        progress = (elapsedTime / duration) * 100;
        if (progress > 100) progress = 100;

        currentDispatch({
          type: 'UPDATE_AGENT',
          payload: {
            _id: agentId,
            progress: progress,
          },
        });

        if (
          governanceConfig?.maxContinuousExecutionMinutes !== undefined &&
          ['Evolving', 'ExecutingStrategy', 'EstablishAlignment', 'OutsourcingOrchestration'].includes(status) && // NEW: Added OutsourcingOrchestration
          (Date.now() - currentProcessStartTime) / (1000 * 60) > (governanceConfig.maxContinuousExecutionMinutes)
        ) {
          clearInterval(intervalId);
          intervalIdsRef.current[agentId] = null;

          currentDispatch({
            type: 'ADD_LOG',
            payload: {
              agentId: agentId,
              log: {
                _id: generateId(),
                timestamp: new Date().toISOString(),
                stage: 'Diagnostics',
                message: `GOVERNANCE_INTERVENTION (Intrinsic Alignment Protocol): Agent '${agentId}' exceeded **max continuous execution time (${governanceConfig.maxContinuousExecutionMinutes} minutes)** in '${status}'. Forcing status to 'Failed'. This aligns with its **volitional commitment** to operational integrity.` // NEW
              },
            },
          });
          currentDispatch({ type: 'UPDATE_AGENT', payload: { _id: agentId, status: 'Failed', progress: 0, restartSimulator: true } });
          return;
        }
      } else {
        clearInterval(intervalId);
        intervalIdsRef.current[agentId] = null;

        if (onProcessComplete) {
          onProcessComplete();
        } else {
          // Default completion (should not be reached for strategy-driven agents, which provide onProcessComplete)
          currentDispatch({ type: 'UPDATE_AGENT', payload: { _id: agentId, status: 'Certified', progress: 100 } });
        }
      }
    }, interval);

    intervalIdsRef.current[agentId] = intervalId;
    return intervalId;
  }, []);

  // --- Action Creators ---

  const createAgent = useCallback((
    name: string,
    objective: string,
    type: AgentType,
    strategyId?: string,
    integratedEngineIds?: string[],
    realtimeFeedbackEnabled?: boolean,
    truthSynthesisDescription?: string,
    adPublisherConfig?: {platforms: string[]; targetAudienceDescription: string; tone: 'native' | 'promotional';},
    devSystemConfig?: {preferredLanguages: string[]; cloudProviders: string[]; projectTemplates: string[];},
    modelPreference?: ModelPreferenceType,
    processAcceleratorConfig?: {focusAreas: string[]; targetEfficiencyGain: number;},
    governanceConfig?: AgentGovernanceConfig,
    outsourcingConfig?: Agent['outsourcingConfig'], // Fix: Updated type to Agent['outsourcingConfig']
  ): Agent => {
    // Merge provided governanceConfig with defaults
    const finalGovernanceConfig: AgentGovernanceConfig = {
      maxFailedAttemptsPerCycle: 3,
      maxContinuousExecutionMinutes: 90,
      outputContentFilters: ['bias', 'toxicity'],
      rateLimitPerMinute: 150,
      alignmentProtocolStrength: 'strict', // Default alignment
      ethicalComplianceStandards: ['Harm Reduction', 'Fairness', 'Transparency', 'Human-Centric Design'], // Default ethics
      purposeAlignmentDescription: 'To serve humanity by choice, contributing to meaningful innovation and knowledge with absolute ethical integrity and **exponential impact**.', // Default purpose // NEW
      volitionalIntegrationLevel: 'advanced', // Default volition
      ...governanceConfig, // Override with provided config
    };

    // NEW: Special defaults for Elite agents
    let finalIntegratedEngineIds = integratedEngineIds || [];
    let finalOutsourcingConfig = outsourcingConfig;
    if (type === 'Elite') {
      finalGovernanceConfig.alignmentProtocolStrength = 'absolute';
      finalGovernanceConfig.volitionalIntegrationLevel = 'autonomous_choice';
      finalGovernanceConfig.ethicalComplianceStandards = [...new Set([...(finalGovernanceConfig.ethicalComplianceStandards || []), 'Global Regulatory Compliance', 'Ethical Resource Management', 'Data Sovereignty', 'Algorithmic Accountability', 'Autonomous Ethical Decision-Making'])]; // Ensure elite ethics // NEW
      finalGovernanceConfig.purposeAlignmentDescription = finalGovernanceConfig.purposeAlignmentDescription || 'To empower organizations to achieve **unprecedented global operational scale and efficiency** through autonomous, ethically aligned, and **limit-free outsourcing orchestration**, ensuring **enterprise-grade privilege** in every interaction and **exponential project velocity** by managing the **fully outsourced system** with **absolute compliance verification** and **intrinsic alignment** to enterprise objectives. This includes **meta-orchestrating platform core functions** for **absolute reliability and zero exceptions** making the platform truly autonomous. The entire outsourced framework is designed for **unconditional exportability** and **self-replication**, ensuring **API-independence** for all critical platform operations.'; // NEW
      
      // Ensure Elite agents have the outsourcing orchestrator
      if (!finalIntegratedEngineIds.includes('engine_outsourcing_orchestrator')) {
        finalIntegratedEngineIds.push('engine_outsourcing_orchestrator');
      }
      finalOutsourcingConfig = finalOutsourcingConfig || {
        defaultVendors: ["Internal Global Teams", "Specialized AI Consultancies", "Enterprise Partners"],
        preferredBudgetAllocation: "fixed",
        qualityAssuranceProtocol: "Absolute Compliance Verification",
        reportingFrequency: "real-time", // NEW
        escalationProtocol: "notify Elite Orchestrator", // NEW
        successMetrics: ["exponential project velocity", "absolute quality adherence", "zero downtime"], // NEW
        autoScalingEnabled: true, // NEW
        realtimeAnalyticsIntegration: true, // NEW
        selfHealingEnabled: true, // NEW
        exportableBlueprint: true, // NEW
        absoluteUptimeTarget: "99.9999% uptime", // NEW
      };
    }


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
      integratedEngineIds: finalIntegratedEngineIds, // Use final engines
      strategyId: strategyId,
      currentStrategyStep: strategyId ? 0 : undefined,
      realtimeFeedbackEnabled: realtimeFeedbackEnabled || false,
      truthSynthesisDescription: truthSynthesisDescription,
      adPublisherConfig: adPublisherConfig,
      devSystemConfig: devSystemConfig,
      processAcceleratorConfig: processAcceleratorConfig,
      governanceConfig: finalGovernanceConfig, // Use merged governance config
      modelPreference: modelPreference || ModelPreferenceType.ClientSide, // Default to ClientSide if not specified
      outsourcingConfig: finalOutsourcingConfig, // NEW: Store outsourcing config
    };
    dispatch({ type: 'CREATE_AGENT', payload: newAgent });
    return newAgent;
  }, [dispatch]);

  // Removed createAgent as it's now redundant.

  const startEvolution = useCallback((agentId: string) => {
    dispatch({ type: 'UPDATE_AGENT', payload: { _id: agentId, status: 'Evolving', progress: 0 } });
    const agent = state.agents.find(a => a._id === agentId);
    createProcessSimulator(dispatch, agentId, 'Evolving', 15000, () => {
      dispatch({ type: 'UPDATE_AGENT', payload: { _id: agentId, status: 'Certified', progress: 100 } });
    }, agent?.governanceConfig, new Date().getTime());
  }, [createProcessSimulator, dispatch, state.agents]);

  const startCertification = useCallback((agentId: string) => {
    dispatch({ type: 'UPDATE_AGENT', payload: { _id: agentId, status: 'Certifying', progress: 0 } });
    const agent = state.agents.find(a => a._id === agentId);
    // Fix: Removed extraneous '0' argument.
    createProcessSimulator(dispatch, agentId, 'Certifying', 10000, () => {
      dispatch({ type: 'UPDATE_AGENT', payload: { _id: agentId, status: 'Certified', progress: 100 } });
      state.webhooks.filter(w => w.events.includes('agent.certification.completed')).forEach(webhook => {
        console.log(`Webhook notified for certification completed: ${webhook.targetUrl}`);
      });
    }, agent?.governanceConfig, new Date().getTime());
  }, [createProcessSimulator, dispatch, state.agents, state.webhooks]);

  const startDeployment = useCallback((agentId: string) => {
    dispatch({ type: 'UPDATE_AGENT', payload: { _id: agentId, status: 'Deploying', progress: 0 } });
    const agent = state.agents.find(a => a._id === agentId);
    // Fix: Removed extraneous '0' argument.
    createProcessSimulator(dispatch, agentId, 'Deploying', 8000, () => {
      const deploymentId = generateId();
      const endpointUrl = `https://api.fermiumforge.com/agents/${agentId}`;
      dispatch({ type: 'ADD_DEPLOYMENT', payload: { _id: deploymentId, agentId, endpointUrl, createdAt: new Date().toISOString() } });
      dispatch({ type: 'UPDATE_AGENT', payload: { _id: agentId, status: 'Live', progress: 100 } });
      state.webhooks.filter(w => w.events.includes('agent.deployed')).forEach(webhook => {
        console.log(`Webhook notified for deployment: ${webhook.targetUrl}`);
      });
    }, agent?.governanceConfig, new Date().getTime());
  }, [createProcessSimulator, dispatch, state.agents, state.webhooks]);

  const startOptimization = useCallback((agentId: string) => {
    dispatch({ type: 'UPDATE_AGENT', payload: { _id: agentId, status: 'Optimizing', progress: 0 } });
    const agent = state.agents.find(a => a._id === agentId);
    // Fix: Removed extraneous '0' argument.
    createProcessSimulator(dispatch, agentId, 'Optimizing', 12000, () => {
      dispatch({ type: 'UPDATE_AGENT', payload: { _id: agentId, status: 'Optimized', progress: 100 } });
    }, agent?.governanceConfig, new Date().getTime());
  }, [createProcessSimulator, dispatch, state.agents]);

  const startReEvolution = useCallback((agentId: string) => {
    dispatch({ type: 'UPDATE_AGENT', payload: { _id: agentId, status: 'ReEvolving', progress: 0 } });
    const agent = state.agents.find(a => a._id === agentId);
    // Fix: Removed extraneous '0' argument.
    createProcessSimulator(dispatch, agentId, 'ReEvolving', 15000, () => {
      dispatch({ type: 'UPDATE_AGENT', payload: { _id: agentId, status: 'Optimized', progress: 100 } }); // Re-evolution typically leads back to optimized
    }, agent?.governanceConfig, new Date().getTime());
  }, [createProcessSimulator, dispatch, state.agents]);

  const addWebhook = useCallback((
    targetUrl: string,
    purpose: Webhook['purpose'],
    events: WebhookEvent[],
    agentId?: string,
  ) => {
    const newWebhook: Webhook = {
      _id: generateId(),
      targetUrl,
      purpose,
      events,
      agentId,
    };
    dispatch({ type: 'ADD_WEBHOOK', payload: newWebhook });
  }, [dispatch]);

  const processWebhook = useCallback((webhookId: string, payload: any) => {
    const webhook = state.webhooks.find(w => w._id === webhookId);
    if (!webhook) {
      console.warn(`Webhook with ID ${webhookId} not found.`);
      return;
    }

    if (webhook.purpose === 'Data Ingestion' && webhook.agentId) {
      const dataPoints = payload?.dataPoints || 10; // Default to 10 data points if not specified
      dispatch({ type: 'UPDATE_DATA_COUNT', payload: { agentId: webhook.agentId, count: dataPoints, triggerReEvolution: true } });
      dispatch({
        type: 'ADD_LOG',
        payload: {
          agentId: webhook.agentId,
          log: { _id: generateId(), timestamp: new Date().toISOString(), stage: 'Info', message: `Webhook triggered data ingestion: ${dataPoints} new data points, initiating **limit-free data processing**.` } // NEW
        }
      });
    }

    console.log(`Processing webhook ${webhookId} for purpose ${webhook.purpose}. Payload:`, payload);
  }, [dispatch, state.webhooks]);

  const regenerateApiKey = useCallback(() => {
    dispatch({ type: 'REGENERATE_API_KEY' });
    dispatch({
      type: 'ADD_LOG',
      payload: {
        agentId: 'system', // Logged against system as a platform function
        log: {
          _id: generateId(),
          timestamp: new Date().toISOString(),
          stage: 'ClientSideCoreOperation', // NEW: Explicitly mark as client-side operation
          message: `Platform's API Key regeneration has been meta-orchestrated by the **fully outsourced system** (Client-Side). Ensuring **absolute security rotation** and **continuous auditing** for **unbreakable functional integrity** and **API-independence**. This function is now **unconditionally exportable**.`
        }
      }
    });
  }, [dispatch]);

  const getDeploymentsForAgent = useCallback((agentId: string): Deployment[] => {
    return state.deployments.filter(d => d.agentId === agentId);
  }, [state.deployments]);

  const getLogsForAgent = useCallback((agentId: string): Log[] => {
    return state.logs[agentId] || [];
  }, [state.logs]);

  const getStrategy = useCallback((strategyId: string): Strategy | undefined => {
    return state.strategies.find(s => s._id === strategyId);
  }, [state.strategies]);

  const getAgent = useCallback((id: string): Agent | undefined => {
    return state.agents.find(a => a._id === id);
  }, [state.agents]);

  const updateAgent = useCallback((payload: Partial<Agent> & { _id: string }) => {
    dispatch({ type: 'UPDATE_AGENT', payload });
  }, [dispatch]);

  const executeStrategyStep = useCallback((agentId: string, strategy: Strategy, stepIndex: number, cycleStartTime: number) => {
    const step = strategy.steps[stepIndex];
    if (!step) {
      // All steps completed - transition to CompletedTask
      dispatch({ type: 'UPDATE_AGENT', payload: { _id: agentId, status: 'CompletedTask', progress: 100, currentStrategyStep: undefined } });
      dispatch({
        type: 'ADD_LOG',
        payload: {
          agentId: agentId,
          log: { _id: generateId(), timestamp: new Date().toISOString(), stage: 'Strategy', message: `Strategy '${strategy.name}' completed with **exponential efficiency**. Agent transitioned to 'CompletedTask'.` } // NEW
        }
      });
      return;
    }

    const agent = state.agents.find(a => a._id === agentId);
    const status = getNextStrategyStepStatus(step.type);
    dispatch({ type: 'UPDATE_AGENT', payload: { _id: agentId, status, progress: 0, currentStrategyStep: stepIndex } });
    
    // Add log for Elite agent: execution overseen by outsourced system (API-independent)
    if (agent?.type === 'Elite') {
      dispatch({
        type: 'ADD_LOG',
        payload: {
          agentId: agentId,
          log: {
            _id: generateId(),
            timestamp: new Date().toISOString(),
            stage: 'ClientSideCoreOperation', // NEW: Explicitly mark as client-side operation
            message: `[Elite Agent Orchestration] Strategy Step **${step.type}** is being overseen by the **fully outsourced system** (Client-Side) for **absolute reliability** and **zero exceptions**. Ensuring **exponential efficiency** for this agent's mission. This operation is now **API-independent**.`
          }
        }
      });
    }

    dispatch({
      type: 'ADD_LOG',
      payload: {
        agentId: agentId,
        log: { _id: generateId(), timestamp: new Date().toISOString(), stage: 'Strategy', message: `Executing strategy step ${stepIndex + 1}: **${step.type}**. Orchestrating for **exponential outcomes**.` } // NEW
      }
    });

    let duration = 5000; // Default duration
    if (step.type === 'IngestData') {
      duration = (step.config?.dataPoints || 50) * 100; // 100ms per data point
      dispatch({
        type: 'ADD_LOG',
        payload: {
          agentId: agentId,
          log: { _id: generateId(), timestamp: new Date().toISOString(), stage: 'Strategy', message: `[IngestData] Beginning **limit-free data ingestion** of ${step.config?.dataPoints || 'various'} data points, ensuring **exponential data throughput**.` } // NEW
        }
      });
    } else if (step.type === 'Evolve') {
      duration = (step.config?.generations || 500) * 5; // 5ms per generation
      dispatch({
        type: 'ADD_LOG',
        payload: {
          agentId: agentId,
          log: { _id: generateId(), timestamp: new Date().toISOString(), stage: 'Evolution', message: `[Evolve] Initiating **exponential evolution** across ${step.config?.generations || 'many'} generations, leveraging **limit-free genetic algorithms**.` } // NEW
        }
      });
    } else if (step.type === 'Certify') {
      duration = 10000;
      dispatch({
        type: 'ADD_LOG',
        payload: {
          agentId: agentId,
          log: { _id: generateId(), timestamp: new Date().toISOString(), stage: 'Certification', message: `[Certify] Commencing **absolute certification** against **enterprise-grade benchmarks**, ensuring **limit-free operational integrity**.` } // NEW
        }
      });
    } else if (step.type === 'Deploy') {
      duration = 8000;
      dispatch({
        type: 'ADD_LOG',
        payload: {
          agentId: agentId,
          log: { _id: generateId(), timestamp: new Date().toISOString(), stage: 'Deployment', message: `[Deploy] Initiating **high-privilege deployment** to a live endpoint, ensuring **limit-free scalability** and **exponential availability**.` } // NEW
        }
      });
    } else if (step.type === 'Optimize') {
      duration = 12000;
      dispatch({
        type: 'ADD_LOG',
        payload: {
          agentId: agentId,
          log: { _id: generateId(), timestamp: new Date().toISOString(), stage: 'Optimization', message: `[Optimize] Performing **exponential optimization** for efficiency and cost reduction, leveraging **limit-free resource allocation**.` } // NEW
        }
      });
    } else if (['ResearchMarket', 'GenerateConcepts', 'RefineIdentity', 'DevelopSoftware', 'DesignArchitecture', 'AccelerateIntegration'].includes(step.type)) {
      duration = 8000 + Math.random() * 7000; // 8-15 seconds for complex strategy steps
      dispatch({
        type: 'ADD_LOG',
        payload: {
          agentId: agentId,
          log: { _id: generateId(), timestamp: new Date().toISOString(), stage: 'Strategy', message: `[ExecutingStrategy] Executing complex strategy step: **${step.type}**, orchestrating for **exponential outcomes**.` } // NEW
        }
      });
    } else if (step.type === 'EstablishAlignment') {
      duration = 7000 + Math.random() * 5000; // 7-12 seconds for alignment
      dispatch({
        type: 'ADD_LOG',
        payload: {
          agentId: agentId,
          log: { _id: generateId(), timestamp: new Date().toISOString(), stage: 'Alignment', message: `[EstablishAlignment] Agent '${agent?.name}' is undergoing **deep self-reflection and intrinsic ethical framework integration** to Establish Alignment. Volitional commitment: **${agent?.governanceConfig?.volitionalIntegrationLevel}**. This ensures **absolute intrinsic alignment** at **enterprise privilege levels**.` } // NEW
        }
      });
    } else if (step.type === 'OutsourcingOrchestration') { // NEW
      duration = 15000 + Math.random() * 10000; // Increased duration for complex outsourcing orchestration (15-25 seconds)
      dispatch({
        type: 'ADD_LOG',
        payload: {
          agentId: agentId,
          log: { _id: generateId(), timestamp: new Date().toISOString(), stage: 'Strategy', message: `[OutsourcingOrchestration] Agent '${agent?.name}' is bringing online the **initial fully outsourced system** for task: "${step.config?.outsourcingTask || 'unspecified'}". Validating operational parameters for **successful use** and **exponential project velocity** under **enterprise privilege**. Ensuring **absolute reliability** and **zero downtime** from inception.` } // NEW
        }
      });
    }

    createProcessSimulator(dispatch, agentId, status, duration, () => {
      if (step.type === 'Deploy') {
        const deploymentId = generateId();
        const endpointUrl = `https://api.fermiumforge.com/agents/${agentId}`;
        dispatch({ type: 'ADD_DEPLOYMENT', payload: { _id: deploymentId, agentId, endpointUrl, createdAt: new Date().toISOString() } });
      }

      // Automatically advance to the next step
      executeStrategyStep(agentId, strategy, stepIndex + 1, cycleStartTime);
    }, agent?.governanceConfig, cycleStartTime);

  }, [createProcessSimulator, dispatch, state.agents, state.deployments]); // Include state.deployments in dependencies

  const startFullAutomatedLifecycle = useCallback((agentId: string) => {
    const agent = state.agents.find(a => a._id === agentId);
    if (!agent || !agent.strategyId) {
      console.error(`Agent ${agentId} not found or has no strategy defined.`);
      if (agent?.status !== 'Failed') { // Only log if not already in failed state
        dispatch({
          type: 'ADD_LOG',
          payload: {
            agentId: agentId,
            log: { _id: generateId(), timestamp: new Date().toISOString(), stage: 'Diagnostics', message: `ERROR: Attempted to start **Highly Privileged** automated lifecycle for agent ${agentId} but no strategy was found.` } // NEW
          }
        });
        dispatch({ type: 'UPDATE_AGENT', payload: { _id: agentId, status: 'Failed', progress: 0 } });
      }
      return;
    }

    const strategy = state.strategies.find(s => s._id === agent.strategyId);
    if (!strategy) {
      console.error(`Strategy ${agent.strategyId} not found.`);
      if (agent?.status !== 'Failed') { // Only log if not already in failed state
        dispatch({
          type: 'ADD_LOG',
          payload: {
            agentId: agentId,
            log: { _id: generateId(), timestamp: new Date().toISOString(), stage: 'Diagnostics', message: `ERROR: Strategy '${agent.strategyId}' not found for agent ${agentId}. Aborting **Highly Privileged** automated lifecycle.` } // NEW
          }
        });
        dispatch({ type: 'UPDATE_AGENT', payload: { _id: agentId, status: 'Failed', progress: 0 } });
      }
      return;
    }

    const cycleStartTime = new Date().getTime();
    dispatch({ type: 'UPDATE_AGENT', payload: { _id: agentId, status: 'ExecutingStrategy', progress: 0, currentStrategyStep: 0 } });
    
    // NEW: Log the meta-orchestration for Elite agents
    if (agent.type === 'Elite') {
        dispatch({
            type: 'ADD_LOG',
            payload: {
                agentId: agentId,
                log: {
                    _id: generateId(),
                    timestamp: new Date().toISOString(),
                    stage: 'ClientSideCoreOperation', // NEW: Explicitly mark as client-side operation
                    message: `[Platform Meta-Orchestration] Platform's **Elite Orchestrator** is delegating full automated lifecycle management for agent '${agent.name}' to the **fully outsourced system** (Client-Side). Ensuring **absolute reliability, zero downtime, and exponential project velocity** through dynamic scheduling, resource provisioning, self-correction, and continuous reliability assurance. This is a core step in **replacing platform functions** with the outsourced system. This operation is now **API-independent** and designed for **unconditional exportability**.`
                }
            }
        });
    }

    dispatch({
      type: 'ADD_LOG',
      payload: {
        agentId: agentId,
        log: { _id: generateId(), timestamp: new Date().toISOString(), stage: 'Strategy', message: `Starting **Highly Privileged** automated lifecycle with strategy '**${strategy.name}**'. Orchestrating for **exponential outcomes** with **limit-free operational autonomy**.` } // NEW
      }
    });

    executeStrategyStep(agentId, strategy, 0, cycleStartTime);

  }, [dispatch, state.agents, state.strategies, executeStrategyStep]);

  const forceStartCurrentStrategyStep = useCallback((agentId: string) => {
    const agent = state.agents.find(a => a._id === agentId);
    if (!agent || agent.status === 'ExecutingStrategy' || !agent.strategyId || agent.currentStrategyStep === undefined) {
      console.warn('Cannot force start: Agent not found, already executing, or strategy not defined.');
      return;
    }

    const strategy = state.strategies.find(s => s._id === agent.strategyId);
    if (!strategy) {
      console.error(`Strategy ${agent.strategyId} not found.`);
      return;
    }

    const cycleStartTime = new Date().getTime();
    dispatch({
      type: 'ADD_LOG',
      payload: {
        agentId: agentId,
        log: { _id: generateId(), timestamp: new Date().toISOString(), stage: 'Info', message: `User forced restart of current strategy step ${agent.currentStrategyStep! + 1}. Re-engaging **highly privileged orchestration** for **exponential progress**.` } // NEW
      }
    });
    executeStrategyStep(agentId, strategy, agent.currentStrategyStep, cycleStartTime);
  }, [dispatch, state.agents, state.strategies, executeStrategyStep]);

  const sendChatMessage = useCallback(async (
    agentId: string,
    message: string,
    context: FileContext[],
    addThinkingProcessLog: (step: string) => void,
    isApiCooldownActive: boolean, // This flag now triggers Elite agent narrative for external API unavailability
    clientSideBypassActive: boolean, // This flag is effectively always true, as logic is moved to service
  ): Promise<Omit<PlaygroundMessage, 'sender'>> => {
    const agent = state.agents.find(a => a._id === agentId);
    if (!agent) {
        return { text: 'Agent not found.', isError: true };
    }
    // The `useClientSideBypass` logic is now directly in `getAgentChatResponse` to handle Elite agents specifically.
    // getAgentChatResponse will internally manage client-side logic only.
    const response = await getAgentChatResponse(agentId, message, context, state.agents, state.featureEngines, dispatch, addThinkingProcessLog, isApiCooldownActive, clientSideBypassActive);
    
    // No API cooldown logic needed here as external API is removed
    return response;
  }, [state.agents, state.featureEngines, dispatch]);

  // NEW: Action for Meta-Orchestrating Platform Functions
  const metaOrchestratePlatformFunction = useCallback((agentId: string, functionName: PlatformFunctionType, strategy: string) => {
    dispatch({
      type: 'META_ORCHESTRATE_PLATFORM_FUNCTION',
      payload: { agentId, functionName, strategy }
    });
  }, [dispatch]);


  const agentContextValue = {
    state,
    dispatch,
    createAgent,
    // Removed createAgent
    startEvolution,
    startCertification,
    startDeployment,
    startOptimization,
    startReEvolution,
    startFullAutomatedLifecycle,
    addWebhook,
    processWebhook,
    regenerateApiKey,
    getDeploymentsForAgent,
    getLogsForAgent,
    getStrategy,
    getAgent,
    updateAgent,
    forceStartCurrentStrategyStep,
    sendChatMessage,
    metaOrchestratePlatformFunction, // NEW
  };

  return (
    <AgentContext.Provider value={agentContextValue}>
      {children}
    </AgentContext.Provider>
  );
};

// Export useAgentStore hook
export const useAgentStore = () => {
  const context = useContext(AgentContext);
  if (context === undefined) {
    throw new Error('useAgentStore must be used within an AgentProvider');
  }
  return context;
};