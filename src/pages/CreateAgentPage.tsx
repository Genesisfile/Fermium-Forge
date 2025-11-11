import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRightIcon, PlusIcon } from '../components/icons';

const creationOptions = [
    {
        title: 'Design with AI Assistant',
        description: 'Engage in a conversation with our Strategist Council AI to collaboratively design your agent\'s core specifications.',
        link: '/council',
        icon: PlusIcon,
        cta: 'Consult the Council',
        recommended: true,
    },
    {
        title: 'Manual Configuration',
        description: 'Build an agent from scratch by defining every component, model, and parameter yourself. For advanced users.',
        link: '#',
        icon: PlusIcon,
        cta: 'Configure Manually',
        disabled: true,
    },
];

const CreateAgentPage: React.FC = () => {
  return (
    <div>
        <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-text-primary">Create a New Agent</h1>
            <p className="mt-4 text-lg text-text-secondary max-w-2xl mx-auto">
                Choose a method to begin crafting your specialized AI agent. Start with our AI assistant for a rapid design process.
            </p>
        </div>

        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
            {creationOptions.map((option) => (
                <div key={option.title} className={`bg-surface rounded-lg border ${option.disabled ? 'border-border-color/50' : 'border-border-color hover:border-primary'} p-8 flex flex-col transition-all duration-300 relative`}>
                    {option.recommended && (
                         <div className="absolute top-0 right-8 -mt-3 bg-primary text-white text-xs font-bold px-3 py-1 rounded-full">RECOMMENDED</div>
                    )}
                    <option.icon className={`h-10 w-10 mb-4 ${option.disabled ? 'text-text-secondary/50' : 'text-primary'}`} />
                    <h2 className={`text-2xl font-bold ${option.disabled ? 'text-text-primary/50' : 'text-text-primary'}`}>{option.title}</h2>
                    <p className={`mt-2 text-base flex-grow ${option.disabled ? 'text-text-secondary/50' : 'text-text-secondary'}`}>{option.description}</p>
                    
                    {option.disabled ? (
                        <span className="mt-8 w-full text-center bg-surface-light text-text-secondary/50 font-semibold py-3 rounded-lg cursor-not-allowed">
                            Coming Soon
                        </span>
                    ) : (
                        <Link 
                            to={option.link}
                            className="group mt-8 inline-flex items-center justify-center bg-primary text-white font-semibold px-6 py-3 rounded-lg shadow-lg hover:bg-primary-focus transition-transform transform hover:-translate-y-0.5 duration-300"
                        >
                            {option.cta}
                            <ChevronRightIcon className="h-5 w-5 ml-2 transform transition-transform group-hover:translate-x-1" />
                        </Link>
                    )}
                </div>
            ))}
        </div>
    </div>
  );
};

export default CreateAgentPage;