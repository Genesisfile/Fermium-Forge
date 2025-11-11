import React, { createContext, useContext, ReactNode, useState, useCallback } from 'react';
import { ToastContextType, ToastState, ToastType } from '../types';

const ToastContext = createContext<ToastContextType | undefined>(undefined);

const initialToastState: ToastState = {
  message: '',
  type: 'info',
  visible: false,
};

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toast, setToast] = useState<ToastState>(initialToastState);

  const hideToast = useCallback(() => {
    setToast(prev => ({ ...prev, visible: false }));
  }, []);

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    setToast({ message, type, visible: true });
    setTimeout(() => {
      hideToast();
    }, 5000); // Auto-hide after 5 seconds
  }, [hideToast]);

  return (
    <ToastContext.Provider value={{ showToast, toast, hideToast }}>
      {children}
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
