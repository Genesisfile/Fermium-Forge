import { useEffect, useRef, useCallback } from 'react';
import { useAgentStore } from '../context/AgentContext';
import { generateCampaignLog } from '../lib/gemini';
import { useToast } from '../context/ToastContext';
import { ApiKeyContext } from '../context/ApiKeyContext';
import React from 'react'; // Explicitly import React for useContext

// This interval controls how often campaign logs are generated (e.g., every 10 seconds for simulation)
const CAMPAIGN_LOG_INTERVAL_MS = 10000;

export const useCampaignEngine = () => {
  const { state, dispatch } = useAgentStore();
  const { showToast } = useToast();
  const { callGeminiApi } = React.useContext(ApiKeyContext); // Use React.useContext

  const intervalRef = useRef<number | null>(null);

  const processCampaigns = useCallback(async () => {
    const activeCampaigns = state.campaigns.filter(c => c.status === 'RUNNING');

    for (const campaign of activeCampaigns) {
      // Simulate agent activity within the campaign
      if (campaign.agentIds.length > 0) {
        // Pick one agent randomly to generate a log for this cycle
        const randomAgentId = campaign.agentIds[Math.floor(Math.random() * campaign.agentIds.length)];
        const agent = state.agents.find(a => a.id === randomAgentId);

        if (agent) {
          try {
            const logMessage = await callGeminiApi(() => generateCampaignLog(campaign, agent));
            if (logMessage) {
              dispatch({
                type: 'ADD_CAMPAIGN_LOG',
                payload: {
                  campaignId: campaign.id,
                  log: {
                    id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
                    agentId: agent.id,
                    agentName: agent.name,
                    timestamp: new Date().toISOString(),
                    message: logMessage,
                  },
                },
              });
            }
          } catch (error) {
            console.error(`Error generating log for campaign ${campaign.id}, agent ${agent.id}:`, error);
            // Optionally add an error log to the campaign
            dispatch({
              type: 'ADD_CAMPAIGN_LOG',
              payload: {
                campaignId: campaign.id,
                log: {
                  id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
                  agentId: agent.id,
                  agentName: agent.name,
                  timestamp: new Date().toISOString(),
                  message: `Error generating campaign log for agent ${agent.name}.`,
                },
              },
            });
            showToast(`Failed to generate campaign log for ${agent.name}.`, 'error');
          }
        }
      }

      // TODO: Add more complex campaign simulation logic here, e.g.,
      // - Randomly complete campaigns after some logs
      // - Introduce agent errors
      // - Trigger agent evolutions based on campaign performance
      // - Periodically check campaign objectives and transition status
      // For now, let's keep it simple with log generation.
    }
  }, [state.campaigns, state.agents, dispatch, callGeminiApi, showToast]);

  useEffect(() => {
    // Clear any existing interval to prevent duplicates
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Start a new interval if there are active campaigns
    const hasActiveCampaigns = state.campaigns.some(c => c.status === 'RUNNING');
    if (hasActiveCampaigns) {
      // Run immediately on mount/update, then every interval
      processCampaigns();
      intervalRef.current = window.setInterval(processCampaigns, CAMPAIGN_LOG_INTERVAL_MS);
    }

    // Cleanup on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [state.campaigns, processCampaigns]); // Re-run effect if campaigns change
};
