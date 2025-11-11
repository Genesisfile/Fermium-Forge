import React from 'react';

interface LoadingSpinnerProps {
  text?: string;
  size?: number;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ text, size = 8 }) => {
  return (
    <div className="flex flex-col items-center justify-center space-y-4" aria-live="polite" aria-busy="true">
      <div className="relative">
        <div 
          className={`h-${size} w-${size} rounded-full border-2 border-solid border-primary border-t-transparent animate-spin`}
          style={{ height: `${size * 0.25}rem`, width: `${size * 0.25}rem` }}
        ></div>
      </div>
      {text && <p className="text-text-secondary">{text}</p>}
    </div>
  );
};

export default LoadingSpinner;