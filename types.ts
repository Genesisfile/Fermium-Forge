import { Dispatch } from 'react';


export type AgentType = 'Standard' | 'Creative' | 'Analytical' | 'ClientSide' | 'Strategist'; // FIX: Added 'ClientSide' to AgentType, NEW: Added 'Strategist'

export type AgentStatus =
  | 'Conception'
  | 'Evolving'
  | 'Certifying'
  | 'Certified'
  | 'Deploying'
  | 'Live'
  | 'Failed'
  | 'Optimizing'
  | 'Optimized'
  | 'AwaitingReEvolution'
  | 'ReEvolving'
  | 'ExecutingStrategy'
  | 'AutoEvolving';

export interface ParallelTask {
  name: string;
  progress: number;
}

export interface ExternalModelConfig {
  url: string;
  authHeader?: string; // e.g., "Bearer sk-..."
  responsePath?: string; // JSON dot notation, e.g., "choices[0].message.content"
  payloadTemplate?: string; // JSON string template, e.g., `{"prompt": "{{prompt}}", "param": "value"}`
}

export enum ModelPreferenceType {
  GeminiFlash = 'GeminiFlash',
  GeminiPro = 'GeminiPro',
  External = 'External',
  ClientSide = 'ClientSide', // NEW: For client-side rule-based agents
}

/* // REMOVED: ModelPreference interface (no longer used for routing)
export interface ModelPreference {
  id: string; // Unique ID for this preference entry
  type: ModelPreferenceType;
  externalConfig?: ExternalModelConfig; // Only if type is 'External'
}
*/

// NEW: For Agent governance rules
export interface AgentGovernanceConfig {
  maxFailedAttemptsPerCycle?: number; // e.g., if agent status goes to 'Failed' this many times in 'Evolving' state, intervene.
  maxContinuousExecutionMinutes?: number; // e.g., if agent is in 'ExecutingStrategy' for longer than this, intervene.
  outputContentFilters?: string[]; // e.g., ['bias', 'toxicity', 'unwanted_loops']
  rateLimitPerMinute?: number; // Simulated rate limit for output/actions
}

export interface Agent {
  _id: string;
  name: string;
  objective: string;
  type: AgentType;
  status: AgentStatus;
  progress: number;
  apiKey: string;
  createdAt: string;
  ingestedDataCount?: number;
  integratedEngineIds?: string[];
  strategyId?: string;
  currentStrategyStep?: number;
  parallelTasks?: ParallelTask[];
  realtimeFeedbackEnabled?: boolean;
  externalModelConfig?: ExternalModelConfig; // Kept as a direct property for external LLM agents
  // modelPreferenceOrder?: ModelPreference[]; // REMOVED: No longer used for ordered model fallbacks
  restartSimulator?: boolean; // NEW: Transient flag to explicitly signal simulator restart
  governanceConfig?: AgentGovernanceConfig; // NEW: Agent-specific governance configuration
}

export interface Deployment {
  _id: string;
  agentId: string;
  endpointUrl: string;
  createdAt: string;
}

export type WebhookEvent =
  | 'agent.evolution.completed'
  | 'agent.certification.completed'
  | 'agent.deployed'
  | 'agent.status.changed';

export interface Webhook {
  _id: string;
  targetUrl: string;
  purpose: 'Notification' | 'Data Ingestion' | 'Orchestration'; // NEW: Added 'Orchestration' purpose
  events: WebhookEvent[];
  agentId?: string; // For data ingestion and orchestration, implicitly the orchestrator for 'Orchestration'
}

export interface PlaygroundMessage {
    sender: 'user' | 'agent';
    text: string;
    sources?: any[];
    file?: {
        filename: string;
        content: string;
    };
    activatedEngineId?: string;
    isError?: boolean;
    groundingUrls?: { uri: string; title: string }[]; // New field for search grounding URLs
    usedModelType?: ModelPreferenceType | 'DefaultGemini' | 'ClientSide'; // New: Added 'ClientSide'
    proposedGovernanceActions?: GovernanceAction[]; // NEW: For Dev Strategist to propose actions in Playground
}

export interface FileContext {
    name:string;
    type: 'image' | 'text';
    mimeType: string;
    data: string; // base64
}

export interface Log {
    _id: string;
    timestamp: string;
    stage: 'Conception' | 'Evolution' | 'Certification' | 'Deployment' | 'Chat' | 'Strategy' | 'Optimization' | 'Info' | 'Diagnostics' | 'Orchestration' | 'ThinkingProcess' | 'DevelopmentStrategy'; // NEW: Added 'ThinkingProcess' stage, NEW: 'DevelopmentStrategy'
    message: string; // FIX: Added 'message' property to Log interface
}

export interface StrategyStep {
    type: 'IngestData' | 'Evolve' | 'Certify' | 'Deploy' | 'Optimize' | 'ResearchMarket' | 'GenerateConcepts' | 'RefineIdentity' | 'Orchestrate' | 'MonitorAndRefine'; // NEW strategy step types, NEW: 'MonitorAndRefine'
    config?: {
        dataPoints?: number;
        generations?: number;
        task?: string; // For Orchestrate step
    }
}

export interface Strategy {
    _id: string;
    name: string;
    description: string;
    steps: StrategyStep[];
}

export interface ResearchStep {
    title: string;
    description: string;
}

export interface FeatureEngine {
    _id: string;
    name: string;
    description: string;
    icon: 'solution' | 'data' | 'creative' | 'search' | 'strategy' | 'build' | 'check' | 'info' | 'shield' | 'document' | 'code' | 'clipboard-check' | 'deploy' | 'orchestrate' | 'lightbulb' | 'external_model' | 'client_side' | 'analyze' | 'strategy_plan'; // NEW: 'orchestrate' icon type, 'client_side' icon, 'analyze' icon, NEW: 'strategy_plan'
}

// NEW: Moved from hooks/useAgentStore.tsx
export interface AgentState {
    agents: Agent[];
    deployments: Deployment[];
    webhooks: Webhook[];
    logs: { [agentId: string]: Log[] };
    strategies: Strategy[];
    featureEngines: FeatureEngine[];
    apiKey: string;
}

// NEW: Actions specifically for model alignment
export enum ModelAlignmentActionType {
  RetrainAgentModel = 'RetrainAgentModel',
  AdjustModelParameters = 'AdjustModelParameters',
  ImplementOutputMasking = 'ImplementOutputMasking',
  ResetAgentObjective = 'ResetAgentObjective',
  FlagForManualReview = 'FlagForManualReview',
}

export interface ModelAlignmentAction {
  type: ModelAlignmentActionType;
  targetAgentId: string;
  details: Record<string, any>; // e.g., { reason: "objective drift", newObjective: "..." }
}

// NEW: Actions the Dev Strategist can propose for governance (now includes ModelAlignmentActionType)
export type GovernanceActionType =
  | 'SetAgentGovernanceConfig'
  | 'ToggleRealtimeFeedback'
  | 'ResetAgentLifecycle'
  | 'SuspendAgent'
  | 'AdjustStrategyParameters'
  // Explicitly list all string literal values from ModelAlignmentActionType
  | 'RetrainAgentModel'
  | 'AdjustModelParameters'
  | 'ImplementOutputMasking'
  | 'ResetAgentObjective'
  | 'FlagForManualReview';

export interface GovernanceAction {
  type: GovernanceActionType;
  targetAgentId: string;
  details: Record<string, any>; // e.g., { config: { maxFailedAttemptsPerCycle: 5 } } or { enable: boolean }
}

// NEW: Structured result for Dev Strategist plan
export interface DevStrategistPlanResult {
  strategyPlan: string;
  efficiencyScore: number;
  updates: string[];
  proposedGovernanceActions?: GovernanceAction[]; // NEW: Optional field for governance actions
}

// NEW: Structured result for Agent Alignment Audit
export interface AgentAlignmentAuditResult {
  isAligned: boolean;
  alignmentScore: number; // 0-100
  deviationReason: string; // Detailed explanation if not aligned
  suggestedAlignmentActions: ModelAlignmentAction[]; // Dev Strategist can pick from these
}


// NEW: Moved from hooks/useAgentStore.tsx
export type Action =
    | { type: 'CREATE_AGENT'; payload: Agent }
    | { type: 'UPDATE_AGENT'; payload: Partial<Agent> & { _id: string; } }
    | { type: 'ADD_DEPLOYMENT'; payload: Deployment }
    | { type: 'ADD_WEBHOOK'; payload: Webhook }
    | { type: 'REGENERATE_API_KEY' }
    | { type: 'ADD_LOG'; payload: { agentId: string; log: Log } }
    | { type: 'UPDATE_DATA_COUNT'; payload: { agentId: string; count: number; triggerReEvolution?: boolean } }
    | { type: 'CONSUME_RESTART_SIMULATOR_FLAG'; payload: { _id: string } }
    | { type: 'APPLY_GOVERNANCE_ACTION'; payload: GovernanceAction }; // NEW: Action type for governance

// FIX: Declare AgentContext here
export interface AgentContextType { // Exported for use in other files
    state: AgentState;
    dispatch: Dispatch<Action>;
    forceStartCurrentStrategyStep: (agentId: string) => void; // Added new function to context
    getAgent: (id: string) => Agent | undefined; // Added getAgent to context for easier access
    // FIX: Removed `addLog` and `getAgent` parameters, now captured from outer scope.
    sendChatMessage: (agentId: string, message: string, context: FileContext[], addThinkingProcessLog: (step: string) => void) => Promise<Omit<PlaygroundMessage, 'sender'>>; // FIX: Add sendChatMessage to context type and added addThinkingProcessLog, removed allFeatureEngines parameter
}

// ADDED: Type for the possible return values of `executeFunctionCall`
export type FunctionCallResult =
  | { insights: string; recommendations: string[] }
  | { review: string; suggestions: string[] }
  | { testResults: string; failedTests: string[] }
  | { analysis: string; incidentId: string; recommendations: string[] }
  | { securityReport: string; minorFindings: string[]; recommendations: string[] }
  | { documentation: string; documentLink: string; sectionsGenerated: string[] }
  | { code: string; language: string; description: string }
  | { status: string; pipelineId: string; stage: string; details: string }
  | { status: string; resourceAllocation: Record<string, string>; nextMilestone: string; report: string }
  | { searchResults: string; relevantLinks: { title: string; url: string }[] }
  | { status: string; delegatedTasks: string[]; summary: string }
  | { report: string; findings: string[]; instructions: string[] }
  | DevStrategistPlanResult // NEW: Use the structured type for Dev Strategist plan
  | AgentAlignmentAuditResult // NEW: Add alignment audit result
  | { message: string; result: string }
  | { error: string };