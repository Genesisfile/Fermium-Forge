
import React from 'react';
import { NavLink } from 'react-router-dom';

const AppHeader: React.FC = () => {
  return (
    <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-start h-full"> {/* Changed to justify-start */}
        <NavLink to="/" className="flex-shrink-0 flex items-center space-x-2 py-4">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-primary">
            <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="text-xl font-bold text-text-primary">Fermium Forge</span>
        </NavLink>
      </div>
    </nav>
  );
};

export default AppHeader;
