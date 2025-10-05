export interface UploadResponse {
  uploadId: string;
  message: string;
  country: string;
  erp: string;
}

export interface Questionnaire {
  webhooks: boolean;
  sandbox_env: boolean;
  retries: boolean;
}

export interface Scores {
  data: number;
  coverage: number;
  rules: number;
  posture: number;
  overall: number;
}

export interface FieldMapping {
  target: string;
  candidate: string;
  confidence: number;
}

export interface Coverage {
  matched: string[];
  close: FieldMapping[];
  missing: string[];
}

export interface RuleFinding {
  rule: string;
  ok: boolean;
  exampleLine?: number;
  expected?: number;
  got?: number;
  value?: string;
}

export interface Report {
  reportId: string;
  scores: Scores;
  coverage: Coverage;
  ruleFindings: RuleFinding[];
  gaps: string[];
  meta: {
    rowsParsed: number;
    linesTotal: number;
    country: string;
    erp: string;
    db: string;
  };
  readiness: string;
  message?: string;
}

export interface RecentReport {
  id: string;
  createdAt: string;
  overallScore: number;
  country: string;
  erp: string;
}