const GETS_FIELDS = [
  'invoice.id', 'invoice.issue_date', 'invoice.currency', 'invoice.total_excl_vat',
  'invoice.vat_amount', 'invoice.total_incl_vat', 'seller.name', 'seller.trn',
  'seller.country', 'seller.city', 'buyer.name', 'buyer.trn', 'buyer.country',
  'buyer.city', 'lines[].sku', 'lines[].description', 'lines[].qty',
  'lines[].unit_price', 'lines[].line_total'
];

export const normalizeFieldName = (fieldName: string): string => {
  return fieldName.toLowerCase().replace(/[_\s]/g, '');
};

export const calculateSimilarity = (a: string, b: string): number => {
  const normalizedA = normalizeFieldName(a);
  const normalizedB = normalizeFieldName(b);
  
  if (normalizedA === normalizedB) return 1.0;
  if (normalizedA.includes(normalizedB) || normalizedB.includes(normalizedA)) return 0.9;
  if (normalizedA.startsWith(normalizedB) || normalizedB.startsWith(normalizedA)) return 0.8;
  
  const longer = normalizedA.length > normalizedB.length ? normalizedA : normalizedB;
  const shorter = normalizedA.length > normalizedB.length ? normalizedB : normalizedA;
  
  if (longer.includes(shorter)) {
    return shorter.length / longer.length;
  }
  
  return 0;
};

export interface FieldMapping {
  matched: string[];
  close: Array<{ target: string; candidate: string; confidence: number }>;
  missing: string[];
}

export const detectFieldMapping = (sourceFields: string[]): FieldMapping => {
  const matched: string[] = [];
  const close: Array<{ target: string; candidate: string; confidence: number }> = [];
  const missing: string[] = [];

  GETS_FIELDS.forEach(targetField => {
    const normalizedTarget = normalizeFieldName(targetField);
    
    const exactMatchIndex = sourceFields.findIndex(sourceField => 
      normalizeFieldName(sourceField) === normalizedTarget
    );

    if (exactMatchIndex !== -1) {
      matched.push(targetField);
    } else {
      let bestCandidate: string | null = null;
      let bestConfidence = 0;

      sourceFields.forEach(sourceField => {
        const confidence = calculateSimilarity(targetField, sourceField);
        if (confidence > 0.7 && confidence > bestConfidence) {
          bestConfidence = confidence;
          bestCandidate = sourceField;
        }
      });

      if (bestCandidate && bestConfidence > 0.7) {
        close.push({
          target: targetField,
          candidate: bestCandidate,
          confidence: Math.round(bestConfidence * 100) / 100
        });
      } else {
        missing.push(targetField);
      }
    }
  });

  return { matched, close, missing };
};

// P1: AI-Lite Guidance
export const generateFieldSuggestions = (closeMatches: Array<{ target: string; candidate: string; confidence: number }>): string[] => {
  const suggestions: string[] = [];
  
  closeMatches.forEach(match => {
    if (match.confidence > 0.8) {
      suggestions.push(`"${match.candidate}" likely maps to "${match.target}" (high similarity)`);
    } else if (match.confidence > 0.7) {
      suggestions.push(`Consider mapping "${match.candidate}" to "${match.target}"`);
    } else {
      suggestions.push(`"${match.candidate}" might correspond to "${match.target}" - review this mapping`);
    }
  });
  
  return suggestions;
};

export const inferFieldType = (value: any): string => {
  if (typeof value === 'number') return 'number';
  if (!isNaN(Date.parse(value))) return 'date';
  if (typeof value === 'boolean') return 'boolean';
  return 'string';
};