
import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { HomeIcon, DashboardIcon, BuildIcon, DeployIcon, IntegrationsIcon, AccountIcon, MenuIcon, XIcon, HealthIcon, SystemIntegrityIcon, DiagnosticsIcon } from './icons/Icons';

const navLinks = [
  { to: '/', text: 'Home', icon: <HomeIcon /> },
  { to: '/dashboard', text: 'Dashboard', icon: <DashboardIcon /> },
  { to: '/deploy', text: 'Deployment Hub', icon: <DeployIcon /> },
  { to: '/health', text: 'Health', icon: <HealthIcon /> },
  { to: '/integrity', text: 'Integrity', icon: <SystemIntegrityIcon /> },
  { to: '/diagnostics', text: 'Diagnostics', icon: <DiagnosticsIcon /> },
  { to: '/integrations', text: 'Integrations', icon: <IntegrationsIcon /> },
  { to: '/account', text: 'Account', icon: <AccountIcon /> },
];

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-surface/80 backdrop-blur-md border-b border-border-color">
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <NavLink to="/" className="flex-shrink-0 flex items-center space-x-2">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-primary">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="text-xl font-bold text-text-primary">Fermium Forge</span>
            </NavLink>
          </div>
          <div className="hidden md:flex items-center ml-10 space-x-4">
              {navLinks.map((link) => (
                <NavLink
                  key={link.text}
                  to={link.to}
                  className={({ isActive }) =>
                    `flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                      isActive
                        ? 'bg-primary text-white'
                        : 'text-text-secondary hover:bg-surface-light hover:text-text-primary'
                    }`
                  }
                >
                  {link.icon}
                  <span>{link.text}</span>
                </NavLink>
              ))}
               <button
                  onClick={() => navigate('/strategy')}
                  className="flex items-center space-x-2 bg-primary text-white font-semibold py-2 px-4 rounded-lg hover:bg-primary-focus transition-colors shadow-md shadow-primary/30"
                >
                  <BuildIcon />
                  <span>Create Agent</span>
                </button>
          </div>
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-text-secondary hover:text-text-primary hover:bg-surface-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-surface focus:ring-primary"
              aria-controls="mobile-menu"
              aria-expanded={isOpen}
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? <XIcon /> : <MenuIcon />}
            </button>
          </div>
        </div>
      </nav>

      {isOpen && (
        <div className="md:hidden" id="mobile-menu">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navLinks.map((link) => (
              <NavLink
                key={link.text}
                to={link.to}
                onClick={() => setIsOpen(false)}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 ${
                    isActive
                      ? 'bg-primary text-white'
                      : 'text-text-secondary hover:bg-surface-light hover:text-text-primary'
                  }`
                }
              >
                {link.icon}
                <span>{link.text}</span>
              </NavLink>
            ))}
             <button
                onClick={() => { navigate('/strategy'); setIsOpen(false); }}
                className="w-full flex items-center space-x-3 bg-primary text-white px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 mt-2"
              >
                <BuildIcon />
                <span>Create Agent</span>
              </button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
