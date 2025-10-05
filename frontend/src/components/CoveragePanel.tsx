import React from 'react';
import { Coverage } from '../types';

interface CoveragePanelProps {
  coverage: Coverage;
}

const CoveragePanel: React.FC<CoveragePanelProps> = ({ coverage }) => {
  const totalFields = coverage.matched.length + coverage.close.length + coverage.missing.length;
  const matchedPercentage = Math.round((coverage.matched.length / totalFields) * 100);
  const closePercentage = Math.round((coverage.close.length / totalFields) * 100);
  const missingPercentage = Math.round((coverage.missing.length / totalFields) * 100);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Schema Coverage</h3>
      
      {/* Coverage Summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">{coverage.matched.length}</div>
          <div className="text-sm text-gray-600">Matched</div>
          <div className="text-xs text-gray-500">{matchedPercentage}%</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-yellow-600">{coverage.close.length}</div>
          <div className="text-sm text-gray-600">Close Match</div>
          <div className="text-xs text-gray-500">{closePercentage}%</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-red-600">{coverage.missing.length}</div>
          <div className="text-sm text-gray-600">Missing</div>
          <div className="text-xs text-gray-500">{missingPercentage}%</div>
        </div>
      </div>

      {/* Matched Fields */}
      {coverage.matched.length > 0 && (
        <div className="mb-4">
          <h4 className="font-medium text-green-700 mb-2">✓ Matched Fields</h4>
          <div className="grid grid-cols-2 gap-1">
            {coverage.matched.map((field) => (
              <div key={field} className="text-sm text-green-600 bg-green-50 px-2 py-1 rounded">
                {field}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Close Matches */}
      {coverage.close.length > 0 && (
        <div className="mb-4">
          <h4 className="font-medium text-yellow-700 mb-2">~ Close Matches</h4>
          <div className="space-y-2">
            {coverage.close.map((mapping, index) => (
              <div key={index} className="text-sm">
                <div className="text-yellow-700">{mapping.target}</div>
                <div className="text-gray-500 text-xs">
                  ← {mapping.candidate} ({Math.round(mapping.confidence * 100)}% confidence)
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Missing Fields */}
      {coverage.missing.length > 0 && (
        <div>
          <h4 className="font-medium text-red-700 mb-2">✗ Missing Fields</h4>
          <div className="grid grid-cols-2 gap-1">
            {coverage.missing.map((field) => (
              <div key={field} className="text-sm text-red-600 bg-red-50 px-2 py-1 rounded">
                {field}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CoveragePanel;