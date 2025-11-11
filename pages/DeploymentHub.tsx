
import React, { useState } from 'react';
import { useAgentStore } from '../hooks/useAgentStore';
import type { Agent } from '../types';
import { useNavigate } from 'react-router-dom';
import { DownloadIcon } from '../components/icons/Icons';

interface ExportModalProps {
    agent: Agent;
    endpointUrl: string;
    onClose: () => void;
}

const downloadFile = (filename: string, content: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};

const CodeSnippet: React.FC<{ language: string; code: string }> = ({ language, code }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div>
            <h4 className="text-sm font-semibold text-text-secondary mb-2">{language}</h4>
            <div className="relative bg-black/50 p-4 rounded-lg font-mono text-sm border border-border-color">
                <button onClick={handleCopy} className="absolute top-2 right-2 text-text-secondary hover:text-text-primary transition-colors">
                    {copied ? 'Copied!' : 'Copy'}
                </button>
                <pre><code className={`language-${language.toLowerCase()}`}>{code}</code></pre>
            </div>
        </div>
    );
};

const ExportModal: React.FC<ExportModalProps> = ({ agent, endpointUrl, onClose }) => {
    const agentJson = JSON.stringify({
        id: agent._id,
        name: agent.name,
        objective: agent.objective,
        endpoint: endpointUrl,
    }, null, 2);

    const htmlDemo = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Fermium Forge Agent Demo</title>
    <style>
        body { font-family: sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; background: #0A0E14; color: #E0E0E0; }
        #widget { width: 400px; border: 1px solid #2a3140; border-radius: 8px; background: #101620; }
        h2 { text-align: center; color: #6A63F5; }
    </style>
</head>
<body>
    <div id="agent-chat-widget">
        <h2>${agent.name} Demo</h2>
        <!-- Widget implementation here... -->
    </div>
    <script>
        const agentId = "${agent._id}";
        // This is a placeholder. A real widget would be loaded here.
        console.log("Agent ID:", agentId);
    </script>
    <script src="https://fermium-forge.io/widgets/chat.js" defer></script>
</body>
</html>`;

    const jsSdk = `
import { FermiumAgent } from 'fermium-forge-sdk';

const agent = new FermiumAgent({ agentId: "${agent._id}" });

async function queryAgent() {
    const response = await agent.chat("Hello, agent!");
    console.log(response);
}
queryAgent();`;
    
    const pythonSdk = `
from fermium_forge_sdk import FermiumAgent

agent = FermiumAgent(agent_id="${agent._id}")

response = agent.chat("Hello, agent!")
print(response)`;

    const handleDownloadJson = () => {
        downloadFile('agent.json', agentJson, 'application/json');
    };

    const handleDownloadHtml = () => {
        downloadFile('demo.html', htmlDemo, 'text/html');
    };

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-surface w-full max-w-2xl rounded-xl border border-border-color shadow-2xl p-8 transform transition-all" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold">Export Agent: {agent.name}</h2>
                    <button onClick={onClose} className="text-text-secondary hover:text-text-primary">&times;</button>
                </div>
                <div className="space-y-6">
                    <div>
                        <h3 className="text-lg font-semibold mb-2">Endpoint URL</h3>
                        <input type="text" readOnly value={endpointUrl} className="w-full bg-surface-light border border-border-color rounded-lg p-3 text-text-secondary"/>
                    </div>
                     <div>
                        <h3 className="text-lg font-semibold mb-2">Downloads</h3>
                        <div className="flex space-x-4">
                            <button onClick={handleDownloadJson} className="flex items-center space-x-2 bg-surface-light border border-border-color py-2 px-4 rounded-lg hover:bg-border-color transition-colors"><DownloadIcon/><span>agent.json</span></button>
                            <button onClick={handleDownloadHtml} className="flex items-center space-x-2 bg-surface-light border border-border-color py-2 px-4 rounded-lg hover:bg-border-color transition-colors"><DownloadIcon/><span>demo.html</span></button>
                        </div>
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold mb-4">Client SDK Snippets</h3>
                        <div className="space-y-4">
                            <CodeSnippet language="JavaScript" code={jsSdk} />
                            <CodeSnippet language="Python" code={pythonSdk} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const DeploymentHub: React.FC = () => {
    const { agents, startDeployment, getDeploymentsForAgent } = useAgentStore();
    const navigate = useNavigate();
    const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);

    // Add defensive check for agents array
    const validatedAgents = Array.isArray(agents) ? agents : [];

    const deployableAgents = validatedAgents.filter(a => ['Certified', 'Deploying', 'Live', 'Optimizing', 'Optimized', 'AwaitingReEvolution', 'ReEvolving'].includes(a.status));

    const handleExport = (agent: Agent) => {
        setSelectedAgent(agent);
    };

    const getStatusLabel = (agent: Agent) => {
        if (agent.status === 'Optimized') return { text: 'Optimized', color: 'bg-yellow-400/20 text-yellow-300 border border-yellow-400/50'};
        if (agent.status === 'Optimizing') return { text: 'Optimizing...', color: 'bg-blue-500/20 text-blue-400'};
        if (agent.status === 'Live') return { text: 'Live', color: 'bg-green-500/20 text-green-400'};
        if (agent.status === 'AwaitingReEvolution') return { text: 'Awaiting Re-Evolution', color: 'bg-purple-500/20 text-purple-400'};
        if (agent.status === 'ReEvolving') return { text: 'Re-Evolving...', color: 'bg-blue-500/20 text-blue-400'};
        if (agent.status === 'Deploying') return { text: 'Deploying...', color: 'bg-blue-500/20 text-blue-400'};
        return { text: 'Ready to Deploy', color: 'bg-yellow-500/20 text-yellow-400'};
    }

    return (
        <div className="container mx-auto py-8">
             <h1 className="text-4xl font-bold mb-8">Deployment Hub</h1>

            <div className="bg-surface rounded-xl border border-border-color shadow-lg overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-surface-light">
                        <tr>
                            <th className="p-4 font-semibold">Agent Name</th>
                            <th className="p-4 font-semibold">Status</th>
                            <th className="p-4 font-semibold">Endpoint URL</th>
                            <th className="p-4 font-semibold text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {deployableAgents.map(agent => {
                            const deployment = getDeploymentsForAgent(agent._id)[0];
                            const status = getStatusLabel(agent);
                            return (
                                <tr key={agent._id} className="border-t border-border-color hover:bg-surface-light/50">
                                    <td className="p-4 font-medium">{agent.name}</td>
                                    <td className="p-4">
                                        <div className="flex items-center">
                                            <span className={`px-3 py-1 text-xs font-semibold rounded-full ${status.color}`}>
                                                {status.text}
                                            </span>
                                        </div>
                                        { (['Deploying', 'Optimizing', 'ReEvolving'].includes(agent.status)) && agent.progress < 100 &&
                                            <div className="w-24 bg-surface-light rounded-full h-1.5 mt-1.5">
                                                <div className="bg-primary h-1.5 rounded-full" style={{ width: `${agent.progress}%` }}></div>
                                            </div>
                                        }
                                    </td>
                                    <td className="p-4 text-text-secondary font-mono text-sm">
                                        {deployment ? deployment.endpointUrl : 'Not deployed'}
                                    </td>
                                    <td className="p-4 text-center">
                                        <div className="flex items-center justify-center space-x-2">
                                            {(agent.status === 'Live' || agent.status === 'Optimized') && deployment && (
                                                <button onClick={() => handleExport(agent)} className="bg-accent text-white font-bold py-2 px-4 rounded-lg hover:bg-accent-focus transition-colors">
                                                    Export
                                                </button>
                                            )}
                                            {agent.status === 'Certified' && (
                                                <button 
                                                    onClick={() => startDeployment(agent._id)} 
                                                    className="bg-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-primary-focus transition-colors"
                                                >
                                                    Deploy
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
                {deployableAgents.length === 0 && (
                     <div className="text-center py-12">
                        <p className="text-text-secondary">No agents are ready for deployment.</p>

                        <p className="text-text-secondary">
                            <a onClick={() => navigate('/create')} className="text-primary hover:underline cursor-pointer">Build and Certify an agent</a> to get started.
                        </p>
                    </div>
                )}
            </div>
            
            <div className="text-center mt-12">
                <button onClick={() => navigate('/dashboard')} className="text-sm text-text-secondary hover:text-primary transition-colors">
                    &larr; Back to Dashboard
                </button>
            </div>

            {selectedAgent && <ExportModal agent={selectedAgent} endpointUrl={getDeploymentsForAgent(selectedAgent._id)[0]?.endpointUrl || ''} onClose={() => setSelectedAgent(null)} />}
        </div>
    );
};

export default DeploymentHub;
