

import React from 'react';
import { GeneratedSuggestion } from '../services/geminiService'; // Fix: Imported GeneratedSuggestion
import { RefreshIcon, SparklesIcon, LightbulbIcon, RobotIcon, ArchitectureIcon, SpeedometerIcon, CrownIcon, CheckCircleIcon } from './icons/Icons'; // Added SpeedometerIcon, CrownIcon, CheckCircleIcon

interface SuggestionSectionProps {
  title: string;
  description: string;
  suggestions: GeneratedSuggestion[];
  isLoading: boolean;
  onRefresh: () => void;
  onSelect: (suggestion: GeneratedSuggestion) => void;
  // Removed isCooldownActive prop
  accentColorClass: string;
  icon: React.ReactNode;
}

const SuggestionSection: React.FC<SuggestionSectionProps> = ({
  title,
  description,
  suggestions,
  isLoading,
  onRefresh,
  onSelect,
  // Removed isCooldownActive from destructuring
  accentColorClass,
  icon,
}) => {
  return (
    <div className="mt-8 pt-8 border-t border-border-color">
      <div className="flex items-center justify-between mb-4">
        <h3 className={`text-xl font-bold ${accentColorClass} flex items-center space-x-2`}>
          {icon}
          <span>{title}</span>
        </h3>
        <button
          onClick={onRefresh}
          disabled={isLoading} // Removed isCooldownActive from disabled check
          className="flex items-center space-x-2 text-text-secondary hover:text-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed py-2 px-4 rounded-lg border border-border-color hover:border-primary" /* Added padding, border, hover styles */
          aria-label={`Refresh ${title} concepts`}
          aria-disabled={isLoading} // Removed isCooldownActive from aria-disabled
        >
          <RefreshIcon className="w-5 h-5"/>
          <span>{isLoading ? 'Loading...' : 'Refresh Concepts'}</span>
        </button>
      </div>
      <p className="text-sm text-text-secondary mb-4">{description}</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-surface-light p-4 rounded-lg border border-border-color animate-pulse h-24" aria-hidden="true">
              <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-700 rounded w-full"></div>
              <div className="h-3 bg-gray-700 rounded w-5/6 mt-1"></div>
            </div>
          ))
        ) : (
          suggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => onSelect(suggestion)}
              className="group text-left p-4 bg-surface-light border border-border-color rounded-lg hover:border-primary-focus hover:shadow-md transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed" /* Changed hover:border-primary to hover:border-primary-focus */
              // Removed disabled={isCooldownActive}
              aria-label={`Select concept: ${suggestion.prompt}`}
              // Removed aria-disabled={isCooldownActive}
            >
              <p className="text-text-primary font-semibold mb-1 group-hover:text-primary transition-colors text-base">{suggestion.prompt}</p>
              {suggestion.fullDescription && (
                <p className="text-text-secondary text-sm line-clamp-2 group-hover:text-text-primary transition-colors">{suggestion.fullDescription}</p>
              )}
            </button>
          ))
        )}
      </div>
      {/* Removed API cooldown message */}
    </div>
  );
};

export default SuggestionSection;