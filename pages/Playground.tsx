
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAgentStore } from '../hooks/useAgentStore';
import { useToast } from '../hooks/useToast';
import { PlaygroundMessage, FileContext, ModelPreferenceType, ModelAlignmentActionType } from '../types'; // NEW: Added ModelAlignmentActionType
import { fileToBase64 } from '../utils/helpers';
import { SendIcon, PaperclipIcon, TrashIcon, FileTextIcon, ImageIcon, DownloadIcon, XCircleIcon } from '../components/icons/Icons';
import AgentVitals from '../components/AgentVitals';
import { marked } from 'marked';
// import { getDevTeamAgentCallableTools } from '../utils/constants'; // REMOVED: Directly import getDevTeamAgentCallableTools

const Playground: React.FC = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const { agents, sendChatMessage, addLog, getAgent, state, dispatch } = useAgentStore(); // REMOVED: initialFeatureEngines from destructuring, NEW: Added dispatch
    const { showToast } = useToast();

    const [selectedAgentId, setSelectedAgentId] = useState<string | null>(searchParams.get('agentId'));
    const [messages, setMessages] = useState<PlaygroundMessage[]>([]);
    const [userInput, setUserInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [fileContext, setFileContext] = useState<FileContext[]>([]);
    const [vitals, setVitals] = useState({
        thinkingSteps: [] as string[], // Now dynamically updated
        activeEngine: null as string | null,
        confidence: 0,
        latency: 0,
        // FIX: ModelPreferenceType is now imported as a value.
        currentModelType: null as ModelPreferenceType | 'DefaultGemini' | 'ClientSide' | null, // New field for active model type
    });
    
    const chatContainerRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Add defensive check for agents array
    const validatedAgents = Array.isArray(agents) ? agents : [];
    const availableAgents = validatedAgents.filter(a => ['Live', 'Optimized', 'ExecutingStrategy', 'Certified'].includes(a.status));
    const selectedAgent = validatedAgents.find(a => a._id === selectedAgentId);

    // Callback for real-time thinking process logs
    const addThinkingProcessStep = useCallback((step: string) => {
        setVitals(prev => ({
            ...prev,
            thinkingSteps: [...prev.thinkingSteps, step]
        }));
    }, []);

    useEffect(() => {
        const agentIdFromParams = searchParams.get('agentId');
        const hasAgents = availableAgents.length > 0;

        if (agentIdFromParams && hasAgents && availableAgents.some(a => a._id === agentIdFromParams)) {
            setSelectedAgentId(agentIdFromParams);
        } else if (hasAgents) { // If there are agents but no valid ID from params, pick the first one
            const defaultAgentId = availableAgents[0]._id;
            setSelectedAgentId(defaultAgentId);
            setSearchParams({ agentId: defaultAgentId });
        } else { // If no agents are available at all
            setSelectedAgentId(null); // Explicitly set to null to trigger the "No Agents Available" message
            setSearchParams({}); // Clear any invalid agentId from params
        }
    }, [searchParams, validatedAgents, availableAgents, setSearchParams]); // Add setSearchParams to dependencies
    
    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [messages, isLoading, vitals.thinkingSteps]);

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    }, [userInput]);

    const handleAgentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newAgentId = e.target.value;
        setSelectedAgentId(newAgentId);
        setSearchParams({ agentId: newAgentId });
        setMessages([]);
        setFileContext([]);
        setVitals({ thinkingSteps: [], activeEngine: null, confidence: 0, latency: 0, currentModelType: null });
    };

    const handleSendMessage = async () => {
        if (!userInput.trim() || !selectedAgentId || isLoading) return;

        const userMessage: PlaygroundMessage = { sender: 'user', text: userInput };
        setMessages(prev => [...prev, userMessage]);
        setUserInput('');
        setIsLoading(true);
        // Reset vitals for new interaction
        setVitals({ thinkingSteps: [], activeEngine: null, confidence: 0, latency: 0, currentModelType: null });

        const startTime = Date.now();
        
        try {
            // Pass getAgent, allFeatureEngines, AND the new addThinkingProcessStep callback
            const rawAgentResponse = await sendChatMessage(selectedAgentId, userInput, fileContext, addThinkingProcessStep); // REMOVED: initialFeatureEngines, getDevTeamAgentCallableTools
            const agentResponse: PlaygroundMessage = { ...rawAgentResponse, sender: 'agent' }; // FIX: Add sender property back for display
            
            const latency = Date.now() - startTime;

            setVitals(prev => ({
                ...prev,
                latency,
                activeEngine: agentResponse.activatedEngineId || null,
                confidence: Math.floor(Math.random() * 15) + 85, // 85-100%
                currentModelType: agentResponse.usedModelType || null, // Update with the actually used model type
            }));
            setMessages(prev => [...prev, agentResponse]);

            if (agentResponse.isError) {
                // Extract only the first line for the toast, keep full message in chat
                const toastMessage = agentResponse.text.split('\n')[0] || 'An agent error occurred.';
                showToast(toastMessage, 'error', 7000); // Show for longer if it's an error
            }

            // NEW: Handle proposed governance and model alignment actions from Dev Strategist
            if (agentResponse.proposedGovernanceActions && agentResponse.proposedGovernanceActions.length > 0) {
                const alignmentActionsCount = agentResponse.proposedGovernanceActions.filter(action => Object.values(ModelAlignmentActionType).includes(action.type as ModelAlignmentActionType)).length;
                const governanceActionsCount = agentResponse.proposedGovernanceActions.length - alignmentActionsCount;
                
                let toastMsg = `Dev Strategist proposed ${agentResponse.proposedGovernanceActions.length} action(s).`;
                if (governanceActionsCount > 0) toastMsg += ` (${governanceActionsCount} governance`;
                if (alignmentActionsCount > 0) toastMsg += `${governanceActionsCount > 0 ? ', ' : '('}${alignmentActionsCount} alignment`;
                toastMsg += `) Applying...`;

                showToast(toastMsg, 'info', 7000); // Longer toast for more complex actions
                addLog(selectedAgentId, 'DevelopmentStrategy', `Dev Strategist proposed ${agentResponse.proposedGovernanceActions.length} action(s): ${toastMsg}`);
                
                agentResponse.proposedGovernanceActions.forEach(action => {
                    const isModelAlignment = Object.values(ModelAlignmentActionType).includes(action.type as ModelAlignmentActionType);
                    addLog(action.targetAgentId, 'Diagnostics', `${isModelAlignment ? 'MODEL_ALIGNMENT_ACTION_INITIATED_BY_DEV_STRATEGIST' : 'GOVERNANCE_ACTION_INITIATED_BY_DEV_STRATEGIST'}: Proposing action '${action.type}' for agent '${action.targetAgentId}'.`);
                    dispatch({ type: 'APPLY_GOVERNANCE_ACTION', payload: action });
                });
            }


        } catch (error: any) { // Catch as 'any' to access error.message
            addLog(selectedAgentId, 'Diagnostics', `ERROR: Unexpected error in Playground handleSendMessage: ${error.message || error.toString()}`); // Use addLog
            const errorMessage: PlaygroundMessage = { sender: 'agent', text: 'An unexpected error occurred. Please try again.', isError: true };
            setMessages(prev => [...prev, errorMessage]);
            addThinkingProcessStep("ERROR: An unexpected error occurred during processing.");
            showToast('An unexpected error occurred.', 'error');
        } finally {
            setIsLoading(false);
            setFileContext([]);
        }
    };
    
    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            try {
                const base64Data = await fileToBase64(file);
                const newFileContext: FileContext = { name: file.name, type: file.type.startsWith('image/') ? 'image' : 'text', mimeType: file.type, data: base64Data };
                setFileContext([newFileContext]);
                showToast(`Attached file: ${file.name}`, 'info');
            } catch (error) {
                showToast('Failed to attach file.', 'error');
            }
        }
    };
    
    const downloadFile = (filename: string, content: string) => {
        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const AgentMessage: React.FC<{ message: PlaygroundMessage }> = ({ message }) => {
        const html = marked.parse(message.text);
        return (
            <div className={`flex items-end gap-3 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`w-fit max-w-full md:max-w-lg lg:max-w-xl p-4 rounded-2xl 
                    ${message.sender === 'user' ? 'bg-primary text-white rounded-br-none' : ''}
                    ${message.sender === 'agent' && !message.isError ? 'bg-surface-light text-text-primary rounded-bl-none' : ''}
                    ${message.sender === 'agent' && message.isError ? 'bg-red-500/20 text-red-300 border border-red-500 rounded-bl-none' : ''}
                `}>
                    {message.isError && (
                        <div className="flex items-center space-x-2 text-red-400 mb-2">
                            <XCircleIcon />
                            <span className="font-semibold">Error from Agent:</span>
                        </div>
                    )}
                    <div className="markdown-content" dangerouslySetInnerHTML={{ __html: html as string }}></div>
                    {message.file && (
                        <div className="mt-3 pt-3 border-t border-white/20">
                            <button onClick={() => downloadFile(message.file!.filename, message.file!.content)} className="flex items-center space-x-2 text-sm font-semibold hover:underline">
                                <DownloadIcon />
                                <span>{message.file.filename}</span>
                            </button>
                        </div>
                    )}
                    {message.groundingUrls && message.groundingUrls.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-white/20">
                            <p className="text-sm font-semibold mb-2">Sources:</p>
                            <ul className="list-disc list-inside text-sm space-y-1">
                                {message.groundingUrls.map((source, idx) => (
                                    <li key={idx}>
                                        <a href={source.uri} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                                            {source.title || source.uri}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                    {message.proposedGovernanceActions && message.proposedGovernanceActions.length > 0 && (
                         <div className="mt-3 pt-3 border-t border-white/20">
                            <p className="text-sm font-semibold mb-2 text-blue-300">Proposed Actions (Dev Strategist):</p>
                            <ul className="list-disc list-inside text-sm space-y-1 text-blue-200">
                                {message.proposedGovernanceActions.map((action, idx) => (
                                    <li key={idx}>
                                        <span className={`font-medium ${Object.values(ModelAlignmentActionType).includes(action.type as ModelAlignmentActionType) ? 'text-purple-300' : 'text-blue-300'}`}>
                                            {Object.values(ModelAlignmentActionType).includes(action.type as ModelAlignmentActionType) ? 'Model Alignment:' : 'Governance:'} {action.type}
                                        </span> for <span className="font-medium">{action.targetAgentId}</span> (Details: {JSON.stringify(action.details)})
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            </div>
        )
    }

    return (
        <div className="container mx-auto py-8 h-[calc(100vh-120px)] flex flex-col">
            <div className="flex-shrink-0 flex flex-col sm:flex-row justify-between sm:items-center mb-6">
                <h1 className="text-4xl font-bold">Playground</h1>
                {availableAgents.length > 0 && (
                     <div className="flex items-center space-x-2 w-full sm:w-auto mt-4 sm:mt-0">
                        <select onChange={handleAgentChange} value={selectedAgentId || ''} className="flex-grow bg-surface border border-border-color rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary">
                            {availableAgents.map(agent => (
                                <option key={agent._id} value={agent._id}>{agent.name}</option>
                            ))}
                        </select>
                        {/* {selectedAgent?.modelPreferenceOrder && selectedAgent.modelPreferenceOrder.length > 0 && ( // REMOVED */}
                        {/*     <span className="px-3 py-2 bg-purple-500/20 text-purple-400 text-xs font-semibold rounded-lg"> */}
                        {/*         Model Routing */}
                        {/*     </span> */}
                        {/* )} */}
                    </div>
                )}
            </div>

            {selectedAgent ? (
                <>
                    <div className="playground-grid-new flex-grow min-h-0">
                        <div className="chat-panel-container bg-surface rounded-xl border border-border-color shadow-lg overflow-hidden">
                            <div ref={chatContainerRef} className="flex-grow p-6 space-y-6 overflow-y-auto">
                                {messages.map((msg, index) => ( <AgentMessage key={index} message={msg} /> ))}
                                {isLoading && (
                                    <div className="flex items-end gap-3 justify-start">
                                        <div className="w-fit max-w-lg p-4 rounded-2xl bg-surface-light text-text-primary rounded-bl-none">
                                            <div className="flex items-center space-x-2">
                                                <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                                                <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:0.1s]"></div>
                                                <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:0.2s]"></div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="flex-shrink-0 p-4 bg-surface-light border-t border-border-color">
                                {fileContext.length > 0 && (
                                    <div className="mb-2 px-2 flex items-center justify-between bg-surface border border-dashed border-primary rounded-lg p-2">
                                        <div className="flex items-center space-x-2 text-primary">
                                            {fileContext[0].type === 'image' ? <ImageIcon/> : <FileTextIcon/>}
                                            <span className="text-sm font-medium">{fileContext[0].name}</span>
                                        </div>
                                        <button onClick={() => setFileContext([])} className="text-text-secondary hover:text-red-500"><TrashIcon/></button>
                                    </div>
                                )}
                                <div className="flex items-end space-x-4">
                                     <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
                                     <button onClick={() => fileInputRef.current?.click()} className="p-3 text-text-secondary hover:text-primary transition-colors rounded-full hover:bg-surface"><PaperclipIcon/></button>
                                    <textarea
                                        ref={textareaRef}
                                        value={userInput}
                                        onChange={(e) => setUserInput(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSendMessage())}
                                        placeholder={`Chat with ${selectedAgent.name}... (Shift+Enter for new line)`}
                                        className="chat-textarea flex-grow bg-surface border border-border-color rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary"
                                        rows={1}
                                        disabled={isLoading}
                                    />
                                    <button onClick={handleSendMessage} disabled={isLoading || !userInput.trim()} className="p-3 bg-primary text-white rounded-lg hover:bg-primary-focus transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed self-stretch flex items-center">
                                        <SendIcon />
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="agent-vitals-container">
                           {selectedAgent && <AgentVitals agent={selectedAgent} vitals={{...vitals, thinkingSteps: vitals.thinkingSteps}} isLoading={isLoading} />}
                        </div>
                    </div>
                    <div className="text-center mt-4">
                        <button onClick={() => navigate('/dashboard')} className="text-sm text-text-secondary hover:text-primary transition-colors">
                            &larr; Back to Dashboard
                        </button>
                    </div>
                </>
            ) : (
                <div className="flex-grow flex items-center justify-center bg-surface rounded-xl border border-dashed border-border-color">
                    <div className="text-center">
                        <h2 className="text-2xl font-semibold text-text-primary">
                            {availableAgents.length === 0 ? "No Agents Available" : "Please Select an Agent"}
                        </h2>
                        <p className="text-text-secondary mt-2">
                            {availableAgents.length === 0 ? "Create and deploy an agent to start a conversation." : "Select an agent from the dropdown above to start chatting."}
                        </p>
                        {availableAgents.length === 0 && (
                            <button onClick={() => navigate('/strategy')} className="mt-6 bg-primary text-white font-bold py-2 px-6 rounded-lg hover:bg-primary-focus transition-colors">
                                Create Agent
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Playground;
