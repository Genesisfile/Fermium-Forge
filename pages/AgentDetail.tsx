import React from 'react';
import { useParams, Outlet, useNavigate } from 'react-router-dom';
import { useAgentStore } from '../hooks/useAgentStore';
import AgentSidebar from '../components/AgentSidebar';

const AgentDetail: React.FC = () => {
    const { agentId } = useParams<{ agentId: string }>();
    const { getAgent } = useAgentStore();
    const navigate = useNavigate();
    
    if (!agentId) {
        navigate('/dashboard');
        return null;
    }
    
    const agent = getAgent(agentId);

    if (!agent) {
        return (
            <div className="container mx-auto py-8 text-center">
                <h1 className="text-3xl font-bold">Agent Not Found</h1>
                <p className="text-text-secondary mt-4">The agent you are looking for does not exist.</p>
                <button onClick={() => navigate('/dashboard')} className="mt-6 bg-primary text-white font-bold py-2 px-6 rounded-lg hover:bg-primary-focus transition-colors">
                    Back to Dashboard
                </button>
            </div>
        );
    }
    
    return (
        <div className="container mx-auto py-8 flex gap-8">
            <AgentSidebar agent={agent} />
            <main className="flex-1">
                <Outlet context={agent} />
            </main>
        </div>
    );
};

export default AgentDetail;
