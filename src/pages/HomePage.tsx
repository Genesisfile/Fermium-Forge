import React from 'react';
import { Link } from 'react-router-dom';

const HomePage: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center text-center h-full -mt-16">
      <div className="max-w-3xl">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-text-primary leading-tight">
          Welcome to <span className="text-primary">Fermium Forge</span>
        </h1>
        <p className="mt-4 text-lg sm:text-xl text-text-secondary max-w-2xl mx-auto">
          A revolutionary platform to create, evolve, certify, and deploy personalized AI agents. Simulate evolution, manage deployments, and bring your AI concepts to life with immediate, practical applications.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Link
            to="/dashboard"
            className="inline-block bg-primary text-white font-semibold px-8 py-3 rounded-lg shadow-lg hover:bg-primary-focus transition-transform transform hover:-translate-y-1 duration-300"
          >
            Get Started
          </Link>
          <Link
            to="/council"
            className="inline-block bg-surface-light text-text-primary font-semibold px-8 py-3 rounded-lg shadow-lg hover:bg-surface transition-transform transform hover:-translate-y-1 duration-300"
          >
            Learn More
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
