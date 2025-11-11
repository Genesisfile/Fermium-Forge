import React, { createContext, useContext, ReactNode, useReducer } from 'react';
import {
  AgentState,
  AgentAction,
  AgentContextType,
  SystemEvent,
  SystemEventType,
  AgentStatus,
  Deployment,
} from '../types';

const initialState: AgentState = {
  agents: [],
  campaigns: [],
  systemEvents: [],
  chatHistories: {},
  agentBlueprints: [], // New for Phase 5
  alertConfigurations: [], // New for Phase 5
};

// Helper to create system events
const createSystemEvent = (type: SystemEventType, message: string): SystemEvent => ({
  id: `sys-evt-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
  type,
  message,
  timestamp: new Date().toISOString(),
});

const agentReducer = (state: AgentState, action: AgentAction): AgentState => {
  switch (action.type) {
    case 'ADD_AGENT': {
      const newAgent = action.payload;
      const newState = {
        ...state,
        agents: [...state.agents, newAgent],
        systemEvents: [...state.systemEvents, createSystemEvent('AGENT_CREATED', `Agent "${newAgent.name}" (ID: ${newAgent.id}) was created.`)],
      };
      return newState;
    }
    case 'UPDATE_AGENT_STATUS': {
      const { agentId, status } = action.payload;
      const agent = state.agents.find(a => a.id === agentId);
      if (!agent) return state;

      const message = `Agent "${agent.name}" status changed to ${status}.`;
      const newState = {
        ...state,
        agents: state.agents.map(a =>
          a.id === agentId ? { ...a, status } : a
        ),
        systemEvents: [...state.systemEvents, createSystemEvent('STATUS_CHANGE', message)],
      };
      return newState;
    }
    case 'ADD_CERTIFICATION_REPORT': {
      const { agentId, report } = action.payload;
      const agent = state.agents.find(a => a.id === agentId);
      if (!agent) return state;

      const message = `Certification report added for Agent "${agent.name}" (ID: ${agentId}).`;
      const newState = {
        ...state,
        agents: state.agents.map(a =>
          a.id === agentId ? { ...a, certificationReport: report } : a
        ),
        systemEvents: [...state.systemEvents, createSystemEvent('INFO', message)],
      };
      return newState;
    }
    case 'EVOLVE_AGENT': {
      const { agentId, newSpecifications, evolution } = action.payload;
      const agent = state.agents.find(a => a.id === agentId);
      if (!agent) return state;

      const message = `Agent "${agent.name}" evolved to version ${evolution.newVersion}. Rationale: ${evolution.rationale}`;
      const newState = {
        ...state,
        agents: state.agents.map(a =>
          a.id === agentId
            ? {
                ...a,
                version: evolution.newVersion,
                specifications: newSpecifications,
                evolutions: [...(a.evolutions || []), evolution],
                status: 'IDLE' as AgentStatus, // Reset status after evolution
              }
            : a
        ),
        systemEvents: [...state.systemEvents, createSystemEvent('AGENT_EVOLVED', message)],
      };
      return newState;
    }
    case 'CREATE_CAMPAIGN': {
      const newCampaign = action.payload;
      const message = `Campaign "${newCampaign.name}" (ID: ${newCampaign.id}) started with ${newCampaign.agentIds.length} agents.`;
      const newState = {
        ...state,
        campaigns: [...state.campaigns, newCampaign],
        systemEvents: [...state.systemEvents, createSystemEvent('CAMPAIGN_STARTED', message)],
      };
      return newState;
    }
    case 'UPDATE_CAMPAIGN_STATUS': {
      const { campaignId, status } = action.payload;
      const campaign = state.campaigns.find(c => c.id === campaignId);
      if (!campaign) return state;

      const message = `Campaign "${campaign.name}" status changed to ${status}.`;
      const eventType: SystemEventType = status === 'COMPLETED' ? 'CAMPAIGN_COMPLETED' : 'INFO';
      const newState = {
        ...state,
        campaigns: state.campaigns.map(c =>
          c.id === campaignId ? { ...c, status } : c
        ),
        systemEvents: [...state.systemEvents, createSystemEvent(eventType, message)],
      };
      return newState;
    }
    case 'ADD_CAMPAIGN_LOG': {
      const { campaignId, log } = action.payload;
      const newState = {
        ...state,
        campaigns: state.campaigns.map(c =>
          c.id === campaignId ? { ...c, logs: [...c.logs, log] } : c
        ),
      };
      return newState;
    }
    case 'ADD_SYSTEM_EVENT': {
      const { payload } = action;
      return {
        ...state,
        systemEvents: [...state.systemEvents, payload],
      };
    }
    case 'SET_CHAT_HISTORY': {
      const { agentId, messages } = action.payload;
      return {
        ...state,
        chatHistories: {
          ...state.chatHistories,
          [agentId]: messages,
        },
      };
    }
    case 'ADD_AGENT_BLUEPRINT': { // New Phase 5 action
      const newBlueprint = action.payload;
      const message = `Agent blueprint "${newBlueprint.name}" (ID: ${newBlueprint.id}) was added to the marketplace.`;
      const newState = {
        ...state,
        agentBlueprints: [...state.agentBlueprints, newBlueprint],
        systemEvents: [...state.systemEvents, createSystemEvent('INFO', message)],
      };
      return newState;
    }
    case 'ADD_DEPLOYMENT': { // New Phase 5 action
      const { agentId, deployment } = action.payload;
      const agent = state.agents.find(a => a.id === agentId);
      if (!agent) return state;

      const message = `Agent "${agent.name}" (v${deployment.agentVersion}) deployed to "${deployment.environment}" (ID: ${deployment.id}).`;
      const newState = {
        ...state,
        agents: state.agents.map(a =>
          a.id === agentId
            ? { ...a, deployments: [...(a.deployments || []), deployment] }
            : a
        ),
        systemEvents: [...state.systemEvents, createSystemEvent('AGENT_DEPLOYED', message)],
      };
      return newState;
    }
    case 'ADD_ALERT_CONFIGURATION': { // New Phase 5 action
      const newAlert = action.payload;
      const message = `New alert "${newAlert.name}" configured for metric "${newAlert.metric}" on agent "${newAlert.targetAgentName || 'all agents'}".`;
      const newState = {
        ...state,
        alertConfigurations: [...state.alertConfigurations, newAlert],
        systemEvents: [...state.systemEvents, createSystemEvent('ALERT_CONFIGURED', message)],
      };
      return newState;
    }
    default:
      // Ensure all possible actions are handled and prevent falling through
      // @ts-ignore: If a new action type is added and not handled, this will catch it.
      console.warn(`Unhandled action type: ${action.type}`, action);
      return state;
  }
};

const AgentContext = createContext<AgentContextType | undefined>(undefined);

export const AgentProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(agentReducer, initialState);

  return (
    <AgentContext.Provider value={{ state, dispatch }}>
      {children}
    </AgentContext.Provider>
  );
};

export const useAgentStore = (): AgentContextType => {
  const context = useContext(AgentContext);
  if (context === undefined) {
    throw new Error('useAgentStore must be used within an AgentProvider');
  }
  return context;
};