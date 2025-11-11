import React from 'react';

const LoadingSpinner: React.FC = () => (
  <div className="fixed inset-0 bg-background flex items-center justify-center z-50">
    <div className="flex flex-col items-center space-y-4">
      <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      <p className="text-xl text-text-primary">Loading Fermium Forge...</p>
    </div>
  </div>
);

export default LoadingSpinner;