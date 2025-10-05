import { getUploadById } from './database';
import { detectFieldMapping, generateFieldSuggestions } from './fieldDetection';
import { runAllRules, generateRuleExplanations } from './ruleEngine';
import { calculateScores } from './scoringService';
import { generateMappingSkeleton } from './mappingService';

export const analyzeData = async (uploadId: string, questionnaire: any = {}): Promise<any> => {
  const upload = await getUploadById(uploadId);
  
  if (!upload) {
    throw new Error('Upload not found');
  }

  const data = upload.data;
  const sourceFields = Object.keys(data[0] || {});
  const country = upload.country || 'UAE';

  // Field detection
  const coverage = detectFieldMapping(sourceFields);

  // Rule checking with country-specific rules
  const ruleFindings = runAllRules(data, country);

  // Calculate scores
  const scores = calculateScores(data, coverage, ruleFindings, questionnaire);

  // P1: Generate AI-lite suggestions and explanations
  const fieldSuggestions = generateFieldSuggestions(coverage.close);
  const ruleExplanations = generateRuleExplanations(ruleFindings);

  // Generate gaps list
  const gaps: string[] = [];
  
  coverage.missing.forEach(field => {
    gaps.push(`Missing required field: ${field}`);
  });

  ruleFindings.forEach(rule => {
    if (!rule.ok) {
      gaps.push(rule.explanation || `Rule ${rule.rule} failed`);
    }
  });

  // P2: Generate mapping skeleton
  const mappingSkeleton = generateMappingSkeleton(coverage);

  return {
    uploadId,
    scores,
    coverage,
    ruleFindings,
    gaps,
    fieldSuggestions, // P1
    ruleExplanations, // P1
    mappingSkeleton,  // P2
    meta: {
      rowsParsed: data.length,
      linesTotal: data.length,
      country: upload.country,
      erp: upload.erp,
      db: 'SQLite',
      analyzedAt: new Date().toISOString()
    }
  };
};