

import React from 'react';

import { useToast } from '../hooks/useToast';
import { CheckCircleIcon, XCircleIcon, InfoIcon } from './icons/Icons';

const Toast: React.FC = () => {
  const { toast, hideToast } = useToast();
  const { message, type, visible } = toast;

  if (!visible) {
    return null;
  }

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircleIcon />;
      case 'error':
        return <XCircleIcon />;
      case 'info':
      default:
        return <InfoIcon />;
    }
  };

  const getColors = () => {
    switch (type) {
      case 'success':
        return 'bg-accent/95 border-accent text-white'; /* Slightly increased opacity */
      case 'error':
        return 'bg-red-500/95 border-red-500 text-white'; /* Slightly increased opacity */
      case 'info':
      default:
        return 'bg-surface/95 border-border-color text-text-primary'; /* Slightly increased opacity */
    }
  };

  return (
    <div
      className={`fixed bottom-5 left-1/2 -translate-x-1/2 min-w-[280px] max-w-md p-4 rounded-xl border shadow-2xl backdrop-blur-md backdrop-saturate-150 z-50 flex items-center space-x-4 transition-all duration-300 ${visible ? 'animate-fade-in-up' : 'animate-fade-out-down'} ${getColors()}`} /* Added backdrop-saturate-150 */
      role="alert"
      aria-live="polite"
      aria-atomic="true"
    >
      <div className="flex-shrink-0">{getIcon()}</div>
      <div className="flex-1 text-sm font-semibold">{message}</div>
      <button onClick={hideToast} className="flex-shrink-0 text-xl font-bold" aria-label="Close notification">&times;</button> {/* Increased close button size */}
    </div>
  );
};

export default Toast;