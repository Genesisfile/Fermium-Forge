import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAgentStore } from '../context/AgentContext';
import { useToast } from '../context/ToastContext';
import { Agent } from '../types';
import { generateAgentDesign, AgentDesign } from '../lib/gemini';
import { ApiKeyContext } from '../context/ApiKeyContext';

// Define the shape of a message for type safety
export interface CouncilMessage {
  sender: 'user' | 'ai';
  content: string | { design: AgentDesign };
}

export const useCouncilChat = () => {
  const { dispatch } = useAgentStore();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const { callGeminiApi } = useContext(ApiKeyContext);

  const [messages, setMessages] = useState<CouncilMessage[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [chatStarted, setChatStarted] = useState(false);

  const handleCreateAgent = (design: AgentDesign) => {
    const newAgent: Agent = {
      id: `ag-${Date.now()}`,
      name: design.name,
      version: '1.0.0',
      status: 'IDLE',
      description: design.description,
      createdAt: new Date().toISOString(),
      specifications: design.specifications.map((spec, index) => ({
        ...spec,
        id: `spec-${Date.now()}-${index}`,
      })),
    };
    dispatch({ type: 'ADD_AGENT', payload: newAgent });
    showToast(`Agent "${newAgent.name}" created successfully!`, 'success');
    navigate('/dashboard');
  };

  const startDesignProcess = async (initialPrompt: string) => {
    if (!initialPrompt.trim() || isGenerating) return;

    setChatStarted(true);
    setMessages([
      { sender: 'user', content: initialPrompt }
    ]);
    setIsGenerating(true);

    try {
      const design = await callGeminiApi(() => generateAgentDesign(initialPrompt));
      if (design) {
        setMessages(prev => [...prev, { sender: 'ai', content: { design } }]);
      } else {
        throw new Error("Received no design from the AI.");
      }
    } catch (err: any) {
      const errorMessage = "The Council could not generate a design. Please try again.";
      setMessages(prev => [...prev, { sender: 'ai', content: errorMessage }]);
      showToast(errorMessage, 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    messages,
    isGenerating,
    chatStarted,
    startDesignProcess,
    handleCreateAgent,
  };
};
