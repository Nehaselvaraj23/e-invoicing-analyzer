import axios from 'axios';
import { UploadResponse, Report, Questionnaire, RecentReport } from '../types';

const API_BASE_URL = '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

export const uploadFile = async (file: File, country: string, erp: string): Promise<UploadResponse> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('country', country);
  formData.append('erp', erp);

  const response = await api.post<UploadResponse>('/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const analyzeData = async (uploadId: string, questionnaire: Questionnaire): Promise<Report> => {
  const response = await api.post<Report>('/analyze', {
    uploadId,
    questionnaire,
  });
  return response.data;
};

export const getReport = async (reportId: string): Promise<Report> => {
  const response = await api.get<Report>(`/report/${reportId}`);
  return response.data;
};

export const getRecentReports = async (limit: number = 10): Promise<RecentReport[]> => {
  const response = await api.get<RecentReport[]>(`/reports?limit=${limit}`);
  return response.data;
};

export const healthCheck = async (): Promise<any> => {
  const response = await api.get('/health');
  return response.data;
};