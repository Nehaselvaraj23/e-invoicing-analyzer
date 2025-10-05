import React, { useState, useEffect } from 'react';
import { useAnalysis } from '../context/AnalysisContext';
import { analyzeData } from '../services/api';
import ScoreCard from './ScoreCard';
import CoveragePanel from './CoveragePanel';
import RuleFindings from './RuleFindings';

const AnalysisStep: React.FC = () => {
  const { state, dispatch } = useAnalysis();
  const [questionnaire, setQuestionnaire] = useState({
    webhooks: false,
    sandbox_env: false,
    retries: false,
  });

  useEffect(() => {
    if (state.uploadData && !state.report) {
      performAnalysis();
    }
  }, [state.uploadData]);

  const performAnalysis = async () => {
    if (!state.uploadData) return;

    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const report = await analyzeData(state.uploadData.uploadId, questionnaire);
      dispatch({ type: 'SET_REPORT', payload: report });
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.response?.data?.error || 'Analysis failed' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  if (state.loading) {
    return (
      <div className="max-w-4xl mx-auto text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Analyzing your invoice data...</p>
      </div>
    );
  }

  if (!state.report) {
    return (
      <div className="max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Additional Information</h2>
        
        <div className="bg-gray-50 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Technical Capabilities</h3>
          <p className="text-gray-600 mb-4">
            Help us understand your technical setup to provide better recommendations.
          </p>
          
          <div className="space-y-4">
            {[
              { key: 'webhooks', label: 'Webhooks Support', description: 'Can your system handle webhook callbacks?' },
              { key: 'sandbox_env', label: 'Sandbox Environment', description: 'Do you have a testing environment?' },
              { key: 'retries', label: 'Retry Mechanism', description: 'Can your system retry failed requests?' },
            ].map((item) => (
              <div key={item.key} className="flex items-start">
                <input
                  type="checkbox"
                  id={item.key}
                  checked={questionnaire[item.key as keyof typeof questionnaire]}
                  onChange={(e) => setQuestionnaire(prev => ({
                    ...prev,
                    [item.key]: e.target.checked
                  }))}
                  className="mt-1 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor={item.key} className="ml-3">
                  <span className="block text-sm font-medium text-gray-900">{item.label}</span>
                  <span className="block text-sm text-gray-500">{item.description}</span>
                </label>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-between">
          <button
            onClick={() => dispatch({ type: 'SET_STEP', payload: 1 })}
            className="btn-secondary"
          >
            Back to Upload
          </button>
          <button
            onClick={performAnalysis}
            className="btn-primary"
          >
            Start Analysis
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Analysis Complete</h2>
        <p className="text-gray-600">
          Your e-invoicing readiness score is{' '}
          <span className={`font-semibold ${
            state.report.readiness === 'High' ? 'text-green-600' :
            state.report.readiness === 'Medium' ? 'text-yellow-600' : 'text-red-600'
          }`}>
            {state.report.readiness}
          </span>
        </p>
      </div>

      <ScoreCard scores={state.report.scores} readiness={state.report.readiness} />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
        <CoveragePanel coverage={state.report.coverage} />
        <RuleFindings findings={state.report.ruleFindings} gaps={state.report.gaps} />
      </div>

      <div className="mt-8 flex justify-between items-center">
        <button
          onClick={() => {
            dispatch({ type: 'RESET' });
            dispatch({ type: 'SET_STEP', payload: 0 });
          }}
          className="btn-secondary"
        >
          Analyze Another File
        </button>
        
        <div className="space-x-4">
          <button
            onClick={() => {
              const dataStr = JSON.stringify(state.report, null, 2);
              const dataBlob = new Blob([dataStr], { type: 'application/json' });
              const url = URL.createObjectURL(dataBlob);
              const link = document.createElement('a');
              link.href = url;
              link.download = `e-invoicing-report-${state.report?.reportId}.json`;
              link.click();
              URL.revokeObjectURL(url);
            }}
            className="btn-primary"
          >
            Download JSON Report
          </button>
          
          <button
            onClick={() => {
              navigator.clipboard.writeText(`${window.location.origin}/report/${state.report?.reportId}`);
              alert('Report link copied to clipboard!');
            }}
            className="btn-secondary"
          >
            Copy Shareable Link
          </button>
        </div>
      </div>
    </div>
  );
};

export default AnalysisStep;