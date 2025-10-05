import React from 'react';
import { Scores } from '../types';

interface ScoreCardProps {
  scores: Scores;
  readiness: string;
}

const ScoreCard: React.FC<ScoreCardProps> = ({ scores, readiness }) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'score-excellent';
    if (score >= 60) return 'score-good';
    if (score >= 40) return 'score-medium';
    return 'score-poor';
  };

  const getReadinessColor = (readiness: string) => {
    switch (readiness) {
      case 'High': return 'bg-green-100 text-green-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Low': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const scoreItems = [
    { label: 'Data Quality', score: scores.data, weight: '25%' },
    { label: 'Schema Coverage', score: scores.coverage, weight: '35%' },
    { label: 'Rule Compliance', score: scores.rules, weight: '30%' },
    { label: 'Technical Posture', score: scores.posture, weight: '10%' },
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Overall Score */}
        <div className="text-center">
          <div className="mb-4">
            <div className="text-4xl font-bold text-gray-900 mb-2">{scores.overall}/100</div>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getReadinessColor(readiness)}`}>
              {readiness} Readiness
            </span>
          </div>
          <div className="w-32 h-32 mx-auto relative">
            <svg className="w-full h-full" viewBox="0 0 36 36">
              <path
                d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="#E5E7EB"
                strokeWidth="3"
              />
              <path
                d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="#3B82F6"
                strokeWidth="3"
                strokeDasharray={`${scores.overall}, 100`}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl font-bold text-gray-900">{scores.overall}%</span>
            </div>
          </div>
        </div>

        {/* Score Breakdown */}
        <div className="md:col-span-2 space-y-4">
          {scoreItems.map((item) => (
            <div key={item.label} className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-gray-700">{item.label}</span>
                  <span className="text-gray-500">{item.score}/100 • {item.weight}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${getScoreColor(item.score)}`}
                    style={{ width: `${item.score}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ScoreCard;