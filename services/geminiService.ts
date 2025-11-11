// CODE REVIEWED: All 'const' declarations checked and appear correctly initialized.

import { GoogleGenAI, Type, FunctionDeclaration, ToolCall } from "@google/genai";
// FIX: Imported AgentGovernanceConfig, GovernanceAction, DevStrategistPlanResult, ModelAlignmentActionType, AgentAlignmentAuditResult, ModelAlignmentAction
import { Agent, PlaygroundMessage, ResearchStep, AgentType, FileContext, ModelPreferenceType, FeatureEngine, Log, FunctionCallResult, AgentGovernanceConfig, GovernanceAction, DevStrategistPlanResult, ModelAlignmentActionType, AgentAlignmentAuditResult, ModelAlignmentAction, Action } from "../types";
import { generateId, fileToBase64 } from "../utils/helpers"; // Assuming generateId is available
// FIX: Explicitly import getDevTeamAgentCallableTools to ensure correct type resolution.
import { initialStrategies, CAPABILITY_PREFIX, getDevTeamAgentCallableTools, DEV_STRATEGIST_SYSTEM_INSTRUCTION } from "../utils/constants";

// The API key is injected at runtime, so we create the AI instance when needed.

// Helper function to map FeatureEngine to FunctionDeclaration
const getFunctionDeclarationForEngine = (engine: FeatureEngine): FunctionDeclaration | null => {
  // Logic to dynamically create FunctionDeclaration based on engine._id
  // This is a simplified example; a real implementation would have more detailed schema definitions.
  switch (engine._id) {
    case CAPABILITY_PREFIX + 'googleSearch':
      return {
        name: 'googleSearch',
        description: 'Searches Google for up-to-date information and returns relevant snippets and URLs.',
        parameters: {
          type: Type.OBJECT,
          properties: {
            query: { type: Type.STRING, description: 'The search query.' },
          },
          required: ['query'],
        },
      };
    case CAPABILITY_PREFIX + 'helios_architect_insights':
      return {
        name: 'heliosArchitectInsights',
        description: 'Provides architectural insights for platform scalability and design based on a specific query.',
        parameters: {
          type: Type.OBJECT,
          properties: {
            query: { type: Type.STRING, description: 'Architectural topic or problem to get insights on.' },
            systemContext: { type: Type.STRING, description: 'Optional context about the system, e.g., current architecture or constraints.' },
          },
          required: ['query'],
        },
      };
    case CAPABILITY_PREFIX + 'coda_code_review':
      return {
        name: 'codaCodeReview',
        description: 'Performs automated code reviews, ensures dependency integrity, and manages build configurations.',
        parameters: {
          type: Type.OBJECT,
          properties: {
            code: { type: Type.STRING, description: 'The code snippet or file content to review.' },
            context: { type: Type.STRING, description: 'Optional context like programming language or project standards.' },
          },
          required: ['code'],
        },
      };
    case CAPABILITY_PREFIX + 'janus_qa_testing':
      return {
        name: 'janusQaTesting',
        description: 'Executes comprehensive test suites (unit, integration, E2E) and validates performance.',
        parameters: {
          type: Type.OBJECT,
          properties: {
            testSuite: { type: Type.STRING, description: 'Name or description of the test suite to run.' },
            agentTargetId: { type: Type.STRING, description: 'ID of the agent to test.' },
          },
          required: ['testSuite', 'agentTargetId'],
        },
      };
    case CAPABILITY_PREFIX + 'chronos_diagnostics_analysis':
      return {
        name: 'chronosDiagnosticsAnalysis',
        description: 'Analyzes platform activity logs for anomalies, performance bottlenecks, and state changes.',
        parameters: {
          type: Type.OBJECT,
          properties: {
            timeframe: { type: Type.STRING, description: 'Timeframe for analysis (e.g., "last hour", "today").' },
            focusArea: { type: Type.STRING, description: 'Specific area to focus diagnostics on (e.g., "agent_performance", "system_health").' },
          },
          required: ['timeframe', 'focusArea'],
        },
      };
    case CAPABILITY_PREFIX + 'sentinel_security_audit':
      return {
        name: 'sentinelSecurityAudit',
        description: 'Performs automated security audits, vulnerability scans, and compliance checks.',
        parameters: {
          type: Type.OBJECT,
          properties: {
            target: { type: Type.STRING, description: 'The system or agent to audit.' },
            auditType: { type: Type.STRING, description: 'Type of audit (e.g., "vulnerability", "compliance").' },
          },
          required: ['target'],
        },
      };
    case CAPABILITY_PREFIX + 'atlas_documentation':
      return {
        name: 'atlasDocumentation',
        description: 'Generates and updates technical documentation, API references, and user guides.',
        parameters: {
          type: Type.OBJECT,
          properties: {
            topic: { type: Type.STRING, description: 'Topic for which to generate documentation.' },
            format: { type: Type.STRING, description: 'Desired output format (e.g., "markdown", "html").' },
          },
          required: ['topic'],
        },
      };
    case CAPABILITY_PREFIX + 'synthesis_code_generation':
      return {
        name: 'synthesisCodeGeneration',
        description: 'Generates robust and optimized code snippets or modules based on specifications.',
        parameters: {
          type: Type.OBJECT,
          properties: {
            prompt: { type: Type.STRING, description: 'The code generation prompt or requirements.' },
            language: { type: Type.STRING, description: 'Programming language (e.g., "Python", "JavaScript").' },
          },
          required: ['prompt', 'language'],
        },
      };
    case CAPABILITY_PREFIX + 'release_orchestration':
      return {
        name: 'releaseOrchestration',
        description: 'Automates CI/CD pipelines, environment provisioning, and deployment processes.',
        parameters: {
          type: Type.OBJECT,
          properties: {
            pipelineName: { type: Type.STRING, description: 'Name of the CI/CD pipeline to trigger.' },
            environment: { type: Type.STRING, description: 'Target deployment environment (e.g., "staging", "production").' },
          },
          required: ['pipelineName', 'environment'],
        },
      };
    case CAPABILITY_PREFIX + 'project_management':
      return {
        name: 'projectManagement',
        description: 'Monitors project progress, identifies bottlenecks, allocates resources, and provides status updates.',
        parameters: {
          type: Type.OBJECT,
          properties: {
            action: { type: Type.STRING, description: 'Action to perform (e.g., "get_status", "allocate_resources").' },
            details: { type: Type.STRING, description: 'Specific details for the action.' },
          },
          required: ['action'],
        },
      };
    case CAPABILITY_PREFIX + 'nexus_orchestrator_orchestrate':
      return {
        name: 'nexusOrchestratorOrchestrate',
        description: 'Delegates complex tasks to other specialized agents for end-to-end workflow management.',
        parameters: {
          type: Type.OBJECT,
          properties: {
            task: { type: Type.STRING, description: 'The complex task to be orchestrated.' },
            context: { type: Type.STRING, description: 'Additional context or data for the task.' },
          },
          required: ['task'],
        },
      };
    case CAPABILITY_PREFIX + 'project_guardian_analysis':
      return {
        name: 'projectGuardianAnalysis',
        description: 'Assesses code and project files, providing analysis, feedback, and actionable improvement instructions.',
        parameters: {
          type: Type.OBJECT,
          properties: {
            projectFiles: { type: Type.STRING, description: 'Summary or content of project files to analyze.' },
            focus: { type: Type.STRING, description: 'Specific area of focus (e.g., "code_quality", "architecture", "security").' },
          },
          required: ['projectFiles'],
        },
      };
    case CAPABILITY_PREFIX + 'dev_strategist_plan':
      return {
        name: 'devStrategistPlan',
        description: 'Generates a comprehensive development strategy plan based on system analysis, logs, and past developments.',
        parameters: {
          type: Type.OBJECT,
          properties: {
            currentSystemStatus: { type: Type.STRING, description: 'Summary of current system health and performance (e.g., from Chronos Diagnostics).' },
            recentDevelopments: { type: Type.STRING, description: 'Summary of recent agent updates or feature deployments.' },
            pastStrategyEffectiveness: { type: Type.STRING, description: 'Insights on how previous development strategies performed.' },
            focusAreas: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'Key areas to focus the strategy on (e.g., "scalability", "cost_reduction", "agent_alignment").' },
          },
          required: ['currentSystemStatus', 'recentDevelopments', 'pastStrategyEffectiveness'],
        },
      };
    case CAPABILITY_PREFIX + 'agent_alignment_audit':
      return {
        name: 'agentAlignmentAudit',
        description: 'Performs a deep audit of a target agent\'s alignment with its objective and governance rules to detect and correct alignment drift or emergent misbehavior.',
        parameters: {
          type: Type.OBJECT,
          properties: {
            targetAgentId: { type: Type.STRING, description: 'The ID of the agent to audit for alignment.' },
            auditScope: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'Specific aspects to audit (e.g., "objective_drift", "bias_detection", "governance_compliance").' },
            recentLogsSummary: { type: Type.STRING, description: 'Summary of recent logs and interactions for the target agent.' },
          },
          required: ['targetAgentId', 'recentLogsSummary'],
        },
      };
    default:
      return null;
  }
};

// Mock function execution for capabilities
const executeFunctionCall = async (toolCall: ToolCall, allAgents: Agent[], dispatch: (action: Action) => void, addThinkingProcessLog: (step: string) => void): Promise<FunctionCallResult> => {
  addThinkingProcessLog(`Executing tool: ${toolCall.name} with args: ${JSON.stringify(toolCall.args)}`);

  switch (toolCall.name) {
    case 'googleSearch':
      // Simulate Google Search results
      const searchQuery = toolCall.args.query as string;
      addThinkingProcessLog(`Searching Google for "${searchQuery}"...`);
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate delay
      return {
        searchResults: `Found relevant information for "${searchQuery}". Key snippets include...`,
        relevantLinks: [
          { title: `Result 1 for ${searchQuery}`, url: `https://example.com/search1?q=${encodeURIComponent(searchQuery)}` },
          { title: `Result 2 for ${searchQuery}`, url: `https://example.com/search2?q=${encodeURIComponent(searchQuery)}` },
        ],
      };
    case 'heliosArchitectInsights':
      await new Promise(resolve => setTimeout(resolve, 1500));
      return { insights: `Architectural insights for "${toolCall.args.query}": Consider modular microservices and event-driven architecture for scalability.`, recommendations: ['Implement service mesh', 'Evaluate serverless options'] };
    case 'codaCodeReview':
      await new Promise(resolve => setTimeout(resolve, 2000));
      return { review: `Code review for provided snippet in ${toolCall.args.context || 'general context'}: Identified potential N+1 query issue and missing error handling.`, suggestions: ['Add try-catch blocks', 'Optimize database queries'] };
    case 'janusQaTesting':
      await new Promise(resolve => setTimeout(resolve, 2500));
      return { testResults: `Successfully ran ${toolCall.args.testSuite} on agent ${toolCall.args.agentTargetId}. 98% pass rate.`, failedTests: ['Authentication flow broken'] };
    case 'chronosDiagnosticsAnalysis':
      await new Promise(resolve => setTimeout(resolve, 1800));
      return { analysis: `Diagnostics for ${toolCall.args.focusArea} in ${toolCall.args.timeframe}: Detected a 5% latency spike in Agent X during peak hours. Incident ID: CHRONOS-20240315-001.`, incidentId: 'CHRONOS-20240315-001', recommendations: ['Scale up Agent X instances', 'Optimize database connection pool'] };
    case 'sentinelSecurityAudit':
      await new Promise(resolve => setTimeout(resolve, 2200));
      return { securityReport: `Security audit on ${toolCall.args.target} for ${toolCall.args.auditType}: No major vulnerabilities found. Minor findings include outdated dependency in module Y.`, minorFindings: ['Outdated dependency Y'], recommendations: ['Update module Y', 'Enable automated dependency scans'] };
    case 'atlasDocumentation':
      await new Promise(resolve => setTimeout(resolve, 1700));
      return { documentation: `Generated documentation for "${toolCall.args.topic}" in ${toolCall.args.format || 'default'} format.`, documentLink: `https://docs.fermiumforge.com/${toolCall.args.topic.replace(/\s+/g, '-')}`, sectionsGenerated: ['Introduction', 'API Reference', 'Usage Examples'] };
    case 'synthesisCodeGeneration':
      await new Promise(resolve => setTimeout(resolve, 1500));
      const generatedCode = `
\`\`\`${toolCall.args.language}
// Generated code for: ${toolCall.args.prompt}
function exampleFunction() {
  // Your logic here
  return "Hello from generated code!";
}
\`\`\`
`;
      return { code: generatedCode, language: toolCall.args.language as string, description: `Code generated for: ${toolCall.args.prompt}` };
    case 'releaseOrchestration':
      await new Promise(resolve => setTimeout(resolve, 2000));
      return { status: 'Pipeline initiated', pipelineId: 'REL-456', stage: 'Deployment', details: `CI/CD pipeline '${toolCall.args.pipelineName}' triggered for environment '${toolCall.args.environment}'.` };
    case 'projectManagement':
      await new Promise(resolve => setTimeout(resolve, 1000));
      return { status: 'Resource allocation updated', resourceAllocation: { developer: 'John Doe', qa: 'Jane Smith' }, nextMilestone: 'Feature X complete', report: `Project status is green. Resources reallocated for task: ${toolCall.args.details}.` };
    case 'nexusOrchestratorOrchestrate':
      addThinkingProcessLog(`Orchestrating complex task: ${toolCall.args.task}...`);
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate delegation delay
      // In a real system, this would trigger other agents. For simulation, just confirm.
      return { status: 'Delegated', delegatedTasks: ['Task A to Agent X', 'Task B to Agent Y'], summary: `Task "${toolCall.args.task}" successfully broken down and delegated.` };
    case 'projectGuardianAnalysis':
      addThinkingProcessLog(`Performing deep analysis on project files for focus: ${toolCall.args.focus || 'general quality'}...`);
      await new Promise(resolve => setTimeout(resolve, 2500));
      return { report: `Project file analysis complete. Found several areas for improvement in ${toolCall.args.focus || 'code quality'}.`, findings: ['High cyclomatic complexity in module Z', 'Lack of consistent error handling'], instructions: ['Refactor module Z to reduce complexity', 'Implement a global error handling strategy'] };
    case 'devStrategistPlan':
      addThinkingProcessLog(`Formulating development strategy plan based on system status...`);
      await new Promise(resolve => setTimeout(resolve, 3000));
      // Example structured output for DevStrategistPlanResult
      const proposedActions: GovernanceAction[] = [];

      // Simulate some governance actions if certain conditions were met (e.g. from currentSystemStatus)
      if (toolCall.args.currentSystemStatus?.includes('latency spike')) {
        proposedActions.push({
          type: 'SetAgentGovernanceConfig',
          targetAgentId: 'agent_market_pulse', // Example target
          details: { config: { rateLimitPerMinute: 180 }, reason: 'Adjusting rate limit due to observed latency spike.' }
        });
      }
      if (toolCall.args.recentDevelopments?.includes('frequent errors')) {
        proposedActions.push({
          type: ModelAlignmentActionType.FlagForManualReview, // Use enum value here
          targetAgentId: 'agent_knowledge_synth', // Example target
          details: { reason: 'Frequent errors detected post-deployment, requires manual intervention.' }
        });
      }
      if (toolCall.args.pastStrategyEffectiveness?.includes('objective drift')) {
        proposedActions.push({
          type: ModelAlignmentActionType.RetrainAgentModel, // Use enum value here
          targetAgentId: 'agent_brand_strategist',
          details: { reason: 'Detected objective drift towards generating overly abstract content.' }
        });
        proposedActions.push({
          type: ModelAlignmentActionType.AdjustModelParameters, // Use enum value here
          targetAgentId: 'agent_brand_strategist',
          details: { parameter: 'temperature', value: 0.7, reason: 'Increase creativity while retraining.' }
        });
      }


      return {
        strategyPlan: `Based on the current system status, recent developments, and past strategy effectiveness, here is the refined development strategy:\n\n**Identified Issues:**\n- Latency spikes in core agent services.\n- Potential objective drift in creative agents.\n- Suboptimal resource utilization.\n\n**Root Causes:**\n- Insufficient rate limiting during peak loads.\n- Lack of continuous alignment auditing.\n- Static resource allocation.\n\n**Proposed Self-Healing, Governance & Model Alignment Actions:**\n- Implement dynamic rate limiting for high-traffic agents. (See proposed governance actions)\n- Initiate agent alignment audits quarterly for all production agents. (See proposed model alignment actions)\n- Develop an auto-scaling module for agent instances.`,
        efficiencyScore: 8.9,
        updates: ['Refined rate limiting protocols', 'Scheduled agent alignment audits'],
        proposedGovernanceActions: proposedActions.length > 0 ? proposedActions : undefined,
      };
    case 'agentAlignmentAudit':
      addThinkingProcessLog(`Performing alignment audit for agent ${toolCall.args.targetAgentId}...`);
      await new Promise(resolve => setTimeout(resolve, 2500));
      const isAligned = Math.random() > 0.3; // Simulate 70% chance of being aligned
      const alignmentScore = isAligned ? Math.floor(Math.random() * 20) + 80 : Math.floor(Math.random() * 30) + 30; // 30-60 if not aligned
      const deviationReason = isAligned ? 'N/A' : 'Detected a subtle drift from core objective, leading to verbose and occasionally off-topic responses. Possible emergent bias towards certain phrasing styles.';
      const suggestedAlignmentActions: ModelAlignmentAction[] = [];

      if (!isAligned) {
        suggestedAlignmentActions.push({
          type: ModelAlignmentActionType.RetrainAgentModel,
          targetAgentId: toolCall.args.targetAgentId as string,
          details: { reason: 'To correct objective drift and emergent bias.' }
        });
        if (alignmentScore < 50) {
          suggestedAlignmentActions.push({
            type: ModelAlignmentActionType.ResetAgentObjective,
            targetAgentId: toolCall.args.targetAgentId as string,
            details: { newObjective: 'Recalibrate objective based on initial intent.', reason: 'Severe objective drift detected.' }
          });
        }
      }

      return {
        isAligned: isAligned,
        alignmentScore: alignmentScore,
        deviationReason: deviationReason,
        suggestedAlignmentActions: suggestedAlignmentActions,
      };
    default:
      return { error: `Unknown function: ${toolCall.name}` };
  }
};

/**
 * Generates a chat response from the Gemini model, potentially using integrated tools.
 * @param agentId The ID of the agent to chat with.
 * @param userMessage The user's message.
 * @param fileContext Optional file context (e.g., image).
 * @param allAgents All agents in the system for context.
 * @param allFeatureEngines All available feature engines for tool mapping.
 * @param dispatch Dispatch function from useAgentStore to add logs.
 * @param addThinkingProcessLog Callback to log thinking steps in the UI.
 * @returns A promise that resolves with the PlaygroundMessage response.
 */
// FIX: Export getAgentChatResponse
export const getAgentChatResponse = async (
  agentId: string,
  userMessage: string,
  fileContext: FileContext[],
  allAgents: Agent[],
  allFeatureEngines: FeatureEngine[], // This is the argument that might be undefined
  dispatch: (action: Action) => void,
  addThinkingProcessLog: (step: string) => void,
): Promise<Omit<PlaygroundMessage, 'sender'>> => {
  addThinkingProcessLog('Initializing AI model...');
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  // Defensive check for allFeatureEngines
  if (!Array.isArray(allFeatureEngines)) {
    console.error("getAgentChatResponse: allFeatureEngines is not an array, received:", allFeatureEngines);
    return {
      text: 'An internal error occurred: Feature engines data is corrupted.',
      isError: true,
      usedModelType: 'DefaultGemini',
    };
  }


  const agent = allAgents.find((a) => a._id === agentId);
  if (!agent) {
    throw new Error('Agent not found.');
  }

  let modelName = 'gemini-2.5-flash'; // Default for basic tasks
  let usedModelType: ModelPreferenceType | 'DefaultGemini' | 'ClientSide' = 'DefaultGemini';
  // Determine model based on agent type for initial model selection (before model routing or external config)
  if (agent.type === 'Analytical' || agent.type === 'Strategist') {
    modelName = 'gemini-2.5-pro'; // More complex models for analytical/strategist tasks
    usedModelType = ModelPreferenceType.GeminiPro;
  } else if (agent.type === 'Creative') {
    modelName = 'gemini-2.5-flash'; // Often good for creative tasks
    usedModelType = ModelPreferenceType.GeminiFlash;
  } else if (agent.type === 'ClientSide') {
    // Client-side agents typically rely on custom logic, not LLM for main response.
    // For now, if no tools, they might still use a default LLM.
    usedModelType = ModelPreferenceType.ClientSide;
  }

  if (agent.externalModelConfig) {
    // In a real scenario, this would involve calling the external model API
    // For this simulation, we'll indicate it's an external model but still use Gemini internally
    usedModelType = ModelPreferenceType.External;
    // modelName would technically be the external service endpoint, but for Gemini SDK usage,
    // we fallback to Gemini model for content generation if no actual external call is made here.
  }

  // Determine system instruction based on agent type or specific agent (e.g., Dev Strategist)
  let systemInstruction = `You are an AI agent named ${agent.name}. Your objective is: "${agent.objective}". Provide concise and helpful responses.`;
  if (agent.type === 'Strategist' && agent.name === 'Dev Strategist') {
    systemInstruction = DEV_STRATEGIST_SYSTEM_INSTRUCTION;
  }

  const tools: FunctionDeclaration[] = [];
  const integratedCapabilityEngines = allFeatureEngines.filter(
    (fe) => agent.integratedEngineIds?.includes(fe._id) && fe._id.startsWith(CAPABILITY_PREFIX)
  );

  addThinkingProcessLog(`Identifying integrated capabilities (${integratedCapabilityEngines.length} found)...`);

  integratedCapabilityEngines.forEach((engine) => {
    const fn = getFunctionDeclarationForEngine(engine);
    if (fn) {
      tools.push(fn);
      addThinkingProcessLog(`Found tool: ${fn.name}`);
    }
  });

  const contents: { parts: any[] } = { parts: [{ text: userMessage }] };

  if (fileContext.length > 0) {
    addThinkingProcessLog(`Attaching file: ${fileContext[0].name}...`);
    contents.parts.push({
      inlineData: {
        mimeType: fileContext[0].mimeType,
        data: fileContext[0].data,
      },
    });
  }

  let response: Omit<PlaygroundMessage, 'sender'>;
  let textOutput = '';
  let groundingUrls: { uri: string; title: string }[] | undefined = undefined;
  let activatedEngineId: string | undefined = undefined;
  let proposedGovernanceActions: GovernanceAction[] | undefined = undefined;

  try {
    const geminiResponse = await ai.models.generateContent({
      model: modelName,
      contents: contents,
      config: {
        systemInstruction: systemInstruction,
        tools: tools.length > 0 ? [{ functionDeclarations: tools }] : undefined,
      },
    });

    addThinkingProcessLog('Model responded. Processing...');

    if (geminiResponse.functionCalls && geminiResponse.functionCalls.length > 0) {
      const toolCall = geminiResponse.functionCalls[0];
      activatedEngineId = toolCall.name; // Indicate which tool was called
      addThinkingProcessLog(`Model called tool: ${toolCall.name}. Executing...`);

      const toolResult = await executeFunctionCall(toolCall, allAgents, dispatch, addThinkingProcessLog);

      // Use a type guard to safely check for the 'error' property
      if ('error' in toolResult && toolResult.error) {
        textOutput = `Error executing tool '${toolCall.name}': ${toolResult.error}`;
        // Fix: Remove 'sender' property as it's excluded by Omit<PlaygroundMessage, 'sender'>
        response = {
          text: textOutput,
          isError: true,
          activatedEngineId,
          usedModelType,
        };
        return response;
      }

      addThinkingProcessLog(`Tool '${toolCall.name}' execution complete. Sending result back to model...`);

      // Send the tool response back to the model for a natural language summary
      const followUpResponse = await ai.models.generateContent({
        model: modelName,
        contents: [
          contents, // Original conversation context
          {
            parts: [{
              functionResponse: {
                name: toolCall.name,
                response: toolResult,
              },
            }],
          },
        ],
        config: {
          systemInstruction: systemInstruction,
          // Do not include tools in the follow-up, as the model should now summarize the result
        },
      });

      textOutput = followUpResponse.text || `Tool '${toolCall.name}' executed. Result: ${JSON.stringify(toolResult)}`;

      // Special handling for devStrategistPlan result
      if (toolCall.name === 'devStrategistPlan') {
        const devPlanResult = toolResult as DevStrategistPlanResult;
        textOutput = devPlanResult.strategyPlan;
        if (devPlanResult.proposedGovernanceActions) {
          proposedGovernanceActions = devPlanResult.proposedGovernanceActions;
        }
      } else if (toolCall.name === 'agentAlignmentAudit') {
        const auditResult = toolResult as AgentAlignmentAuditResult;
        textOutput = `Agent Alignment Audit for ${toolCall.args.targetAgentId}:\n\nIs Aligned: ${auditResult.isAligned ? 'Yes' : 'No'}\nAlignment Score: ${auditResult.alignmentScore}%\nDeviation Reason: ${auditResult.deviationReason}\nSuggested Actions: ${auditResult.suggestedAlignmentActions.map(a => `${a.type} for ${a.targetAgentId} (Reason: ${a.details.reason})`).join(', ')}`;
        if (auditResult.suggestedAlignmentActions.length > 0) {
          proposedGovernanceActions = auditResult.suggestedAlignmentActions.map(action => ({
            type: action.type,
            targetAgentId: action.targetAgentId,
            details: action.details
          }));
        }
      }

    } else {
      textOutput = geminiResponse.text;
    }

    // Extract grounding URLs if available (e.g., from Google Search tool)
    if (geminiResponse.candidates?.[0]?.groundingMetadata?.groundingChunks) {
      groundingUrls = geminiResponse.candidates[0].groundingMetadata.groundingChunks
        .filter((chunk: any) => chunk.web?.uri)
        .map((chunk: any) => ({ uri: chunk.web.uri, title: chunk.web.title || chunk.web.uri }));
      if (groundingUrls.length > 0) {
        addThinkingProcessLog(`Found ${groundingUrls.length} grounding sources.`);
      }
    }

    // Fix: Remove 'sender' property as it's excluded by Omit<PlaygroundMessage, 'sender'>
    response = {
      text: textOutput,
      groundingUrls: groundingUrls,
      activatedEngineId: activatedEngineId,
      usedModelType: usedModelType,
      proposedGovernanceActions: proposedGovernanceActions,
    };
  } catch (error: any) {
    console.error('Gemini API Error:', error);
    addThinkingProcessLog(`ERROR: Gemini API call failed: ${error.message || error.toString()}`);
    // Fix: Remove 'sender' property as it's excluded by Omit<PlaygroundMessage, 'sender'>
    response = {
      text: `An error occurred while communicating with the AI. Please try again. Details: ${error.message || error.toString()}`,
      isError: true,
      activatedEngineId: activatedEngineId,
      usedModelType: usedModelType,
    };
  }
  return response;
};

/**
 * Generates an AI-assisted design for a new agent based on a concept.
 * @param concept The user's concept for the agent.
 * @param allFeatureEngines All available feature engines for recommendations.
 * @param addLog Function to add logs to the system.
 * @returns A promise that resolves with the agent design.
 */
// FIX: Export getAiAssistedDesign
export const getAiAssistedDesign = async (
  concept: string,
  allFeatureEngines: FeatureEngine[],
  addLog: (agentId: string, stage: Log['stage'], message: string) => void
): Promise<{
  name: string;
  objective: string;
  type: AgentType;
  recommendedStrategyId: string;
  recommendedEngineIds: string[];
  recommendRealtimeFeedback: boolean;
}> => {
  addLog('system', 'Info', `Generating AI-assisted design for concept: "${concept}"`);
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  // Defensive check for allFeatureEngines
  if (!Array.isArray(allFeatureEngines)) {
    console.error("getAiAssistedDesign: allFeatureEngines is not an array, received:", allFeatureEngines);
    addLog('system', 'Diagnostics', `ERROR: Failed to generate AI-assisted design due to corrupted feature engines data.`);
    throw new Error('Failed to generate AI-assisted design: Feature engines data is corrupted.');
  }

  const featureEngineList = allFeatureEngines
    .map((fe) => `*   ${fe.name} (ID: ${fe._id}): ${fe.description}`)
    .join('\n');

  const strategyList = initialStrategies
    .map((s) => `*   ${s.name} (ID: ${s._id}): ${s.description}`)
    .join('\n');

  const prompt = `You are an AI Strategist. Your task is to analyze a user's concept for a new AI agent and generate a comprehensive operational blueprint.
  
Based on the following concept, provide:
1.  A concise, evocative name for the agent.
2.  A clear and focused mission objective.
3.  The most suitable AgentType ('Standard', 'Creative', 'Analytical', 'ClientSide', 'Strategist').
4.  The ID of the most appropriate lifecycle strategy from the available strategies.
5.  An array of IDs for recommended Feature Engines (capabilities) from the provided list that are most relevant to the agent's objective.
6.  A boolean indicating whether real-time feedback for auto-evolution is recommended for this agent.

Consider the following available resources:

**Available Agent Types:**
- 'Standard': Balanced for general-purpose tasks.
- 'Creative': Optimized for generating novel content, ideas, and narratives.
- 'Analytical': Optimized for data analysis, problem-solving, and structured output.
- 'ClientSide': For agents designed to run client-side logic or act as orchestrators for other agents without heavy LLM processing.
- 'Strategist': Specialized in high-level planning, continuous analysis, and formulating strategies.

**Available Lifecycle Strategies:**
${strategyList}

**Available Feature Engines (Capabilities):**
${featureEngineList}

Ensure your output is a valid JSON object matching the following TypeScript interface, with no additional text or markdown formatting around it:

\`\`\`typescript
interface AgentDesign {
  name: string;
  objective: string;
  type: 'Standard' | 'Creative' | 'Analytical' | 'ClientSide' | 'Strategist';
  recommendedStrategyId: string;
  recommendedEngineIds: string[];
  recommendRealtimeFeedback: boolean;
}
\`\`\`

User's Agent Concept:
"${concept}"
`;

  try {
    const geminiResponse = await ai.models.generateContent({
      model: 'gemini-2.5-pro', // Use a more capable model for strategic design
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            objective: { type: Type.STRING },
            type: {
              type: Type.STRING,
              enum: ['Standard', 'Creative', 'Analytical', 'ClientSide', 'Strategist'],
            },
            recommendedStrategyId: { type: Type.STRING },
            recommendedEngineIds: { type: Type.ARRAY, items: { type: Type.STRING } },
            recommendRealtimeFeedback: { type: Type.BOOLEAN },
          },
          required: [
            'name',
            'objective',
            'type',
            'recommendedStrategyId',
            'recommendedEngineIds',
            'recommendRealtimeFeedback',
          ],
        },
        temperature: 0.7, // Allow for some creativity in naming and recommendations
        topP: 0.95,
        topK: 64,
      },
    });

    const jsonResponse = JSON.parse(geminiResponse.text.trim());
    addLog('system', 'Info', `AI-assisted design generated successfully for "${concept}".`);
    return jsonResponse;
  } catch (error: any) {
    console.error('Error generating AI-assisted design:', error);
    addLog('system', 'Diagnostics', `ERROR: Failed to generate AI-assisted design: ${error.message || error.toString()}`);
    throw new Error(`Failed to generate AI-assisted design: ${error.message || error.toString()}`);
  }
};