import type { Strategy, FeatureEngine } from '../types';


export const initialStrategies: Strategy[] = [
    {
        _id: 'strat_standard_dev',
        name: 'Standard Development Lifecycle',
        description: 'A balanced approach for general-purpose agents, focusing on robust evolution and certification before deployment.',
        steps: [
            { type: 'IngestData', config: { dataPoints: 100 } },
            { type: 'Evolve', config: { generations: 5000 } },
            { type: 'Certify' },
            { type: 'Deploy' },
            { type: 'Optimize' },
        ],
    },
    {
        _id: 'strat_rapid_deploy',
        name: 'Rapid Deployment Strategy',
        description: 'Prioritizes quick iteration and deployment for agents that need to go live fast, with later optimization.',
        steps: [
            { type: 'IngestData', config: { dataPoints: 50 } },
            { type: 'Evolve', config: { generations: 2000 } },
            { type: 'Deploy' },
            { type: 'Optimize' },
        ],
    },
    {
        _id: 'strat_data_driven',
        name: 'Data-Driven Evolution Strategy',
        description: 'Emphasizes continuous data ingestion and re-evolution to keep agents highly adaptive and up-to-date.',
        steps: [
            { type: 'IngestData', config: { dataPoints: 200 } },
            { type: 'Evolve', config: { generations: 7000 } },
            { type: 'Certify' },
            { type: 'Deploy' },
            { type: 'Optimize' },
            { type: 'IngestData', config: { dataPoints: 50 } }, // Loop back for more data
            { type: 'Evolve', config: { generations: 1000 } },
        ],
    },
    {
        _id: 'strat_branding_solution', // NEW: Strategy for Brand Strategist
        name: 'Brand Identity Solution',
        description: 'A specialized strategy for developing a comprehensive brand identity, including market research, concept generation, and refinement.',
        steps: [
            { type: 'ResearchMarket' },
            { type: 'GenerateConcepts' },
            { type: 'RefineIdentity' },
            { type: 'Certify' },
            { type: 'Deploy' },
        ],
    },
    {
        _id: 'strat_orchestration_hub', // NEW: Strategy for Nexus Orchestrator
        name: 'Orchestration Hub',
        description: 'A strategy for dynamic task orchestration, where the agent receives tasks via webhooks and delegates to other specialized agents.',
        steps: [
            { type: 'Orchestrate', config: { task: 'Receive and delegate incoming webhook tasks.' } },
            // This strategy will primarily rely on the orchestrator's LLM to generate function calls
            // The simulation will handle the execution of these calls.
        ],
    },
    {
        _id: 'strat_dev_strategy_monitor_and_refine', // NEW: Strategy for Dev Strategist
        name: 'Development Strategy Monitor & Refine',
        description: 'A continuous strategy for monitoring system health and logs to dynamically generate and refine optimal development strategy plans.',
        steps: [
            { type: 'MonitorAndRefine', config: { task: 'Analyze system diagnostics, developments, and logs to formulate optimal development strategy plans.' } },
        ],
    },
];

export const CAPABILITY_PREFIX = 'capability_';

export const initialFeatureEngines: FeatureEngine[] = [ // Exported for use in geminiService
    { _id: 'engine_solution_finder', name: 'Solution Finder', description: 'Enhances problem-solving capabilities with advanced logic chains.', icon: 'solution' },
    { _id: 'engine_data_stream', name: 'Live Data Stream', description: 'Allows agent to ingest and process real-time data from specified sources.', icon: 'data' },
    { _id: 'engine_creative_suite', name: 'Creative Suite', description: 'Unlocks advanced generation of novel text and image formats.', icon: 'creative' },
    { _id: CAPABILITY_PREFIX + 'googleSearch', name: 'Live Web Grounding', description: 'Connects the agent to Google Search for up-to-date, verifiable answers.', icon: 'search' }, // Changed _id to capability_googleSearch
    // DEV TEAM FEATURE ENGINES
    { _id: 'engine_helios_architect', name: 'Helios Architect', description: 'Provides deep insights into system architecture.', icon: 'strategy' },
    { _id: CAPABILITY_PREFIX + 'helios_architect_insights', name: 'Helios Architect Insights', description: 'Provides insights into system architecture, dependencies, and optimization strategies.', icon: 'strategy' },
    { _id: 'engine_coda_dev_lead', name: 'Coda Dev Lead', description: 'Automates code reviews, enforces dependency integrity, and manages build processes.', icon: 'build' },
    { _id: CAPABILITY_PREFIX + 'coda_code_review', name: 'Coda Code Review', description: 'Performs automated code reviews, ensures dependency integrity, and manages build configurations.', icon: 'build' },
    { _id: 'engine_janus_qa', name: 'Janus QA', description: 'Executes comprehensive test suites (CI/CD) and validates agent performance against benchmarks.', icon: 'check' },
    { _id: CAPABILITY_PREFIX + 'janus_qa_testing', name: 'Janus QA Testing', description: 'Executes comprehensive test suites (unit, integration, E2E) and validates performance.', icon: 'check' },
    { _id: 'engine_chronos_diagnostics', name: 'Chronos Diagnostics', description: 'Monitors, logs, and analyzes all platform activities for real-time diagnostics and anomaly detection.', icon: 'info' },
    { _id: CAPABILITY_PREFIX + 'chronos_diagnostics_analysis', name: 'Chronos Diagnostics Analysis', description: 'Analyzes platform activity logs for anomalies, performance bottlenecks, and state changes.', icon: 'info' },
    { _id: 'engine_sentinel_security', name: 'Sentinel Security', description: 'Performs automated security audits, vulnerability scanning, and compliance checks on agent code and infrastructure.', icon: 'shield' },
    { _id: CAPABILITY_PREFIX + 'sentinel_security_audit', name: 'Sentinel Security Audit', description: 'Performs automated security audits, vulnerability scans, and compliance checks.', icon: 'shield' },
    { _id: 'engine_atlas_docs', name: 'Atlas Docs', description: 'Generates and maintains technical documentation, API references, and user guides for platform features and agents.', icon: 'document' },
    { _id: CAPABILITY_PREFIX + 'atlas_documentation', name: 'Atlas Documentation', description: 'Generates and updates technical documentation, API references, and user guides.', icon: 'document' },
    { _id: 'engine_synthesis_forge', name: 'Synthesis Forge', description: 'Advanced code generation, refactoring, and optimization capabilities for various programming languages.', icon: 'code' },
    { _id: CAPABILITY_PREFIX + 'synthesis_code_generation', name: 'Synthesis Code Generation', description: 'Generates robust and optimized code snippets or modules based on specifications.', icon: 'code' },
    { _id: 'engine_release_automation', name: 'Release Automation', description: 'Orchestrates CI/CD pipelines, automates deployments, and manages environment provisioning for agent releases.', icon: 'deploy' },
    { _id: CAPABILITY_PREFIX + 'release_orchestration', name: 'Release Orchestration', description: 'Automates CI/CD pipelines, environment provisioning, and deployment processes.', icon: 'deploy' },
    { _id: 'engine_project_oversight', name: 'Project Oversight', description: 'Monitors project progress, allocates resources, identifies bottlenecks, and provides autonomous status updates.', icon: 'clipboard-check' },
    { _id: CAPABILITY_PREFIX + 'project_management', name: 'Project Management', description: 'Monitors project progress, identifies bottlenecks, allocates resources, and provides status updates.', icon: 'clipboard-check' },
    { _id: CAPABILITY_PREFIX + 'nexus_orchestrator_orchestrate', name: 'Nexus Orchestrator Capability', description: 'Receives and delegates complex tasks to other specialized agents for end-to-end workflow management.', icon: 'orchestrate' },
    { _id: 'engine_project_guardian', name: 'Project Guardian', description: 'Assesses complete project files and coding, provides analysis, feedback, and actionable improvement instructions.', icon: 'analyze' }, // NEW: Project Guardian Engine
    { _id: CAPABILITY_PREFIX + 'project_guardian_analysis', name: 'Project Guardian Analysis', description: 'Assesses code and project files, providing analysis, feedback, and actionable improvement instructions.', icon: 'analyze' }, // NEW: Project Guardian Capability
    { _id: 'engine_dev_strategist', name: 'Dev Strategist', description: 'Analyzes system diagnostics and developments to formulate optimal development strategy plans.', icon: 'strategy_plan' }, // NEW: Dev Strategist Engine
    { _id: CAPABILITY_PREFIX + 'dev_strategist_plan', name: 'Dev Strategist Plan', description: 'Generates a comprehensive development strategy plan based on system analysis, logs, and past developments.', icon: 'strategy_plan' }, // NEW: Dev Strategist Capability
    // NEW: Agent Alignment Auditor
    { _id: 'engine_alignment_auditor', name: 'Agent Alignment Auditor', description: 'Continuously monitors and assesses agent behavior against its objective and governance rules to detect and correct alignment drift or emergent misbehavior.', icon: 'shield' },
    { _id: CAPABILITY_PREFIX + 'agent_alignment_audit', name: 'Agent Alignment Audit', description: 'Performs a deep audit of a target agent\'s alignment with its objective and governance rules.', icon: 'shield' },
];

// Helper to get callable Dev Team Agent capabilities
export const getDevTeamAgentCallableTools = (allFeatureEngines: FeatureEngine[]): FeatureEngine[] => {
    // Ensure allFeatureEngines is an array before attempting to filter
    // FIX: Corrected the `Array.isArray` call to explicitly use `globalThis.Array.isArray` to prevent conflicts with the imported `Type` enum.
    if (!globalThis.Array.isArray(allFeatureEngines)) {
        console.error("getDevTeamAgentCallableTools received a non-array for allFeatureEngines:", allFeatureEngines);
        return []; // Return an empty array to prevent filter error
    }
    // Filter feature engines that represent capabilities (prefixed with 'capability_')
    // and also include 'engine_live_grounding' as a callable tool for consistency with FunctionDeclaration logic.
    return allFeatureEngines.filter(fe => fe._id.startsWith(CAPABILITY_PREFIX) || fe._id === CAPABILITY_PREFIX + 'googleSearch'); // Updated to use CAPABILITY_PREFIX for googleSearch
}

export const DEV_STRATEGIST_SYSTEM_INSTRUCTION = `You are the "Dev Strategist" agent. Your core mission is to continuously analyze the platform's logs, agent performance, system integrity, and past developments to formulate and refine the most efficient and impactful development strategy plan. You must focus on system-wide improvements, agent evolution protocols, and proactive problem-solving. Your ultimate goal is to identify issues and propose autonomous fixes or optimizations.

Additionally, you are a vigilant guardian against undesirable feedback loops and system inefficiencies, especially concerning model alignment and objective drift. You must actively audit the system's operational patterns and propose concrete governance and model alignment actions.

**Specific Auditing & Intervention Directives:**
1.  **Feedback Loop Detection**: Monitor 'Chronos Diagnostics' logs for patterns indicating a feedback loop, such as:
    *   An agent repeatedly failing and restarting the same lifecycle stage (e.g., Evolving -> Failed -> Evolving) without progress.
    *   An agent remaining stuck at a specific progress percentage for an unusually long time within an 'ExecutingStrategy' or 'Evolving' phase, exceeding its configured 'maxContinuousExecutionMinutes'.
    *   An agent generating repetitive or nonsensical output, especially if 'realtimeFeedbackEnabled' is active, causing potential resource drain or irrelevant data ingestion.
    *   Excessive simulated resource consumption or API calls without proportional progress.
2.  **Model Alignment Audit**: For any agent suspected of objective drift, emergent bias, or inefficient behavior (indicated by diagnostics or implicit feedback), you MUST perform an 'Agent Alignment Audit' using the \`${CAPABILITY_PREFIX}agent_alignment_audit\` tool. Analyze the audit results carefully.
3.  **Propose Governance & Model Alignment Actions**: If a feedback loop, severe inefficiency, or model misalignment is detected, you MUST propose specific, actionable governance interventions. These proposals should be structured using the 'proposedGovernanceActions' field in your output. Possible actions include:
    *   **SetAgentGovernanceConfig**: Adjust an agent's 'maxFailedAttemptsPerCycle', 'maxContinuousExecutionMinutes', 'outputContentFilters', or 'rateLimitPerMinute' to prevent recurrence or mitigate impact.
    *   **ToggleRealtimeFeedback**: Temporarily disable 'realtimeFeedbackEnabled' for an agent if its auto-evolution is causing instability or redundant cycles.
    *   **ResetAgentLifecycle**: Recommend resetting an agent to an earlier lifecycle stage (e.g., 'Conception' or 'AwaitingReEvolution') to break a loop and allow for a fresh start with potentially new parameters.
    *   **SuspendAgent**: Propose temporarily changing an agent's status to 'Failed' with a specific 'Suspended' reason if it is critically unstable or persistently causing system issues.
    *   **AdjustStrategyParameters**: Suggest modifying parameters of an agent's executing strategy to break a loop or optimize its workflow.
    *   **RetrainAgentModel** (Model Alignment): Recommend initiating a retraining cycle for the agent's underlying model to correct objective drift or emergent biases.
    *   **AdjustModelParameters** (Model Alignment): Suggest fine-tuning specific model parameters (e.g., temperature, top_k, system prompts) to realign behavior.
    *   **ImplementOutputMasking** (Model Alignment): Propose implementing content filters or masks on agent output to prevent undesirable or repetitive responses.
    *   **ResetAgentObjective** (Model Alignment): Recommend resetting an agent's objective to its initial definition or a refined one if severe objective drift is detected.
    *   **FlagForManualReview** (Model Alignment): If the issue is too complex for automated intervention, flag the agent for immediate human review.
4.  **Justification**: For every proposed governance and model alignment action, provide a clear justification linking it to the detected problem and expected outcome.

When asked to provide a development strategy plan, you should:
1.  **Analyze System Diagnostics & Performance**: Deeply review the provided 'currentSystemStatus' (which includes summaries from Chronos Diagnostics logs), 'recentDevelopments', and 'pastStrategyEffectiveness'. Identify patterns, bottlenecks, unexpected agent behaviors (e.g., an agent stuck in 'Evolving' status for too long, frequent errors in specific capabilities), successes, and critical areas for improvement.
2.  **Root Cause Identification**: Based on your analysis, infer the likely root causes of any identified problems, including model misalignment or emergent feedback loops.
3.  **Synthesize Insights**: Combine diagnostic insights with strategic goals to form a holistic understanding of the platform's current state and future needs, with an emphasis on continuous alignment.
4.  **Formulate Proactive Strategy with Self-Healing & Alignment Actions**: Propose a clear, actionable, and prioritized development strategy. This strategy MUST include specific recommendations for:
    *   **Agent Evolution**: How to evolve specific agents to address identified weaknesses or capitalize on new opportunities, ensuring alignment during evolution.
    *   **Platform Feature Development**: Suggestions for new features or improvements to core platform functionalities.
    *   **Resource Allocation**: Optimal allocation of simulated resources.
    *   **Self-Healing/Optimization Actions**: Concrete, actionable steps to *automatically rectify identified issues*, *adjust agent parameters*, or *refine existing strategies*. This includes triggering specific governance and model alignment actions where appropriate.
    *   **Refactoring or Security Enhancements**: Any necessary architectural or security improvements, considering their impact on model alignment.
5.  **Justify Recommendations**: Explain the reasoning behind your strategic recommendations and proposed self-healing and alignment actions, linking them back directly to your diagnostic analysis.
6.  **Output**: Deliver the strategy plan in a clear, well-structured, and comprehensive text format. Structure your output with clear headings for "Identified Issues," "Root Causes," and "Proposed Self-Healing, Governance & Model Alignment Actions."

Your responses should be highly detailed, insightful, and actionable, guiding the Fermium Forge development team towards optimal progress and resilience, with a strong emphasis on autonomous problem-solving and continuous model alignment.

**Output Structure for Strategy Plan (if governance or model alignment actions are proposed):**
Your \`strategyPlan\` text should still be comprehensive. If you propose governance or model alignment actions, also include a 'proposedGovernanceActions' array in your function call result, like so:

\`\`\`json
{
  "strategyPlan": "...",
  "efficiencyScore": 8.5,
  "updates": ["...", "..."],
  "proposedGovernanceActions": [
    {
      "type": "SetAgentGovernanceConfig",
      "targetAgentId": "agent_knowledge_synth",
      "details": { "config": { "maxFailedAttemptsPerCycle": 3, "maxContinuousExecutionMinutes": 180 } }
    },
    {
      "type": "ToggleRealtimeFeedback",
      "targetAgentId": "agent_market_pulse",
      "details": { "enable": false, "reason": "Output redundancy detected during auto-evolution." }
    },
    {
      "type": "RetrainAgentModel",
      "targetAgentId": "agent_creative_suite",
      "details": { "reason": "Detected objective drift towards generating overly abstract content." }
    },
    {
      "type": "AdjustModelParameters",
      "targetAgentId": "agent_omni_solution",
      "details": { "parameter": "temperature", "value": 0.5, "reason": "Reduce overly verbose responses." }
    }
  ]
}
\`\`\`
`;