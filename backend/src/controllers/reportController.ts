import { Request, Response } from 'express';
import { getReportById, getRecentReports as getRecentReportsFromDB } from '../services/database';

export const getReport = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { reportId } = req.params;

    if (!reportId) {
      return res.status(400).json({ error: 'reportId is required' });
    }

    const report = await getReportById(reportId);

    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    return res.json(report);
  } catch (error) {
    console.error('Get report error:', error);
    return res.status(500).json({ error: 'Failed to retrieve report' });
  }
};

export const getRecentReports = async (req: Request, res: Response): Promise<Response> => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const reports = await getRecentReportsFromDB(limit);
    
    return res.json(reports);
  } catch (error) {
    console.error('Get recent reports error:', error);
    return res.status(500).json({ error: 'Failed to retrieve recent reports' });
  }
};