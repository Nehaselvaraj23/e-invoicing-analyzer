import { Request, Response } from 'express';
import { Database } from '../config/database';

export const healthCheck = async (req: Request, res: Response): Promise<void> => {
  try {
    // Check database connection
    const db = new Database();
    
    // Instead of type conversion, properly access the database
    const result = await db.query('SELECT 1 as status');
    
    res.status(200).json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      database: result ? 'connected' : 'disconnected',
      uptime: process.uptime(),
      memory: process.memoryUsage(),
    });
  } catch (error) {
    res.status(503).json({
      status: 'Service Unavailable',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const readinessCheck = async (req: Request, res: Response): Promise<void> => {
  try {
    const db = new Database();
    const result = await db.query('SELECT 1 as status');
    
    if (result) {
      res.status(200).json({
        status: 'READY',
        timestamp: new Date().toISOString(),
      });
    } else {
      res.status(503).json({
        status: 'NOT_READY',
        timestamp: new Date().toISOString(),
      });
    }
  } catch (error) {
    res.status(503).json({
      status: 'NOT_READY',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
