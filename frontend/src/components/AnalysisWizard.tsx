import React from 'react';
import { useAnalysis } from '../context/AnalysisContext';

const AnalysisWizard: React.FC = () => {
  const { state } = useAnalysis();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            E-Invoicing Readiness Analyzer
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Upload your invoice data to check compliance with GETS v0.1 standard
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Welcome to the E-Invoicing Analyzer
          </h2>
          <p className="text-gray-600 mb-6">
            This tool will help you analyze your invoice data against the GETS v0.1 standard.
          </p>
          <button className="btn-primary">
            Get Started
          </button>
        </div>
      </div>
    </div>
  );
};

export default AnalysisWizard;