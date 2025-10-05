import { FieldMapping } from './fieldDetection';

export interface Scores {
  data: number;
  coverage: number;
  rules: number;
  posture: number;
  overall: number;
}

export const calculateScores = (
  data: any[],
  coverage: FieldMapping,
  ruleFindings: any[],
  questionnaire: any
): Scores => {
  // Data score (25%) - based on rows parsed
  const dataMaxPoints = 25;
  const dataScore = Math.min(dataMaxPoints, Math.round((data.length / 200) * dataMaxPoints));

  // Coverage score (35%) - based on matched required fields
  const coverageMaxPoints = 35;
  const totalFields = 18;
  const matchedFields = coverage.matched.length;
  
  // Weight header/seller/buyer fields higher than lines
  const headerFields = ['invoice.id', 'invoice.issue_date', 'invoice.currency', 'invoice.total_excl_vat', 'invoice.vat_amount', 'invoice.total_incl_vat'];
  const sellerBuyerFields = ['seller.name', 'seller.trn', 'seller.country', 'buyer.name', 'buyer.trn', 'buyer.country'];
  
  let coverageWeight = 0;
  coverage.matched.forEach(field => {
    if (headerFields.includes(field)) coverageWeight += 2;
    else if (sellerBuyerFields.includes(field)) coverageWeight += 1.5;
    else coverageWeight += 1;
  });
  
  const maxWeight = headerFields.length * 2 + sellerBuyerFields.length * 1.5 + (totalFields - headerFields.length - sellerBuyerFields.length);
  const coverageScore = Math.round((coverageWeight / maxWeight) * coverageMaxPoints);

  // Rules score (30%) - based on passed rules
  const rulesMaxPoints = 30;
  const passedRules = ruleFindings.filter(rule => rule.ok).length;
  const rulesScore = Math.round((passedRules / 5) * rulesMaxPoints);

  // Posture score (10%) - based on questionnaire
  const postureMaxPoints = 10;
  const postureAnswers = Object.values(questionnaire).filter(Boolean).length;
  const postureScore = Math.round((postureAnswers / 3) * postureMaxPoints);

  const overall = Math.min(100, dataScore + coverageScore + rulesScore + postureScore);

  return {
    data: dataScore,
    coverage: coverageScore,
    rules: rulesScore,
    posture: postureScore,
    overall
  };
};