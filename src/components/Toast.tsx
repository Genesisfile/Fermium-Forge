import React, { useEffect, useState } from 'react';
import { useToast } from '../context/ToastContext';
import { CheckCircleIcon, XCircleIcon, InfoIcon } from './icons';

const icons = {
  success: <CheckCircleIcon className="h-6 w-6 text-accent" />,
  error: <XCircleIcon className="h-6 w-6 text-red-500" />,
  warning: <InfoIcon className="h-6 w-6 text-yellow-500" />,
  info: <InfoIcon className="h-6 w-6 text-blue-500" />,
};

const Toast: React.FC = () => {
  const { toast, hideToast } = useToast();
  const { message, type, visible } = toast;
  const [isShowing, setIsShowing] = useState(false);

  useEffect(() => {
    if (visible) {
      setIsShowing(true);
    } else {
      // Delay hiding to allow for exit animation
      const timer = setTimeout(() => setIsShowing(false), 300);
      return () => clearTimeout(timer);
    }
  }, [visible]);

  if (!isShowing) {
    return null;
  }

  return (
    <div
      className={`fixed bottom-5 right-5 w-full max-w-sm rounded-lg shadow-lg bg-surface-light border border-border-color p-4 flex items-start space-x-4 z-[100] transition-all duration-300 ease-in-out ${
        visible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}
      role="alert"
      aria-live="assertive"
    >
      <div className="flex-shrink-0">{icons[type]}</div>
      <div className="flex-1">
        <p className="text-sm font-medium text-text-primary">{message}</p>
      </div>
      <button
        onClick={hideToast}
        className="text-text-secondary hover:text-text-primary transition-colors"
        aria-label="Close notification"
      >
        <XCircleIcon className="h-5 w-5" />
      </button>
    </div>
  );
};

export default Toast;