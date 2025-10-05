import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { Report, UploadResponse, Questionnaire } from '../types';

interface AnalysisState {
  currentStep: number;
  context: {
    country: string;
    erp: string;
  };
  uploadData: UploadResponse | null;
  report: Report | null;
  loading: boolean;
  error: string | null;
}

type AnalysisAction =
  | { type: 'SET_STEP'; payload: number }
  | { type: 'SET_CONTEXT'; payload: { country: string; erp: string } }
  | { type: 'SET_UPLOAD_DATA'; payload: UploadResponse }
  | { type: 'SET_REPORT'; payload: Report }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'RESET' };

const initialState: AnalysisState = {
  currentStep: 0,
  context: {
    country: '',
    erp: '',
  },
  uploadData: null,
  report: null,
  loading: false,
  error: null,
};

const analysisReducer = (state: AnalysisState, action: AnalysisAction): AnalysisState => {
  switch (action.type) {
    case 'SET_STEP':
      return { ...state, currentStep: action.payload };
    case 'SET_CONTEXT':
      return { ...state, context: action.payload };
    case 'SET_UPLOAD_DATA':
      return { ...state, uploadData: action.payload, error: null };
    case 'SET_REPORT':
      return { ...state, report: action.payload, loading: false, error: null };
    case 'SET_LOADING':
      return { ...state, loading: action.payload, error: action.payload ? state.error : null };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
};

const AnalysisContext = createContext<{
  state: AnalysisState;
  dispatch: React.Dispatch<AnalysisAction>;
} | null>(null);

export const AnalysisProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(analysisReducer, initialState);

  return (
    <AnalysisContext.Provider value={{ state, dispatch }}>
      {children}
    </AnalysisContext.Provider>
  );
};

export const useAnalysis = () => {
  const context = useContext(AnalysisContext);
  if (!context) {
    throw new Error('useAnalysis must be used within an AnalysisProvider');
  }
  return context;
};