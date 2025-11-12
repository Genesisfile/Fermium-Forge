import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';

type ToastType = 'success' | 'error' | 'info';

interface ToastState {
  message: string;
  type: ToastType;
  visible: boolean;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType, duration?: number) => void;
  toast: ToastState;
  hideToast: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toast, setToast] = useState<ToastState>({ message: '', type: 'info', visible: false });
  const [timeoutId, setTimeoutId] = useState<number | null>(null);

  const hideToast = useCallback(() => {
    setToast(prev => ({ ...prev, visible: false }));
     if (timeoutId) {
      clearTimeout(timeoutId as number); // Explicitly cast to number
      setTimeoutId(null);
    }
  }, [timeoutId]);

  const showToast = useCallback((message: string, type: ToastType = 'info', duration: number = 3000) => {
    if (timeoutId) {
      clearTimeout(timeoutId as number); // Explicitly cast to number
    }
    const newTimeoutId = window.setTimeout(() => {
      hideToast();
    }, duration);
    setToast({ message, type, visible: true });
    setTimeoutId(newTimeoutId);
  }, [hideToast, timeoutId]);

  return (
    <ToastContext.Provider value={{ showToast, toast, hideToast }}>
      {children}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};