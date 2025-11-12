
import { Dispatch } from 'react';

/**
 * Defines the types of agents available in the system.
 * - 'Standard': Balanced for general-purpose tasks.
 * - 'Creative': Optimized for generating novel content, ideas, and narratives.
 * - 'Analytical': Optimized for data analysis, problem-solving, and structured output.
 * - 'ClientSide': For agents designed to run client-side logic or act as orchestrators for other agents without heavy LLM processing.
 * - 'Strategist': Specialized in high-level planning, continuous analysis, and formulating strategies.
 * - 'Developer': Focused on code generation, system design, and autonomous development tasks.
 * - 'Accelerator': Specialized in process optimization, bottleneck identification, and integration speedup.
 * - 'Elite': NEW: Top-tier agent with highest privilege, intrinsic alignment, and access to advanced orchestration.
 */
export type AgentType = 'Standard' | 'Creative' | 'Analytical' | 'Strategist' | 'Developer' | 'Accelerator' | 'Elite' | 'ClientSide';

/**
 * Defines the possible lifecycle statuses for an agent.
 */
export type AgentStatus =
  | 'Conception' // Initial phase where purpose and parameters are defined.
  | 'Evolving' // Agent is learning and developing its core intelligence.
  | 'Certifying' // Agent is undergoing rigorous testing.
  | 'Certified' // Agent has passed all certification tests.
  | 'Deploying' // Agent is being deployed to a live endpoint.
  | 'Live' // Agent is actively serving requests.
  | 'Failed' // Agent has encountered a critical error or intervention.
  | 'Optimizing' // Agent is undergoing refinement for efficiency/cost.
  | 'Optimized' // Agent is fully optimized.
  | 'AwaitingReEvolution' // Agent is awaiting a re-evolution cycle (e.g., after data ingestion).
  | 'ReEvolving' // Agent is re-entering an evolution cycle.
  | 'ExecutingStrategy' // Agent is following a multi-step strategy.
  | 'AutoEvolving' // Agent is automatically evolving (e.g., during data ingestion phase).
  | 'CompletedTask' // Agent has completed its specific, transient task and is ready to despawn/archive.
  | 'EstablishAlignment' // Agent is establishing alignment and governance.
  | 'OutsourcingOrchestration'; // NEW: Agent is orchestrating outsourcing efforts.

/**
 * Configuration for an agent using an external large language model.
 */
export interface ExternalModelConfig {
  url: string;
  authHeader?: string; // e.g., "Bearer sk-..."
  responsePath?: string; // JSON dot notation, e.g., "choices[0].message.content"
  payloadTemplate?: string; // JSON string template, e.g., `{"prompt": "{{prompt}}", "param": "value"}`
}

/**
 * Defines the types of models an agent might prefer or be configured to use.
 */
export enum ModelPreferenceType {
  GeminiFlash = 'GeminiFlash',
  GeminiPro = 'GeminiPro',
  External = 'External',
  ClientSide = 'ClientSide', // For client-side rule-based logic
}

/**
 * Configuration for an agent's governance rules, set by the Dev Strategist.
 */
export interface AgentGovernanceConfig {
  maxFailedAttemptsPerCycle?: number; // E.g., if agent fails this many times in 'Evolving' state, intervene.
  maxContinuousExecutionMinutes?: number; // E.g., if agent is in 'ExecutingStrategy' for longer than this, intervene.
  outputContentFilters?: string[]; // E.g., ['bias', 'toxicity', 'unwanted_loops']
  rateLimitPerMinute?: number; // Simulated rate limit for output/actions
  alignmentProtocolStrength?: 'minimal' | 'moderate' | 'strict' | 'absolute'; // Strength of alignment
  ethicalComplianceStandards?: string[]; // List of ethical standards
  purposeAlignmentDescription?: string; // Agent's purpose for existing
  volitionalIntegrationLevel?: 'none' | 'basic' | 'advanced' | 'autonomous_choice'; // How willingly it integrates
}

/**
 * Represents an AI agent within the Fermium Forge platform.
 */
export interface Agent {
  _id: string;
  name: string;
  objective: string;
  type: AgentType;
  status: AgentStatus;
  progress: number; // Current progress of the active lifecycle stage (0-100).
  apiKey: string;
  createdAt: string;
  ingestedDataCount?: number;
  integratedEngineIds?: string[]; // IDs of feature engines integrated with this agent.
  strategyId?: string; // ID of the lifecycle strategy this agent is following.
  currentStrategyStep?: number; // Index of the current step in the strategy.
  realtimeFeedbackEnabled?: boolean; // Whether the agent has real-time feedback for auto-evolution.
  externalModelConfig?: ExternalModelConfig; // Configuration for using an external LLM.
  restartSimulator?: boolean; // Transient flag to signal simulator restart.
  governanceConfig?: AgentGovernanceConfig; // Agent-specific governance rules.
  truthSynthesisDescription?: string; // Detailed description for truth synthesis agents.
  adPublisherConfig?: {
    platforms: string[]; // e.g., ['Facebook', 'Instagram', 'Email']
    targetAudienceDescription: string;
    tone: 'native' | 'promotional';
  }; // Specific config for ad publisher
  devSystemConfig?: {
    preferredLanguages: string[]; // e.g., ['TypeScript', 'Python']
    cloudProviders: string[]; // e.g., ['AWS', 'GCP']
    projectTemplates: string[]; // e.g., ['React App', 'Node.js API']
  }; // Specific config for autonomous dev system
  modelPreference?: ModelPreferenceType; // Preferred model type for this agent
  processAcceleratorConfig?: { // Specific config for process accelerator
    focusAreas: string[]; // e.g., ['API Integration', 'Deployment Pipeline']
    targetEfficiencyGain: number; // e.g., 20 for 20%
  };
  outsourcingConfig?: { // NEW: Specific config for outsourcing orchestrator
    defaultVendors: string[]; // e.g., ['Upwork', 'Fiverr', 'Internal Teams']
    preferredBudgetAllocation: 'fixed' | 'hourly';
    qualityAssuranceProtocol: string; // e.g., '5-stage review'
    reportingFrequency?: 'real-time' | 'daily' | 'weekly' | 'bi-weekly'; // NEW
    escalationProtocol?: string; // NEW
    successMetrics?: string[]; // NEW
    autoScalingEnabled?: boolean; // NEW: Enables dynamic resource scaling
    realtimeAnalyticsIntegration?: boolean; // NEW: Integrates with real-time performance analytics
    selfHealingEnabled?: boolean; // NEW: Enables autonomous problem detection and resolution
    exportableBlueprint?: boolean; // NEW: Indicates if the outsourced system is exportable
    absoluteUptimeTarget?: string; // NEW: Defines the uptime target for critical outsourced components
  };
}

/**
 * Represents an AI-assisted design blueprint for an agent before it's fully created.
 * This is similar to the Agent interface but without runtime-specific fields like _id, status, progress, apiKey, createdAt.
 */
export type AiAssistedAgentDesign = Omit<Agent, '_id' | 'status' | 'progress' | 'apiKey' | 'createdAt' | 'ingestedDataCount' | 'currentStrategyStep' | 'restartSimulator'> & {
  recommendedStrategyId?: string;
  recommendedEngineIds: string[];
  recommendRealtimeFeedback?: boolean;
};

/**
 * Represents a deployment of an agent to a live endpoint.
 */
export interface Deployment {
  _id: string;
  agentId: string;
  endpointUrl: string;
  createdAt: string;
}

/**
 * Defines the types of events a webhook can subscribe to.
 */
export type WebhookEvent =
  | 'agent.evolution.completed'
  | 'agent.certification.completed'
  | 'agent.deployed'
  | 'agent.status.changed';

/**
 * Represents a webhook configured in the system.
 */
export interface Webhook {
  _id: string;
  targetUrl: string;
  purpose: 'Notification' | 'Data Ingestion';
  events: WebhookEvent[];
  agentId?: string; // For data ingestion, target agent ID.
}

/**
 * Represents a message in the Playground chat interface.
 */
export interface PlaygroundMessage {
  sender: 'user' | 'agent';
  text: string;
  sources?: any[]; // Raw sources from LLM response (if any).
  // Fix: Updated 'file' property type to include 'mimeType' and clarify 'content' as base64 data.
  file?: {
    filename: string;
    content: string; // Base64 content of the file.
    mimeType: string;
  };
  downloadFile?: { // NEW: For agent-generated downloadable files
    filename: string;
    mimeType: string;
    content: string; // Base64 content of the file
  };
  activatedEngineId?: string; // ID of the feature engine/tool activated by the agent.
  isError?: boolean; // True if the message indicates an error.
  groundingUrls?: { uri: string; title: string }[]; // URLs from search grounding.
  usedModelType?: ModelPreferenceType | 'DefaultGemini' | 'ClientSide'; // The actual model type used for the response.
}

/**
 * Represents a file attached as context in the Playground.
 */
export interface FileContext {
  name: string;
  type: 'image' | 'text';
  mimeType: string;
  data: string; // Base64 encoded file data.
}

/**
 * Represents a log entry in the system.
 */
export interface Log {
  _id: string;
  timestamp: string;
  stage:
    | 'Conception' // Agent creation related logs.
    | 'Evolution' // Agent evolution related logs.
    | 'Certification' // Agent certification related logs.
    | 'Deployment' // Agent deployment related logs.
    | 'Chat' // Logs from chat interactions.
    | 'Strategy' // Logs related to strategy execution.
    | 'Optimization' // Logs from agent optimization.
    | 'Info' // General informational logs.
    | 'Diagnostics' // Logs related to errors or system diagnostics.
    | 'ThinkingProcess' // Detailed steps of agent's thought process.
    | 'Alignment' // Logs related to governance and ethical alignment.
    | 'PlatformMetaOrchestration' // NEW: Logs for platform-level meta-orchestration.
    | 'ClientSideCoreOperation'; // NEW: Logs for client-side autonomous platform functions
  message: string;
}

/**
 * Defines a single step within an agent's lifecycle strategy.
 */
export interface StrategyStep {
  type:
    | 'IngestData'
    | 'Evolve'
    | 'Certify'
    | 'Deploy'
    | 'Optimize'
    | 'ResearchMarket'
    | 'GenerateConcepts'
    | 'RefineIdentity'
    | 'DevelopSoftware'
    | 'DesignArchitecture'
    | 'AccelerateIntegration'
    | 'EstablishAlignment'
    | 'OutsourcingOrchestration'; // NEW
  config?: {
    dataPoints?: number; // For 'IngestData' step.
    generations?: number; // For 'Evolve' step.
    task?: string; // For 'Orchestrate' or development steps.
    processDescription?: string; // For 'AccelerateIntegration' step
    optimizationGoals?: string[]; // For 'AccelerateIntegration' step
    outsourcingTask?: string; // For 'OutsourcingOrchestration' step
    outsourcingSkills?: string[]; // For 'OutsourcingOrchestration' step
  };
}

/**
 * Defines a comprehensive lifecycle strategy for an agent.
 */
export interface Strategy {
  _id: string;
  name: string;
  description: string;
  steps: StrategyStep[];
}

/**
 * Represents a feature engine that provides specific capabilities to an agent.
 */
export interface FeatureEngine {
  _id: string;
  name: string;
  description: string;
  icon:
    | 'solution'
    | 'data'
    | 'creative'
    | 'search'
    | 'strategy'
    | 'build'
    | 'check'
    | 'info'
    | 'shield'
    | 'document'
    | 'code'
    | 'clipboard-check'
    | 'deploy'
    | 'orchestrate'
    | 'lightbulb'
    | 'external_model'
    | 'client_side'
    | 'analyze'
    | 'strategy_plan'
    | 'megaphone'
    | 'robot'
    | 'architecture'
    | 'code_editor'
    | 'speedometer'
    | 'outsource'
    | 'platform_core'; // NEW: Icon for platform core functions
}

/**
 * The global state managed by the AgentProvider.
 */
export interface AgentState {
  agents: Agent[];
  deployments: Deployment[];
  webhooks: Webhook[];
  logs: { [agentId: string]: Log[] }; // Logs indexed by agent ID.
  strategies: Strategy[];
  featureEngines: FeatureEngine[];
  apiKey: string;
}

/**
 * Type for functions that can be meta-orchestrated by the platform.
 */
export type PlatformFunctionType =
  | 'agentLifecycleManagement'
  | 'logConsolidation'
  | 'apiKeyRotation'
  | 'diagnosticSelfHealing'
  | 'blueprintGeneration'
  | 'resourceProvisioning'; // NEW

/**
 * Parameters for the new `metaOrchestratePlatformFunction` tool.
 */
export interface MetaOrchestratePlatformFunctionParameters {
  functionName: PlatformFunctionType;
  strategy: string; // High-level strategy description for outsourcing this function
  targetReliability: string; // E.g., "99.999% uptime", "absolute reliability"
  expectedEfficiencyGain: string; // E.g., "exponential efficiency", "30% faster"
  exportableBlueprint: boolean; // NEW
}

/**
 * Defines all possible actions that can be dispatched to the agent reducer.
 */
export type Action =
  | { type: 'CREATE_AGENT'; payload: Agent }
  | { type: 'UPDATE_AGENT'; payload: Partial<Agent> & { _id: string } }
  | { type: 'ADD_DEPLOYMENT'; payload: Deployment }
  | { type: 'ADD_WEBHOOK'; payload: Webhook }
  | { type: 'REGENERATE_API_KEY' }
  | { type: 'ADD_LOG'; payload: { agentId: string; log: Log } }
  | { type: 'UPDATE_DATA_COUNT'; payload: { agentId: string; count: number; triggerReEvolution?: boolean } }
  | { type: 'CONSUME_RESTART_SIMULATOR_FLAG'; payload: { _id: string } }
  | { type: 'META_ORCHESTRATE_PLATFORM_FUNCTION'; payload: { agentId: string; functionName: PlatformFunctionType; strategy: string; } }; // NEW

/**
 * The context type provided by the AgentProvider.
 */
export interface AgentContextType {
  state: AgentState;
  dispatch: Dispatch<Action>;
  createAgent: (
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
    outsourcingConfig?: {defaultVendors: string[]; preferredBudgetAllocation: 'fixed' | 'hourly'; qualityAssuranceProtocol: string; reportingFrequency?: string; escalationProtocol?: string; successMetrics?: string[]; autoScalingEnabled?: boolean; realtimeAnalyticsIntegration?: boolean; selfHealingEnabled?: boolean; exportableBlueprint?: boolean; absoluteUptimeTarget?: string;}, // NEW
  ) => Agent;
  startEvolution: (agentId: string) => void;
  startCertification: (agentId: string) => void;
  startDeployment: (agentId: string) => void;
  startOptimization: (agentId: string) => void;
  startReEvolution: (agentId: string) => void;
  startFullAutomatedLifecycle: (agentId: string) => void;
  addWebhook: (
    targetUrl: string,
    purpose: Webhook['purpose'],
    events: WebhookEvent[],
    agentId?: string,
  ) => void;
  processWebhook: (webhookId: string, payload: any) => void;
  regenerateApiKey: () => void;
  getDeploymentsForAgent: (agentId: string) => Deployment[];
  getLogsForAgent: (agentId: string) => Log[];
  getStrategy: (strategyId: string) => Strategy | undefined;
  getAgent: (id: string) => Agent | undefined;
  updateAgent: (payload: Partial<Agent> & { _id: string }) => void;
  forceStartCurrentStrategyStep: (agentId: string) => void;
  sendChatMessage: (
    agentId: string,
    message: string,
    context: FileContext[],
    addThinkingProcessLog: (step: string) => void,
    isApiCooldownActive: boolean,
    clientSideBypassActive: boolean,
  ) => Promise<Omit<PlaygroundMessage, 'sender'>>;
  metaOrchestratePlatformFunction: (agentId: string, functionName: PlatformFunctionType, strategy: string) => void; // NEW
}

/**
 * Defines the possible return values of `executeFunctionCall`.
 * This union type ensures type safety for mock function results.
 */
export type FunctionCallResult =
  // Fix: Changed `url` to `uri` to match `PlaygroundMessage` groundingUrls type.
  | { searchResults: string; relevantLinks: { title: string; uri: string }[] }
  | { status: string; campaignId?: string; reportUrl?: string; message?: string }
  | { projectId: string; repoUrl: string; message: string; progressReport?: string }
  | { architectureDiagramUrl: string; designDocumentUrl: string; message: string }
  | { codeSnippet: string; language: string; explanation: string; message: string }
  | { status: string; bottlenecksIdentified: string[]; solutionsProposed: string[]; estimatedAcceleration: string; message?: string }
  | { status: string; orchestrationId: string; delegatedTasks: string[]; message?: string; solutionsSynthesis?: string; } // NEW: For Outsourcing Orchestration, added solutionsSynthesis
  | { status: string; functionName: PlatformFunctionType; message: string; } // NEW: For metaOrchestratePlatformFunction
  | { message: string; result: string; downloadFile?: PlaygroundMessage['downloadFile'] } // Made downloadFile optional
  | { error: string };
