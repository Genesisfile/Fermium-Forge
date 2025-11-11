import React, { useState, useEffect } from 'react';

// Define types for dependencies
type DependencyStatus = 'Up-to-date' | 'Update Available' | 'Vulnerable';

interface Dependency {
    name: string;
    currentVersion: string;
    latestVersion: string;
    license: string;
    status: DependencyStatus;
    area: 'Frontend' | 'Backend' | 'Tooling';
}

// Initial data for dependencies
const initialDependencies: Dependency[] = [
    { name: 'React', currentVersion: '19.2.0', latestVersion: '19.2.0', license: 'MIT', status: 'Up-to-date', area: 'Frontend' },
    { name: 'React Router DOM', currentVersion: '7.9.5', latestVersion: '7.9.5', license: 'MIT', status: 'Up-to-date', area: 'Frontend' },
    { name: '@google/genai', currentVersion: '1.30.0', latestVersion: '1.30.0', license: 'Apache-2.0', status: 'Up-to-date', area: 'Frontend' },
    { name: 'Tailwind CSS', currentVersion: '3.4.1', latestVersion: '3.4.1', license: 'MIT', status: 'Up-to-date', area: 'Frontend' },
    { name: 'Node.js', currentVersion: '20.11.0', latestVersion: '20.11.1', license: 'MIT', status: 'Update Available', area: 'Backend' },
    { name: 'Express', currentVersion: '4.18.2', latestVersion: '4.18.2', license: 'MIT', status: 'Up-to-date', area: 'Backend' },
    { name: 'Mongoose', currentVersion: '8.1.0', latestVersion: '8.1.0', license: 'MIT', status: 'Up-to-date', area: 'Backend' },
    { name: 'jsonwebtoken', currentVersion: '9.0.2', latestVersion: '9.0.2', license: 'MIT', status: 'Up-to-date', area: 'Backend' },
    { name: 'Vite', currentVersion: '5.0.8', latestVersion: '5.0.8', license: 'MIT', status: 'Up-to-date', area: 'Tooling' },
    { name: 'TypeScript', currentVersion: '5.2.2', latestVersion: '5.3.3', license: 'Apache-2.0', status: 'Update Available', area: 'Tooling' },
];

// Helper function for status colors
const getStatusClasses = (status: DependencyStatus) => {
    switch (status) {
        case 'Up-to-date':
            return 'bg-green-500/20 text-green-400';
        case 'Update Available':
            return 'bg-yellow-500/20 text-yellow-400';
        case 'Vulnerable':
            return 'bg-red-500/20 text-red-400';
        default:
            return 'bg-gray-500/20 text-gray-400';
    }
};

const SystemIntegrity: React.FC = () => {
    const [dependencies, setDependencies] = useState<Dependency[]>(initialDependencies);

    // Simulate dependency updates
    useEffect(() => {
        const interval = setInterval(() => {
            setDependencies(prev => {
                const newDeps = [...prev];
                // Randomly pick one dep to check for changes
                const indexToUpdate = Math.floor(Math.random() * newDeps.length);
                const dep = newDeps[indexToUpdate];

                // Simulate a vulnerability being patched or a new version release
                if (dep.status === 'Vulnerable' && Math.random() > 0.8) {
                    dep.status = 'Up-to-date';
                    dep.currentVersion = dep.latestVersion;
                } else if (dep.status === 'Update Available' && Math.random() > 0.7) {
                    dep.status = 'Up-to-date';
                    dep.currentVersion = dep.latestVersion;
                }
                
                return newDeps;
            });
        }, 5000); // Check every 5 seconds

        return () => clearInterval(interval);
    }, []);

    const healthyCount = dependencies.filter(d => d.status === 'Up-to-date').length;
    const vulnerableCount = dependencies.filter(d => d.status === 'Vulnerable').length;
    const totalCount = dependencies.length;
    const healthPercentage = totalCount > 0 ? ((healthyCount / totalCount) * 100).toFixed(1) : '100.0';

    return (
        <div className="container mx-auto py-8">
            <h1 className="text-4xl font-bold mb-2">System Integrity</h1>
            <p className="text-text-secondary mb-8">Live status of core platform dependencies, guided by Coda's continuous analysis.</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                <div className="bg-surface p-6 rounded-xl border border-border-color shadow-lg">
                    <p className="text-sm font-semibold text-text-secondary">Dependency Health</p>
                    <p className={`text-4xl font-bold my-2 ${vulnerableCount > 0 ? 'text-red-400' : 'text-primary'}`}>{healthPercentage}%</p>
                    <p className="text-xs text-text-secondary">{healthyCount} of {totalCount} dependencies are up-to-date.</p>
                </div>
                <div className="bg-surface p-6 rounded-xl border border-border-color shadow-lg">
                    <p className="text-sm font-semibold text-text-secondary">Updates Available</p>
                    <p className="text-4xl font-bold text-yellow-400 my-2">{dependencies.filter(d => d.status === 'Update Available').length}</p>
                    <p className="text-xs text-text-secondary">Packages with newer versions available for review.</p>
                </div>
                 <div className="bg-surface p-6 rounded-xl border border-border-color shadow-lg">
                    <p className="text-sm font-semibold text-text-secondary">Vulnerabilities Found</p>
                    <p className="text-4xl font-bold text-red-400 my-2">{vulnerableCount}</p>
                    <p className="text-xs text-text-secondary">Dependencies with known security vulnerabilities.</p>
                </div>
            </div>

            <div className="bg-surface rounded-xl border border-border-color shadow-lg overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-surface-light">
                        <tr>
                            <th className="p-4 font-semibold">Package</th>
                            <th className="p-4 font-semibold">Area</th>
                            <th className="p-4 font-semibold">Current Version</th>
                            <th className="p-4 font-semibold">Latest Version</th>
                            <th className="p-4 font-semibold">License</th>
                            <th className="p-4 font-semibold">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {dependencies.map(dep => (
                            <tr key={dep.name} className="border-t border-border-color hover:bg-surface-light/50">
                                <td className="p-4 font-medium">{dep.name}</td>
                                <td className="p-4 text-text-secondary">{dep.area}</td>
                                <td className="p-4 font-mono text-sm">{dep.currentVersion}</td>
                                <td className="p-4 font-mono text-sm">{dep.latestVersion}</td>
                                <td className="p-4 text-text-secondary">{dep.license}</td>
                                <td className="p-4">
                                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusClasses(dep.status)}`}>
                                        {dep.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default SystemIntegrity;