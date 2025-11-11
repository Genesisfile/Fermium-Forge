import React from 'react';
import CouncilInitialPrompt from '../components/council/CouncilInitialPrompt';
import CouncilChatInterface from '../components/council/CouncilChatInterface';
import { useCouncilChat } from '../hooks/useCouncilChat';

const CouncilPage: React.FC = () => {
  const {
    messages,
    isGenerating,
    chatStarted,
    startDesignProcess,
    handleCreateAgent,
  } = useCouncilChat();

  return (
    <div className="h-[calc(100vh-12rem)] max-w-4xl mx-auto">
      {!chatStarted ? (
        <CouncilInitialPrompt 
          onStart={startDesignProcess} 
          isLoading={isGenerating} 
        />
      ) : (
        <CouncilChatInterface 
          messages={messages}
          isGenerating={isGenerating}
          onCreateAgent={handleCreateAgent}
        />
      )}
    </div>
  );
};

export default CouncilPage;
