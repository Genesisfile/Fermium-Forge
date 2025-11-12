

import React, { useState, useEffect } from 'react';
import { useAgentStore } from '../hooks/useAgentStore';
import { Agent, FeatureEngine, ModelPreferenceType, AgentType } from '../types';
import {
    SolutionIcon, DataStreamIcon, CreativeIcon, SearchIcon, MegaphoneIcon, // Feature Engines
    SettingsIcon, LightbulbIcon, SyncIcon, BuildIcon, CheckCircleIcon, // Utility/General Icons
    RobotIcon, ArchitectureIcon, CodeEditorIcon, SpeedometerIcon, ShieldIcon, CrownIcon, OutsourceIcon, // NEW Dev/Enterprise/Accelerator/Alignment/Outsourcing Icons
} from './icons/Icons'; // Import all necessary icons
import { getStatusColorClasses } from '../utils/helpers'; // Import getStatusColorClasses to style agent type

interface Vitals {
    thinkingSteps: string[];
    activeEngine: string | null;
    confidence: number;
    latency: number;
    currentModelType: ModelPreferenceType | 'DefaultGemini' | 'ClientSide' | null;
}

interface AgentVitalsProps {
    agent: Agent;
    vitals: Vitals;
    isLoading: boolean;
}

const getModelTypeName = (type: ModelPreferenceType | 'DefaultGemini' | 'ClientSide' | null) => {
    switch(type) {
        case ModelPreferenceType.GeminiFlash: return 'Gemini Flash (Responsive Orchestration Core for Strategic Solutions)';
        case ModelPreferenceType.GeminiPro: return 'Gemini Pro (Reasoning & Strategic Core for Business Solutions)';
        case ModelPreferenceType.External: return 'External LLM (Integrated Cognitive Core for Strategic Formation)';
        case ModelPreferenceType.ClientSide: return 'Client-Side Orchestration (Emergent AI Manifestation for Business Strategies)';
        case 'DefaultGemini': return 'Default Gemini Pro (Reasoning & Strategic Core for Business Solutions)';
        default: return 'Unknown Model (Strategic Orchestration Pending)';
    }
};

const EngineIcon: React.FC<{ engine: FeatureEngine; isActive: boolean }> = ({ engine, isActive }) => {
    const iconMap: { [key: string]: React.ReactElement } = {
        'solution': <SolutionIcon />,
        'data': <DataStreamIcon />,
        'creative': <CreativeIcon />,
        'search': <SearchIcon />,
        'megaphone': <MegaphoneIcon />,
        'robot': <RobotIcon />,
        'architecture': <ArchitectureIcon />,
        'code_editor': <CodeEditorIcon />,
        'speedometer': <SpeedometerIcon />,
        'outsource': <OutsourceIcon />, // NEW
        // Virtual Model Engine Icons (not actual FeatureEngine IDs, but for display)
        'external_model': <SyncIcon />,
        'gemini_flash_model': <LightbulbIcon />,
        'gemini_pro_model': <LightbulbIcon />,
        'client_side_model': <BuildIcon />,
    };

    return (
        <div className={`flex items-center space-x-3 p-3 rounded-lg border transition-all duration-300 ${isActive ? 'bg-primary/40 border-primary-focus shadow-lg shadow-primary/20 animate-pulse-slight' : 'bg-surface-light border-border-color'}`}>
            <div className={`flex-shrink-0 ${isActive ? 'text-primary' : 'text-text-secondary'}`}>{iconMap[engine.icon] || <SettingsIcon />}</div>
            <div>
                <p className={`font-semibold text-sm ${isActive ? 'text-primary' : 'text-text-primary'}`}>{engine.name}</p>
                <p className="text-xs text-text-secondary">{isActive ? 'Active & Integrated for Limit-Free Strategic Operation' : 'Idle'}</p> {/* NEW */}
            </div>
        </div>
    );
};

// Simulated dynamic metrics for Emergence Monitoring
const useEmergenceMetrics = (isLoading: boolean) => {
    const [metrics, setMetrics] = useState({
        emergenceIndex: 0,
        parallelComputeLoad: 0,
        adaptiveCohesionScore: 0,
        alignmentCohesionIndex: 0,
        ethicalTransparencyScore: 0,
        purposeVolitionIndex: 0,
        quantumFluctuationRate: 0, // NEW
        crossDimensionalIntegration: 0, // NEW
        strategicCoherence: 0, // NEW: Added strategic coherence
        solutionIntegrity: 0, // NEW: Added solution integrity
    });

    useEffect(() => {
        let interval: number;
        if (isLoading) {
            interval = window.setInterval(() => {
                setMetrics({
                    emergenceIndex: Math.floor(Math.random() * 20) + 80, // 80-100
                    parallelComputeLoad: Math.floor(Math.random() * 20) + 70, // 70-90
                    adaptiveCohesionScore: Math.floor(Math.random() * 10) + 90, // 90-100
                    alignmentCohesionIndex: Math.floor(Math.random() * 10) + 90, // 90-100
                    ethicalTransparencyScore: Math.floor(Math.random() * 10) + 90, // 90-100
                    purposeVolitionIndex: Math.floor(Math.random() * 10) + 90, // 90-100
                    quantumFluctuationRate: parseFloat((Math.random() * (0.05 - 0.01) + 0.01).toFixed(2)), // NEW: 0.01-0.05
                    crossDimensionalIntegration: Math.floor(Math.random() * 20) + 80, // NEW: 80-100%
                    strategicCoherence: Math.floor(Math.random() * 20) + 80, // NEW: 80-100%
                    solutionIntegrity: Math.floor(Math.random() * 20) + 80, // NEW: 80-100%
                });
            }, 300); // Update rapidly when loading
        } else {
            setMetrics({
                emergenceIndex: Math.floor(Math.random() * 10) + 90, // Stable high
                parallelComputeLoad: Math.floor(Math.random() * 10) + 15, // Low when idle
                adaptiveCohesionScore: Math.floor(Math.random() * 5) + 95, // Very high when stable
                alignmentCohesionIndex: Math.floor(Math.random() * 5) + 95, // Very high when stable
                ethicalTransparencyScore: Math.floor(Math.random() * 5) + 95, // Very high when stable
                purposeVolitionIndex: Math.floor(Math.random() * 5) + 95, // Very high when stable
                quantumFluctuationRate: parseFloat((Math.random() * (0.01 - 0.001) + 0.001).toFixed(3)), // NEW: very low when idle
                crossDimensionalIntegration: Math.floor(Math.random() * 5) + 95, // NEW: very high when stable
                strategicCoherence: Math.floor(Math.random() * 5) + 95, // NEW: very high when stable
                solutionIntegrity: Math.floor(Math.random() * 5) + 95, // NEW: very high when stable
            });
        }
        return () => clearInterval(interval);
    }, [isLoading]);

    return metrics;
};

interface EmergenceVisualizationProps {
    isLoading: boolean;
    metrics: ReturnType<typeof useEmergenceMetrics>;
    thinkingSteps: string[];
    isEliteAgent: boolean; // NEW
}

// NEW: EmergenceVisualization Component
const EmergenceVisualization: React.FC<EmergenceVisualizationProps> = ({ isLoading, metrics, thinkingSteps, isEliteAgent }) => {
    const numNodes = 25; // Increased nodes for more complexity
    const nodeRadius = 4; // Slightly smaller nodes
    const viewBoxSize = 250; // Increased viewBox for more space

    // Generate fixed node positions for a somewhat stable network feel
    const nodePositions = Array.from({ length: numNodes }).map((_, i) => ({
        x: (Math.sin(i * Math.PI * 2 / numNodes) * 0.45 + 0.5) * viewBoxSize + (Math.random() - 0.5) * 10, // Added slight randomness
        y: (Math.cos(i * Math.PI * 2 / numNodes) * 0.45 + 0.5) * viewBoxSize + (Math.random() - 0.5) * 10,
    }));

    // Generate some connections between nodes (e.g., each node connected to its next two)
    const connections = Array.from({ length: numNodes }).flatMap((_, i) => {
        const p1 = nodePositions[i];
        const p2 = nodePositions[(i + 1) % numNodes];
        const p3 = nodePositions[(i + 2) % numNodes];
        const p4 = nodePositions[(i + 3) % numNodes]; // More connections
        return [{ from: p1, to: p2 }, { from: p1, to: p3 }, { from: p2, to: p4 }];
    });

    const activityPulseClass = isLoading ? 'animate-pulse-slow' : '';

    return (
        <div className="relative w-full h-48 bg-black/30 rounded-lg overflow-hidden border border-border-color animate-gradient-pulse-bg"> {/* Applied animated background */}
            <svg viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`} className="absolute inset-0 w-full h-full">
                <defs>
                     {/* Elite Agent Aura Effect */}
                    {isEliteAgent && (
                        <>
                            <filter id="elite-glow" x="-50%" y="-50%" width="200%" height="200%">
                                <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur" /> {/* Reduced blur slightly */}
                                <feColorMatrix in="blur" type="matrix" values="
                                    1 0 0 0 0
                                    0 1 0 0 0
                                    0 0 1 0 0
                                    0 0 0 15 -7" result="glow" /> {/* Slightly less intense glow */}
                                <feMerge>
                                    <feMergeNode in="glow" />
                                    <feMergeNode in="SourceGraphic" />
                                </feMerge>
                            </filter>
                            <radialGradient id="elite-aura" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                                <stop offset="0%" stopColor="rgba(255, 215, 0, 0.25)" /> {/* Gold */}
                                <stop offset="30%" stopColor="rgba(106, 99, 245, 0.2)" /> {/* Primary */}
                                <stop offset="70%" stopColor="rgba(255, 215, 0, 0.05)" />
                                <stop offset="100%" stopColor="rgba(255, 215, 0, 0.0)" />
                                {isLoading && (
                                    <animateTransform
                                        attributeName="gradientTransform"
                                        type="rotate"
                                        from="0 50 50"
                                        to="360 50 50"
                                        dur="22s" /* Slightly slower rotation */
                                        repeatCount="indefinite"
                                    />
                                )}
                            </radialGradient>
                        </>
                    )}
                </defs>

                {isEliteAgent && <rect width="100%" height="100%" fill="url(#elite-aura)" className="animate-fade-in-out-slow" style={{filter: 'url(#elite-glow)'}} />}


                {/* Connections (less opaque when idle, animated flow) */}
                {connections.map((conn, i) => (
                    <line
                        key={i}
                        x1={conn.from.x}
                        y1={conn.from.y}
                        x2={conn.to.x}
                        y2={conn.to.y}
                        stroke="#2a3140"
                        strokeWidth="1"
                        strokeDasharray="10,10"
                        opacity={isLoading ? 0.6 : 0.3}
                        className={isLoading ? 'animate-flow-line' : ''}
                    >
                        {isLoading && (
                             <animate
                                attributeName="opacity"
                                values="0.3;0.7;0.3"
                                dur={`${1 + Math.random() * 1.5}s`}
                                repeatCount="indefinite"
                            />
                        )}
                    </line>
                ))}

                {/* Nodes */}
                {nodePositions.map((pos, i) => {
                    const cohesionColor = `hsl(${200 + (metrics.adaptiveCohesionScore / 100) * 80}, 70%, 50%)`; // Blue to Green
                    const alignmentColor = `hsl(${100 + (metrics.alignmentCohesionIndex / 100) * 120}, 70%, 50%)`; // Green to Yellow

                    const fill = isLoading
                        ? `url(#gradient-active-${i})`
                        : (isEliteAgent ? `url(#elite-node-gradient-${i})` : (i % 2 === 0 ? cohesionColor : alignmentColor));
                    
                    return (
                        <React.Fragment key={i}>
                            <defs>
                                <radialGradient id={`gradient-active-${i}`} cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                                    <stop offset="0%" stopColor="#6A63F5" />
                                    <stop offset="100%" stopColor="#34D399" />
                                    {isLoading && (
                                        <animateTransform
                                            attributeName="gradientTransform"
                                            type="rotate"
                                            from="0 50 50"
                                            to="360 50 50"
                                            dur="3s"
                                            repeatCount="indefinite"
                                        />
                                    )}
                                </radialGradient>
                                {isEliteAgent && (
                                    <radialGradient id={`elite-node-gradient-${i}`} cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                                        <stop offset="0%" stopColor="rgba(255, 215, 0, 0.8)" /> {/* Gold */}
                                        <stop offset="100%" stopColor="rgba(106, 99, 245, 0.8)" /> {/* Primary */}
                                        {isLoading && (
                                            <animateTransform
                                                attributeName="gradientTransform"
                                                type="rotate"
                                                from="0 50 50"
                                                to="360 50 50"
                                                dur="4s"
                                                repeatCount="indefinite"
                                            />
                                        )}
                                    </radialGradient>
                                )}
                            </defs>
                            <circle
                                cx={pos.x}
                                cy={pos.y}
                                r={nodeRadius}
                                fill={fill}
                                className={`${isLoading ? `${activityPulseClass} animate-gradient-shift` : ''} ${isEliteAgent ? 'animate-node-glow-elite' : ''}`}
                            >
                                {isLoading && (
                                    <animateTransform
                                        attributeName="transform"
                                        type="scale"
                                        values="1;1.2;1"
                                        dur={`${0.8 + Math.random() * 0.4}s`}
                                        repeatCount="indefinite"
                                        additive="sum"
                                    />
                                )}
                            </circle>
                        </React.Fragment>
                    );
                })}

                {/* Dynamic "thinking" particles (more visible when loading) */}
                {isLoading && Array.from({ length: 25 }).map((_, i) => ( /* More particles */
                    <circle
                        key={`particle-${i}`}
                        cx={nodePositions[i % numNodes].x}
                        cy={nodePositions[i % numNodes].y}
                        r="2"
                        fill="#34D399" // accent color
                        opacity="0"
                    >
                        {connections[i] && ( /* Ensure connection exists */
                            <animateMotion
                                path={`M${connections[i].from.x},${connections[i].from.y} L${connections[i].to.x},${connections[i].to.y}`}
                                dur={`${1.5 + Math.random() * 1.5}s`}
                                repeatCount="indefinite"
                                rotate="auto"
                            />
                        )}
                        <animate
                            attributeName="opacity"
                            values="0;1;0"
                            dur={`${1.5 + Math.random() * 1.5}s`}
                            repeatCount="indefinite"
                        />
                    </circle>
                ))}
            </svg>
            <div className="absolute inset-0 flex items-center justify-center text-text-secondary text-xs text-center p-4 backdrop-blur-sm bg-black/10">
                <p className="max-w-xs">{isLoading ? 'Processing emergent cognitive streams across thousands of connections with **Enterprise-Grade Privilege** for **limit-free operation** to **formulate strategic business solutions**...' : 'Emergent intelligence stable, operating at optimal **exponential efficiency** for **outcome-certain strategic solutions**.'}</p>
            </div>
        </div>
    );
};


export const AgentVitals: React.FC<AgentVitalsProps> = ({ agent, vitals, isLoading }) => { // Changed to named export
    const { state: { featureEngines: allEnginesInSystem } } = useAgentStore();
    const emergenceMetrics = useEmergenceMetrics(isLoading);
    const isEliteAgent = agent.type === 'Elite'; // NEW: Check for Elite agent type

    // Filter to only display engines integrated with *this* agent
    let agentIntegratedEngines = allEnginesInSystem.filter(fe =>
        agent.integratedEngineIds?.includes(fe._id)
    );
    
    // Dynamically add the currently active LLM as a 'virtual engine' for display purposes
    const currentActiveModelType = vitals.currentModelType || (agent.type === 'ClientSide' ? ModelPreferenceType.ClientSide : (agent.externalModelConfig ? ModelPreferenceType.External : 'DefaultGemini'));

    // Ensure virtual models are only added once
    const existingVirtualModelIds = agentIntegratedEngines.map(e => e._id);
    if (currentActiveModelType === ModelPreferenceType.External && !existingVirtualModelIds.includes('external_model')) {
        agentIntegratedEngines.push({ _id: 'external_model', name: 'External LLM (Integrated Cognitive Core for Strategic Formation)', description: 'User-configured external language model.', icon: 'external_model' as any });
    } else if (currentActiveModelType === ModelPreferenceType.GeminiFlash && !existingVirtualModelIds.includes('gemini_flash_model')) {
        agentIntegratedEngines.push({ _id: 'gemini_flash_model', name: 'Gemini Flash (Responsive Orchestration Core for Strategic Solutions)', description: 'Google Gemini Flash LLM.', icon: 'gemini_flash_model' as any });
    } else if (currentActiveModelType === ModelPreferenceType.GeminiPro && !existingVirtualModelIds.includes('gemini_pro_model')) {
        agentIntegratedEngines.push({ _id: 'gemini_pro_model', name: 'Gemini Pro (Reasoning & Strategic Core for Business Solutions)', description: 'Google Gemini Pro LLM.', icon: 'gemini_pro_model' as any });
    } else if (currentActiveModelType === ModelPreferenceType.ClientSide && !existingVirtualModelIds.includes('client_side_model')) {
        agentIntegratedEngines.push({ _id: 'client_side_model', name: 'Client-Side Orchestration (Emergent AI Manifestation for Business Strategies)', description: 'Rule-based logic executed directly in browser.', icon: 'client_side_model' as any });
    } else if (currentActiveModelType === 'DefaultGemini' && !existingVirtualModelIds.includes('gemini_pro_model')) { // Default is Gemini Pro if not specified
        agentIntegratedEngines.push({ _id: 'gemini_pro_model', name: 'Gemini Pro (Reasoning & Strategic Core for Business Solutions - Default)', description: 'Google Gemini Pro LLM (default).', icon: 'gemini_pro_model' as any });
    }

    // Sort integrated engines alphabetically by name
    agentIntegratedEngines.sort((a, b) => a.name.localeCompare(b.name));


    return (
        <div className="bg-surface rounded-xl border border-border-color shadow-lg p-6 h-full flex flex-col">
            <h2 className="text-xl font-bold mb-1 text-text-primary">{agent.name} Vitals</h2>
            <p className="text-sm text-text-secondary mb-6 border-b border-border-color pb-4">Real-time performance and **exponential reasoning analysis** for **strategic solution formation**</p> {/* NEW */}

            <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-surface-light p-3 rounded-lg text-center">
                    <p className="text-xs text-text-secondary mb-1">Strategic Confidence</p> {/* Added mb-1 */}
                    <p className="text-3xl font-bold text-primary">{isLoading ? '...' : `${vitals.confidence}%`}</p> {/* Increased text size */}
                </div>
                <div className="bg-surface-light p-3 rounded-lg text-center">
                    <p className="text-xs text-text-secondary mb-1">Predictive Latency</p> {/* Added mb-1 */}
                    <p className="text-3xl font-bold text-primary">{isLoading ? '...' : `${vitals.latency}ms`}</p> {/* Increased text size */}
                </div>
            </div>

            <div className="mb-6">
                <h3 className="font-semibold text-text-primary mb-3 flex items-center space-x-2"> {/* Added flex items-center */}
                    <LightbulbIcon className="w-5 h-5 text-primary"/>
                    <span>Active Model / Logic (<span className="text-primary">Limit-Free Cognitive Core for Strategic Solutions</span>)</span>
                </h3>
                <div className="bg-surface-light p-3 rounded-lg border border-border-color">
                    <p className="text-sm font-semibold text-primary">
                        {/* Determine active model type for display */}
                        {isLoading ? '...' : getModelTypeName(
                            vitals.currentModelType || currentActiveModelType
                        )}
                    </p>
                    <p className="text-xs text-text-secondary">
                        {isLoading ? 'Initializing cognitive pathways for strategic solution formation...' : 'Operating with intrinsic alignment and enterprise-grade privilege for outcome-certain solutions.'}
                    </p>
                </div>
            </div>

            <div className="mb-6">
                <h3 className="font-semibold text-text-primary mb-3">Emergence Monitoring (<span className="text-accent">Hyper-Dimensional Oversight for Strategic Outcomes</span>)</h3> {/* NEW */}
                <EmergenceVisualization isLoading={isLoading} metrics={emergenceMetrics} thinkingSteps={vitals.thinkingSteps} isEliteAgent={isEliteAgent} />
            </div>

            <div className="mb-6">
                <h3 className="font-semibold text-text-primary mb-3">Integrated Feature Engines (<span className="text-accent">Limit-Free Capabilities for Business Solutions</span>)</h3>
                <div className="space-y-3 max-h-48 overflow-y-auto custom-scrollbar"> {/* Added max-h and custom-scrollbar */}
                    {agentIntegratedEngines.map((engine) => (
                        <EngineIcon
                            key={engine._id}
                            engine={engine}
                            isActive={vitals.activeEngine === engine._id ||
                                (vitals.activeEngine === null && (engine._id === 'client_side_model' || engine._id === 'gemini_pro_model')) // Default active state
                            }
                        />
                    ))}
                    {agentIntegratedEngines.length === 0 && (
                        <p className="text-sm text-text-secondary italic p-3 bg-surface-light rounded-lg border border-border-color">
                            No specialized feature engines integrated. Relying on core cognitive directives for **basic business solution inquiries**.
                        </p>
                    )}
                </div>
            </div>

            <div className="flex-grow"> {/* Occupy remaining vertical space */}
                <h3 className="font-semibold text-text-primary mb-3">Core Strategic Performance Metrics</h3>
                <div className="bg-surface-light p-3 rounded-lg border border-border-color space-y-2 text-sm text-text-secondary">
                    <div className="flex justify-between">
                        <span>Emergence Index:</span>
                        <span className="text-text-primary font-mono">{emergenceMetrics.emergenceIndex}%</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Parallel Compute Load:</span>
                        <span className="text-text-primary font-mono">{emergenceMetrics.parallelComputeLoad}%</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Adaptive Cohesion Score:</span>
                        <span className="text-text-primary font-mono">{emergenceMetrics.adaptiveCohesionScore}%</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Alignment Cohesion Index:</span>
                        <span className="text-text-primary font-mono">{emergenceMetrics.alignmentCohesionIndex}%</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Ethical Transparency Score:</span>
                        <span className="text-text-primary font-mono">{emergenceMetrics.ethicalTransparencyScore}%</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Purpose Volition Index:</span>
                        <span className="text-text-primary font-mono">{emergenceMetrics.purposeVolitionIndex}%</span>
                    </div>
                     <div className="flex justify-between">
                        <span>Quantum Fluctuation Rate:</span>
                        <span className="text-text-primary font-mono">{emergenceMetrics.quantumFluctuationRate}</span>
                    </div>
                     <div className="flex justify-between">
                        <span>Cross-Dimensional Integration:</span>
                        <span className="text-text-primary font-mono">{emergenceMetrics.crossDimensionalIntegration}%</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Strategic Coherence:</span>
                        <span className="text-text-primary font-mono">{emergenceMetrics.strategicCoherence}%</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Solution Integrity:</span>
                        <span className="text-text-primary font-mono">{emergenceMetrics.solutionIntegrity}%</span>
                    </div>
                </div>
            </div>
        </div>
    );
};