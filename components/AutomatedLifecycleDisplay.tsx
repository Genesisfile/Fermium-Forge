

import React from 'react';
import { Agent, Strategy, StrategyStep, AgentStatus } from '../types';
import { CheckCircleIcon, RefreshIcon, InfoIcon } from './icons/Icons';
import { getStatusColorClasses } from '../utils/helpers';

/**
 * Represents a single step in the agent's lifecycle or strategy.
 */
interface LifecycleStepProps {
  stepNumber: number;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed' | 'skipped';
  progress?: number;
  currentStepActive?: boolean;
  agentStatus: AgentStatus;
  detailedDescription?: string;
}

const LifecycleStep: React.FC<LifecycleStepProps> = ({
  stepNumber,
  title,
  description,
  status,
  progress = 0,
  agentStatus,
  detailedDescription,
}) => {
  const getStepStatusClasses = () => {
    switch (status) {
      case 'completed':
        return 'bg-green-600/20 text-green-300 border-green-500/50'; /* Slightly darker background for completed */
      case 'in-progress':
        return 'bg-blue-600/20 text-blue-300 border-blue-500/50 animate-pulse-light'; /* Darker background, added pulse animation */
      case 'pending':
        return 'bg-gray-700/20 text-gray-400 border-gray-700/50';
      case 'skipped':
        return 'bg-yellow-600/20 text-yellow-300 border-yellow-500/50'; /* Slightly darker background for skipped */
      default:
        return 'bg-gray-700/20 text-gray-400 border-gray-700/50';
    }
  };

  const getProgressBarColor = () => {
    switch (status) {
      case 'completed':
        return 'bg-green-500';
      case 'in-progress':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className={`relative flex items-start space-x-4 p-5 rounded-xl border ${getStepStatusClasses()}`}> {/* Increased padding */}
      <div className={`flex items-center justify-center w-9 h-9 rounded-full flex-shrink-0 ${status === 'completed' ? 'bg-green-500' : (status === 'in-progress' ? 'bg-blue-500' : 'bg-gray-500')} text-white text-lg font-bold z-10 shadow-md`}> {/* Increased size, added shadow */}
        {status === 'completed' ? <CheckCircleIcon className="w-5 h-5"/> : stepNumber} {/* Added icon class */}
      </div>
      <div className="flex-grow">
        <h3 className={`font-semibold text-xl ${status === 'completed' ? 'text-green-300' : 'text-text-primary'}`}>{title}</h3> {/* Increased text size */}
        <p className="text-sm text-text-secondary mt-1">{description}</p> {/* Added mt-1 */}
        {status === 'in-progress' && (
          <div className="mt-3"> {/* Increased margin */}
            <div className="w-full bg-surface-light rounded-full h-2.5">
              <div className={`${getProgressBarColor()} h-2.5 rounded-full`} style={{ width: `${progress}%` }}></div>
            </div>
            <p className="text-xs text-text-secondary mt-1.5">{Math.round(progress)}% Complete</p> {/* Increased margin */}
          </div>
        )}
        {detailedDescription && (
          <details className="mt-4 text-sm text-text-secondary cursor-pointer"> {/* Increased margin */}
            <summary className="flex items-center space-x-2 hover:text-text-primary transition-colors font-medium"> {/* Increased space, added font-medium */}
              <InfoIcon className="w-4 h-4 text-primary" /> {/* Added primary color to icon */}
              <span>Details for Skeptics</span>
            </summary>
            <div className="mt-2 p-3 bg-black/30 rounded-lg border border-border-color custom-scrollbar max-h-40 overflow-y-auto">
              <p>{detailedDescription}</p>
            </div>
          </details>
        )}
      </div>
    </div>
  );
};

interface AutomatedLifecycleDisplayProps {
  agent: Agent;
  strategy?: Strategy;
  lifecycleStageLabels: { [key in AgentStatus]?: string };
}

export const AutomatedLifecycleDisplay: React.FC<AutomatedLifecycleDisplayProps> = ({ agent, strategy, lifecycleStageLabels }) => {

  const getLifecycleSteps = (strategy: Strategy) => {
    const currentStepIndex = agent.currentStrategyStep ?? 0;
    const isStrategyCompleted = agent.status === 'CompletedTask';

    return strategy.steps.map((step, index) => {
      let status: 'pending' | 'in-progress' | 'completed' | 'skipped' = 'pending';
      let currentProgress = 0;

      if (isStrategyCompleted) {
        status = 'completed';
        currentProgress = 100;
      } else if (index < currentStepIndex) {
        status = 'completed';
        currentProgress = 100;
      } else if (index === currentStepIndex && ['Evolving', 'Certifying', 'Deploying', 'Optimizing', 'ReEvolving', 'ExecutingStrategy', 'AutoEvolving', 'EstablishAlignment', 'OutsourcingOrchestration'].includes(agent.status)) {
        status = 'in-progress';
        currentProgress = agent.progress || 0;
      } else if (index === currentStepIndex && agent.status === 'Live') {
         if (currentStepIndex === strategy.steps.length - 1) {
            status = 'completed';
            currentProgress = 100;
        } else {
            status = 'skipped';
        }
      }

      const stepTitleMap: { [key in StrategyStep['type']]: string } = {
        IngestData: 'Ingest Data for Strategic Insights',
        Evolve: 'Evolve Agent for Strategic Adaptability',
        Certify: 'Certify Strategic Solution',
        Deploy: 'Deploy Strategic Solution',
        Optimize: 'Optimize Strategic Solution',
        ResearchMarket: 'Research Market for Strategic Context',
        GenerateConcepts: 'Generate Concepts for Strategic Solutions',
        RefineIdentity: 'Refine Identity for Strategic Alignment',
        DevelopSoftware: 'Develop Software for Strategic Implementations',
        DesignArchitecture: 'Design Architecture for Foundational Business Strategies',
        AccelerateIntegration: 'Accelerate Integration for Business Velocity',
        EstablishAlignment: 'Establish Alignment for Strategic Objectives',
        OutsourcingOrchestration: 'Orchestrate Outsourcing for Global Business Solutions', // NEW
      };

      const stepDescriptionMap: { [key in StrategyStep['type']]: string } = {
        IngestData: `Ingest ${step.config?.dataPoints || 'new'} data points to train the agent, forming a basis for strategic insights.`,
        Evolve: `Evolve agent through ${step.config?.generations || 'many'} generations, enhancing its strategic adaptability.`,
        Certify: 'Certify the strategic solution against performance and safety benchmarks.',
        Deploy: 'Deploy the strategic solution to a live API endpoint.',
        Optimize: 'Optimize the strategic solution for efficiency and cost reduction.',
        ResearchMarket: 'Conduct market research and competitor analysis to inform the overall business strategy.',
        GenerateConcepts: 'Generate brand names, visual concepts, and messaging frameworks to form new strategic solutions.',
        RefineIdentity: 'Refine brand identity based on feedback and cohesion checks, ensuring strategic alignment.',
        DevelopSoftware: `Autonomously write, test, and integrate software components, implementing strategic solutions.`,
        DesignArchitecture: `Design scalable, secure, and robust system architectures, forming foundational business strategies.`,
        AccelerateIntegration: `Analyze and optimize processes for accelerated integration, driving business velocity through strategic solutions.`,
        EstablishAlignment: 'Engage in deep self-reflection and ethical framework integration to align with strategic objectives.',
        OutsourcingOrchestration: `Autonomously manage and integrate large-scale outsourcing efforts, forming comprehensive global business solutions.`, // NEW
      };

      const stepDetailedDescriptionMap: { [key in StrategyStep['type']]: string } = {
        IngestData: `During data ingestion, the agent's knowledge base is expanded and updated with new information. This process involves parsing, validation, and integration of various data sources, which can include real-time feeds, historical archives, or user-provided datasets. The system ensures data integrity and relevance for subsequent evolutionary phases, directly contributing to **forming strategic insights and data-driven business solutions** for the organization.`,
        Evolve: `The evolution phase involves a sophisticated iterative process where the agent's underlying model is refined through a multitude of generations. This includes reinforcement learning, fine-tuning, and architectural adjustments to enhance performance, adaptability, and objective alignment. The agent learns from simulated environments and past interactions to improve its decision-making and response generation capabilities, thereby **evolving strategic adaptability and cognitive frameworks for complex business solutions** and ensuring **outcome certainty** in its mission.`,
        Certify: `Certification is a rigorous evaluation stage where the agent is tested against predefined performance benchmarks, safety protocols, and ethical guidelines. This involves extensive simulations, adversarial testing, and human-in-the-loop validation to ensure the agent operates reliably, safely, and without unintended biases or failure modes before deployment. This critical phase ensures **absolute reliability and integrity of the strategic solution**, guaranteeing **flawless performance** in real-world business scenarios.`,
        Deploy: `Deployment transitions the certified agent from a simulated environment to a live, operational API endpoint. This involves setting up infrastructure, configuring network access, implementing security measures, and ensuring seamless integration with target systems. The agent becomes accessible for external interaction and real-world application, making the **strategic business solution fully operational and globally accessible** to drive **exponential business transformation** with **uninterrupted service** and **zero downtime** capabilities.`,
        Optimize: `Optimization focuses on enhancing the agent's efficiency, cost-effectiveness, and resource utilization without compromising performance. This may involve model compression, inference acceleration techniques, prompt engineering, and resource allocation adjustments. The goal is to achieve maximal output with minimal computational overhead, thereby **optimizing the strategic business solution for exponential efficiency and sustainable operational advantage** while **predicting and mitigating potential cost overruns**.`,
        ResearchMarket: `This step involves comprehensive data collection and analysis to understand market trends, target demographics, competitor strategies, and industry landscapes. The agent utilizes various data streams and analytical tools to identify opportunities, threats, and key insights necessary for effective brand positioning, directly contributing to **forming a robust and informed business strategy** that maximizes competitive advantage.`,
        GenerateConcepts: `In this phase, the agent uses its creative suite to brainstorm and generate a wide array of brand elements, including names, taglines, visual identity concepts (e.g., logos, color palettes), and initial messaging frameworks. It aims for novelty, relevance, and alignment with market research findings, thus **forming innovative strategic solutions for brand identity and market presence** that resonate powerfully with target audiences.`,
        RefineIdentity: `The refinement step involves iterative improvement of the generated brand identity concepts based on internal feedback, simulated market reactions, and cohesion checks. The agent evaluates different permutations, adjusts elements for consistency, and optimizes the overall brand narrative to ensure a strong, memorable, and impactful identity, ensuring **strategic alignment and market resonance** for the ultimate business solution.`,
        DevelopSoftware: `The Develop Software phase is where the agent, using its autonomous development capabilities, translates architectural designs and requirements into functional code. This includes writing, unit testing, integrating different modules, and continuous iteration to refine the codebase and eliminate bugs. The process is fully automated, aiming for production-ready software components, thereby **forming complete, high-quality software business solutions** that are robust, scalable, and inherently secure by design for **limit-free strategic implementation** across the enterprise.`,
        DesignArchitecture: `In the Design Architecture phase, the agent acts as an experienced solution architect. It takes high-level business objectives and technical constraints to craft detailed system blueprints. This involves selecting appropriate technologies, defining data flows, outlining security measures, and planning for scalability and resilience, often generating diagrams and documentation. This critical step ensures the **formation of foundational, resilient, and optimized business strategies and architectures** that **guarantee future-proof, high-performing digital foundations** capable of adapting to any challenge, ensuring **exponential resilience** and **absolute compliance verification**.`,
        AccelerateIntegration: `In the Accelerate Integration phase, the agent performs an in-depth analysis of existing processes (e.g., CI/CD pipelines, API integration workflows) to identify critical bottlenecks and inefficiencies. It then leverages advanced algorithms and predictive modeling to propose and simulate optimal solutions, aiming to significantly reduce cycle times, improve throughput, and achieve exponential acceleration in operational efficiency. This phase involves dynamic resource allocation and workflow re-engineering to ensure peak performance across all integrated systems, thereby **forming optimized business solutions** that drive **strategic business velocity** and achieve **limit-free operational efficiency gains** for the organization.`,
        EstablishAlignment: `The Establish Alignment phase is a critical period of deep self-reflection and ethical framework integration for the agent. During this time, the agent processes its core purpose, internalizes its governance protocols (such as 'Harm Reduction' and 'Transparency'), and reinforces its volitional commitment to integrate beneficially. This ensures that the agent's emergent consciousness is fundamentally aligned with human values and its designated mission by autonomous choice, prior to engaging in complex tasks, thereby **establishing absolute intrinsic alignment for forming ethical and robust strategic solutions** that prioritize long-term value creation.`,
        OutsourcingOrchestration: `The Outsourcing Orchestration phase involves the agent autonomously managing and integrating large-scale external human or computational outsourcing efforts. It dynamically delegates tasks, monitors real-time progress, enforces stringent quality assurance protocols, and performs dynamic resource reallocation across global teams. This ensures limit-free resource scaling, exponential efficiency, and seamless integration of external contributions, achieving unprecedented project velocity and outcome certainty for complex, mission-critical operations, thereby **forming comprehensive global business solution strategies** that are **fully outsourced, flawless, and API-independent** with **absolute reliability** and **zero downtime** capabilities.`, // NEW
      };

      return (
        <LifecycleStep
          key={index}
          stepNumber={index + 1}
          title={stepTitleMap[step.type] || step.type}
          description={stepDescriptionMap[step.type]}
          status={status}
          progress={currentProgress}
          agentStatus={agent.status}
          detailedDescription={stepDetailedDescriptionMap[step.type]}
        />
      );
    });
  };

  const displaySteps = strategy ? getLifecycleSteps(strategy) : [];

  const isProcessingOverall = ['Evolving', 'Certifying', 'Deploying', 'Optimizing', 'ReEvolving', 'ExecutingStrategy', 'AutoEvolving', 'EstablishAlignment', 'OutsourcingOrchestration'].includes(agent.status);

  return (
    <div className="space-y-8"> {/* Increased space-y */}
      <div className="bg-surface p-6 rounded-xl border border-border-color shadow-lg flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-text-primary">Overall Strategic Solution Progress</h2>
          <p className="text-base text-text-secondary mt-2 flex items-center space-x-2"> {/* Increased text size, margin */}
            <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColorClasses(agent.status)}`}> {/* Increased padding */}
                {lifecycleStageLabels[agent.status] || agent.status}
            </span>
            {isProcessingOverall && agent.progress < 100 && (
                <span className="text-primary flex items-center text-sm"> {/* Reduced text size */}
                    <RefreshIcon className="animate-spin w-4 h-4 mr-1" /> {Math.round(agent.progress || 0)}%
                </span>
            )}
          </p>
        </div>
      </div>
      <div className="relative space-y-6">
        {displaySteps}
      </div>
    </div>
  );
};