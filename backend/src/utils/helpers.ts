export const getCurrentDate = (): string => {
  const date = new Date();
  return date.toISOString().split('T')[0] || '';
};

export const parseCSV = (csvText: string): any[] => {
  try {
    const lines = csvText.split('\n').filter(line => line.trim() !== '');
    
    if (lines.length === 0) {
      return [];
    }

    const headers = lines[0]?.split(',').map(header =>
      header.trim().toLowerCase().replace(/[^\w]/g, '_')
    ) || [];

    const result = [];
    for (let i = 1; i < Math.min(lines.length, 201); i++) {
      const values = lines[i]?.split(',').map(value => value.trim()) || [];
      const row: any = {};

      headers.forEach((header, index) => {
        let value: any = values[index] || '';
        
        // Try to convert to number if possible
        if (!isNaN(parseFloat(value)) && isFinite(parseFloat(value))) {
          value = parseFloat(value);
        }
        // Try to convert to boolean
        else if (value.toLowerCase() === 'true' || value.toLowerCase() === 'false') {
          value = value.toLowerCase() === 'true';
        }
        // Try to parse as date
        else if (Date.parse(value)) {
          // Keep as string but validate format later
        }

        row[header] = value;
      });

      result.push(row);
    }

    return result;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`CSV parsing failed: ${errorMessage}`);
  }
};

export const parseJSON = (jsonText: string): any[] => {
  try {
    const data = JSON.parse(jsonText);
    
    if (Array.isArray(data)) {
      return data.slice(0, 200);
    } else if (typeof data === 'object') {
      return [data];
    } else {
      throw new Error('JSON must be an array or object');
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Invalid JSON format: ${errorMessage}`);
  }
};

export const detectDelimiter = (firstLine: string): string => {
  const delimiters = [',', ';', '\t', '|'];
  let bestDelimiter = ',';
  let maxCount = 0;

  for (const delimiter of delimiters) {
    const count = (firstLine?.split(delimiter) || []).length;
    if (count > maxCount) {
      maxCount = count;
      bestDelimiter = delimiter;
    }
  }

  return bestDelimiter;
};

export const calculateScores = (
  data: any[],
  coverage: any,
  ruleFindings: any[],
  questionnaire: any
): { data: number; coverage: number; rules: number; posture: number; overall: number } => {
  // Data score (25%) - based on rows parsed and type inference
  const dataScore = Math.min(100, Math.round((data.length / 200) * 100 * 0.25));

  // Coverage score (35%) - based on matched fields
  const totalFields = 18; // Total GETS fields
  const matchedFields = coverage.matched.length;
  const coverageScore = Math.round((matchedFields / totalFields) * 100 * 0.35);

  // Rules score (30%) - based on passed rules
  const passedRules = ruleFindings.filter(rule => rule.ok).length;
  const rulesScore = Math.round((passedRules / 5) * 100 * 0.30);

  // Posture score (10%) - based on questionnaire
  const postureAnswers = Object.values(questionnaire).filter(Boolean).length;
  const postureScore = Math.round((postureAnswers / 3) * 100 * 0.10);

  const overall = Math.min(100, dataScore + coverageScore + rulesScore + postureScore);

  return {
    data: dataScore,
    coverage: coverageScore,
    rules: rulesScore,
    posture: postureScore,
    overall
  };
};