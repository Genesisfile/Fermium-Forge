import React, { useContext } from 'react';
import { ApiKeyContext } from '../../context/ApiKeyContext';
import { SystemIcon } from '../../components/icons';

const Account: React.FC = () => {
    const { hasApiKey, selectApiKey } = useContext(ApiKeyContext);

    const handleChangeKey = () => {
        selectApiKey();
    };

    return (
        <div>
            <h2 className="text-2xl font-bold text-text-primary mb-6">Account Settings</h2>
            <div className="bg-surface-light p-6 rounded-lg border border-border-color">
                <h3 className="text-lg font-semibold text-text-primary flex items-center">
                    <SystemIcon className="h-6 w-6 mr-3 text-primary" />
                    API Key Management
                </h3>
                <p className="mt-2 text-text-secondary">
                    Your Google AI API key is required for all generative AI features on the platform. It is managed by the host environment and is not stored by this application.
                </p>
                <div className="mt-4 p-3 bg-surface rounded-md text-sm">
                    <p className="text-text-secondary">Status: <span className="font-mono text-text-primary">{hasApiKey ? `API Key Selected` : 'No API Key Selected'}</span></p>
                </div>
                 <button
                    onClick={handleChangeKey}
                    className="mt-4 bg-primary text-white font-semibold py-2 px-4 rounded-lg shadow-lg hover:bg-primary-focus transition-all duration-300"
                >
                    {hasApiKey ? 'Change API Key' : 'Select API Key'}
                </button>
            </div>
        </div>
    );
};

export default Account;