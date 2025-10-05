import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { errorHandler } from './utils/errors';
import { initializeDatabase } from './services/database';
import { healthCheck } from './controllers/healthController';
import { uploadFile } from './controllers/uploadController';
import { analyzeData } from './controllers/analyzeController';
import { getReport, getRecentReports } from './controllers/reportController';
import { emailReport } from './controllers/emailController';

const app = express();
const PORT = process.env.PORT || 3001;

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv' || 
        file.mimetype === 'application/json' ||
        file.originalname.endsWith('.csv') ||
        file.originalname.endsWith('.json')) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV and JSON files are allowed'));
    }
  }
});

// CORS Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsing middleware
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/health', healthCheck);
app.post('/upload', upload.single('file'), uploadFile);
app.post('/analyze', analyzeData);
app.get('/report/:reportId', getReport);
app.get('/reports', getRecentReports);
app.post('/email-report', emailReport); // P2: Email functionality

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'E-Invoicing Readiness Analyzer API',
    version: '2.0.0',
    endpoints: {
      upload: 'POST /upload',
      analyze: 'POST /analyze', 
      getReport: 'GET /report/:id',
      recentReports: 'GET /reports',
      health: 'GET /health',
      emailReport: 'POST /email-report'
    }
  });
});

// Error handling middleware
// app.use(errorHandler);

// Start server
const startServer = async () => {
  try {
    await initializeDatabase();
    
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/health`);
      console.log(`🌐 CORS enabled for: http://localhost:5173`);
      console.log(`📧 Email service: Ready`);
      console.log(`🎯 P1/P2 Features: Enabled`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
