import React, { useState } from 'react';
import { CouncilIcon } from '../icons';

interface CouncilInitialPromptProps {
  onStart: (prompt: string) => void;
  isLoading: boolean;
}

const CouncilInitialPrompt: React.FC<CouncilInitialPromptProps> = ({ onStart, isLoading }) => {
  const [prompt, setPrompt] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim()) {
      onStart(prompt);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full text-center animate-fade-in">
      <div className="bg-primary/10 p-4 rounded-full mb-6">
        <CouncilIcon className="h-12 w-12 text-primary" />
      </div>
      <h1 className="text-4xl font-bold text-text-primary">Design Your Next Agent</h1>
      <p className="mt-4 text-lg text-text-secondary max-w-2xl mx-auto">
        Describe the primary goal or function of the agent you want to create. The AI Council will generate a complete design specification for you.
      </p>
      <form onSubmit={handleSubmit} className="mt-8 w-full max-w-2xl">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g., An AI agent that monitors social media for brand mentions and performs sentiment analysis..."
          disabled={isLoading}
          className="w-full bg-surface-light border border-border-color rounded-lg p-4 text-text-primary focus:ring-2 focus:ring-primary focus:border-primary transition disabled:opacity-50 min-h-[120px] resize-none"
          rows={4}
        />
        <button
          type="submit"
          disabled={isLoading || !prompt.trim()}
          className="mt-4 w-full bg-primary text-white font-semibold py-3 px-6 rounded-lg shadow-lg hover:bg-primary-focus transition-all duration-300 disabled:bg-primary/50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Generating...' : 'Start Design Process'}
        </button>
      </form>
    </div>
  );
};

export default CouncilInitialPrompt;
