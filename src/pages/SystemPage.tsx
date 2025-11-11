import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';

const SystemPage: React.FC = () => {
    const navItems = [
        { path: 'health', label: 'Health' },
        { path: 'integrity', label: 'Integrity' },
        { path: 'diagnostics', label: 'Diagnostics' },
        { path: 'integrations', label: 'Integrations' },
        { path: 'account', label: 'Account' },
    ];

    const navLinkClass = ({ isActive }: { isActive: boolean }) =>
        `block px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
        isActive
            ? 'bg-surface-light text-text-primary'
            : 'text-text-secondary hover:bg-surface hover:text-text-primary'
        }`;

    return (
        <div className="flex flex-col md:flex-row gap-8">
            <aside className="md:w-1/4 lg:w-1/5">
                <div className="sticky top-24">
                    <h2 className="text-lg font-bold text-text-primary mb-4 px-4">System Management</h2>
                    <nav className="space-y-1">
                        {navItems.map(item => (
                            <NavLink key={item.path} to={item.path} className={navLinkClass}>
                                {item.label}
                            </NavLink>
                        ))}
                    </nav>
                </div>
            </aside>
            <main className="flex-1">
                <div className="bg-surface p-6 rounded-lg border border-border-color min-h-[400px]">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default SystemPage;