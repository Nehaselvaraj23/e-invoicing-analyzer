import { Request, Response } from 'express';
import { initializeDatabase, getRecentReports } from '../services/database';

export const healthCheck = async (req: Request, res: Response): Promise<Response> => {
  try {
    const db = await initializeDatabase();
    
    // Test database connection
    await db.get('SELECT 1 as test');
    
    // Get metrics
    const totalReports = await db.get('SELECT COUNT(*) as count FROM reports') as { count: number };
    const totalUploads = await db.get('SELECT COUNT(*) as count FROM uploads') as { count: number };
    const recentReports = await getRecentReports(5);

    // System metrics
    const memoryUsage = process.memoryUsage();
    const uptime = process.uptime();

    return res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'e-invoicing-analyzer',
      version: '2.0.0',
      environment: process.env.NODE_ENV || 'development',
      
      database: {
        status: 'connected',
        type: 'SQLite',
        total_reports: totalReports.count,
        total_uploads: totalUploads.count
      },

      system: {
        uptime: `${Math.floor(uptime / 60)} minutes`,
        memory: {
          used: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`,
          total: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)}MB`,
          rss: `${Math.round(memoryUsage.rss / 1024 / 1024)}MB`
        },
        node_version: process.version,
        platform: process.platform
      },

      features: {
        p1_ai_guidance: true,
        p1_pdf_export: true,
        p1_recent_reports: true,
        p2_country_rules: true,
        p2_email_reports: true,
        p2_theme_support: true,
        p2_mapping_export: true
      },

      recent_activity: {
        last_reports: recentReports.map((r: any) => ({
          id: r.id,
          score: r.scores_overall,
          created: r.created_at
        }))
      }
    });
  } catch (error) {
    console.error('Health check failed:', error);
    return res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      service: 'e-invoicing-analyzer',
      database: 'disconnected',
      error: 'Database connection failed'
    });
  }
};