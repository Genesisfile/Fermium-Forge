

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { SparklesIcon, SyncIcon, DeployIcon, StrategyIcon, BuildIcon, LightbulbIcon } from '../components/icons/Icons';

const Home: React.FC = () => {
    const navigate = useNavigate();
    return (
        <div className="container mx-auto py-12 animate-fade-in overflow-hidden">
            {/* Hero Section */}
            <section className="text-center mb-24 md:mb-32">
                <h1 className="text-5xl md:text-7xl font-extrabold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
                    Beyond Chat. Build Autonomous AI Agents.
                </h1>
                <p className="max-w-3xl mx-auto text-xl md:text-2xl text-text-primary mb-8">
                    Transform your ideas into specialized, deployable AI agents that execute complex strategies and evolve over time.
                </p>
                <button
                    onClick={() => navigate('/strategy')} // Navigate directly to strategy operations
                    className="bg-primary text-white font-bold py-4 px-10 rounded-lg hover:bg-primary-focus transition-transform transform hover:scale-105 shadow-lg shadow-primary/30 text-lg"
                >
                    Forge Your First Agent
                </button>
            </section>

            {/* From Prompt to Protocol Section */}
            <section className="mb-24 md:mb-32">
                <div className="text-center max-w-3xl mx-auto">
                    <h2 className="text-4xl font-bold mb-4">From Prompt to Protocol in Three Steps</h2>
                    <p className="text-text-secondary mb-12">Our AI-driven workflow makes agent creation intuitive and powerful. Your vision is the only prerequisite.</p>
                </div>
                <div className="grid md:grid-cols-3 gap-8 text-center">
                    <div className="bg-surface p-8 rounded-xl border border-border-color shadow-lg">
                        <div className="bg-primary/20 text-primary p-4 rounded-full w-16 h-16 mx-auto mb-6 flex items-center justify-center">
                           <LightbulbIcon/>
                        </div>
                        <h3 className="text-2xl font-semibold mb-2">1. Describe</h3>
                        <p className="text-text-secondary">Articulate your objective in plain English. Describe the task, the goal, and any specific capabilities you need.</p>
                    </div>
                     <div className="bg-surface p-8 rounded-xl border border-border-color shadow-lg">
                        <div className="bg-primary/20 text-primary p-4 rounded-full w-16 h-16 mx-auto mb-6 flex items-center justify-center">
                           <SparklesIcon/>
                        </div>
                        <h3 className="text-2xl font-semibold mb-2">2. Blueprint</h3>
                        <p className="text-text-secondary">Our AI Strategist analyzes your concept and generates a complete operational blueprint, configuring the optimal strategy, engines, and lifecycle.</p>
                    </div>
                     <div className="bg-surface p-8 rounded-xl border border-border-color shadow-lg">
                        <div className="bg-primary/20 text-primary p-4 rounded-full w-16 h-16 mx-auto mb-6 flex items-center justify-center">
                           <DeployIcon/>
                        </div>
                        <h3 className="text-2xl font-semibold mb-2">3. Launch</h3>
                        <p className="text-text-secondary">Review and approve the blueprint. Your agent begins its autonomous lifecycle, evolving and deploying to a live API endpoint automatically.</p>
                    </div>
                </div>
            </section>

            {/* The Autonomous Core Section */}
            <section className="mb-24 md:mb-32">
                 <div className="text-center max-w-3xl mx-auto">
                    <h2 className="text-4xl font-bold mb-4">The Autonomous Core</h2>
                    <p className="text-text-secondary mb-12">Fermium Forge agents are more than just models. They are persistent, stateful entities designed for complex, long-running tasks.</p>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 text-left">
                    <div className="bg-surface p-6 rounded-xl border border-border-color">
                        <div className="text-primary mb-4 w-8 h-8"><StrategyIcon /></div>
                        <h3 className="text-xl font-semibold mb-2">Strategic Execution</h3>
                        <p className="text-text-secondary">Launch agents that follow complex, multi-step strategies involving data ingestion, evolution, certification, and optimization without manual intervention.</p>
                    </div>
                     <div className="bg-surface p-6 rounded-xl border border-border-color">
                        <div className="text-primary mb-4 w-8 h-8"><SyncIcon /></div>
                        <h3 className="text-xl font-semibold mb-2">Auto-Evolution</h3>
                        <p className="text-text-secondary">Enable a real-time feedback loop, allowing your agent to analyze new data, learn from interactions, and trigger its own re-evolution cycles to improve over time.</p>
                    </div>
                     <div className="bg-surface p-6 rounded-xl border border-border-color">
                        <div className="text-primary mb-4 w-8 h-8"><BuildIcon /></div>
                        <h3 className="text-xl font-semibold mb-2">Feature Engines</h3>
                        <p className="text-text-secondary">Integrate powerful, pre-built capabilities like Live Web Grounding, advanced problem-solving, and creative content generation to specialize your agent's skills.</p>
                    </div>
                    <div className="bg-surface p-6 rounded-xl border border-border-color">
                        <div className="text-primary mb-4 w-8 h-8"><DeployIcon /></div>
                        <h3 className="text-xl font-semibold mb-2">Instant Deployment</h3>
                        <p className="text-text-secondary">Every certified agent is automatically deployed to a production-ready, scalable API endpoint, complete with SDKs for seamless integration.</p>
                    </div>
                </div>
            </section>

             {/* Final CTA Section */}
            <section className="bg-gradient-to-r from-primary/80 to-accent/80 p-12 rounded-2xl text-center">
                 <h2 className="text-4xl font-extrabold text-white mb-4">Your Vision, Forged into Intelligence.</h2>
                 <p className="max-w-3xl mx-auto text-white/90 mb-8 text-lg">
                    Stop wrestling with models and start building intelligent systems. Fermium Forge provides the complete, end-to-end platform to bring sophisticated AI agents to life. What will you create?
                 </p>
                 <button
                    onClick={() => navigate('/strategy')} // Navigate directly to strategy operations
                    className="bg-white text-primary font-bold py-4 px-10 rounded-lg hover:bg-gray-200 transition-transform transform hover:scale-105 shadow-2xl text-lg"
                >
                    Start Forging Now
                </button>
            </section>
        </div>
    );
};

export default Home;