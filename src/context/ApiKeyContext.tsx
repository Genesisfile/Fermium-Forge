import React, { createContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { ApiKeyContextType } from '../types';
import { useToast } from './ToastContext';

export const ApiKeyContext = createContext<ApiKeyContextType>({
  hasApiKey: false,
  isApiKeyLoading: true, // Start in a loading state
  selectApiKey: async () => {}, // Dummy function for initial context value
  callGeminiApi: async () => null,
});

export const ApiKeyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [hasApiKey, setHasApiKey] = useState(false);
  const [isApiKeyLoading, setIsApiKeyLoading] = useState(true); // Changed initial state to true
  const { showToast } = useToast();

  // This function checks the aistudio environment for a selected key.
  // It's memoized with useCallback to prevent re-creation on re-renders.
  const checkApiKey = useCallback(async () => {
    setIsApiKeyLoading(true); // Ensure loading state is active when checking
    // The window.aistudio object is provided by the hosting environment (e.g., Google AI Studio)
    // to securely manage API keys without exposing them directly in the code.
    if (window.aistudio) {
        try {
            const keyStatus = await window.aistudio.hasSelectedApiKey();
            setHasApiKey(keyStatus);
        } catch (error) {
            console.error("Error checking for API key:", error);
            setHasApiKey(false); // Assume no key on error
        } finally {
            setIsApiKeyLoading(false); // Always set to false after check completes
        }
    } else {
        // If not in the aistudio environment, assume no key is available through this mechanism.
        // In a production app, you might have a different fallback.
        setHasApiKey(false);
        setIsApiKeyLoading(false); // No aistudio, immediately resolve loading
    }
  }, []);

  // FIX: Define selectApiKey using useCallback to ensure it's in scope and memoized.
  // It calls window.aistudio.openSelectKey() as per guidelines.
  const selectApiKey = useCallback(async () => {
    if (window.aistudio) {
      try {
        await window.aistudio.openSelectKey();
        // After opening the dialog, assume success and re-check the key.
        // As per guidelines: "you can assume the key selection was successful after triggering `openSelectKey()`."
        await checkApiKey();
      } catch (error) {
        console.error("Error opening API key selection dialog:", error);
        showToast("Failed to open API key selection dialog.", "error");
      }
    } else {
      showToast("API Key selection is not available in this environment.", "error");
    }
  }, [checkApiKey, showToast]); // Dependencies for selectApiKey

  useEffect(() => {
    checkApiKey();
  }, [checkApiKey]);

  // A wrapper for all Gemini API calls to centralize key checking and error handling.
  // The `<T,>` syntax with a trailing comma disambiguates the generic from a JSX tag.
  const callGeminiApi = useCallback(async <T,>(apiCall: () => Promise<T>): Promise<T | null> => {
    if (!hasApiKey) {
      showToast("No API Key selected. Please select a key to continue.", "warning");
      selectApiKey(); // Now `selectApiKey` is in scope
      return null;
    }

    try {
      // If a key is present, attempt the API call.
      return await apiCall();
    } catch (error: any) {
      // Gracefully handle common API key errors.
      // As per guidelines: If the request fails with "Requested entity was not found.", reset key selection.
      if (error.message?.includes("API key not valid") || error.message?.includes("Requested entity was not found.")) {
        setHasApiKey(false); // The key is bad, trigger the ApiKeyGate to reappear.
        showToast("API Key is invalid or expired. Please select a new one.", "error");
        selectApiKey(); // Explicitly re-open the dialog
      } else {
        // For other errors, re-throw them to be handled by the calling component.
        console.error("Gemini API call failed:", error);
        showToast("An unexpected error occurred with the AI service.", "error");
      }
      return null;
    }
  }, [hasApiKey, showToast, selectApiKey]); // Add selectApiKey to dependencies

  const contextValue = {
    hasApiKey,
    isApiKeyLoading,
    selectApiKey, // Now `selectApiKey` is in scope here
    callGeminiApi,
  };

  return (
    <ApiKeyContext.Provider value={contextValue}>
      {children}
    </ApiKeyContext.Provider>
  );
};