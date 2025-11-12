

import React, { useState } from 'react';

import { useAgentStore } from '../hooks/useAgentStore';
import { useToast } from '../hooks/useToast';
import { CopyIcon, RefreshIcon } from '../components/icons/Icons';

const Account: React.FC = () => {
  const { state, regenerateApiKey } = useAgentStore();

  // Guard against null/undefined apiKey if state isn't fully initialized yet
  const displayApiKey = state.apiKey || 'Loading API Key...';
  const maskedApiKey = displayApiKey ? `${displayApiKey.substring(0, 6)}****************************${displayApiKey.substring(displayApiKey.length - 4)}` : '';
  
  const { showToast } = useToast();

  const handleCopy = () => {
    if (state.apiKey) {
      navigator.clipboard.writeText(state.apiKey);
      showToast('API Key copied to clipboard!', 'success');
    } else {
      showToast('API Key not available to copy.', 'error');
    }
  };

  const handleRegenerate = () => {
    if (window.confirm('Are you sure you want to regenerate your API key? This will invalidate the old key immediately.')) {
      regenerateApiKey();
      showToast('API Key has been regenerated.', 'info');
    }
  };

  return (
    <div className="container mx-auto py-10 max-w-2xl"> {/* Increased padding */}
      <h1 className="text-4xl font-bold mb-10">Account Settings</h1> {/* Increased margin */}

      <div className="bg-surface p-8 rounded-xl border border-border-color shadow-lg">
        <h2 className="text-2xl font-bold text-text-primary mb-6">Your API Key</h2>
        <p className="text-text-secondary mb-4">
          This key provides **absolute authentication** for your client SDKs and deployed agent endpoints, ensuring **unbreakable functional integrity** in every interaction. Handle with utmost care.
        </p>
        <div className="bg-surface-light p-4 rounded-lg flex items-center justify-between border border-border-color">
          <span className="font-mono text-text-primary text-base break-all">{maskedApiKey}</span> {/* Added text-base and break-all */}
          <button onClick={handleCopy} className="ml-4 text-text-secondary hover:text-primary flex items-center space-x-2 transition-colors">
            <CopyIcon className="w-5 h-5"/>
            <span>Copy</span>
          </button>
        </div>
        <div className="mt-8"> {/* Increased margin */}
          <button onClick={handleRegenerate} className="flex items-center space-x-2 bg-red-600/20 text-red-400 font-bold py-2 px-5 rounded-lg hover:bg-red-600/40 transition-colors"> {/* Increased horizontal padding */}
            <RefreshIcon className="w-5 h-5"/>
            <span>Regenerate API Key</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Account;