import React from 'react';
import { useAnalysis } from '../context/AnalysisContext';

const ContextStep: React.FC = () => {
  const { state, dispatch } = useAnalysis();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (state.context.country && state.context.erp) {
      dispatch({ type: 'SET_STEP', payload: 1 });
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Setup Context</h2>
      <p className="text-gray-600 mb-6">
        Provide some context about your e-invoicing environment to help us generate more accurate analysis.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-2">
            Country
          </label>
          <select
            id="country"
            value={state.context.country}
            onChange={(e) => dispatch({ 
              type: 'SET_CONTEXT', 
              payload: { ...state.context, country: e.target.value } 
            })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            required
          >
            <option value="">Select a country</option>
            <option value="UAE">United Arab Emirates</option>
            <option value="KSA">Saudi Arabia</option>
            <option value="MY">Malaysia</option>
            <option value="OTHER">Other</option>
          </select>
        </div>

        <div>
          <label htmlFor="erp" className="block text-sm font-medium text-gray-700 mb-2">
            ERP System
          </label>
          <input
            type="text"
            id="erp"
            value={state.context.erp}
            onChange={(e) => dispatch({ 
              type: 'SET_CONTEXT', 
              payload: { ...state.context, erp: e.target.value } 
            })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            placeholder="e.g., SAP, Oracle, Custom, etc."
            required
          />
        </div>

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={!state.context.country || !state.context.erp}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Continue to Upload
          </button>
        </div>
      </form>
    </div>
  );
};

export default ContextStep;