import { Dispatch, SetStateAction } from 'react';
import { FunctionCall } from '@google/genai';

// Type definition for window.aistudio to integrate with the platform's API key selection dialog.
declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }
  interface Window {
    aistudio?: AIStudio;
  }
}

// Main entity types
export type AgentStatus = 'IDLE' | 'TRAINING' | 'DEPLOYED' | 'ERROR' | 'CERTIFYING';
export type CampaignStatus = 'PLANNING' | 'RUNNING' | 'COMPLETED' | 'FAILED';
export type SystemEventType = 'AGENT_CREATED' | 'AGENT_EVOLVED' | 'CAMPAIGN_STARTED' | 'AGENT_DEPLOYED' | 'AGENT_ERROR' | 'CAMPAIGN_COMPLETED' | 'ALERT_CONFIGURED' | 'STATUS_CHANGE' | 'INFO'; // Added ALERT_CONFIGURED, STATUS_CHANGE, INFO

export interface AgentSpec {
  id: string;
  name: string;
  description: string;
}

export interface EvolutionEvent {
  newVersion: string;
  rationale: string;
  timestamp: string;
}

export interface DeploymentLog {
  id: string;
  timestamp: string;
  type: 'INFO' | 'ERROR' | 'SUCCESS';
  message: string;
}

export interface Deployment {
  id: string;
  agentVersion: string;
  environment: string; // e.g., 'Production', 'Staging', 'Development' - explicitly added
  status: DeploymentStatus;
  createdAt: string;
  lastHeartbeat: string;
  metrics: {
    tasksProcessed: number;
    errorRate: number;
  };
  logs: DeploymentLog[];
}

export type DeploymentStatus = 'ACTIVE' | 'DEGRADED' | 'OFFLINE';

export interface Agent {
  id: string;
  name: string;
  version: string;
  status: AgentStatus;
  description: string;
  createdAt: string;
  specifications: AgentSpec[];
  evolutions?: EvolutionEvent[];
  certificationReport?: string;
  deployments?: Deployment[]; // Updated to include deployments
}

export interface AgentBlueprint {
  id: string; // Unique ID for the blueprint itself
  name: string;
  description: string;
  specifications: AgentSpec[];
  evolutionHistory: EvolutionEvent[]; // Store past evolutions as part of the blueprint
  createdAt: string; // Timestamp of when the blueprint was created
}

export interface AIAnalysis {
    observations: string[];
    recommendations: {
        title: string;
        description: string;
    }[];
}

export interface SentinelAnalysis {
    rootCauseAnalysis: string;
    correctiveActions: string[];
    evolutionSuggestions: string[];
}

export interface AgentPerformanceData {
    overallScore: number;
    accuracy: { value: number; trend: 'up' | 'down' | 'stable' };
    latency: { value: number; trend: 'up' | 'down' | 'stable' };
    taskCompletionRate: number;
    recentActivity: { id: string; task: string; status: 'Success' | 'Failure'; timestamp: string }[];
}

export interface CampaignLog {
  id: string;
  agentId: string;
  agentName: string;
  timestamp: string;
  message: string;
}

export interface Campaign {
  id: string;
  name: string;
  objective: string;
  status: CampaignStatus;
  agentIds: string[];
  createdAt: string;
  logs: CampaignLog[];
}

export interface SystemEvent {
  id: string;
  type: SystemEventType;
  message: string;
  timestamp: string;
}

export interface AlertConfiguration {
  id: string;
  name: string;
  metric: 'Error Rate' | 'Latency' | 'Task Completion Rate' | 'Custom'; // Added 'Custom' for flexibility
  threshold: number;
  condition: '>' | '<' | '=';
  frequency: 'Every 5 min' | 'Every hour' | 'Daily';
  targetAgentId?: string; // Optional: specific agent to monitor
  targetAgentName?: string; // For display purposes
  createdAt: string;
}

export interface ChatMessage {
  sender: 'user' | 'agent';
  text: string;
}


// Context and State types
export interface AgentState {
  agents: Agent[];
  campaigns: Campaign[];
  systemEvents: SystemEvent[];
  chatHistories: { [agentId: string]: ChatMessage[] };
  agentBlueprints: AgentBlueprint[]; // New state slice for blueprints
  alertConfigurations: AlertConfiguration[]; // New state slice for alerts
}

export type AgentAction =
  | { type: 'ADD_AGENT'; payload: Agent }
  | { type: 'UPDATE_AGENT_STATUS'; payload: { agentId: string; status: AgentStatus } }
  | { type: 'ADD_CERTIFICATION_REPORT'; payload: { agentId: string; report: string } }
  | { type: 'EVOLVE_AGENT'; payload: { agentId: string; newSpecifications: AgentSpec[]; evolution: EvolutionEvent } }
  | { type: 'CREATE_CAMPAIGN'; payload: Campaign }
  | { type: 'UPDATE_CAMPAIGN_STATUS'; payload: { campaignId: string; status: CampaignStatus } }
  | { type: 'ADD_CAMPAIGN_LOG'; payload: { campaignId: string; log: CampaignLog } }
  | { type: 'ADD_SYSTEM_EVENT'; payload: SystemEvent }
  | { type: 'SET_CHAT_HISTORY'; payload: { agentId: string; messages: ChatMessage[] } }
  | { type: 'ADD_AGENT_BLUEPRINT'; payload: AgentBlueprint } // New action for creating blueprints
  | { type: 'ADD_DEPLOYMENT'; payload: { agentId: string; deployment: Deployment } } // New action to add a deployment
  | { type: 'ADD_ALERT_CONFIGURATION'; payload: AlertConfiguration }; // New action to add an alert

export interface AgentContextType {
  state: AgentState;
  dispatch: Dispatch<AgentAction>;
}

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastState {
  message: string;
  type: ToastType;
  visible: boolean;
}

export interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
  hideToast: () => void;
  toast: ToastState;
}

export interface ApiKeyContextType {
  hasApiKey: boolean;
  isApiKeyLoading: boolean;
  selectApiKey: () => Promise<void>;
  callGeminiApi: <T>(apiCall: () => Promise<T>) => Promise<T | null>;
}