

import React, { useState } from 'react';
import { useAgentStore } from '../hooks/useAgentStore';
import { useToast } from '../hooks/useToast';
import { CopyIcon, RefreshIcon } from '../components/icons/Icons';

const Account: React.FC = () => {
    const { apiKey, regenerateApiKey } = useAgentStore();
    const { showToast } = useToast();

    const maskedApiKey = `${apiKey.substring(0, 6)}****************************${apiKey.substring(apiKey.length - 4)}`;

    const handleCopy = () => {
        navigator.clipboard.writeText(apiKey);
        showToast('API Key copied to clipboard!', 'success');
    };

    const handleRegenerate = () => {
        if (window.confirm('Are you sure you want to regenerate your API key? This will invalidate the old key immediately.')) {
            regenerateApiKey();
            showToast('API Key has been regenerated.', 'info');
        }
    };

    return (
        <div className="container mx-auto py-8 max-w-2xl">
            <h1 className="text-4xl font-bold mb-8">Account Settings</h1>
            
            <div className="bg-surface p-8 rounded-xl border border-border-color shadow-lg">
                <h2 className="text-2xl font-bold mb-6">Your API Key</h2>
                <p className="text-text-secondary mb-4">
                    Use this key to authenticate your requests when using our client SDKs or interacting with your deployed agent endpoints directly.
                </p>
                <div className="bg-surface-light p-4 rounded-lg flex items-center justify-between border border-border-color">
                    <span className="font-mono text-text-primary">{maskedApiKey}</span>
                    <button onClick={handleCopy} className="text-text-secondary hover:text-text-primary flex items-center space-x-2">
                        <CopyIcon />
                        <span>Copy</span>
                    </button>
                </div>
                <div className="mt-6">
                    <button onClick={handleRegenerate} className="flex items-center space-x-2 bg-red-600/20 text-red-400 font-bold py-2 px-4 rounded-lg hover:bg-red-600/40 transition-colors">
                        <RefreshIcon />
                        <span>Regenerate API Key</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Account;