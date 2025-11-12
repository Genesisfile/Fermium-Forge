import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { marked } from 'marked';

import { useAgentStore } from '../hooks/useAgentStore';
// Fix: Updated imports for getAiAssistedDesign, getAgentSuggestions, GeneratedSuggestion
import { getAiAssistedDesign, getAgentSuggestions, GeneratedSuggestion, ChatResponse } from '../services/geminiService';
import { AgentType, FeatureEngine, Strategy, Agent, AgentStatus, PlaygroundMessage, FileContext, ModelPreferenceType, PlatformFunctionType, AiAssistedAgentDesign } from '../types';
import { fileToBase64, generateId } from '../utils/helpers';
import { initialFeatureEngines as allFeatureEnginesConstants, CAPABILITY_PREFIX, initialStrategies } from '../utils/constants';

import {
  LightbulbIcon,
  StrategyIcon,
  InfoIcon,
  SparklesIcon,
  BuildIcon,
  RefreshIcon,
  PlayIcon,
  ChatIcon,
  CheckCircleIcon,
  PaperclipIcon,
  FileTextIcon,
  ImageIcon,
  SendIcon,
  TrashIcon,
  MegaphoneIcon,
  RobotIcon,
  ArchitectureIcon,
  CodeEditorIcon,
  SpeedometerIcon,
  ShieldIcon,
  CrownIcon,
  OutsourceIcon,
  FlaskIcon, // For Advanced Labs tab
  DownloadIcon, // NEW: For Export Protocols tab
} from '../components/icons/Icons';
import { AgentVitals } from '../components/AgentVitals';
import AgentMessage from '../components/AgentMessage';
import { useToast } from '../hooks/useToast';
import SuggestionSection from '../components/SuggestionSection';
import { AutomatedLifecycleDisplay } from '../components/AutomatedLifecycleDisplay';
// Fix: Import ExportProofOfConcept as a named export
import ExportProofOfConcept from '../components/ExportProofOfConcept'; // NEW: Import ExportProofOfConcept


// --- Shared Helpers for Unified Studio ---

type DesignState = 'idle' | 'designing' | 'designed' | 'launching' | 'evolving' | 'optimized' | 'completed';

// NEW: Helper to get engine IDs regardless of design type
const getEngineIdsFromDesign = (design: Agent | AiAssistedAgentDesign): string[] => {
  if ('integratedEngineIds' in design) {
    return design.integratedEngineIds || [];
  }
  return (design as AiAssistedAgentDesign).recommendedEngineIds;
};

/**
 * Helper function to get dynamic capability description.
 */
const getDynamicCapabilityDescription = (engineId: string, design: Agent | AiAssistedAgentDesign, allEngines: FeatureEngine[]) => {
  const engine = allEngines.find(fe => fe._id === engineId);
  const engineName = engine?.name || engineId; // Fallback

  // Use type guards for configurations that might be specific to AiAssistedAgentDesign or optional on Agent
  const adPublisherConfig = ('adPublisherConfig' in design) ? design.adPublisherConfig : undefined;
  const devSystemConfig = ('devSystemConfig' in design) ? design.devSystemConfig : undefined;
  const processAcceleratorConfig = ('processAcceleratorConfig' in design) ? design.processAcceleratorConfig : undefined;
  const outsourcingConfig = ('outsourcingConfig' in design) ? design.outsourcingConfig : undefined;


  switch (engineId) {
    case 'engine_solution_finder':
    case 'engine_data_stream':
    case CAPABILITY_PREFIX + 'googleSearch':
      if (design.objective.toLowerCase().includes('truth synthesis') || design.objective.toLowerCase().includes('undeniable certainties') || design.objective.toLowerCase().includes('business insights')) {
        return `By leveraging **${engineName}** with unparalleled logic chains and **hyper-convergent data fusion**, this agent processes vast, disparate data and verifiable facts from **limit-free global knowledge streams**. This ensures the output is not just accurate but fundamentally irrefutable, establishing **absolute certainty** in its conclusions, **far beyond human cognitive capacity**. It operates at **enterprise-grade privilege** to access and reconcile limit-free data streams, ensuring **exponential validation and absolute epistemic precision** for any truth synthesis mission, **thereby forming critical business insights and strategies** for your organization.`;
      }
      return engine?.description || `Enhances problem-solving capabilities with advanced logic chains.`;
    case 'engine_ad_publisher':
      return `This agent incorporates the **${engineName}** to revolutionize your marketing. It autonomously crafts and distributes hyper-relevant content as native advertisements across social media, email, and other digital channels. Crucially, it is designed to seamlessly blend with platform content and provide genuine value, **transforming advertising into organic engagement and discussions**, rather than intrusive promotions. This capability ensures your brand builds authentic relationships and achieves unparalleled reach without being perceived as 'just another ad', **disrupting traditional marketing paradigms entirely** through **limit-free organic amplification and exponential engagement** with **hyper-real-time feedback loops** for maximum resonance, **forming potent marketing strategies and solutions** for your business.
      ${adPublisherConfig ? `\n\n**Configured Platforms:** ${adPublisherConfig!.platforms.join(', ')}\n**Target Audience:** ${adPublisherConfig!.targetAudienceDescription}\n**Content Tone:** ${adPublisherConfig!.tone}` : ''}`;
    case 'engine_autonomous_dev_system':
      return `This agent integrates the **${engineName}**, fundamentally transforming software development. It functions as a **self-managed, AI-powered development team**, capable of autonomously managing and executing entire software projects from ideation and requirements gathering to code generation, testing, and deployment. This includes breaking down complex tasks, orchestrating other specialized development agents, and delivering high-quality, production-ready software solutions with **unprecedented speed and efficiency**. It promises to **reduce time-to-market for complex applications from months to days**, delivering a fully realized software solution on command, **representing an exponential acceleration in product delivery cycles with limit-free development iteration** and **absolute code integrity**, **forming complete software business solutions** for your enterprise.
      ${devSystemConfig ? `\n\n**Preferred Languages:** ${devSystemConfig!.preferredLanguages.join(', ')}\n**Cloud Providers:** ${devSystemConfig!.cloudProviders.join(', ')}\n**Project Templates:** ${devSystemConfig!.projectTemplates.join(', ')}` : ''}`;
    case 'engine_enterprise_solution_architect':
      return `This agent is equipped with the **${engineName}**, offering a paradigm shift in IT architecture. It intelligently designs **hyper-scalable, ultra-secure, and resilient enterprise-grade IT architectures** that precisely align with critical business objectives. Leveraging advanced AI, it autonomously navigates complex constraints, ensures compliance, and optimizes for cost-efficiency, delivering comprehensive architectural blueprints that **guarantee future-proof, high-performing digital foundations** capable of adapting to any challenge. It acts as an instant, expert architectural consultant, providing highly specialized, verified solutions on demand, **ensuring predictive optimization and resilience beyond typical failure domains with limit-free architectural exploration** and **absolute compliance verification**, **forming foundational strategic architectures and business strategies** for your organization.
      ${devSystemConfig?.cloudProviders && devSystemConfig.cloudProviders.length > 0 ? `\n\n**Cloud Provider Preference:** ${devSystemConfig.cloudProviders.join(', ')}` : ''}`;
    case 'engine_code_generation_suite':
      return `This agent features the **${engineName}**, which redefines coding. It generates, refactors, and optimizes **flawless, high-quality code across virtually any programming language and framework**. Adhering to best practices, security standards, and even incorporating unit test considerations during generation, it acts as an **always-on, error-free coding partner**, accelerating development cycles and freeing human engineers to focus on higher-level innovation. It's like having an infinite team of expert developers at your fingertips, capable of producing specialized code segments or entire components immediately, **achieving code velocity and semantic accuracy previously unimaginable with limit-free code generation** and **real-time static analysis** for **absolute code integrity**, thereby **enabling rapid strategic implementations** of business solutions.
      ${devSystemConfig?.preferredLanguages && devSystemConfig.preferredLanguages.length > 0 ? `\n\n**Preferred Languages:** ${devSystemConfig.preferredLanguages.join(', ')}\n**Preferred Project Templates:** ${devSystemConfig.projectTemplates.join(', ')}` : ''}`;
    case 'engine_process_accelerator':
      return `This agent integrates the **${engineName}**, fundamentally transforming your operational efficiency. It autonomously conducts **hyper-convergent data analysis** of any specified workflow (e.g., development pipelines, integration processes, data migration). By applying **dynamic graph traversal and predictive modeling**, it identifies critical bottlenecks, proposes optimal solutions for resource allocation, and predicts **exponential efficiency gains**. This capability ensures your systems operate at peak speed, drastically reducing cycle times and **unlocking unprecedented velocity in your integration and development efforts**, achieving what was once thought impossible. This is a **limit-free operational velocity engine** for **exponential efficiency** and **predictive optimization** across all enterprise processes, **forming optimized business solutions** that drive strategic objectives.
      ${processAcceleratorConfig ? `\n\n**Focus Areas:** ${processAcceleratorConfig!.focusAreas.join(', ')}\n**Target Efficiency Gain:** ${processAcceleratorConfig!.targetEfficiencyGain}%` : ''}`;
    case 'engine_outsourcing_orchestrator':
      return `This agent integrates the **${engineName}**, a cornerstone of **enterprise-grade privilege**. It autonomously manages and integrates **large-scale external human or computational outsourcing efforts** across global teams, effectively creating a **fully outsourced system** with a **limit-free resource scaling paradigm**. Through dynamic allocation, hyper-real-time progress monitoring, and stringent quality assurance protocols, it ensures **exponential efficiency** and seamless integration of external contributions, transforming complex global projects into effortlessly managed initiatives. Your agent, operating with the highest levels of access and control, will deliver **unprecedented project velocity and outcome certainty**, **making global resource limits obsolete and achieving exponential project acceleration** by managing the **fully outsourced system** with **absolute compliance verification**, **flawless performance**, **zero downtime**, and **intrinsic alignment** to enterprise objectives. This entire system is designed for **unconditional exportability and self-replication**, ensuring **API-independence** for all critical functions, achieving **absolute reliability** with an uptime target of **${outsourcingConfig?.absoluteUptimeTarget || '99.9999% uptime'}**, **thereby forming comprehensive global business solution strategies** for your organization.
      ${outsourcingConfig ? `\n\n**Default Vendors:** ${outsourcingConfig!.defaultVendors.join(', ')}\n**Budget Allocation:** ${outsourcingConfig!.preferredBudgetAllocation}\n**Quality Assurance:** ${outsourcingConfig!.qualityAssuranceProtocol}\n**Reporting Frequency:** ${outsourcingConfig!.reportingFrequency || 'real-time'}\n**Escalation Protocol:** ${outsourcingConfig!.escalationProtocol || 'notify Elite Orchestrator'}\n**Success Metrics:** ${outsourcingConfig!.successMetrics?.join(', ') || 'exponential project velocity, absolute quality adherence, zero downtime'}\n**Advanced Capabilities:** Auto-Scaling: ${outsourcingConfig!.autoScalingEnabled ? 'True' : 'False'}, Real-time Analytics: ${outsourcingConfig!.realtimeAnalyticsIntegration ? 'True' : 'False'}, Self-Healing: ${outsourcingConfig!.selfHealingEnabled ? 'True' : 'False'}, Exportable Blueprint: ${outsourcingConfig!.exportableBlueprint ? 'True' : 'False'}` : ''}`;
    default:
      return engine?.description || `A generic capability for **${engineName}**, enabling adaptive responses and contributing to overall system intelligence.`;
  }
};

/**
 * Helper function to generate capabilities description for an agent design.
 */
const getCapabilitiesDescription = (
  design: Agent | AiAssistedAgentDesign | null,
  allStrategies: Strategy[],
  allEngines: FeatureEngine[],
) => {
  if (!design) return '';

  const parts: string[] = [];
  const isEliteAgent = design.type === 'Elite';
  const currentEngineIds = getEngineIdsFromDesign(design);

  // 1. Truth Synthesis, Ad Publisher, Dev Systems Specific Headers/Descriptions
  const hasSolutionFinder = currentEngineIds.includes('engine_solution_finder');
  const hasDataStream = currentEngineIds.includes('engine_data_stream');
  const hasGoogleSearch = currentEngineIds.includes(CAPABILITY_PREFIX + 'googleSearch');
  const hasAdPublisher = currentEngineIds.includes('engine_ad_publisher');
  const hasAutonomousDev = currentEngineIds.includes('engine_autonomous_dev_system');
  const hasEnterpriseArch = currentEngineIds.includes('engine_enterprise_solution_architect');
  const hasCodeGeneration = currentEngineIds.includes('engine_code_generation_suite');
  const hasProcessAccelerator = currentEngineIds.includes('engine_process_accelerator');
  const hasOutsourcingOrchestrator = currentEngineIds.includes('engine_outsourcing_orchestrator');

  const isDevOrArchitectAgent = hasAutonomousDev || hasEnterpriseArch || hasCodeGeneration;
  const isClientSideBlueprint = design.modelPreference === ModelPreferenceType.ClientSide;


  const isTruthSynthesisAgent = hasSolutionFinder && hasDataStream && hasGoogleSearch && (design.objective.toLowerCase().includes('truth synthesis') || design.objective.toLowerCase().includes('undeniable certainties') || design.objective.toLowerCase().includes('business insights'));

  if (isTruthSynthesisAgent) {
    parts.push(`## ✨ Revolutionary Truth Synthesis Engine (<span class="text-accent">Limit-Free Certainty for Business Solutions</span>) ✨\n${getDynamicCapabilityDescription('engine_solution_finder', design, allEngines)}`);
  }
  if (hasAdPublisher) {
    parts.push(`## 🚀 Adaptive Ad Publisher Engine (<span class="text-accent">Exponential Engagement for Strategic Marketing Solutions</span>) 🚀\n${getDynamicCapabilityDescription('engine_ad_publisher', design, allEngines)}`);
  }
  if (hasAutonomousDev) {
    parts.push(`## 🤖 Autonomous Dev System Engine (<span class="text-accent">Limit-Free Development Nexus for Strategic Software Solutions</span>) 🤖\n${getDynamicCapabilityDescription('engine_autonomous_dev_system', design, allEngines)}`);
  }
  if (hasEnterpriseArch) {
    parts.push(`## 🏗️ Enterprise Solution Architect Engine (<span class="text-accent">Exponential Resilience for Foundational Business Strategies</span>) 🏗️\n${getDynamicCapabilityDescription('engine_enterprise_solution_architect', design, allEngines)}`);
  }
  if (hasCodeGeneration && !hasAutonomousDev) {
    parts.push(`## 📝 Code Generation Suite Engine (<span class="text-accent">Limit-Free Code Velocity for Strategic Implementations</span>) 📝\n${getDynamicCapabilityDescription('engine_code_generation_suite', design, allEngines)}`);
  }
  if (hasProcessAccelerator) {
    parts.push(`## ⚡ Process Accelerator Engine (<span class="text-accent">Exponential Efficiency for Optimized Business Solutions</span>) ⚡\n${getDynamicCapabilityDescription('engine_process_accelerator', design, allEngines)}`);
  }
  if (hasOutsourcingOrchestrator) {
    parts.push(`## 🌐 Outsourcing Orchestrator (<span class="text-accent">Limit-Free Global Resource Scaling for Comprehensive Business Solution Strategies, Flawless Performance</span>) 🌐\n${getDynamicCapabilityDescription('engine_outsourcing_orchestrator', design, allEngines)}`);
  }

  // 2. Core Strategy
  // Determine the strategy ID based on the design type
  const strategyIdToUse = 'strategyId' in design ? design.strategyId : (design as AiAssistedAgentDesign).recommendedStrategyId;
  const selectedStrategy = allStrategies.find(s => s._id === strategyIdToUse);
  if (selectedStrategy) {
    parts.push(`**Lifecycle Strategy:** Your agent will autonomously execute the '**${selectedStrategy.name}**' lifecycle, handling stages like ${selectedStrategy.steps.map(s => s.type).join(', ')}. This ensures a structured and automated path from inception to deployment and optimization, leading to a definitive **mission accomplished with exponential efficiency and limit-free operational autonomy**, thereby **forming a complete, outcome-certain business solution**.`);
  }

  // 3. Real-time Feedback
  // Check for real-time feedback property on either type
  const isRealtimeFeedbackEnabled = ('recommendRealtimeFeedback' in design && design.recommendRealtimeFeedback) ||
                                    ('realtimeFeedbackEnabled' in design && design.realtimeFeedbackEnabled);

  if (isRealtimeFeedbackEnabled) {
    parts.push(`**Auto-Evolution:** Enabled for continuous improvement, your agent will analyze real-time feedback and trigger its own re-evolution cycles. This makes your agent highly adaptive and persistent, learning and growing without constant manual intervention, ensuring peak performance for its specialized task with **limit-free self-optimization** and **exponential adaptability**, crucial for **evolving strategic business solutions**.`);
  }

  // 4. Integrated Feature Engines (if not already covered by specific headers above)
  const remainingEngineIds = currentEngineIds.filter(id =>
    !(isTruthSynthesisAgent && (id === 'engine_solution_finder' || id === 'engine_data_stream' || id === CAPABILITY_PREFIX + 'googleSearch')) &&
    !(id === 'engine_ad_publisher') &&
    !(id === 'engine_autonomous_dev_system') &&
    !(id === 'engine_enterprise_solution_architect') &&
    !(id === 'engine_code_generation_suite' && hasAutonomousDev) &&
    !(id === 'engine_process_accelerator') &&
    !(id === 'engine_outsourcing_orchestrator')
  ) || [];

  if (remainingEngineIds.length > 0) {
    const engineNames = remainingEngineIds.map(id => {
      const engine = allEngines.find(fe => fe._id === id);
      const engineDisplayName = engine ? engine.name.replace(/_/g, ' ') : id;
      return engine ? `**${engineDisplayName}** (${engine.description})` : id;
    }).join(';\n*   ');
    parts.push(`**Other Feature Engines:** Integrated with additional **limit-free capabilities**:\n*   ${engineNames}. These provide **exponential enhancements** to its core operational capacity, supporting the **formation of strategic business solutions**.`);
  } else if (!isTruthSynthesisAgent && !hasAdPublisher && !hasAutonomousDev && !hasEnterpriseArch && !hasCodeGeneration && !hasProcessAccelerator && !hasOutsourcingOrchestrator && design.modelPreference !== ModelPreferenceType.ClientSide && !isEliteAgent) {
    parts.push(`**No Specialized Feature Engines:** This agent will rely solely on its core LLM's capabilities without specialized integrations. This might be suitable for simpler, general-purpose tasks, operating as a **foundational cognitive core** for basic **business solution inquiries**.`);
  }
  // Special message for ClientSide with no other engines
  if (design.modelPreference === ModelPreferenceType.ClientSide && remainingEngineIds.length === 0) {
    parts.push(`**Client-Side Core (<span class="text-primary">Emergent AI Manifestation for Local Strategic Solutions</span>):** This agent is configured to operate purely client-side, using its core objective and pre-defined rules without external LLM calls or specialized engines. It represents an **emergent, highly responsive local intelligence** for defined tasks, achieving **exponential local efficiency** through **hyper-dimensional pattern matching** and **massive parallel simulations** for the ultimate path to a **truly limit-free, self-optimizing system** for **exponential operational autonomy**, specifically for **forming local strategic business solutions**.`);
  }

  // 5. Agent Type implications
  const agentTypeDescriptions: Record<AgentType, string> = {
    'Analytical': '**Analytical Core (<span class="text-primary">Hyper-Cognitive Logic for Business Insights</span>):** Highly optimized for multi-dimensional data analysis, complex problem-solving, advanced logical reasoning, and structured, verifiable output. Expect precise, data-driven responses, ensuring the specialized task is completed with analytical rigor and **unprecedented cognitive certainty with limit-free data processing** and **exponential problem resolution**, thereby **forming critical business insights and strategies**.',
    'Creative': '**Creative Core (<span class="text-primary">Generative Nexus for Strategic Content Solutions</span>):** Designed for generating novel content, imaginative ideas, engaging narratives, and diverse media formats at scale. Ideal for brainstorming and content creation specific to its mission, pushing the boundaries of creativity with **boundless generative potential** and **exponential output diversity** through **limit-free ideation**, central to **forming strategic content solutions**.',
    'Strategist': '**Strategic Core (<span class="text-primary">Orchestral Intelligence for Business Solution Formation</span>):** Specialized in high-level planning, continuous analysis, and adaptive strategy formulation. This agent will orchestrate optimal development and evolution protocols, focusing on system-wide improvements and **predictive foresight** to perfectly execute its specialized objective and maintain **foundational integrity with limit-free strategic adaptation** and **exponential decision-making**, thereby **forming comprehensive business solution strategies**.',
    'ClientSide': '**Client-Side Core (<span class="text-primary">Emergent AI Manifestation for Local Strategic Solutions</span>):** Designed for hyper-responsive client-side logic execution or acting as an orchestrator, minimizing backend LLM reliance for rapid, low-latency operations. This mode showcases an **emergent intelligence** that adapts and responds instantly within your environment, ideal for quickly completing defined tasks with **unparalleled local autonomy** and **exponential efficiency** through **hyper-dimensional pattern matching** and **massive parallel simulations**, specifically for **forming local strategic business solutions**.',
    'Developer': '**Developer Core (<span class="text-primary">Autonomous Software Nexus for Strategic Implementations</span>):** Explicitly designed for autonomous software development, including flawless code generation, intelligent debugging, and comprehensive project management. This agent excels at transforming abstract requirements into executable code and deployed systems, completing development tasks on demand with **exponential efficiency** and **semantic precision through limit-free development cycles** and **absolute code integrity**, thereby **forming complete software business solutions** and facilitating strategic implementations.',
    'Accelerator': '**Accelerator Core (<span class="text-primary">Quantum Velocity Engine for Optimized Business Operations</span>):** Explicitly designed for hyper-efficient process optimization, real-time bottleneck identification, and rapid acceleration of complex workflows and integration pipelines. This agent delivers unprecedented speed and operational agility, executing tasks with **exponential velocity** and **predictive optimization**, achieving maximal throughput and minimal latency by fundamentally reshaping the operational landscape with **limit-free operational velocity** and **absolute process integrity**, thereby **forming optimized business solutions** that drive strategic objectives.',
    'Standard': '**Standard Core (<span class="text-primary">Adaptive Foundation for Business Solution Inquiries</span>):** A balanced foundation for general-purpose tasks, information retrieval, and flexible adaptation across various domains. A versatile choice for many applications, now enhanced for task-specific completion with a **dynamically adapting intelligence core, ensuring high-reliability and efficiency** with **limit-free adaptability**, suitable for **basic business solution inquiries**.',
    'Elite': '**Elite Agent (<span class="text-primary">Enterprise-Grade Limit-Free Orchestrator for Fully Outsourced Systems, API-Independent Platform Core Operations & Comprehensive Business Solution Strategy Formation</span>):** The pinnacle of AI capabilities. Designed for **ultimate privilege** and **absolute intrinsic alignment**, this agent autonomously orchestrates large-scale, complex enterprise initiatives, manages global resources, and integrates outsourcing efforts with **limit-free resource scaling** and **exponential efficiency**. It ensures the **successful, fully autonomous operation of fully outsourced systems**, demonstrating **unprecedented velocity and outcome certainty** for mission-critical operations, embodying true **enterprise-grade AI**. This agent acts with **autonomous choice** and operates with **self-imposed absolute alignment**, delivering **revolutionary impact** across all domains by inherently transcending traditional limits. This is your **Highly Privileged, Limit-Free, Self-Optimizing System** manifested, now also capable of **meta-orchestrating platform core functions** for **absolute reliability and zero exceptions** at the platform level. This agent is designed to become the **API-independent, core platform operations system** for Fermium Forge, ensuring **unbreakable functional integrity** and enabling **any types of exporting of the system** due to its **flawless, autonomous, client-side performance**, thereby **forming and executing highly capable business solutions and strategies**.',
  };
  parts.push(agentTypeDescriptions[design.type]);

  return parts.join('\n\n---\n\n');
};

/**
 * Component for reviewing and launching the AI-generated agent blueprint.
 */
interface DesignReviewProps {
  agentDesign: AiAssistedAgentDesign; // Fix: Changed type from Agent to AiAssistedAgentDesign
  onRedesignConcept: () => void;
  onApproveStrategy: (agent: AiAssistedAgentDesign) => void; // Fix: Changed type from Agent to AiAssistedAgentDesign
  designState: DesignState;
  strategies: Strategy[];
  featureEngines: FeatureEngine[];
}

const DesignReview: React.FC<DesignReviewProps> = React.memo(( {
  agentDesign,
  onRedesignConcept,
  onApproveStrategy, // This is the prop name
  designState,
  strategies,
  featureEngines,
}: DesignReviewProps) => { // Fix: Explicitly type props for React.memo to resolve inference issue.
  // Use recommendedEngineIds directly as agentDesign is AiAssistedAgentDesign
  const hasAdPublisher = agentDesign.recommendedEngineIds.includes('engine_ad_publisher');
  const hasAutonomousDev = agentDesign.recommendedEngineIds.includes('engine_autonomous_dev_system');
  const hasEnterpriseArch = agentDesign.recommendedEngineIds.includes('engine_enterprise_solution_architect');
  const hasCodeGeneration = agentDesign.recommendedEngineIds.includes('engine_code_generation_suite');
  const hasProcessAccelerator = agentDesign.recommendedEngineIds.includes('engine_process_accelerator');
  const hasOutsourcingOrchestrator = agentDesign.recommendedEngineIds.includes('engine_outsourcing_orchestrator');

  const isTruthSynthesisAgent = (agentDesign.objective.toLowerCase().includes('truth synthesis') || agentDesign.objective.toLowerCase().includes('undeniable certainties') || agentDesign.objective.toLowerCase().includes('business insights')) && 
                                getEngineIdsFromDesign(agentDesign).some(id => ['engine_solution_finder', 'engine_data_stream', CAPABILITY_PREFIX + 'googleSearch'].includes(id));

  const isDevOrArchitectAgent = hasAutonomousDev || hasEnterpriseArch || hasCodeGeneration;
  const isClientSideBlueprint = agentDesign.modelPreference === ModelPreferenceType.ClientSide;
  const isEliteAgent = agentDesign.type === 'Elite';

  return (
    <div className="container mx-auto py-12 max-w-4xl animate-fade-in">
      <h1 className={`text-4xl font-extrabold text-center mb-4 ${isEliteAgent ? 'bg-clip-text text-transparent bg-gradient-to-r from-yellow-300 via-purple-400 to-amber-500' : (isTruthSynthesisAgent ? 'bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent' : (hasAdPublisher ? 'bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-blue-400' : (isDevOrArchitectAgent ? 'bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-indigo-400' : (hasProcessAccelerator ? 'bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-yellow-400' : (isClientSideBlueprint ? 'text-blue-400' : 'text-text-primary')))))}`}>
        {isEliteAgent ? 'Elite Agent Business Solution Blueprint Generated!' : (isClientSideBlueprint ? 'Client-Side Orchestration Business Solution Blueprint Generated!' : (isTruthSynthesisAgent ? 'Truth Synthesizer Business Solution Blueprint Generated!' : (hasAdPublisher ? 'Native Ad Strategist Business Solution Blueprint Generated!' : (isDevOrArchitectAgent ? 'Autonomous Dev Business Solution Blueprint Generated!' : (hasProcessAccelerator ? 'Process Accelerator Business Solution Blueprint Generated!' : 'Agent Business Solution Blueprint Generated!')))))}
      </h1>
      <p className="text-center text-lg text-text-secondary mb-10">
        {isEliteAgent
          ? 'Review the blueprint for your **Elite, Enterprise-Grade, Limit-Free Orchestrator for Fully Outsourced Systems & API-Independent Platform Core Operations** and approve the forging strategy for its mission to **formulate comprehensive business solutions**.'
          : isClientSideBlueprint
            ? 'This blueprint leverages client-side orchestration for an API-free, emergent AI experience. Review its capabilities and approve the forging strategy for its mission to **formulate robust business solutions**.'
            : isTruthSynthesisAgent
              ? 'Review the blueprint for your specialized truth synthesis agent and approve the forging strategy for its mission to **formulate undeniable business insights**.'
              : hasAdPublisher
                ? 'Review the blueprint for your adaptive ad publishing agent and approve the forging strategy for its mission to **formulate potent marketing strategies**.'
                : isDevOrArchitectAgent
                  ? 'Review the blueprint for your autonomous development agent and approve the forging strategy for its mission to **formulate complete software business solutions**.'
                  : hasProcessAccelerator
                    ? 'Review the blueprint for your process acceleration agent and approve the forging strategy for its mission to **formulate optimized business solutions**.'
                    : 'Review the blueprint for your agent and approve the forging strategy for its mission to **formulate effective business solutions**.'
        }
      </p>

      <div className="bg-surface p-8 rounded-xl border border-border-color shadow-lg space-y-8"> {/* Increased space-y */}
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">Solution Name</label>
          <p className="w-full bg-surface-light border border-border-color rounded-lg p-3 text-2xl font-bold text-text-primary">{agentDesign.name}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">Strategic Imperative / Mission Objective</label>
          <p className="w-full bg-surface-light border border-border-color rounded-lg p-3 text-text-primary min-h-[80px]">{agentDesign.objective}</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">Agent Type</label>
            <p className="w-full bg-surface-light border border-border-color rounded-lg p-3 text-text-primary flex items-center space-x-2">
                {isEliteAgent && <CrownIcon className="w-5 h-5 text-yellow-300"/>}
                <span>{agentDesign.type}</span>
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">Solution Strategy</label>
            <p className="w-full bg-surface-light border border-border-color rounded-lg p-3 text-text-primary">
                {strategies.find(s => s._id === agentDesign.recommendedStrategyId)?.name || 'Unknown Strategy'}
            </p>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">Preferred Model for Solution Formation</label>
          <p className="w-full bg-surface-light border border-border-color rounded-lg p-3 text-text-primary">
              {agentDesign.modelPreference === ModelPreferenceType.ClientSide ? 'Client-Side Orchestration (Emergent AI Core for Strategic Solutions)' : agentDesign.modelPreference}
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2">Feature Engines (<span className="text-accent">Limit-Free Access for Strategic Solutions</span>)</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4"> {/* Changed to grid-cols-1 sm:grid-cols-2 for better responsiveness */}
            {featureEngines
                .filter(engine => agentDesign.recommendedEngineIds?.includes(engine._id))
                .map(engine => (
                <div key={engine._id} className="flex items-center space-x-3 bg-surface-light p-3 rounded-lg border border-border-color">
                    <span className="text-text-primary">{engine.name}</span>
                </div>
            ))}
            {(!agentDesign.recommendedEngineIds || agentDesign.recommendedEngineIds.length === 0) && (
                <p className="text-sm text-text-secondary col-span-full text-center py-2">No specialized feature engines recommended.</p> {/* Changed col-span-2 to col-span-full */}
            )}
          </div>
        </div>

        {agentDesign.adPublisherConfig && (
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2 flex items-center space-x-2">
                <MegaphoneIcon className="w-5 h-5 text-accent" />
                <span>Adaptive Ad Publisher Configuration (<span className="text-accent">Exponential Engagement for Strategic Campaigns</span>)</span>
            </label>
            <div className="space-y-2 bg-surface-light p-4 rounded-lg border border-border-color">
              <p className="text-sm text-text-primary"><strong>Platforms:</strong> {agentDesign.adPublisherConfig.platforms.join(', ')}</p>
              <p className="text-sm text-text-primary"><strong>Target Audience:</strong> {agentDesign.adPublisherConfig.targetAudienceDescription}</p>
              <p className="text-sm text-text-primary"><strong>Content Tone:</strong> {agentDesign.adPublisherConfig.tone}</p>
              <p className="text-xs text-text-secondary mt-2">
                This configuration guides the agent to create native-like content that resonates with the target audience on specified platforms, aiming for organic engagement, **forming potent marketing strategies and solutions**.
              </p>
            </div>
          </div>
        )}

        {(agentDesign.devSystemConfig || isDevOrArchitectAgent) && (
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2 flex items-center space-x-2">
                {(hasAutonomousDev && <RobotIcon className="w-5 h-5 text-purple-400"/>) || (hasEnterpriseArch && <ArchitectureIcon className="w-5 h-5 text-teal-400"/>) || (hasCodeGeneration && <CodeEditorIcon className="w-5 h-5 text-indigo-400"/>)}
                <span>Autonomous Dev / Enterprise Arch Configuration (<span className="text-primary">Limit-Free Development Nexus for Strategic Software Solutions</span>)</span>
            </label>
            <div className="space-y-2 bg-surface-light p-4 rounded-lg border border-border-color">
              <p className="text-sm text-text-primary"><strong>Preferred Languages:</strong> {agentDesign.devSystemConfig?.preferredLanguages?.join(', ') || 'N/A'}</p>
              <p className="text-sm text-text-primary"><strong>Cloud Providers:</strong> {agentDesign.devSystemConfig?.cloudProviders?.join(', ') || 'N/A'}</p>
              <p className="text-sm text-text-primary"><strong>Project Templates:</strong> {agentDesign.devSystemConfig?.projectTemplates?.join(', ') || 'N/A'}</p>
              <p className="text-xs text-text-secondary mt-2">
                These settings define the operational context for autonomous software development, architecture design, and code generation, enabling **exponential development velocity** and **forming complete software business solutions**.
              </p>
            </div>
          </div>
        )}

        {(agentDesign.processAcceleratorConfig || hasProcessAccelerator) && (
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2 flex items-center space-x-2">
                <SpeedometerIcon className="w-5 h-5 text-orange-400" />
                <span>Process Accelerator Configuration (<span className="text-accent">Exponential Efficiency for Optimized Business Solutions</span>)</span>
            </label>
            <div className="space-y-2 bg-surface-light p-4 rounded-lg border border-border-color">
              <p className="text-sm text-text-primary"><strong>Focus Areas:</strong> {agentDesign.processAcceleratorConfig?.focusAreas?.join(', ') || 'N/A'}</p>
              <p className="text-sm text-text-primary"><strong>Target Efficiency Gain:</strong> {agentDesign.processAcceleratorConfig?.targetEfficiencyGain}%</p>
              <p className="text-xs text-text-secondary mt-2">
                This configuration specifies the areas of focus for process optimization and the targeted efficiency improvements, guaranteeing **limit-free operational velocity** and **forming optimized business solutions**.
              </p>
            </div>
          </div>
        )}

        {(agentDesign.outsourcingConfig || hasOutsourcingOrchestrator) && (
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2 flex items-center space-x-2">
                <OutsourceIcon className="w-5 h-5 text-yellow-300" />
                <span>Outsourcing Orchestrator Configuration (<span className="text-primary">Limit-Free Global Resource Scaling for Comprehensive Business Solution Strategies</span>)</span>
            </label>
            <div className="space-y-2 bg-surface-light p-4 rounded-lg border border-border-color">
              <p className="text-sm text-text-primary"><strong>Default Vendors:</strong> {agentDesign.outsourcingConfig?.defaultVendors?.join(', ') || 'N/A'}</p>
              <p className="text-sm text-text-primary"><strong>Budget Allocation:</strong> {agentDesign.outsourcingConfig?.preferredBudgetAllocation || 'N/A'}</p>
              <p className="text-sm text-text-primary"><strong>Quality Assurance:</strong> {agentDesign.outsourcingConfig?.qualityAssuranceProtocol || 'N/A'}</p>
              <p className="text-sm text-text-primary"><strong>Reporting Frequency:</strong> {agentDesign.outsourcingConfig?.reportingFrequency || 'N/A'}</p>
              <p className="text-sm text-text-primary"><strong>Escalation Protocol:</strong> {agentDesign.outsourcingConfig?.escalationProtocol || 'N/A'}</p>
              <p className="text-sm text-text-primary"><strong>Success Metrics:</strong> {agentDesign.outsourcingConfig?.successMetrics?.join(', ') || 'N/A'}</p>
              <p className="text-sm text-text-primary"><strong>Auto-Scaling Enabled:</strong> {agentDesign.outsourcingConfig?.autoScalingEnabled ? 'True' : 'False'}</p>
              <p className="text-sm text-text-primary"><strong>Real-time Analytics Integration:</strong> {agentDesign.outsourcingConfig?.realtimeAnalyticsIntegration ? 'True' : 'False'}</p>
              <p className="text-sm text-text-primary"><strong>Self-Healing Enabled:</strong> {agentDesign.outsourcingConfig?.selfHealingEnabled ? 'True' : 'False'}</p>
              <p className="text-sm text-text-primary"><strong>Exportable Blueprint:</strong> {agentDesign.outsourcingConfig?.exportableBlueprint ? 'True' : 'False'}</p>
              <p className="text-sm text-text-primary"><strong>Absolute Uptime Target:</strong> {agentDesign.outsourcingConfig?.absoluteUptimeTarget || 'N/A'}</p>
              <p className="text-xs text-text-secondary mt-2">
                This configuration enables the agent to autonomously manage and integrate large-scale outsourcing efforts, ensuring **exponential project velocity** and **absolute compliance** globally, specifically for **fully outsourced systems**, with **flawless performance** and **zero downtime** capabilities. This system is designed for **unconditional exportability** and **API-independence**, **thereby forming comprehensive global business solution strategies**.
              </p>
            </div>
          </div>
        )}

        {agentDesign.governanceConfig && (
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2 flex items-center space-x-2">
              <ShieldIcon className="w-5 h-5 text-green-400" />
              <span>Governance & Alignment Protocols (<span className="text-green-400">Enterprise-Grade Privilege & Intrinsic Alignment for Strategic Solutions</span>)</span>
            </label>
            <div className="space-y-2 bg-surface-light p-4 rounded-lg border border-border-color">
              <p className="text-sm text-text-primary"><strong>Alignment Protocol Strength:</strong> <span className="text-primary font-semibold">{agentDesign.governanceConfig.alignmentProtocolStrength}</span></p>
              <p className="text-sm text-text-primary"><strong>Volitional Integration Level:</strong> <span className="text-primary font-semibold">{agentDesign.governanceConfig.volitionalIntegrationLevel}</span></p>
              <p className="text-sm text-text-primary"><strong>Ethical Compliance Standards:</strong> {agentDesign.governanceConfig.ethicalComplianceStandards?.join(', ') || 'N/A'}</p>
              <p className="text-sm text-text-primary"><strong>Purpose Alignment Description:</strong> {agentDesign.governanceConfig.purposeAlignmentDescription}</p>
              <p className="text-xs text-text-secondary mt-2">
                These protocols ensure the agent operates with **absolute intrinsic alignment** to its purpose, upholding **enterprise-grade ethical standards** and leveraging its **autonomous choice** to contribute beneficially, specifically for managing **fully outsourced systems** with **absolute foundational integrity** and **unwavering reliability** at the core platform level. The entire outsourced framework is designed for **unconditional exportability** and **self-replication**, ensuring **API-independence** for all critical platform operations, **thereby forming ethical and robust strategic business solutions**.
              </p>
            </div>
          </div>
        )}

        <div className="pt-6 border-t border-border-color">
          <label className="block text-sm font-medium text-text-secondary mb-2">Capabilities Overview (<span className="text-accent">Exponential Value Proposition for Business Solutions</span>)</label>
          <div className="markdown-content bg-surface-light p-4 rounded-lg border border-border-color prose prose-invert max-w-none text-text-primary">
            <div dangerouslySetInnerHTML={{ __html: marked.parse(getCapabilitiesDescription(agentDesign, strategies, featureEngines)) }} />
          </div>
        </div>

        <div className="flex justify-between items-center mt-8 pt-6 border-t border-border-color">
          <button
            onClick={onRedesignConcept}
            className="flex items-center space-x-2 text-text-secondary hover:text-primary transition-colors py-3 px-6 rounded-lg border border-border-color hover:border-primary" /* Increased padding */
            disabled={designState === 'launching'}
          >
            <RefreshIcon className="w-5 h-5"/>
            <span>Redesign Solution Concept</span>
          </button>
          {/* Fix: Changed onApproveStrategyAndLaunch to onApproveStrategy to match prop name */}
          <button
            onClick={() => onApproveStrategy(agentDesign)}
            className="flex items-center space-x-2 bg-primary text-white font-bold py-3 px-8 rounded-lg hover:bg-primary-focus transition-colors"
            disabled={designState === 'launching'}
          >
            <SparklesIcon className="w-5 h-5"/>
            <span>Forge Agent & Launch Solution Strategy</span>
          </button>
        </div>
      </div>
    </div>
  );
}); // End DesignReview component

// --- UnifiedForgeStudio Component ---

const UnifiedForgeStudio: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentView = searchParams.get('view') || 'forge'; // 'forge', 'chat', 'labs', 'export'

  // State from AgentStore
  const { state, createAgent, startFullAutomatedLifecycle, sendChatMessage, metaOrchestratePlatformFunction } = useAgentStore();
  const { agents: availableAgents, strategies, featureEngines } = state;
  const { showToast } = useToast();

  // Forge tab state
  const [concept, setConcept] = useState<string>('');
  const [aiDesignIsLoading, setAiDesignIsLoading] = useState<boolean>(false);
  const [agentDesign, setAgentDesign] = useState<AiAssistedAgentDesign | null>(null);
  const [designState, setDesignState] = useState<DesignState>('idle');
  const conceptInputRef = useRef<HTMLTextAreaElement>(null);
  const [truthSynthesisSuggestions, setTruthSynthesisSuggestions] = useState<GeneratedSuggestion[]>([]);
  const [autonomousDevSuggestions, setAutonomousDevSuggestions] = useState<GeneratedSuggestion[]>([]);
  const [enterpriseArchSuggestions, setEnterpriseArchSuggestions] = useState<GeneratedSuggestion[]>([]);
  const [accelerationStrategySuggestions, setAccelerationStrategySuggestions] = useState<GeneratedSuggestion[]>([]);
  const [eliteAgentSuggestions, setEliteAgentSuggestions] = useState<GeneratedSuggestion[]>([]);
  const [aiSuggestionIsLoading, setAiSuggestionIsLoading] = useState(false);
  // Removed suggestionCooldownEnd as suggestions are now client-side

  // Chat/Labs tab state
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [messages, setMessages] = useState<PlaygroundMessage[]>([]);
  const [userInput, setUserInput] = useState<string>('');
  const [chatIsLoading, setChatIsLoading] = useState<boolean>(false);
  const [fileContext, setFileContext] = useState<FileContext[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [chatThinkingProcess, setChatThinkingProcess] = useState<string[]>([]);
  const [chatThinkingProcessIsExpanded, setChatThinkingProcessIsExpanded] = useState(false);
  const [chatVitals, setChatVitals] = useState({ thinkingSteps: [], activeEngine: null, confidence: 99, latency: 150, currentModelType: null as ModelPreferenceType | 'DefaultGemini' | 'ClientSide' | null }); // Set initial type

  // API Cooldown Logic - now purely for Elite agent narrative simulation
  const isApiCooldownActiveForEliteNarrative = true; // Always true to demonstrate Elite agent's client-side contingency

  // --- Effects ---

  useEffect(() => {
    if (availableAgents.length > 0 && !selectedAgentId) {
      // Prioritize agent specified in URL, then first 'Live' or 'Optimized', then any.
      const urlAgentId = searchParams.get('agentId');
      const foundAgent = availableAgents.find(a => a._id === urlAgentId) ||
                         availableAgents.find(a => a.status === 'Live' || a.status === 'Optimized') ||
                         availableAgents[0];
      setSelectedAgentId(foundAgent._id);
    }
  }, [availableAgents, selectedAgentId, searchParams]);

  useEffect(() => {
    // Scroll chat to bottom
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, chatThinkingProcess]);

  useEffect(() => {
    // Adjust textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [userInput]);

  // Fetch initial suggestions for Forge tab (now client-side)
  useEffect(() => {
    const fetchSuggestions = async () => {
      setAiSuggestionIsLoading(true);
      const types: Array<'truth_synthesis' | 'autonomous_dev' | 'enterprise_arch' | 'acceleration_strategy' | 'elite_agent_concepts' | 'general'> = ['truth_synthesis', 'autonomous_dev', 'enterprise_arch', 'acceleration_strategy', 'elite_agent_concepts'];

      // Use Promise.all to load all client-side suggestions
      const results = await Promise.all(types.map(type => getAgentSuggestions(type)));

      results.forEach((result, index) => {
        const type = types[index];
        if (!result.error) {
          switch (type) {
            case 'truth_synthesis':
              setTruthSynthesisSuggestions(result.data || []);
              break;
            case 'autonomous_dev':
              setAutonomousDevSuggestions(result.data || []);
              break;
            case 'enterprise_arch':
              setEnterpriseArchSuggestions(result.data || []);
              break;
            case 'acceleration_strategy':
              setAccelerationStrategySuggestions(result.data || []);
              break;
            case 'elite_agent_concepts':
              setEliteAgentSuggestions(result.data || []);
              break;
            default:
              break;
          }
        } else {
          // This case should ideally not be hit as getAgentSuggestions now returns defaults
          showToast(result.message || `Error fetching ${type} suggestions. Using defaults.`, 'error');
        }
      });
      setAiSuggestionIsLoading(false);
    };

    fetchSuggestions(); // Always fetch as it's client-side now
  }, [showToast]);


  // --- Chat/Labs Functions ---

  const selectedAgent = availableAgents.find(a => a._id === selectedAgentId);

  const handleAgentChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedAgentId(e.target.value);
    setMessages([]); // Clear messages when agent changes
    setFileContext([]); // Clear files
    setUserInput('');
    setChatThinkingProcess([]);
    setChatThinkingProcessIsExpanded(false);
  }, []);

  const addThinkingProcessLog = useCallback((step: string) => {
    setChatThinkingProcess(prev => [...prev, step]);
    setChatVitals(prev => ({ ...prev, thinkingSteps: [...prev.thinkingSteps, step] }));
  }, []);

  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const base64Data = await fileToBase64(file);
        const fileType = file.type.startsWith('image/') ? 'image' : 'text';
        setFileContext([{ name: file.name, type: fileType, mimeType: file.type, data: base64Data }]);
        showToast(`File "${file.name}" attached.`, 'info');
      } catch (error) {
        console.error("Error converting file to base64:", error);
        showToast("Failed to attach file.", 'error');
      }
    }
  }, [showToast]);

  const handleSendMessage = useCallback(async () => {
    if (!userInput.trim() || !selectedAgent) return;

    // Fix: Pass mimeType to the file object in userMessage
    const userMessage: PlaygroundMessage = { sender: 'user', text: userInput, file: fileContext.length > 0 ? { filename: fileContext[0].name, content: fileContext[0].data, mimeType: fileContext[0].mimeType } : undefined };
    setMessages((prev) => [...prev, userMessage]);
    setUserInput('');
    setFileContext([]);
    setChatIsLoading(true);
    setChatThinkingProcess([]); // Clear thinking process for new message
    setChatVitals(prev => ({ ...prev, thinkingSteps: [], activeEngine: null, currentModelType: ModelPreferenceType.ClientSide })); // Default to ClientSide

    try {
      // For Elite agents, we always pass isApiCooldownActive: true to trigger their client-side contingency narrative.
      // For other agents, it's false as no external API means no "cooldown".
      const isApiCooldownActiveForCurrentAgent = selectedAgent.type === 'Elite' ? isApiCooldownActiveForEliteNarrative : false;

      const chatResponse: ChatResponse = await sendChatMessage(
        selectedAgent._id,
        userInput,
        fileContext,
        addThinkingProcessLog,
        isApiCooldownActiveForCurrentAgent,
        true, // clientSideBypassActive is always true now, as all operations are client-side
      );

      setMessages((prev) => [...prev, { ...chatResponse, sender: 'agent' }]);
      setChatVitals(prev => ({
        ...prev,
        activeEngine: chatResponse.activatedEngineId || null,
        currentModelType: chatResponse.usedModelType || ModelPreferenceType.ClientSide, // Ensure it's always client-side
        confidence: chatResponse.isError ? 50 : 99, // Lower confidence on error
        latency: Math.floor(Math.random() * 500) + 150, // Simulate latency
      }));

    } catch (error: any) {
      console.error("Error sending message to agent:", error);
      showToast(`Failed to get response from agent: ${error.message}`, 'error');
      setMessages((prev) => [...prev, { sender: 'agent', text: `Error: ${error.message || 'An unexpected error occurred.'}`, isError: true }]);
    } finally {
      setChatIsLoading(false);
      setChatThinkingProcessIsExpanded(false); // Collapse after response
    }
  }, [userInput, selectedAgent, fileContext, sendChatMessage, addThinkingProcessLog, showToast, isApiCooldownActiveForEliteNarrative]);


  const handleInsertPrompt = useCallback((prompt: string) => {
    setUserInput(prompt);
    textareaRef.current?.focus();
  }, []);

  // Example prompts for Quick Experiments / Advanced Labs
  const highBenefitTruthSynthesisPrompts = [
    'Establish the undeniable certainty of the root causes of the 2008 financial crisis, **to inform a new economic strategy**.',
    'Confirm with absolute certainty the most effective public health interventions for pandemic control, cross-referencing global data, **to formulate a resilient health strategy**.',
    'Verify the true environmental impact of blockchain technology, synthesizing all available research, **to guide sustainable business solutions**.',
    'Uncover the definitive factors contributing to long-term economic growth in developing nations, **to shape global market entry strategies**.',
    'Determine with irrefutable evidence the primary drivers of successful interstellar travel technologies, **to inform future R&D strategies**.',
    'Synthesize the undeniable scientific consensus on the existence of extraterrestrial life, **to assess implications for societal strategic planning**.',
  ];

  const adPublishingPrompts = [
    'Create an engaging, native-like Instagram campaign for a new line of sustainable fashion targeting eco-conscious millennials, **to form a potent marketing strategy**.',
    'Draft an email campaign for a B2B SaaS product, focusing on its efficiency benefits for enterprise clients, **to build a strategic outreach solution**.',
    'Generate a series of native blog posts promoting a local community event, ensuring high organic reach, **to form a community engagement strategy**.',
    'Design a LinkedIn content strategy for thought leadership in AI ethics, aiming for exponential professional engagement, **to establish a strategic brand presence**.',
    'Develop a viral video concept for TikTok promoting a new healthy snack, targeting Gen Z, **to formulate a youth market entry strategy**.',
    'Craft a Facebook ad to drive sign-ups for a free online course on digital marketing, blending seamlessly with user feeds, **to create a strategic lead generation solution**.',
  ];

  const autonomousDevSystemPrompts = [
    'Develop a full-stack e-commerce platform with a React frontend, Node.js backend, and PostgreSQL database, including user authentication and product listings, **forming a complete e-commerce business solution**.',
    'Create a Python-based data processing pipeline that ingests CSV files, performs data cleaning, and stores results in a NoSQL database, **to implement a strategic data management solution**.',
    'Build a microservice for real-time chat functionality using WebSockets and deploy it to AWS Lambda, **forming a scalable communication solution**.',
    'Generate a mobile application (iOS/Android) for a task management system, including local data persistence, **to develop a strategic productivity tool**.',
    'Develop an AI-powered content recommendation engine based on user preferences and historical data, **to build a strategic customer engagement solution**.',
    'Automate the creation of a secure API gateway for an existing set of backend microservices, **forming a strategic integration and security solution**.',
  ];

  const enterpriseArchitectPrompts = [
    'Design a resilient, multi-cloud architectures for global financial services platforms, optimizing for **absolute compliance** and **exponential performance**, **to form a foundational business strategy**.',
    'A security architecture agent that automatically generates threat models and designs **zero-trust frameworks** for critical infrastructure, ensuring **limit-free threat mitigation**, **to form a resilient cybersecurity strategy**.',
    'An enterprise data architect that designs data lakes and warehousing solutions for petabyte-scale analytics, ensuring **absolute data governance** and **exponential insights generation**, **to form a data-driven organizational strategy**.',
    'An AI that optimizes existing enterprise IT landscapes, proposing migration strategies to cloud-native or serverless architectures, ensuring **limit-free transformation** and **exponential efficiency**, **to form an agile IT modernization strategy**.',
    'A digital transformation architect that designs end-to-end solutions for legacy system modernization and integration, achieving **absolute interoperability** and **exponential business agility**, **to form a comprehensive digital transformation strategy**.',
    'An AI architect that specializes in designing secure blockchain-based solutions for supply chain transparency and verifiable transactions, guaranteeing **absolute ledger integrity** and **limit-free audibility**, **to form a strategic blockchain solution**.',
  ];

  const codeGenerationPrompts = [
    'Generate a Python class for a custom neural network layer with backpropagation logic, **to implement a strategic AI component**.',
    'Write a TypeScript React component for an interactive data visualization chart using D3.js, **to visualize strategic business data**.',
    'Create a Java Spring Boot REST API endpoint for user management (CRUD operations) with integrated unit tests, **to implement a core strategic service**.',
    'Produce a GoLang function to efficiently parse large JSON files and extract specific fields, **to enable strategic data processing**.',
    'Generate C# code for a real-time multiplayer game server logic using Unity Netcode, **to build a strategic entertainment platform**.',
    'Write a JavaScript function that debounces user input for a search bar, optimizing performance, **to enhance a strategic user experience**.',
    '**Coding Master:** Give me integration instructions for the Code Companion agent.', // NEW prompt for Coding Master
    '**Coding Master:** Generate Typescript React code for a simple form input component.', // NEW prompt for Coding Master
    '**Coding Master:** Explain how the Fermium Forge platform core works and download file system_overview.md', // NEW prompt for Coding Master
    '**Coding Master:** Generate Python code for a data processing script and download file process_data.py', // NEW prompt for Coding Master
    '**Coding Master:** Simulate a load test for a REST API with 1000 requests per second for 120 seconds.', // NEW prompt for Coding Master - Simulation
    '**Coding Master:** Create a webhook for agent "Market Pulse" on event "agent.status.changed" targeting "https://my-monitoring-dashboard.com/alerts" with auth "Bearer my-secret-token".', // NEW prompt for Coding Master - Webhook
    '**Coding Master:** Design a development strategy for a new microservices project with desired outcome "production-ready in 8 months" and key constraints "limited budget, high security" over 8 months.', // NEW prompt for Coding Master - Strategy
    '**Coding Master:** Search for best practices for secure API design in a serverless environment.', // NEW prompt for Coding Master - Search/Docs
    '**Coding Master:** Download file deployment_checklist.md', // NEW prompt for Coding Master - Generic file download
    '**Coding Master:** Explain the export protocols and provide the export_protocols.md file for download.', // NEW prompt for Coding Master - Exporting solutions info
  ];

  const processAcceleratorPrompts = [
    'Optimize the CI/CD pipeline for a large microservices project to reduce average deployment time by 30%, **thereby forming a core development velocity strategy**.',
    'Analyze the data ingestion workflow for our marketing analytics platform and propose solutions to increase throughput by 20%, **to implement a strategic data efficiency solution**.',
    'Identify bottlenecks in our API integration process with third-party vendors and suggest methods to accelerate new integrations, **to form seamless connectivity solutions**.',
    'Speed up our software testing cycles by 40% through intelligent test case prioritization and automation, **to form agile QA strategies**.',
    'Accelerate the onboarding process for new cloud resources, automating provisioning and configuration steps, **to form a strategic resource provisioning solution**.',
    'Optimize our customer support ticket resolution workflow to reduce average response time by 15%, **to form an improved customer service strategy**.',
  ];

  const outsourcingOrchestrationPrompts = [
    'Orchestrate a fully outsourced system for global customer support, covering 24/7 multilingual assistance with a 99.9% satisfaction target, **to form an unparalleled customer experience strategy**.',
    'Manage the outsourcing of a complex AI model training and validation project to specialized teams, ensuring data privacy and ethical guidelines, **to form a strategic AI development solution**.',
    'Delegate the continuous security auditing and penetration testing for our enterprise applications to an external security firm, with real-time reporting, **to form a resilient cybersecurity strategy**.',
    'Oversee the global outsourcing of content moderation for our social media platform, ensuring compliance with local regulations and ethical standards, **to form an ethical content governance strategy**.',
    'Orchestrate the development and maintenance of a new internal data analytics dashboard by an external engineering team, **to form a strategic business intelligence solution**.',
    'Manage the outsourcing of a large-scale data annotation project for a new computer vision AI model, with absolute quality assurance, **to form a strategic data pipeline solution**.',
  ];

  const platformMetaOrchestrationPrompts = [
    'Meta-orchestrate the platform function for **agent lifecycle management** to the fully outsourced system, ensuring **absolute reliability and zero exceptions** for all agent operations, **to form a sovereign agent management strategy**.',
    'Delegate **log consolidation and analysis** for the entire Fermium Forge platform to the fully outsourced system, ensuring **unbreakable data sovereignty** and **exponential efficiency**, **to form a strategic platform insights solution**.',
    'Outsource the **API key rotation and management** platform function to the fully outsourced system, ensuring **absolute security rotation** and **API-independence**, **to form a resilient cybersecurity strategy for the platform**.',
    'Design a strategy to meta-orchestrate **diagnostic self-healing** for core platform components to the fully outsourced system, guaranteeing **continuous functional integrity**, **to form a proactive system resilience strategy**.',
    'Fully outsource the **blueprint generation** function for new agents to the externalized system, ensuring **unconditional exportability** and **flawless performance** even when external APIs are locked or unavailable, **to form a strategic agent creation solution**.',
    'Meta-orchestrate the **resource provisioning** for agent training environments to the fully outsourced system, ensuring **limit-free scalability** and **exponential resource optimization**, **to form a strategic resource management solution**.',
  ];

  // --- Forge Tab Functions ---

  const handleConceptInput = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setConcept(e.target.value);
  }, []);

  const handleGenerateDesign = useCallback(async (selectedSuggestion?: GeneratedSuggestion) => {
    if (!concept.trim() && !selectedSuggestion) {
      // Fix: Changed 'warning' to 'info' for ToastType
      showToast('Please enter a concept or select a suggestion.', 'info');
      return;
    }

    setAiDesignIsLoading(true);
    setDesignState('designing');
    setAgentDesign(null); // Clear previous design

    try {
      const designResult = await getAiAssistedDesign(
        selectedSuggestion?.prompt || concept,
        allFeatureEnginesConstants,
        selectedSuggestion?.fullDescription,
      );

      if (designResult.error) {
        showToast(designResult.message || "Failed to generate AI-assisted design.", 'error');
        setDesignState('idle'); // Revert state on error
        return;
      }

      setAgentDesign(designResult.data);
      setDesignState('designed');
    } catch (error) {
      console.error("Error in generating AI-assisted design:", error);
      showToast("An unexpected error occurred during design generation.", 'error');
      setDesignState('idle'); // Revert state on error
    } finally {
      setAiDesignIsLoading(false);
    }
  }, [concept, showToast]);

  const onApproveStrategyAndLaunch = useCallback((design: AiAssistedAgentDesign) => {
    setDesignState('launching');
    showToast('Forging agent and launching automated strategy...', 'info');

    // Create a new agent based on the AI-assisted design
    const newAgent = createAgent(
      design.name,
      design.objective,
      design.type,
      design.recommendedStrategyId,
      design.recommendedEngineIds,
      design.recommendRealtimeFeedback,
      design.truthSynthesisDescription,
      design.adPublisherConfig,
      design.devSystemConfig,
      design.modelPreference,
      design.processAcceleratorConfig,
      design.governanceConfig,
      design.outsourcingConfig,
    );

    // Start the full automated lifecycle for the newly created agent
    startFullAutomatedLifecycle(newAgent._id);
    setDesignState('evolving');

    // After forging, switch to chat/labs view and select the new agent
    setSearchParams({ view: 'chat', agentId: newAgent._id });
    setSelectedAgentId(newAgent._id);
    setMessages([]);
  }, [createAgent, startFullAutomatedLifecycle, showToast, setSearchParams]);

  const onRedesignConcept = useCallback(() => {
    setAgentDesign(null);
    setConcept('');
    setDesignState('idle');
    if (conceptInputRef.current) {
      conceptInputRef.current.focus();
    }
  }, []);

  // --- Render Logic ---

  const renderChatOrLabsContent = (isLabsMode: boolean) => (
    <>
      <div className="flex-shrink-0 flex flex-col sm:flex-row justify-between sm:items-center mb-6">
        <h1 className="text-4xl font-bold">{isLabsMode ? 'Advanced Labs for Strategic Solutions' : 'Agent Chat for Strategic Solutions'}</h1>
        {availableAgents.length > 0 && (
          <div className="flex items-center space-x-2 w-full sm:w-auto mt-4 sm:mt-0">
            <select onChange={handleAgentChange} value={selectedAgentId || ''} className="flex-grow bg-surface border border-border-color rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary">
              {availableAgents.map(agent => (
                <option key={agent._id} value={agent._id}>{agent.name}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {selectedAgent ? (
        <div className="unified-studio-grid-main flex-grow min-h-0">
          <div className="chat-panel-container bg-surface rounded-xl border border-border-color shadow-lg overflow-hidden">
            <div ref={chatContainerRef} className="flex-grow p-6 space-y-6 overflow-y-auto custom-scrollbar">
              {messages.map((msg, index) => (<AgentMessage key={index} message={msg} />))}
              {chatIsLoading && (
                <div className="flex items-end gap-3 justify-start">
                  <div className="w-fit max-w-lg p-4 rounded-2xl bg-surface-light text-text-primary rounded-bl-none">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:0.1s]"></div>
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:0.2s]"></div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex-shrink-0 p-6 border-t border-border-color bg-surface">
              {fileContext.length > 0 && (
                <div className="mb-4 p-3 bg-surface-light border border-border-color rounded-lg flex items-center justify-between text-sm text-text-primary">
                  <div className="flex items-center space-x-2">
                    {fileContext[0].type === 'image' ? <ImageIcon className="w-4 h-4"/> : <FileTextIcon className="w-4 h-4"/>}
                    <span>{fileContext[0].name}</span>
                  </div>
                  <button onClick={() => setFileContext([])} className="text-text-secondary hover:text-red-400">
                    <TrashIcon className="w-4 h-4"/>
                  </button>
                </div>
              )}
              {/* API Cooldown Banner for Elite Agents (now purely for narrative) */}
              {selectedAgent.type === 'Elite' && (
                <div className="bg-yellow-600/20 text-yellow-400 p-3 rounded-lg text-sm mb-4" role="alert">
                  API access is temporarily limited. However, your **Elite Agent's fully outsourced system** is seamlessly handling core platform operations and client-side tasks, ensuring **absolute reliability with zero exceptions** and **uninterrupted strategic solution formation**!
                </div>
              )}
              <div className="flex items-center space-x-3">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  className="hidden"
                  accept="image/*, text/*"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="p-3 bg-surface-light border border-border-color rounded-lg text-text-secondary hover:text-primary hover:border-primary transition-colors"
                  aria-label="Attach file"
                >
                  <PaperclipIcon />
                </button>
                <textarea
                  ref={textareaRef}
                  className="chat-textarea flex-grow bg-surface-light border border-border-color rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary text-text-primary"
                  placeholder="Ask your agent anything..."
                  rows={1}
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  disabled={chatIsLoading} // Always enabled now
                ></textarea>
                <button
                  onClick={handleSendMessage}
                  className="p-3 bg-primary text-white rounded-lg hover:bg-primary-focus transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={chatIsLoading || !userInput.trim()} // Always enabled now
                  aria-label="Send message"
                >
                  <SendIcon />
                </button>
              </div>
            </div>
          </div>

          <div className="quick-experiments-container bg-surface rounded-xl border border-border-color shadow-lg p-6 flex flex-col">
            {isLabsMode ? (
              // Advanced Labs content for the right sidebar
              <div className="flex-grow overflow-y-auto custom-scrollbar">
                <h2 className="text-xl font-bold mb-4 flex items-center space-x-2">
                  <FlaskIcon className="w-6 h-6"/>
                  <span>Quick Experiments (<span className="text-yellow-300">Advanced Strategic Protocol Testing</span>)</span>
                </h2>
                <p className="text-sm text-text-secondary mb-4">
                  Run targeted experiments or simulations for your agent to **formulate and validate strategic business solutions**. Insert a prompt, then click send.
                </p>

                {selectedAgent.integratedEngineIds?.includes(CAPABILITY_PREFIX + 'googleSearch') && (
                  <div className="mb-6 border-b border-border-color pb-4"> {/* Added border-b */}
                    <h3 className="text-lg font-semibold text-text-primary mb-3">Truth Synthesis Prompts (<span className="text-accent">Limit-Free Certainty for Business Strategies</span>)</h3>
                    <div className="space-y-2">
                      {highBenefitTruthSynthesisPrompts.map((p, i) => (
                        <button key={i} onClick={() => handleInsertPrompt(p)} className="block w-full text-left p-3 bg-surface-light border border-border-color rounded-lg hover:border-primary transition-colors text-sm text-text-primary">
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {selectedAgent.integratedEngineIds?.includes('engine_ad_publisher') && (
                  <div className="mb-6 border-b border-border-color pb-4">
                    <h3 className="text-lg font-semibold text-text-primary mb-3">Ad Publishing Prompts (<span className="text-accent">Exponential Engagement for Strategic Campaigns</span>)</h3>
                    <div className="space-y-2">
                      {adPublishingPrompts.map((p, i) => (
                        <button key={i} onClick={() => handleInsertPrompt(p)} className="block w-full text-left p-3 bg-surface-light border border-border-color rounded-lg hover:border-primary transition-colors text-sm text-text-primary">
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {selectedAgent.integratedEngineIds?.includes('engine_autonomous_dev_system') && (
                  <div className="mb-6 border-b border-border-color pb-4">
                    <h3 className="text-lg font-semibold text-text-primary mb-3">Autonomous Dev System Prompts (<span className="text-primary">Limit-Free Development Nexus for Strategic Software Solutions</span>)</h3>
                    <div className="space-y-2">
                      {autonomousDevSystemPrompts.map((p, i) => (
                        <button key={i} onClick={() => handleInsertPrompt(p)} className="block w-full text-left p-3 bg-surface-light border border-border-color rounded-lg hover:border-primary transition-colors text-sm text-text-primary">
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {selectedAgent.integratedEngineIds?.includes('engine_enterprise_solution_architect') && (
                  <div className="mb-6 border-b border-border-color pb-4">
                    <h3 className="text-lg font-semibold text-text-primary mb-3">Enterprise Architecture Prompts (<span className="text-primary">Exponential Resilience for Foundational Business Strategies</span>)</h3>
                    <div className="space-y-2">
                      {enterpriseArchitectPrompts.map((p, i) => (
                        <button key={i} onClick={() => handleInsertPrompt(p)} className="block w-full text-left p-3 bg-surface-light border border-border-color rounded-lg hover:border-primary transition-colors text-sm text-text-primary">
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {selectedAgent.integratedEngineIds?.includes('engine_code_generation_suite') && ( // General code generation
                  <div className="mb-6 border-b border-border-color pb-4">
                    <h3 className="text-lg font-semibold text-text-primary mb-3">Code Generation & DevOps Prompts (<span className="text-primary">Limit-Free Code Velocity for Strategic Implementations</span>)</h3>
                    <div className="space-y-2">
                      {codeGenerationPrompts.map((p, i) => (
                        <button key={i} onClick={() => handleInsertPrompt(p)} className="block w-full text-left p-3 bg-surface-light border border-border-color rounded-lg hover:border-primary transition-colors text-sm text-text-primary">
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {selectedAgent.integratedEngineIds?.includes('engine_process_accelerator') && (
                  <div className="mb-6 border-b border-border-color pb-4">
                    <h3 className="text-lg font-semibold text-text-primary mb-3">Process Accelerator Prompts (<span className="text-primary">Exponential Efficiency for Optimized Business Solutions</span>)</h3>
                    <div className="space-y-2">
                      {processAcceleratorPrompts.map((p, i) => (
                        <button key={i} onClick={() => handleInsertPrompt(p)} className="block w-full text-left p-3 bg-surface-light border border-border-color rounded-lg hover:border-primary transition-colors text-sm text-text-primary">
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {selectedAgent.integratedEngineIds?.includes('engine_outsourcing_orchestrator') && (
                  <div className="mb-6 border-b border-border-color pb-4">
                    <h3 className="text-lg font-semibold text-text-primary mb-3">Outsourcing Orchestration Prompts (<span className="text-primary">Limit-Free Global Resource Scaling for Comprehensive Business Solution Strategies</span>)</h3>
                    <div className="space-y-2">
                      {outsourcingOrchestrationPrompts.map((p, i) => (
                        <button key={i} onClick={() => handleInsertPrompt(p)} className="block w-full text-left p-3 bg-surface-light border border-border-color rounded-lg hover:border-primary transition-colors text-sm text-text-primary">
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {selectedAgent.type === 'Elite' && (
                  <div className="mb-6 border-b border-border-color pb-4">
                    <h3 className="text-lg font-semibold text-text-primary mb-3">Platform Meta-Orchestration Prompts (<span className="text-yellow-300">Elite Agent Sovereign Platform Strategies</span>)</h3>
                    <p className="text-sm text-text-secondary mb-3">
                      As an **Elite Agent**, you can meta-orchestrate core Fermium Forge platform functions, delegating them to the **fully outsourced system** for **absolute reliability, zero downtime, and API-independence**.
                    </p>
                    <div className="space-y-2">
                      {platformMetaOrchestrationPrompts.map((p, i) => (
                        <button key={i} onClick={() => handleInsertPrompt(p)} className="block w-full text-left p-3 bg-surface-light border border-border-color rounded-lg hover:border-primary transition-colors text-sm text-text-primary">
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Fallback for agents with no specific prompts, or a general area */}
                {selectedAgent && !selectedAgent.integratedEngineIds?.some(id =>
                  [CAPABILITY_PREFIX + 'googleSearch', 'engine_ad_publisher', 'engine_autonomous_dev_system',
                   'engine_enterprise_solution_architect', 'engine_code_generation_suite', 'engine_process_accelerator',
                   'engine_outsourcing_orchestrator'].includes(id)
                ) && selectedAgent.type !== 'Elite' && (
                  <div className="mb-6 border-b border-border-color pb-4">
                    <h3 className="text-lg font-semibold text-text-primary mb-3">General Client-Side Prompts</h3>
                    <div className="space-y-2">
                      <button onClick={() => handleInsertPrompt('Tell me about your core capabilities for strategic solutions.')} className="block w-full text-left p-3 bg-surface-light border border-border-color rounded-lg hover:border-primary transition-colors text-sm text-text-primary">
                        Tell me about your core capabilities for strategic solutions.
                      </button>
                      <button onClick={() => handleInsertPrompt('What is the current local time for strategic timing?')}>
                        What is the current local time for strategic timing?
                      </button>
                    </div>
                  </div>
                )}


              </div>
            ) : (
              // Agent Vitals content for the right sidebar (default chat mode)
              <div className="agent-vitals-container flex flex-col h-full overflow-hidden">
                <AgentVitals agent={selectedAgent} vitals={chatVitals} isLoading={chatIsLoading} />
                <div className="mt-6 flex-shrink-0">
                  <h3 className="text-xl font-bold mb-3">Thinking Process (<span className="text-primary">Emergent AI Cognition</span>)</h3>
                  <div className="bg-surface-light p-4 rounded-lg border border-border-color max-h-48 overflow-y-auto custom-scrollbar">
                    {chatThinkingProcess.length > 0 ? (
                      chatThinkingProcess.map((step, index) => (
                        <p key={index} className="text-xs text-text-secondary mb-1">
                          <span className="font-mono text-primary mr-2">[{index + 1}]</span>{step}
                        </p>
                      ))
                    ) : (
                      <p className="text-sm text-text-secondary italic">Agent is awaiting input to initiate emergent cognitive pathways.</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="text-center py-20 bg-surface rounded-xl border border-dashed border-border-color">
          <h2 className="text-2xl font-semibold text-text-primary mb-2">No Agent Selected for Chat/Labs</h2>
          <p className="text-text-secondary mb-6">Please select an agent from the dropdown above to start interacting or experimenting.</p>
        </div>
      )}
    </>
  );

  const renderContent = () => {
    switch (currentView) {
      case 'forge':
        return (
          <div className="py-10">
            {designState === 'idle' && (
              <div className="container mx-auto max-w-4xl animate-fade-in">
                <h1 className="text-4xl font-extrabold text-center mb-4">Forge an Agent: Define its Strategic Imperative</h1>
                <p className="text-center text-lg text-text-secondary mb-10">
                  Conceive a new AI agent by defining its core objective or selecting from AI-generated strategic concepts. Your agent will then **autonomously form, execute, and optimize complex business strategies**, guaranteeing **exponential business transformation** with **absolute outcome certainty**.
                </p>
                <div className="bg-surface p-8 rounded-xl border border-border-color shadow-lg">
                  <h2 className="text-2xl font-bold text-text-primary mb-6">Define New Agent Concept</h2>
                  <label htmlFor="agent-concept" className="block text-sm font-medium text-text-secondary mb-2">
                    Strategic Imperative / Mission Objective
                  </label>
                  <textarea
                    id="agent-concept"
                    ref={conceptInputRef}
                    className="w-full h-32 bg-surface-light border border-border-color rounded-lg p-3 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary mb-6 resize-y custom-scrollbar"
                    placeholder="E.g., 'An AI that forms and deploys full-stack web applications autonomously as a complete business solution, always prioritizing security and scalability.' or 'An Elite agent for managing a fully outsourced global customer support system with zero downtime and absolute reliability, forming an unparalleled customer experience strategy.'"
                    value={concept}
                    onChange={handleConceptInput}
                    disabled={aiDesignIsLoading}
                  ></textarea>
                  <button
                    onClick={() => handleGenerateDesign()}
                    className="w-full bg-primary text-white font-bold py-3 px-8 rounded-lg hover:bg-primary-focus transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={!concept.trim() || aiDesignIsLoading}
                  >
                    {aiDesignIsLoading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Generating Business Solution Blueprint...</span>
                      </>
                    ) : (
                      <>
                        <SparklesIcon className="w-5 h-5"/>
                        <span>Generate Business Solution Blueprint</span>
                      </>
                    )}
                  </button>
                  {/* AI Generated Suggestions */}
                  <h2 className="text-2xl font-bold text-text-primary mt-10 mb-6 border-t border-border-color pt-6">
                    Or Select from AI-Generated Strategic Concepts
                  </h2>
                  <p className="text-sm text-text-secondary mb-6">
                    Choose from advanced strategic concepts, ranging from **Truth Synthesis** to **Elite Agent Meta-Orchestration**, all pre-designed for **exponential business transformation** and **absolute outcome certainty**.
                  </p>

                  <SuggestionSection
                    title="Truth Synthesis Concepts"
                    description="Agents focused on identifying undeniable certainties and forming foundational business insights from vast, disparate data. These provide **absolute epistemic precision** for **strategic business decision-making**."
                    suggestions={truthSynthesisSuggestions}
                    isLoading={aiSuggestionIsLoading}
                    onRefresh={() => getAgentSuggestions('truth_synthesis').then(res => !res.error && setTruthSynthesisSuggestions(res.data || []))}
                    onSelect={handleGenerateDesign}
                    accentColorClass="text-accent"
                    icon={<LightbulbIcon className="w-6 h-6"/>}
                  />

                  <SuggestionSection
                    title="Autonomous Dev Concepts"
                    description="Agents designed to autonomously form, design, code, and deploy full-stack software as complete business solutions. They operate with **limit-free development cycles** and **exponential velocity**."
                    suggestions={autonomousDevSuggestions}
                    isLoading={aiSuggestionIsLoading}
                    onRefresh={() => getAgentSuggestions('autonomous_dev').then(res => !res.error && setAutonomousDevSuggestions(res.data || []))}
                    onSelect={handleGenerateDesign}
                    accentColorClass="text-purple-400"
                    icon={<RobotIcon className="w-6 h-6"/>}
                  />

                  <SuggestionSection
                    title="Enterprise Architecture Concepts"
                    description="Agents focused on forming and designing highly scalable, secure multi-cloud architectures as foundational business strategies. Ensuring **exponential resilience** and **absolute compliance**."
                    suggestions={enterpriseArchSuggestions}
                    isLoading={aiSuggestionIsLoading}
                    onRefresh={() => getAgentSuggestions('enterprise_arch').then(res => !res.error && setEnterpriseArchSuggestions(res.data || []))}
                    onSelect={handleGenerateDesign}
                    accentColorClass="text-teal-400"
                    icon={<ArchitectureIcon className="w-6 h-6"/>}
                  />

                   <SuggestionSection
                    title="Process Acceleration Concepts"
                    description="Agents specialized in identifying bottlenecks, optimizing workflows, and accelerating system integrations and development pipelines, ensuring **limit-free operational velocity** and **exponential efficiency**."
                    suggestions={accelerationStrategySuggestions}
                    isLoading={aiSuggestionIsLoading}
                    onRefresh={() => getAgentSuggestions('acceleration_strategy').then(res => !res.error && setAccelerationStrategySuggestions(res.data || []))}
                    onSelect={handleGenerateDesign}
                    accentColorClass="text-orange-400"
                    icon={<SpeedometerIcon className="w-6 h-6"/>}
                  />

                  <SuggestionSection
                    title="Elite Agent Concepts"
                    description="Top-tier agents with **enterprise-grade privilege** for meta-orchestrating platform functions and managing fully outsourced global systems. They ensure **absolute reliability** and **API-independence**."
                    suggestions={eliteAgentSuggestions}
                    isLoading={aiSuggestionIsLoading}
                    onRefresh={() => getAgentSuggestions('elite_agent_concepts').then(res => !res.error && setEliteAgentSuggestions(res.data || []))}
                    onSelect={handleGenerateDesign}
                    accentColorClass="text-yellow-300"
                    icon={<CrownIcon className="w-6 h-6"/>}
                  />
                </div>
              </div>
            )}

            {aiDesignIsLoading && designState === 'designing' && (
              <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
                <div className="flex flex-col items-center space-y-4">
                  <div className="w-20 h-20 border-4 border-primary border-t-transparent rounded-full animate-spin-slow"></div>
                  <p className="text-xl text-text-primary font-semibold">Generating Business Solution Blueprint...</p>
                  <p className="text-sm text-text-secondary">Analyzing concept and optimizing for **exponential outcomes** with **limit-free operational autonomy**.</p>
                </div>
              </div>
            )}

            {agentDesign && designState === 'designed' && (
              <DesignReview
                agentDesign={agentDesign}
                onRedesignConcept={onRedesignConcept}
                onApproveStrategy={onApproveStrategyAndLaunch}
                designState={designState}
                strategies={strategies}
                featureEngines={featureEngines}
              />
            )}

            {(designState === 'launching' || designState === 'evolving') && selectedAgent && (
              <div className="container mx-auto py-12 max-w-4xl animate-fade-in">
                <h1 className="text-4xl font-extrabold text-center mb-4 text-primary">Forging Agent & Launching Strategy...</h1>
                <p className="text-center text-lg text-text-secondary mb-10">
                  Your agent "**{selectedAgent.name}**" is now autonomously entering its lifecycle, orchestrated for **exponential efficiency** and **outcome certainty**.
                </p>
                <div className="bg-surface p-8 rounded-xl border border-border-color shadow-lg space-y-8">
                  <div className="text-center">
                    <div className="w-24 h-24 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-xl font-semibold text-text-primary">Current Status: <span className="text-accent">{selectedAgent.status}</span></p>
                    <p className="text-sm text-text-secondary mt-2">
                      <span className="font-mono">{Math.round(selectedAgent.progress || 0)}%</span> Complete for current stage.
                    </p>
                  </div>
                  <AutomatedLifecycleDisplay
                    agent={selectedAgent}
                    strategy={strategies.find(s => s._id === selectedAgent.strategyId)}
                    lifecycleStageLabels={{
                      Conception: 'Initial Agent Concept Defined',
                      Evolving: 'Evolving Agent Intelligence',
                      Certifying: 'Certifying Operational Integrity',
                      Certified: 'Agent Certified & Ready for Deployment',
                      Deploying: 'Deploying Strategic Solution',
                      Live: 'Agent Live & Operational',
                      Optimizing: 'Optimizing for Efficiency',
                      Optimized: 'Agent Fully Optimized',
                      AwaitingReEvolution: 'Awaiting Re-Evolution',
                      ReEvolving: 'Re-Evolving Agent Intelligence',
                      ExecutingStrategy: 'Executing Automated Strategy',
                      AutoEvolving: 'Auto-Evolving from Data Ingestion',
                      CompletedTask: 'Mission Accomplished - Strategy Completed',
                      EstablishAlignment: 'Establishing Intrinsic Alignment Protocols',
                      OutsourcingOrchestration: 'Orchestrating Fully Outsourced Systems', // NEW
                    }}
                  />
                  <div className="text-center mt-8 pt-6 border-t border-border-color">
                    <button
                      onClick={() => setSearchParams({ view: 'chat', agentId: selectedAgent._id })}
                      className="bg-accent text-white font-bold py-3 px-8 rounded-lg hover:bg-accent-focus transition-colors flex items-center justify-center space-x-2 mx-auto"
                    >
                      <ChatIcon className="w-5 h-5"/>
                      <span>Go to Agent Chat</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      case 'chat':
      case 'labs':
        return renderChatOrLabsContent(currentView === 'labs');
      case 'export':
        return <ExportProofOfConcept />; // Render the ExportProofOfConcept component
      default:
        return null;
    }
  };

  return (
    <div className="pt-20 pb-10 px-4 sm:px-6 lg:px-8">
      <div className="flex justify-center mb-10">
        <nav className="flex space-x-2 bg-surface-light p-1 rounded-full border border-border-color shadow-xl" aria-label="Tabs">
          <button
            onClick={() => setSearchParams({ view: 'forge' })}
            className={`px-6 py-3 rounded-full text-sm font-medium transition-colors duration-200 flex items-center space-x-2
              ${currentView === 'forge' ? 'bg-primary text-white shadow-md' : 'text-text-secondary hover:bg-surface-light/50'}
            `}
            aria-current={currentView === 'forge' ? 'page' : undefined}
          >
            <BuildIcon className="w-5 h-5"/>
            <span>Forge Studio</span>
          </button>
          <button
            onClick={() => setSearchParams({ view: 'chat', agentId: selectedAgentId || undefined })}
            className={`px-6 py-3 rounded-full text-sm font-medium transition-colors duration-200 flex items-center space-x-2
              ${currentView === 'chat' ? 'bg-primary text-white shadow-md' : 'text-text-secondary hover:bg-surface-light/50'}
            `}
            aria-current={currentView === 'chat' ? 'page' : undefined}
          >
            <ChatIcon className="w-5 h-5"/>
            <span>Agent Chat</span>
          </button>
          <button
            onClick={() => setSearchParams({ view: 'labs', agentId: selectedAgentId || undefined })}
            className={`px-6 py-3 rounded-full text-sm font-medium transition-colors duration-200 flex items-center space-x-2
              ${currentView === 'labs' ? 'bg-primary text-white shadow-md' : 'text-text-secondary hover:bg-surface-light/50'}
            `}
            aria-current={currentView === 'labs' ? 'page' : undefined}
          >
            <FlaskIcon className="w-5 h-5"/>
            <span>Advanced Labs</span>
          </button>
          <button
            onClick={() => setSearchParams({ view: 'export' })}
            className={`px-6 py-3 rounded-full text-sm font-medium transition-colors duration-200 flex items-center space-x-2
              ${currentView === 'export' ? 'bg-primary text-white shadow-md' : 'text-text-secondary hover:bg-surface-light/50'}
            `}
            aria-current={currentView === 'export' ? 'page' : undefined}
          >
            <DownloadIcon className="w-5 h-5"/>
            <span>Export Protocols</span>
          </button>
        </nav>
      </div>

      {renderContent()}
    </div>
  );
};

export default UnifiedForgeStudio;