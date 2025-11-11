
import type { AgentStatus } from '../types';

/**
 * Generates a unique short ID string.
 * @returns {string} A 9-character alphanumeric ID.
 */
export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 11);
};

/**
 * Generates a random API key with a 'ff_' prefix.
 * @returns {string} A 35-character API key.
 */
export const generateApiKey = (): string => {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let apiKey = 'ff_';
  for (let i = 0; i < 32; i++) {
    apiKey += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return apiKey;
};

/**
 * Converts a File object to a Base64 encoded string.
 * @param {File} file The File object to convert.
 * @returns {Promise<string>} A promise that resolves with the Base64 string (without the data URL prefix).
 */
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = error => reject(error);
  });
};

/**
 * Returns Tailwind CSS classes for an agent's status to style it with appropriate colors.
 * @param {AgentStatus} status The current status of the agent.
 * @returns {string} A string of Tailwind CSS classes for background and text color.
 */
export const getStatusColorClasses = (status: AgentStatus) => {
    switch (status) {
        case 'Optimized':
             return 'bg-yellow-400/20 text-yellow-300';
        case 'Certified':
        case 'Live':
            return 'bg-green-500/20 text-green-400';
        case 'ExecutingStrategy':
        case 'Evolving':
        case 'Certifying':
        case 'Deploying':
        case 'Optimizing':
        case 'ReEvolving':
        case 'AutoEvolving':
            return 'bg-blue-500/20 text-blue-400';
        case 'AwaitingReEvolution':
            return 'bg-purple-500/20 text-purple-400';
        case 'Failed':
            return 'bg-red-500/20 text-red-400';
        case 'Conception':
        default:
            return 'bg-gray-500/20 text-gray-400';
    }
};
