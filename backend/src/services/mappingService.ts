export const generateMappingSkeleton = (coverage: any): any => {
  const mapping: any = {
    version: "1.0",
    generatedAt: new Date().toISOString(),
    fieldMappings: {}
  };
  
  // Add matched fields
  coverage.matched.forEach((field: string) => {
    mapping.fieldMappings[field] = {
      sourceField: field,
      confidence: 1.0,
      status: 'exact_match',
      notes: 'Automatically matched'
    };
  });
  
  // Add close matches
  coverage.close.forEach((match: any) => {
    mapping.fieldMappings[match.target] = {
      sourceField: match.candidate,
      confidence: match.confidence,
      status: 'suggested',
      notes: `Similarity score: ${match.confidence}`
    };
  });
  
  // Add missing fields as placeholders
  coverage.missing.forEach((field: string) => {
    mapping.fieldMappings[field] = {
      sourceField: '',
      confidence: 0,
      status: 'missing',
      notes: 'Field not found in source data'
    };
  });
  
  return mapping;
};

export const exportMappingTemplate = (mappingSkeleton: any): string => {
  const template = {
    name: "E-Invoicing Field Mapping",
    description: "Generated mapping template for GETS v0.1 compliance",
    version: "1.0",
    mappings: mappingSkeleton.fieldMappings,
    instructions: [
      "1. Review suggested mappings",
      "2. Fill in missing source fields",
      "3. Update confidence scores as needed",
      "4. Use this template in your integration"
    ]
  };
  
  return JSON.stringify(template, null, 2);
};