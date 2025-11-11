import React from 'react';
import { NavLink } from 'react-router-dom';
import { ForgeIcon, DashboardIcon, PlaygroundIcon, DeploymentsIcon, CampaignsIcon, CouncilIcon, SystemIcon, PlusIcon } from './icons';

const navLinks = [
  { to: '/dashboard', label: 'Dashboard', icon: DashboardIcon },
  { to: '/playground', label: 'Playground', icon: PlaygroundIcon },
  { to: '/deployments', label: 'Deployments', icon: DeploymentsIcon },
  { to: '/campaigns', label: 'Campaigns', icon: CampaignsIcon },
  { to: '/council', label: 'Council', icon: CouncilIcon },
  { to: '/system', label: 'System', icon: SystemIcon },
];

const Navbar: React.FC = () => {
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
      isActive
        ? 'bg-surface-light text-text-primary'
        : 'text-text-secondary hover:bg-surface hover:text-text-primary'
    }`;

  return (
    <header className="bg-surface sticky top-0 z-50 border-b border-border-color">
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            <NavLink to="/" className="flex items-center space-x-2">
              <ForgeIcon className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold text-text-primary">Fermium Forge</span>
            </NavLink>
          </div>
          <div className="hidden md:flex items-center space-x-2">
            {navLinks.map(({ to, label, icon: Icon }) => (
              <NavLink key={to} to={to} className={linkClass}>
                <Icon className="h-5 w-5 mr-2" />
                <span>{label}</span>
              </NavLink>
            ))}
             <NavLink 
              to="/create" 
              className="inline-flex items-center justify-center bg-primary text-white font-semibold px-3 py-2 text-sm rounded-lg shadow-lg hover:bg-primary-focus transition-transform transform hover:-translate-y-0.5 duration-300 ml-4"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Create Agent
            </NavLink>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;