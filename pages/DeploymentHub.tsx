

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useAgentStore } from '../hooks/useAgentStore';
import type { Agent } from '../types';
import { DownloadIcon, SparklesIcon, CopyIcon } from '../components/icons/Icons'; // Added CopyIcon
import { getStatusColorClasses } from '../utils/helpers';

/**
 * Initiates a file download with specified content and MIME type.
 */
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

/**
 * Displays a code snippet with a copy-to-clipboard button.
 */
const CodeSnippet: React.FC<{ language: string; code: string }> = ({ language, code }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative">
      <h4 className="text-sm font-semibold text-text-secondary mb-2">{language}</h4>
      <div className="bg-black/50 p-4 rounded-lg font-mono text-sm border border-border-color">
        <button onClick={handleCopy} className="absolute top-2 right-2 text-text-secondary hover:text-text-primary transition-colors flex items-center space-x-1">
          <CopyIcon className="w-4 h-4"/>
          <span>{copied ? 'Copied!' : 'Copy'}</span>
        </button>
        <pre><code className={`language-${language.toLowerCase()}`}>{code}</code></pre>
      </div>
    </div>
  );
};

/**
 * Modal for exporting agent details and SDK snippets.
 */
interface ExportModalProps {
  agent: Agent;
  endpointUrl: string;
  onClose: () => void;
}

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
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50" onClick={onClose} aria-modal="true" role="dialog">
      <div className="bg-surface w-full max-w-3xl rounded-xl border border-border-color shadow-2xl p-8 transform transition-all" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6 border-b border-border-color pb-4">
          <h2 className="text-2xl font-bold text-text-primary">Export Agent: {agent.name}</h2>
          <button onClick={onClose} className="text-text-secondary hover:text-text-primary text-3xl leading-none">&times;</button>
        </div>
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-text-primary mb-2">Endpoint URL</h3>
            <div className="relative">
              <input type="text" readOnly value={endpointUrl} className="w-full bg-surface-light border border-border-color rounded-lg p-3 text-text-secondary pr-12 font-mono" />
              <button onClick={() => navigator.clipboard.writeText(endpointUrl)} className="absolute top-1/2 right-3 -translate-y-1/2 text-text-secondary hover:text-text-primary transition-colors flex items-center space-x-1" aria-label="Copy endpoint URL">
                <CopyIcon className="w-4 h-4"/>
              </button>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-text-primary mb-2">Blueprint Downloads</h3>
            <div className="flex flex-wrap gap-4"> {/* Changed to flex-wrap gap-4 */}
              <button onClick={handleDownloadJson} className="flex items-center space-x-2 bg-surface-light border border-border-color py-2 px-4 rounded-lg hover:bg-border-color transition-colors"><DownloadIcon /><span>Agent JSON</span></button>
              <button onClick={handleDownloadHtml} className="flex items-center space-x-2 bg-surface-light border border-border-color py-2 px-4 rounded-lg hover:bg-border-color transition-colors"><DownloadIcon /><span>Demo HTML</span></button>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-text-primary mb-4">Client SDK Snippets</h3>
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
  const { state, startDeployment, getDeploymentsForAgent } = useAgentStore();
  const navigate = useNavigate();
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);

  const validatedAgents = Array.isArray(state.agents) ? state.agents : [];

  // Fix: Added 'EstablishAlignment' to the deployableAgents filter to resolve type error.
  const deployableAgents = validatedAgents.filter(a =>
    ['Certified', 'Deploying', 'Live', 'Optimizing', 'Optimized', 'AwaitingReEvolution', 'ReEvolving', 'EstablishAlignment'].includes(a.status)
  );

  const handleExport = (agent: Agent) => {
    setSelectedAgent(agent);
  };

  const getStatusLabel = (agent: Agent) => {
    if (agent.status === 'Optimized') return { text: 'Optimized', color: getStatusColorClasses('Optimized') };
    if (agent.status === 'Optimizing') return { text: 'Optimizing...', color: getStatusColorClasses('Optimizing') };
    if (agent.status === 'Live') return { text: 'Live', color: getStatusColorClasses('Live') };
    if (agent.status === 'AwaitingReEvolution') return { text: 'Awaiting Re-Evolution', color: getStatusColorClasses('AwaitingReEvolution') };
    if (agent.status === 'ReEvolving') return { text: 'Re-Evolving...', color: getStatusColorClasses('ReEvolving') };
    if (agent.status === 'Deploying') return { text: 'Deploying...', color: getStatusColorClasses('Deploying') };
    if (agent.status === 'CompletedTask') return { text: 'Task Completed', color: getStatusColorClasses('CompletedTask') };
    // Fix: Updated status color for 'EstablishAlignment'
    if (agent.status === 'EstablishAlignment') return { text: 'Establishing Alignment', color: getStatusColorClasses('EstablishAlignment') };
    return { text: 'Ready to Deploy', color: getStatusColorClasses('Certified') };
  };

  return (
    <div className="container mx-auto py-10"> {/* Increased padding */}
      <h1 className="text-4xl font-bold mb-10">Deployment Hub</h1> {/* Increased margin */}

      <div className="bg-surface rounded-xl border border-border-color shadow-lg overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-surface-light border-b-2 border-primary"> {/* Enhanced header style */}
            <tr>
              <th className="p-4 font-semibold text-text-primary">Agent Name</th>
              <th className="p-4 font-semibold text-text-primary">Status</th>
              <th className="p-4 font-semibold text-text-primary">Endpoint URL</th>
              <th className="p-4 font-semibold text-center text-text-primary">Actions</th>
            </tr>
          </thead>
          <tbody>
            {deployableAgents.map(agent => {
              const deployment = getDeploymentsForAgent(agent._id)[0];
              const status = getStatusLabel(agent);
              return (
                <tr key={agent._id} className="border-t border-border-color hover:bg-surface-light/50 transition-colors duration-150"> {/* Added transition */}
                  <td className="p-4 font-medium text-text-primary">{agent.name}</td>
                  <td className="p-4">
                    <div className="flex items-center flex-wrap gap-2"> {/* Allow wrapping */}
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full ${status.color}`}>
                        {status.text}
                      </span>
                      {(['Deploying', 'Optimizing', 'ReEvolving', 'EstablishAlignment'].includes(agent.status)) && agent.progress < 100 &&
                        <div className="w-24 bg-surface-light rounded-full h-1.5 ">
                          <div className="bg-primary h-1.5 rounded-full" style={{ width: `${agent.progress}%` }}></div>
                        </div>
                      }
                    </div>
                  </td>
                  <td className="p-4 text-text-secondary font-mono text-sm break-all"> {/* Added break-all */}
                    {deployment ? deployment.endpointUrl : 'Not deployed'}
                  </td>
                  <td className="p-4 text-center">
                    <div className="flex items-center justify-center space-x-2">
                      {(agent.status === 'Live' || agent.status === 'Optimized') && deployment && (
                        <button onClick={() => handleExport(agent)} className="bg-accent text-white font-bold py-2 px-5 rounded-lg hover:bg-accent-focus transition-colors"> {/* Increased horizontal padding */}
                          Export
                        </button>
                      )}
                      {agent.status === 'Certified' && (
                        <button
                          onClick={() => startDeployment(agent._id)}
                          className="bg-primary text-white font-bold py-2 px-5 rounded-lg hover:bg-primary-focus transition-colors"
                        >
                          Deploy
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {deployableAgents.length === 0 && (
          <div className="text-center py-12">
            <p className="text-text-secondary mb-4">No agents are ready for deployment. Forge or certify an agent to get started.</p>

            <p className="text-text-secondary flex items-center justify-center space-x-2">
              <SparklesIcon className="w-4 h-4" />
              <a onClick={() => navigate('/')} className="text-primary hover:underline cursor-pointer">Forge an agent</a> to get started.
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