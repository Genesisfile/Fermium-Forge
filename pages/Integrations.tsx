
import React, { useState, useEffect } from 'react';
import { useAgentStore } from '../hooks/useAgentStore';
import type { Webhook, WebhookEvent } from '../types';

const allEvents: { id: WebhookEvent, label: string, description: string }[] = [
    { id: 'agent.evolution.completed', label: 'Evolution Completed', description: 'Fired when an agent successfully completes its evolution phase.' },
    { id: 'agent.certification.completed', label: 'Certification Completed', description: 'Fired when an agent passes all certification tests.' },
    { id: 'agent.deployed', label: 'Agent Deployed', description: 'Fired when an agent is successfully deployed to a live endpoint.' },
    { id: 'agent.status.changed', label: 'Status Changed', description: 'Fired for any change in an agent\'s status.' },
    // { id: 'agent.orchestration.completed', label: 'Orchestration Completed', description: 'Fired when an orchestration task is successfully completed.' }, // NEW (optional, if we want to simulate outbound notification for orchestration)
];

const Integrations: React.FC = () => {
    const { agents, webhooks, addWebhook, processWebhook } = useAgentStore(); // Changed ingestWebhookData to processWebhook
    const [targetUrl, setTargetUrl] = useState('');
    const [purpose, setPurpose] = useState<Webhook['purpose']>('Notification');
    const [selectedAgentId, setSelectedAgentId] = useState<string>(''); // For Data Ingestion & Orchestration
    const [selectedEvents, setSelectedEvents] = useState<WebhookEvent[]>([]); // For Notifications
    const [testPayload, setTestPayload] = useState('{\n  "task": "summarize benefits of serverless computing",\n  "detail": "high"\n}'); // For Orchestration
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (message) {
            const timer = setTimeout(() => {
                setMessage('');
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [message]);

    useEffect(() => {
        // Automatically select Nexus Orchestrator when purpose is 'Orchestration'
        if (purpose === 'Orchestration') {
            setSelectedAgentId('agent_nexus_orchestrator');
        } else if (purpose === 'Notification') {
            setSelectedAgentId(''); // Clear for notifications
        }
    }, [purpose]);


    const handleCheckboxChange = (event: WebhookEvent) => {
        setSelectedEvents(prev =>
            prev.includes(event) ? prev.filter(e => e !== event) : [...prev, event]
        );
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!targetUrl) {
            setMessage('Please fill all required fields.');
            return;
        }
        if (purpose === 'Notification' && selectedEvents.length === 0) {
            setMessage('Please select at least one event for notifications.');
            return;
        }
        if ((purpose === 'Data Ingestion' || purpose === 'Orchestration') && !selectedAgentId) {
            setMessage('Please select a target agent.');
            return;
        }
        if (purpose === 'Orchestration') {
            try {
                JSON.parse(testPayload); // Validate JSON payload
            } catch (error) {
                setMessage('Invalid JSON in Test Payload. Please correct it.');
                return;
            }
        }

        try {
            new URL(targetUrl); // Validate URL
            addWebhook(targetUrl, purpose, selectedEvents, selectedAgentId);
            setMessage('Webhook registered successfully!');
            setTargetUrl('');
            setSelectedEvents([]);
            setTestPayload('{\n  "task": "summarize benefits of serverless computing",\n  "detail": "high"\n}');
            setSelectedAgentId(purpose === 'Orchestration' ? 'agent_nexus_orchestrator' : '');
        } catch (error) {
            setMessage('Invalid URL format. Please enter a full URL (e.g., https://example.com/webhook).');
        }
    };
    
    const handleSendData = (webhookId: string) => {
        const webhook = webhooks.find(w => w._id === webhookId);
        if (!webhook) return;

        if (webhook.purpose === 'Data Ingestion') {
            const data = {
                userId: `user_${Math.floor(Math.random() * 1000)}`,
                event: 'item_purchased',
                value: Math.random() * 100,
            };
            processWebhook(webhookId, data);
            setMessage('Test data sent for ingestion!');
        } else if (webhook.purpose === 'Orchestration') {
            try {
                const parsedPayload = JSON.parse(testPayload);
                processWebhook(webhookId, parsedPayload);
                setMessage('Orchestration task sent via webhook!');
            } catch (error) {
                setMessage('Error: Test payload is not valid JSON.');
            }
        }
    }

    // Add defensive checks for arrays
    const validatedWebhooks = Array.isArray(webhooks) ? webhooks : [];
    const validatedAgents = Array.isArray(agents) ? agents : [];

    const notificationWebhooks = validatedWebhooks.filter(w => w.purpose === 'Notification');
    const ingestionWebhooks = validatedWebhooks.filter(w => w.purpose === 'Data Ingestion');
    const orchestrationWebhooks = validatedWebhooks.filter(w => w.purpose === 'Orchestration');

    return (
        <div className="container mx-auto py-8">
            <h1 className="text-4xl font-bold mb-8">Integrations</h1>

            <div className="bg-surface p-8 rounded-xl border border-border-color shadow-lg mb-12">
                <h2 className="text-2xl font-bold mb-6">Register a New Webhook</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-2">Webhook Purpose</label>
                        <div className="flex space-x-4">
                           <label className="flex items-center">
                                <input type="radio" name="purpose" value="Notification" checked={purpose === 'Notification'} onChange={() => setPurpose('Notification')} className="text-primary focus:ring-primary"/>
                                <span className="ml-2">Notifications</span>
                            </label>
                            <label className="flex items-center">
                                <input type="radio" name="purpose" value="Data Ingestion" checked={purpose === 'Data Ingestion'} onChange={() => setPurpose('Data Ingestion')} className="text-primary focus:ring-primary"/>
                                <span className="ml-2">Data Ingestion</span>
                            </label>
                            <label className="flex items-center">
                                <input type="radio" name="purpose" value="Orchestration" checked={purpose === 'Orchestration'} onChange={() => setPurpose('Orchestration')} className="text-primary focus:ring-primary"/>
                                <span className="ml-2">Orchestration (Multi-Agent Workflow)</span>
                            </label>
                        </div>
                         {purpose === 'Data Ingestion' && <p className="text-xs text-text-secondary mt-2">Data Ingestion webhooks send data TO a specific agent, making it eligible for <span className="font-bold text-primary">Re-Evolution</span> to improve its capabilities.</p>}
                         {purpose === 'Orchestration' && <p className="text-xs text-text-secondary mt-2">Orchestration webhooks send a task payload TO the <span className="font-bold text-primary">Nexus Orchestrator</span> agent, triggering a dynamic multi-agent workflow.</p>}
                    </div>

                    <div>
                        <label htmlFor="webhook-url" className="block text-sm font-medium text-text-secondary mb-2">Webhook URL</label>
                        <input id="webhook-url" type="url" placeholder="https://yourapi.com/webhook-receiver" value={targetUrl} onChange={e => setTargetUrl(e.target.value)} className="w-full bg-surface-light border border-border-color rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary"/>
                    </div>
                    
                    {(purpose === 'Data Ingestion' || purpose === 'Orchestration') && (
                         <div>
                            <label htmlFor="agent-select" className="block text-sm font-medium text-text-secondary mb-2">Target Agent</label>
                            <select
                                id="agent-select"
                                value={selectedAgentId}
                                onChange={e => setSelectedAgentId(e.target.value)}
                                className="w-full bg-surface-light border border-border-color rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary"
                                disabled={purpose === 'Orchestration'} // Disable for orchestration as it's fixed to Nexus Orchestrator
                            >
                                <option value="">Select an agent...</option>
                                {validatedAgents.map(agent => (
                                    <option key={agent._id} value={agent._id}>{agent.name}</option>
                                ))}
                            </select>
                            <p className="text-xs text-text-secondary mt-1">
                                {purpose === 'Data Ingestion' ? 'Select an agent to receive the ingested data.' : 'The Nexus Orchestrator agent will receive the task.'}
                            </p>
                        </div>
                    )}

                    {purpose === 'Notification' && (
                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-2">Events to Subscribe</label>
                            <div className="space-y-4">{allEvents.map(event => (
                                <div key={event.id} className="relative flex items-start">
                                    <div className="flex h-5 items-center"><input id={event.id} type="checkbox" checked={selectedEvents.includes(event.id)} onChange={() => handleCheckboxChange(event.id)} className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"/></div>
                                    <div className="ml-3 text-sm">
                                        <label htmlFor={event.id} className="font-medium text-text-primary">{event.label}</label>
                                        <p className="text-text-secondary">{event.description}</p>
                                    </div>
                                </div>))}
                            </div>
                        </div>
                    )}

                    {purpose === 'Orchestration' && (
                        <div>
                            <label htmlFor="test-payload" className="block text-sm font-medium text-text-secondary mb-2">Test Payload (JSON)</label>
                            <textarea
                                id="test-payload"
                                rows={6}
                                value={testPayload}
                                onChange={e => setTestPayload(e.target.value)}
                                className="w-full bg-surface-light border border-border-color rounded-lg p-3 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                placeholder={`{\n  "task": "generate a Python function for string reversal",\n  "detail": "high"\n}`}
                            />
                            <p className="text-xs text-text-secondary mt-1">This JSON data will be sent to the Nexus Orchestrator when you click "Send Test Data".</p>
                        </div>
                    )}
                    
                    <div>
                        <button type="submit" className="w-full bg-primary text-white font-bold py-3 rounded-lg hover:bg-primary-focus transition-colors">Register Webhook</button>
                        {message && <p className="mt-4 text-center text-sm text-accent">{message}</p>}
                    </div>
                </form>
            </div>
            
            <div className="grid md:grid-cols-3 gap-12"> {/* Changed to 3 columns to accommodate Orchestration */}
                <div>
                    <h2 className="text-2xl font-bold mb-6">Notification Webhooks</h2>
                    {notificationWebhooks.length > 0 ? (
                        <div className="space-y-4">{notificationWebhooks.map(webhook => (
                            <div key={webhook._id} className="bg-surface p-4 rounded-lg border border-border-color">
                                <p className="font-mono text-primary break-all">{webhook.targetUrl}</p>
                                <div className="flex flex-wrap gap-2 mt-2">{webhook.events.map(event => (<span key={event} className="px-2 py-1 text-xs bg-surface-light border border-border-color rounded-full">{event}</span>))}</div>
                            </div>))}
                        </div>
                    ) : <p className="text-text-secondary">No notification webhooks registered yet.</p>}
                </div>

                <div>
                    <h2 className="text-2xl font-bold mb-6">Data Ingestion Webhooks</h2>
                    {ingestionWebhooks.length > 0 ? (
                        <div className="space-y-4">{ingestionWebhooks.map(webhook => {
                             const agent = validatedAgents.find(a => a._id === webhook.agentId);
                             return (
                                <div key={webhook._id} className="bg-surface p-4 rounded-lg border border-border-color">
                                    <p className="font-mono text-primary break-all">{webhook.targetUrl}</p>
                                    <div className="flex justify-between items-center mt-2">
                                        <span className="text-sm text-text-secondary">Target: <span className="font-semibold text-text-primary">{agent?.name || 'Unknown Agent'}</span></span>
                                        <button onClick={() => handleSendData(webhook._id)} className="bg-surface-light border border-border-color text-text-secondary text-xs px-3 py-1 rounded-md hover:bg-border-color hover:text-text-primary transition-colors">Send Test Data</button>
                                    </div>
                                </div>
                             )
                        })}
                        </div>
                    ) : <p className="text-text-secondary">No data ingestion webhooks registered yet.</p>}
                </div>

                <div>
                    <h2 className="text-2xl font-bold mb-6">Orchestration Webhooks</h2>
                    {orchestrationWebhooks.length > 0 ? (
                        <div className="space-y-4">{orchestrationWebhooks.map(webhook => {
                             const agent = validatedAgents.find(a => a._id === webhook.agentId); // Will always be Nexus Orchestrator
                             return (
                                <div key={webhook._id} className="bg-surface p-4 rounded-lg border border-border-color">
                                    <p className="font-mono text-primary break-all">{webhook.targetUrl}</p>
                                    <div className="flex justify-between items-center mt-2">
                                        <span className="text-sm text-text-secondary">Target: <span className="font-semibold text-text-primary">{agent?.name || 'Unknown Agent'}</span></span>
                                        <button onClick={() => handleSendData(webhook._id)} className="bg-primary text-white text-xs px-3 py-1 rounded-md hover:bg-primary-focus transition-colors">Run Orchestration</button>
                                    </div>
                                </div>
                             )
                        })}
                        </div>
                    ) : <p className="text-text-secondary">No orchestration webhooks registered yet. Set up the Nexus Orchestrator to start!</p>}
                </div>
            </div>
        </div>
    );
};

export default Integrations;
