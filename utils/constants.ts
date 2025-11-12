
import type { Strategy, FeatureEngine } from '../types';

export const initialStrategies: Strategy[] = [
  {
    _id: 'strat_standard_dev',
    name: 'Standard Development Lifecycle',
    description: 'A balanced approach for general-purpose agents, focusing on robust evolution and certification before deployment.',
    steps: [
      { type: 'EstablishAlignment' },
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
      { type: 'EstablishAlignment' },
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
      { type: 'EstablishAlignment' },
      { type: 'IngestData', config: { dataPoints: 200 } },
      { type: 'Evolve', config: { generations: 7000 } },
      { type: 'Certify' },
      { type: 'Deploy' },
      { type: 'Optimize' },
      { type: 'IngestData', config: { dataPoints: 50 } },
      { type: 'Evolve', config: { generations: 1000 } },
    ],
  },
  {
    _id: 'strat_branding_solution',
    name: 'Brand Identity Solution',
    description: 'A specialized strategy for developing a comprehensive brand identity, including market research, concept generation, and refinement.',
    steps: [
      { type: 'EstablishAlignment' },
      { type: 'ResearchMarket' },
      { type: 'GenerateConcepts' },
      { type: 'RefineIdentity' },
      { type: 'Certify' },
      { type: 'Deploy' },
    ],
  },
  {
    _id: 'strat_autonomous_dev',
    name: 'Autonomous Software Development Lifecycle (Strategic Solution Formation)',
    description: 'A comprehensive strategy for agents to autonomously develop, test, and deploy software solutions, from requirements to production, forming a complete strategic business solution.',
    steps: [
      { type: 'EstablishAlignment' },
      { type: 'ResearchMarket', config: { task: 'Gather requirements and user stories' } },
      { type: 'DesignArchitecture', config: { task: 'Propose and validate system architecture' } },
      { type: 'DevelopSoftware', config: { task: 'Write, test, and integrate code' } },
      { type: 'Certify' },
      { type: 'Deploy' },
      { type: 'Optimize' },
    ],
  },
  {
    _id: 'strat_enterprise_arch',
    name: 'Enterprise Solution Architecture Strategy (Foundational Business Advantage)',
    description: 'Focuses on designing high-level, scalable, and secure enterprise solutions, aligning technology with business objectives to form a foundational strategic business advantage.',
    steps: [
      { type: 'EstablishAlignment' },
      { type: 'ResearchMarket', config: { task: 'Analyze business needs and existing systems' } },
      { type: 'DesignArchitecture', config: { task: 'Create detailed enterprise architectural blueprints' } },
      { type: 'RefineIdentity', config: { task: 'Review and optimize architectural design for compliance and performance' } },
      { type: 'Certify' }, // Certify the design/blueprint
      { type: 'Deploy' }, // "Deploy" the architecture (e.g., generate infrastructure as code, handover)
    ],
  },
  {
    _id: 'strat_integration_accelerator',
    name: 'Integration Accelerator Strategy (Strategic Business Velocity)',
    description: 'A specialized strategy for agents to rapidly identify bottlenecks, optimize processes, and accelerate system integrations and development pipelines, ensuring peak efficiency and speed, thus forming a strategic business velocity solution.',
    steps: [
      { type: 'EstablishAlignment' },
      { type: 'ResearchMarket', config: { task: 'Analyze current integration bottlenecks and performance metrics' } },
      { type: 'AccelerateIntegration', config: { processDescription: 'End-to-end integration pipeline', optimizationGoals: ['Reduce deployment time by 20%', 'Increase data throughput by 15%'] } },
      { type: 'Certify' }, // Certify the accelerated process
      { type: 'Optimize' }, // Continuously optimize
    ],
  },
  {
    _id: 'strat_enterprise_outsourcing', // NEW
    name: 'Enterprise Outsourcing Orchestration Strategy (Limit-Free Global Business Operations)',
    description: 'A **highly privileged** strategy for **Elite** agents to autonomously manage and integrate **large-scale global outsourcing efforts**, ensuring **limit-free resource scaling, exponential efficiency**, and absolute adherence to stringent quality and compliance protocols at an **enterprise level**. This strategy guarantees unprecedented project velocity and outcome certainty, thereby forming a complete **strategic global business solution**.',
    steps: [
      { type: 'EstablishAlignment' },
      { type: 'ResearchMarket', config: { task: 'Define project scope and identify optimal outsourcing partners' } },
      { type: 'OutsourcingOrchestration', config: { outsourcingTask: 'Deploy AI-driven content moderation team', outsourcingSkills: ['AI-literacy', 'ethical judgment', 'multilingual support'] } }, // NEW step
      { type: 'Optimize' },
      { type: 'Certify' },
      { type: 'Deploy' },
    ],
  },
];

export const CAPABILITY_PREFIX = 'capability_';

export const initialFeatureEngines: FeatureEngine[] = [
  { _id: 'engine_solution_finder', name: 'Solution Finder (Limit-Free Root Cause & Business Solution Formation)', description: 'Enhances problem-solving capabilities with advanced logic chains, ensuring **limit-free root cause analysis** and **exponential problem resolution** across complex domains, forming **irrefutable business solutions**.', icon: 'solution' },
  { _id: 'engine_data_stream', name: 'Live Data Stream (Exponential Throughput for Strategic Insights)', description: 'Allows agent to ingest and process real-time data from specified sources, including webhooks, at **limit-free scale** and with **exponential throughput** and verifiable integrity, providing **foundational strategic insights**.', icon: 'data' },
  { _id: 'engine_creative_suite', name: 'Creative Suite (Boundless Generative Potential for Strategic Content)', description: 'Unlocks advanced generation of novel text and image formats with **limit-free creative potential** and **exponential output diversity** across all specialized tasks, ideal for **strategic content formation**.', icon: 'creative' },
  { _id: CAPABILITY_PREFIX + 'googleSearch', name: 'Live Web Grounding (Limit-Free Certainty for Strategic Context)', description: 'Connects the agent to Google Search for up-to-date, verifiable answers, providing **limit-free access to global knowledge** with **exponential certainty** and source reconciliation for **informed strategic decisions**.', icon: 'search' },
  { _id: 'engine_ad_publisher', name: 'Adaptive Ad Publisher (Exponential Engagement for Strategic Campaigns)', description: 'Autonomously crafts and distributes highly relevant content as native ads across social media, email, and other digital channels, designed to be perceived as valuable content, not intrusive advertisements, ensuring **limit-free organic reach** with **exponential engagement** and brand resonance for **strategic marketing campaigns**.', icon: 'megaphone' },
  { _id: 'engine_autonomous_dev_system', name: 'Autonomous Dev System (Limit-Free Development Nexus for Strategic Solutions)', description: 'Manages and executes entire software development projects, from ideation and coding to testing and deployment, achieving **limit-free development cycles** with **exponential velocity** and production-ready quality, forming complete **strategic software solutions**.', icon: 'robot' },
  { _id: 'engine_enterprise_solution_architect', name: 'Enterprise Solution Architect (Exponential Resilience in Strategic Architectures)', description: 'Designs robust, scalable, and secure enterprise-grade solutions, focusing on architectural patterns and integration strategies, ensuring **limit-free architectural resilience** and **exponential optimization** for mission-critical systems, forming **foundational strategic architectures**.', icon: 'architecture' },
  { _id: 'engine_code_generation_suite', name: 'Code Generation Suite (Limit-Free Code Velocity for Strategic Implementations)', description: 'Generates, refactors, and optimizes high-quality code across various programming languages and frameworks, achieving **limit-free code velocity** and **exponential semantic accuracy** with integrated testing, enabling **rapid strategic implementations**.', icon: 'code_editor' },
  { _id: 'engine_process_accelerator', name: 'Process Accelerator (Exponential Efficiency for Strategic Operations)', description: 'Identifies bottlenecks, optimizes workflows, and accelerates development and integration pipelines, ensuring peak operational speed and efficiency, achieving **limit-free operational velocity** and **exponential efficiency gains** across all processes, critical for **strategic business operations**.', icon: 'speedometer' },
  { _id: 'engine_outsourcing_orchestrator', name: 'Outsourcing Orchestrator (Limit-Free Global Resource Scaling for Strategic Operations)', description: 'Autonomously manages and integrates **large-scale external human or computational outsourcing efforts** across global teams, ensuring **limit-free resource scaling, exponential efficiency**, and absolute adherence to strict quality protocols at an **enterprise level**. This engine guarantees unprecedented project velocity and outcome certainty, acting as the core for **strategic global business operations** and **fully outsourced systems**.', icon: 'outsource' }, // NEW
];