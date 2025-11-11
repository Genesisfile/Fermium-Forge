import React, { useContext } from 'react';
import { ApiKeyContext } from '../context/ApiKeyContext';
import { ForgeIcon } from './icons';

const ApiKeyGate: React.FC = () => {
    const { selectApiKey } = useContext(ApiKeyContext);

    return (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
            <div className="w-full max-w-md bg-surface p-8 rounded-lg border border-border-color shadow-2xl">
                 <div className="flex flex-col items-center text-center">
                    <ForgeIcon className="h-12 w-12 text-primary" />
                    <h1 className="text-2xl font-bold text-text-primary mt-4">Welcome to Fermium Forge</h1>
                    <p className="mt-2 text-text-secondary">
                        To use Fermium Forge's generative AI features, you need to select a Google AI API key.
                    </p>
                </div>
                
                <div className="mt-8 space-y-6">
                    <button
                        onClick={selectApiKey}
                        className="w-full bg-primary text-white font-semibold py-3 rounded-lg shadow-lg hover:bg-primary-focus transition-all duration-300"
                    >
                        Select API Key
                    </button>
                </div>

                 <p className="mt-6 text-xs text-text-secondary text-center">
                    By selecting an API key, you agree to the associated billing. For more information, see the{' '}
                    <a
                        href="https://ai.google.dev/gemini-api/docs/billing"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                    >
                        billing documentation
                    </a>.
                </p>
            </div>
        </div>
    );
};

export default ApiKeyGate;