import React, { useEffect, useRef } from 'react';
import { AgentDesign } from '../../lib/gemini';
import { CouncilMessage } from '../../hooks/useCouncilChat';
import { CouncilIcon, SparklesIcon, PlusIcon } from '../icons';
import LoadingSpinner from '../LoadingSpinner';

const AgentDesignCard: React.FC<{ design: AgentDesign; onCreate: () => void }> = ({ design, onCreate }) => {
  return (
    <div className="bg-surface-light border border-border-color rounded-lg p-6 animate-fade-in w-full">
      <div className="flex items-center mb-4">
        <SparklesIcon className="h-6 w-6 text-primary mr-3" />
        <h2 className="text-2xl font-bold text-text-primary">Agent Design Proposal</h2>
      </div>
      <div className="border-t border-border-color pt-4">
        <h3 className="text-xl font-bold text-primary">{design.name}</h3>
        <p className="mt-2 text-text-secondary">{design.description}</p>
        <div className="mt-6">
          <h4 className="text-lg font-semibold text-text-primary mb-3">Core Specifications</h4>
          <ul className="space-y-3">
            {design.specifications.map((spec, i) => (
              <li key={i} className="p-3 bg-surface rounded-md border border-border-color">
                <p className="font-semibold text-text-primary">{spec.name}</p>
                <p className="text-sm text-text-secondary mt-1">{spec.description}</p>
              </li>
            ))}
          </ul>
        </div>
        <button 
          onClick={onCreate} 
          className="mt-6 w-full flex items-center justify-center bg-accent text-white font-semibold py-3 px-6 rounded-lg shadow-lg hover:bg-accent-focus transition-all duration-300"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Create This Agent
        </button>
      </div>
    </div>
  );
};

interface CouncilChatInterfaceProps {
  messages: CouncilMessage[];
  isGenerating: boolean;
  onCreateAgent: (design: AgentDesign) => void;
}

const CouncilChatInterface: React.FC<CouncilChatInterfaceProps> = ({ messages, isGenerating, onCreateAgent }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isGenerating]);

  return (
    <div className="flex flex-col h-full animate-fade-in">
      <div className="flex-grow overflow-y-auto p-4 space-y-6">
        {messages.map((msg, index) => (
          <div key={index} className={`flex items-start gap-4 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.sender === 'ai' && (
              <div className="bg-primary/10 p-2 rounded-full self-start">
                <CouncilIcon className="h-6 w-6 text-primary" />
              </div>
            )}
            <div className={`max-w-xl rounded-lg ${msg.sender === 'user' ? 'bg-primary text-white p-4' : 'bg-transparent text-text-primary w-full'}`}>
              {typeof msg.content === 'string' ? (
                <p className="p-4 bg-surface rounded-lg">{msg.content}</p>
              ) : (
                <AgentDesignCard design={msg.content.design} onCreate={() => onCreateAgent(msg.content.design)} />
              )}
            </div>
          </div>
        ))}

        {isGenerating && (
          <div className="flex items-start gap-4 justify-start">
            <div className="bg-primary/10 p-2 rounded-full self-start">
              <CouncilIcon className="h-6 w-6 text-primary" />
            </div>
            <div className="max-w-xl rounded-lg p-4 bg-surface text-text-primary">
              <LoadingSpinner text="The Council is deliberating..." size={6} />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

export default CouncilChatInterface;
