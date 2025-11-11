import { GoogleGenAI, Type } from "@google/genai";
import { Agent, AgentPerformanceData, AIAnalysis, DeploymentLog, SentinelAnalysis, AgentSpec, Campaign } from '../types';

export interface AgentDesign {
  name: string;
  description: string;
  specifications: {
    name: string;
    description: string;
  }[];
}

export interface EvolvedAgentData {
  newVersion: string;
  rationale: string;
  newSpecifications: AgentSpec[];
}

export async function generateAgentDesign(prompt: string): Promise<AgentDesign | null> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Design an AI agent based on the following goal: "${prompt}". Provide a name, a concise description, and a list of 3-5 core technical specifications for this agent. Ensure the output is valid JSON according to the provided schema.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING, description: "A concise name for the agent." },
            description: { type: Type.STRING, description: "A brief description of the agent's purpose." },
            specifications: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING, description: "Name of the specification (e.g., 'Real-time Data Processing')." },
                  description: { type: Type.STRING, description: "Detailed description of the specification." },
                },
                required: ["name", "description"],
              },
              description: "An array of 3-5 core technical specifications for the agent.",
            },
          },
          required: ["name", "description", "specifications"],
          propertyOrdering: ["name", "description", "specifications"],
        },
      },
    });

    const jsonStr = response.text.trim();
    return JSON.parse(jsonStr) as AgentDesign;
  } catch (error) {
    console.error("Error generating agent design:", error);
    throw new Error(`Failed to generate agent design: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export async function chatWithAgent(agent: Agent, userMessage: string): Promise<string | null> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

  try {
    const systemInstruction = `You are an AI agent named "${agent.name}" (version ${agent.version}). Your primary purpose is: ${agent.description}. Your core specifications include: ${agent.specifications.map(s => `${s.name}: ${s.description}`).join('; ')}. Respond concisely and in character.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: userMessage,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
        topP: 0.95,
        topK: 64,
      },
    });

    return response.text;
  } catch (error) {
    console.error("Error chatting with agent:", error);
    throw new Error(`Failed to chat with agent: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export async function certifyAgent(agent: Agent): Promise<string | null> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

  try {
    const prompt = `Generate a detailed certification report for the following AI agent...`;
    const response = await ai.models.generateContent({ model: "gemini-2.5-pro", contents: prompt });
    return response.text;
  } catch (error) {
    console.error("Error certifying agent:", error);
    throw new Error(`Failed to certify agent: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export async function evolveAgent(agent: Agent): Promise<EvolvedAgentData | null> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
  try {
    const prompt = `Given the following AI agent, propose an evolution...`;
    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            newVersion: { type: Type.STRING },
            rationale: { type: Type.STRING },
            newSpecifications: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, description: { type: Type.STRING } } } },
          },
          required: ["newVersion", "rationale", "newSpecifications"],
        },
      },
    });
    return JSON.parse(response.text) as EvolvedAgentData;
  } catch (error) {
    console.error("Error evolving agent:", error);
    throw new Error(`Failed to evolve agent: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export async function generateEvolutionProposal(agent: Agent, recommendationText: string): Promise<EvolvedAgentData | null> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
    try {
        const prompt = `Based on the following performance recommendation for an AI agent, propose a formal evolution.
Recommendation: "${recommendationText}"

Current Agent Details:
Name: ${agent.name}
Version: ${agent.version}
Description: ${agent.description}

Propose a new version number, a rationale linked to the recommendation, and 3-5 new/updated technical specifications to implement the change. Output as valid JSON.`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-pro",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        newVersion: { type: Type.STRING, description: "The new version number (e.g., '1.1.0')." },
                        rationale: { type: Type.STRING, description: "Rationale for the evolution based on the recommendation." },
                        newSpecifications: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: { name: { type: Type.STRING }, description: { type: Type.STRING } },
                                required: ["name", "description"],
                            },
                            description: "New/updated specifications.",
                        },
                    },
                    required: ["newVersion", "rationale", "newSpecifications"],
                },
            },
        });
        return JSON.parse(response.text.trim()) as EvolvedAgentData;
    } catch (error) {
        console.error("Error generating evolution proposal:", error);
        throw new Error(`Failed to generate evolution proposal: ${error instanceof Error ? error.message : String(error)}`);
    }
}

export async function generateCampaignLog(campaign: Campaign, agent: Agent): Promise<string | null> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
    try {
        const prompt = `Campaign Objective: "${campaign.objective}". Agent: "${agent.name}". Generate a brief, one-sentence progress update or action log entry for this agent within the campaign context.`;
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
        });
        return response.text;
    } catch (error) {
        console.error("Error generating campaign log:", error);
        return "Log generation failed due to an API error.";
    }
}

export async function generateAgentAnalysis(performanceData: AgentPerformanceData): Promise<AIAnalysis | null> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
  try {
    const prompt = `Analyze the following performance data for an AI agent...`;
    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            observations: { type: Type.ARRAY, items: { type: Type.STRING } },
            recommendations: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, description: { type: Type.STRING } } } },
          },
          required: ["observations", "recommendations"],
        },
      },
    });
    return JSON.parse(response.text) as AIAnalysis;
  } catch (error) {
    console.error("Error generating agent analysis:", error);
    throw new Error(`Failed to generate agent analysis: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export async function generateSentinelAnalysis(agentName: string, logs: DeploymentLog[]): Promise<SentinelAnalysis | null> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
  try {
    const formattedLogs = logs.map(log => `[${log.timestamp}] [${log.type}] ${log.message}`).join('\n');
    const prompt = `Perform a Sentinel analysis on the deployment logs for Agent "${agentName}"...`;
    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            rootCauseAnalysis: { type: Type.STRING },
            correctiveActions: { type: Type.ARRAY, items: { type: Type.STRING } },
            evolutionSuggestions: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
          required: ["rootCauseAnalysis", "correctiveActions", "evolutionSuggestions"],
        },
      },
    });
    return JSON.parse(response.text) as SentinelAnalysis;
  } catch (error) {
    console.error("Error generating Sentinel analysis:", error);
    throw new Error(`Failed to generate Sentinel analysis: ${error instanceof Error ? error.message : String(error)}`);
  }
}
