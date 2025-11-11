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
        return 'bg-accent/90 border-accent text-white';
      case 'error':
        return 'bg-red-500/90 border-red-500 text-white';
      case 'info':
      default:
        return 'bg-surface/90 border-border-color text-text-primary';
    }
  }

  return (
    <div
      className={`fixed bottom-5 left-1/2 -translate-x-1/2 min-w-[250px] max-w-md p-4 rounded-xl border shadow-2xl backdrop-blur-md z-50 flex items-center space-x-4 transition-all duration-300 ${visible ? 'animate-fade-in-up' : 'animate-fade-out-down'} ${getColors()}`}
    >
        <div className="flex-shrink-0">{getIcon()}</div>
        <div className="flex-1 text-sm font-semibold">{message}</div>
        <button onClick={hideToast} className="flex-shrink-0">&times;</button>
    </div>
  );
};

// Add animations to index.html or a global CSS file if they don't exist
// For now, adding style tag in component for simplicity, but not best practice
const ToastStyles = () => (
    <style>{`
        @keyframes fade-in-up {
            0% { opacity: 0; transform: translate(-50%, 20px); }
            100% { opacity: 1; transform: translate(-50%, 0); }
        }
        @keyframes fade-out-down {
            0% { opacity: 1; transform: translate(-50%, 0); }
            100% { opacity: 0; transform: translate(-50%, 20px); }
        }
        .animate-fade-in-up { animation: fade-in-up 0.3s ease-out forwards; }
        .animate-fade-out-down { animation: fade-out-down 0.3s ease-in forwards; }
    `}</style>
)


const ToastWithStyles = () => (
    <>
        <ToastStyles />
        <Toast />
    </>
);


export default ToastWithStyles;
