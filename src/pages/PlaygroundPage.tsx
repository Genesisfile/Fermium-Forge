import React, { useState, useRef, useEffect, useContext } from 'react';
import { marked } from 'marked';
import { useAgentStore } from '../context/AgentContext';
import { ApiKeyContext } from '../context/ApiKeyContext';
import { chatWithAgent } from '../lib/gemini';
import { ChatMessage } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';
import { ForgeIcon } from '../components/icons';
import { useToast } from '../context/ToastContext';

const PlaygroundPage: React.FC = () => {
    const { state, dispatch } = useAgentStore();
    const { agents, chatHistories } = state;
    const { callGeminiApi } = useContext(ApiKeyContext);
    const { showToast } = useToast();

    const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const selectedAgent = agents.find(a => a.id === selectedAgentId);

    useEffect(() => {
        if (agents.length > 0 && !selectedAgentId) {
            setSelectedAgentId(agents[0].id);
        }
    }, [agents, selectedAgentId]);

     useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    useEffect(() => {
        // Load chat history when agent changes
        if (selectedAgentId) {
            setMessages(chatHistories[selectedAgentId] || []);
        }
    }, [selectedAgentId, chatHistories]);
    
    const updateHistory = (newMessages: ChatMessage[]) => {
        setMessages(newMessages);
        if(selectedAgentId) {
            dispatch({
                type: 'SET_CHAT_HISTORY',
                payload: { agentId: selectedAgentId, messages: newMessages }
            });
        }
    }

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading || !selectedAgent) return;

        const userMessage: ChatMessage = { sender: 'user', text: input };
        const newMessages = [...messages, userMessage];
        updateHistory(newMessages);
        const currentInput = input;
        setInput('');
        setIsLoading(true);

        try {
            const agentResponse = await callGeminiApi(() => chatWithAgent(selectedAgent, currentInput));
            if (agentResponse) {
                updateHistory([...newMessages, { sender: 'agent', text: agentResponse }]);
            } else {
                 updateHistory([...newMessages, { sender: 'agent', text: "Sorry, I couldn't get a response. Please check your API key and try again." }]);
            }
        } catch (error) {
            console.error("Error chatting with agent:", error);
            showToast("An error occurred while communicating with the agent.", "error");
            updateHistory([...newMessages, { sender: 'agent', text: "Sorry, I encountered an error. Please try again." }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-12rem)] max-w-5xl mx-auto">
            <div className="mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
                 <div>
                    <h1 className="text-3xl font-bold text-text-primary">Agent Playground</h1>
                    <p className="text-text-secondary mt-1">Interact with your created agents.</p>
                 </div>
                 <div className="w-full sm:w-auto">
                    <select
                        value={selectedAgentId ?? ''}
                        onChange={(e) => setSelectedAgentId(e.target.value)}
                        className="w-full bg-surface border border-border-color rounded-lg px-4 py-2 text-text-primary focus:ring-2 focus:ring-primary focus:border-primary transition"
                        aria-label="Select Agent"
                    >
                        {agents.map(agent => (
                            <option key={agent.id} value={agent.id}>{agent.name}</option>
                        ))}
                    </select>
                 </div>
            </div>

            <div className="flex-grow bg-surface border border-border-color rounded-lg p-4 overflow-y-auto space-y-4">
                {selectedAgent ? (
                    <>
                        {messages.map((msg, index) => (
                            <div key={index} className={`flex items-start gap-3 ${msg.sender === 'user' ? 'justify-end' : ''}`}>
                                {msg.sender === 'agent' && <div className="bg-primary rounded-full p-2"><ForgeIcon className="h-6 w-6 text-white" /></div>}
                                <div 
                                    className={`prose prose-invert max-w-xl rounded-lg p-4 ${msg.sender === 'user' ? 'bg-primary text-white' : 'bg-surface-light text-text-primary'}`}
                                    dangerouslySetInnerHTML={{ __html: marked.parse(msg.text) as string }}
                                />
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex items-start gap-3">
                                <div className="bg-primary rounded-full p-2"><ForgeIcon className="h-6 w-6 text-white" /></div>
                                <div className="max-w-xl rounded-lg p-4 bg-surface-light text-text-primary">
                                    <LoadingSpinner text="Agent is thinking..." size={6} />
                                </div>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center text-text-secondary">
                        <p>No agent selected.</p>
                        <p className="text-sm">Create an agent to begin testing in the Playground.</p>
                    </div>
                )}
                 <div ref={messagesEndRef} />
            </div>

             <form onSubmit={handleSendMessage} className="mt-4 flex gap-4">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={selectedAgent ? `Chat with ${selectedAgent.name}...` : 'Select an agent to begin'}
                    disabled={isLoading || !selectedAgent}
                    className="flex-grow bg-surface-light border border-border-color rounded-lg p-3 text-text-primary focus:ring-2 focus:ring-primary focus:border-primary transition disabled:opacity-50"
                />
                <button type="submit" disabled={isLoading || !input.trim() || !selectedAgent} className="bg-primary text-white font-semibold px-6 py-3 rounded-lg shadow-lg hover:bg-primary-focus transition-all duration-300 disabled:bg-primary/50 disabled:cursor-not-allowed">
                    Send
                </button>
            </form>
        </div>
    );
};
export default PlaygroundPage;
