import { Request, Response } from 'express';
import { getReportById } from '../services/database';

export const emailReport = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { reportId, email, message } = req.body;

    if (!reportId || !email) {
      return res.status(400).json({ 
        error: 'Report ID and email address are required' 
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        error: 'Invalid email address format' 
      });
    }

    // Get the report
    const report = await getReportById(reportId);
    if (!report) {
      return res.status(404).json({ 
        error: 'Report not found' 
      });
    }

    // Simulate email sending (in a real app, this would send an actual email)
    console.log('📧 Simulating email send:', {
      to: email,
      reportId: reportId,
      subject: `E-Invoicing Readiness Report - ${report.reportId}`,
      success: true
    });

    // Simulate delay for email sending
    await new Promise(resolve => setTimeout(resolve, 2000));

    return res.json({
      success: true,
      message: 'Report email sent successfully (simulated)',
      email: email,
      reportId: reportId,
      shareableUrl: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/share/${reportId}`,
      note: 'In production, this would send an actual email with the report link'
    });

  } catch (error) {
    console.error('Email simulation failed:', error);
    return res.status(500).json({ 
      error: 'Failed to send email simulation' 
    });
  }
};