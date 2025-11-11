
import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import type { Agent, AgentType } from '../types';
import { BuildIcon, AnalysisIcon, DeployIcon, PlaygroundIcon, StrategyIcon, SettingsIcon } from './icons/Icons';
import { getStatusColorClasses } from '../utils/helpers';

interface AgentSidebarProps {
  agent: Agent;
}

const getTypeIcon = (type: AgentType) => {
    switch (type) {
        case 'Creative': return '🎨';
        case 'Analytical': return '🔬';
        case 'Strategist': return '📊'; // NEW: Icon for Strategist type
        case 'Standard':
        default: return '⚙️';
    }
}

const AgentSidebar: React.FC<AgentSidebarProps> = ({ agent }) => {
    const navigate = useNavigate();

    const navLinks = [
        { to: `/agent/${agent._id}/lifecycle`, text: 'Lifecycle', icon: <StrategyIcon /> }, // NEW: Unified Lifecycle link
        { to: `/agent/${agent._id}/analysis`, text: 'Analysis & Optimization', icon: <AnalysisIcon /> },
        { to: `/deploy`, text: 'Deployment Hub', icon: <DeployIcon /> },
        { to: `/playground?agentId=${agent._id}`, text: 'Go to Playground', icon: <PlaygroundIcon /> },
        // { to: `/agent/${agent._id}/model-routing`, text: 'Model Routing', icon: <SettingsIcon /> }, // REMOVED
    ];
    
    return (
        <aside className="w-64 flex-shrink-0 bg-surface rounded-xl border border-border-color p-4 flex flex-col">
            <div className="p-4 mb-4 border-b border-border-color">
                <h2 className="text-xl font-bold text-text-primary flex items-center">
                    <span className="text-2xl mr-2">{getTypeIcon(agent.type)}</span>
                    {agent.name}
                </h2>
                <p className="text-xs text-text-secondary mt-1">{agent.type} Agent</p>
                <div className="mt-3">
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColorClasses(agent.status)}`}>
                        {agent.status}
                    </span>
                </div>
            </div>
            <nav className="flex-1 space-y-2">
                {navLinks.map(link => (
                     <NavLink
                        key={link.text}
                        to={link.to}
                        end={link.to.includes('?')} // Handle query params for playground link
                        className={({ isActive }) =>
                            `flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                            isActive
                                ? 'bg-primary text-white'
                                : 'text-text-secondary hover:bg-surface-light hover:text-text-primary'
                            }`
                        }
                     >
                        {link.icon}
                        <span>{link.text}</span>
                    </NavLink>
                ))}
            </nav>
            <div className="mt-auto">
                 <button onClick={() => navigate('/dashboard')} className="w-full text-center text-sm text-text-secondary hover:text-primary transition-colors py-2">
                    &larr; Back to Dashboard
                </button>
            </div>
        </aside>
    );
};

export default AgentSidebar;
