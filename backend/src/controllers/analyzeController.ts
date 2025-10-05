import { Request, Response } from 'express';
import { analyzeData as analyzeDataService } from '../services/analysisService';
import { saveReport } from '../services/database';

export const analyzeData = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { uploadId, questionnaire } = req.body;

    if (!uploadId) {
      return res.status(400).json({ error: 'uploadId is required' });
    }

    const analysisResult = await analyzeDataService(uploadId, questionnaire);
    const reportId = await saveReport(analysisResult);

    return res.json({
      ...analysisResult,
      reportId
    });
  } catch (error) {
    console.error('Analysis error:', error);
    return res.status(500).json({ error: 'Analysis failed' });
  }
};