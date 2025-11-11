import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { Agent } from '../../types';
import { InfoIcon } from '../../components/icons';

// Define the context type for clarity and type safety
interface AgentDetailContext {
  agent: Agent | null;
}

const AgentSpecEditorPage: React.FC = () => {
  // Use the context provided by the parent route (AgentDetailPage)
  const { agent } = useOutletContext<AgentDetailContext>();

  // Phase 2 & 3: Defensive coding and loading/error states.
  // Although AgentDetailPage guarantees the agent exists, this pattern
  // makes the component resilient to future changes.
  if (!agent) {
    return (
      <div className="flex items-center justify-center h-full text-text-secondary">
        <InfoIcon className="h-6 w-6 mr-2" />
        Agent data is not available.
      </div>
    );
  }
  
  const { specifications } = agent;

  return (
    <div>
      <h2 className="text-2xl font-bold text-text-primary mb-6">Core Specifications</h2>
      {specifications && specifications.length > 0 ? (
        <div className="space-y-4">
          {specifications.map((spec) => (
            <div key={spec.id} className="p-4 bg-surface-light rounded-md border border-border-color">
              <h3 className="font-semibold text-text-primary text-lg">{spec.name}</h3>
              <p className="text-sm text-text-secondary mt-1">{spec.description}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-surface-light rounded-lg border border-dashed border-border-color">
            <h3 className="text-xl font-semibold text-text-primary">No Specifications Defined</h3>
            <p className="mt-2 text-text-secondary">This agent has no specifications yet. They can be added via the Council.</p>
        </div>
      )}
    </div>
  );
};

export default AgentSpecEditorPage;