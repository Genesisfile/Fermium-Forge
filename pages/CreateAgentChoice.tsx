import React from 'react';
import { useNavigate } from 'react-router-dom';
import { StrategyIcon, BuildIcon } from '../components/icons/Icons';
import { useAgentStore } from '../hooks/useAgentStore'; // Import useAgentStore to create a new agent

const CreateAgentChoice: React.FC = () => {
    const navigate = useNavigate();
    const { createAgent } = useAgentStore(); // Get createAgent from the store

    const handleManualBuild = () => {
        // Create a new agent with a default 'Conception' status and no strategyId
        const newAgent = createAgent("My New Agent", "Describe your agent's objective here.", "Standard");
        navigate(`/agent/${newAgent._id}/lifecycle`); // Navigate to the new unified lifecycle page
    };

    return (
        <div className="container mx-auto py-12">
            <div className="text-center mb-12">
                <h1 className="text-5xl font-extrabold mb-4">How would you like to create?</h1>
                <p className="max-w-3xl mx-auto text-lg text-text-secondary">
                    Fermium Forge offers two powerful methods for bringing your AI agents to life. Choose the path that best suits your project's needs.
                </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                {/* Strategic Design Card */}
                <div className="bg-surface p-8 rounded-xl border-2 border-border-color hover:border-primary transition-all duration-300 flex flex-col shadow-lg hover:shadow-primary/20">
                    <div className="flex items-center space-x-4 mb-4">
                        <div className="bg-primary/20 text-primary p-3 rounded-lg">
                            <StrategyIcon />
                        </div>
                        <h2 className="text-2xl font-bold">Strategic Design</h2>
                    </div>
                    <p className="text-text-secondary flex-grow mb-6">
                        The fastest path to an elite agent. Design your AI using autonomous strategies and integrate powerful, pre-built Feature Engines from the start. Recommended for advanced, purpose-built solutions.
                    </p>
                    <button
                        onClick={() => navigate('/strategy')}
                        className="w-full bg-primary text-white font-bold py-3 rounded-lg hover:bg-primary-focus transition-colors"
                    >
                        Start Strategic Design
                    </button>
                </div>

                {/* Manual Build Card */}
                <div className="bg-surface p-8 rounded-xl border-2 border-border-color hover:border-accent transition-all duration-300 flex flex-col shadow-lg hover:shadow-accent/20">
                     <div className="flex items-center space-x-4 mb-4">
                        <div className="bg-accent/20 text-accent p-3 rounded-lg">
                            <BuildIcon />
                        </div>
                        <h2 className="text-2xl font-bold">Manual Build</h2>
                    </div>
                    <p className="text-text-secondary flex-grow mb-6">
                        For those who prefer granular control. Guide your agent through each stage of its lifecycle—Conception, Evolution, Certification, and Deployment—one step at a time. Ideal for learning and direct oversight.
                    </p>
                    <button
                        onClick={handleManualBuild} // Call the new handler
                        className="w-full bg-accent text-white font-bold py-3 rounded-lg hover:bg-accent-focus transition-colors"
                    >
                        Start Manual Build
                    </button>
                </div>
            </div>

            <div className="text-center mt-12">
                <button onClick={() => navigate('/dashboard')} className="text-sm text-text-secondary hover:text-primary transition-colors">
                    &larr; Go back to Dashboard
                </button>
            </div>
        </div>
    );
};

export default CreateAgentChoice;