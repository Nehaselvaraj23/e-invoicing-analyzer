import React from 'react';
import { RuleFinding } from '../types';

interface RuleFindingsProps {
  findings: RuleFinding[];
  gaps: string[];
}

const RuleFindings: React.FC<RuleFindingsProps> = ({ findings, gaps }) => {
  const getRuleDisplayName = (rule: string) => {
    const names: { [key: string]: string } = {
      TOTALS_BALANCE: 'Totals Balance',
      LINE_MATH: 'Line Item Math',
      DATE_ISO: 'Date Format',
      CURRENCY_ALLOWED: 'Currency Validation',
      TRN_PRESENT: 'TRN Presence',
    };
    return names[rule] || rule;
  };

  const getRuleDescription = (rule: string) => {
    const descriptions: { [key: string]: string } = {
      TOTALS_BALANCE: 'total_excl_vat + vat_amount = total_incl_vat',
      LINE_MATH: 'qty * unit_price = line_total',
      DATE_ISO: 'Date must be in YYYY-MM-DD format',
      CURRENCY_ALLOWED: 'Currency must be AED, SAR, MYR, or USD',
      TRN_PRESENT: 'Both seller and buyer TRN must be present',
    };
    return descriptions[rule] || '';
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Rule Validation</h3>
      
      {/* Rule Findings */}
      <div className="space-y-3 mb-6">
        {findings.map((finding, index) => (
          <div key={index} className="flex items-start space-x-3">
            <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-sm ${
              finding.ok 
                ? 'bg-green-100 text-green-600' 
                : 'bg-red-100 text-red-600'
            }`}>
              {finding.ok ? '✓' : '✗'}
            </div>
            <div className="flex-1">
              <div className="font-medium text-gray-900">
                {getRuleDisplayName(finding.rule)}
              </div>
              <div className="text-sm text-gray-600">
                {getRuleDescription(finding.rule)}
              </div>
              {!finding.ok && (
                <div className="text-sm text-red-600 mt-1">
                  {finding.exampleLine && `Line ${finding.exampleLine}: `}
                  {finding.expected && `Expected ${finding.expected}, got ${finding.got}`}
                  {finding.value && `Invalid value: ${finding.value}`}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Gap Analysis */}
      {gaps.length > 0 && (
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Key Issues to Address</h4>
          <div className="space-y-2">
            {gaps.map((gap, index) => (
              <div key={index} className="flex items-start space-x-2 text-sm">
                <div className="flex-shrink-0 w-4 h-4 mt-0.5">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                </div>
                <span className="text-gray-700">{gap}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default RuleFindings;