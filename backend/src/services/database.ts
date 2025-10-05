import sqlite3 from 'sqlite3';
import path from 'path';

// Database instance
let db: sqlite3.Database | null = null;

export const initializeDatabase = (): Promise<sqlite3.Database> => {
  return new Promise((resolve, reject) => {
    if (db) {
      return resolve(db);
    }

    const dbPath = path.join(process.cwd(), 'e-invoicing.db');
    
    db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('Error opening database:', err);
        reject(err);
      } else {
        console.log('Connected to SQLite database');
        
        // Create tables
        db!.run(`
          CREATE TABLE IF NOT EXISTS uploads (
            id TEXT PRIMARY KEY,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            country TEXT,
            erp TEXT,
            rows_parsed INTEGER,
            data TEXT
          )
        `, (err) => {
          if (err) {
            console.error('Error creating uploads table:', err);
            reject(err);
          } else {
            db!.run(`
              CREATE TABLE IF NOT EXISTS reports (
                id TEXT PRIMARY KEY,
                upload_id TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                scores_overall INTEGER,
                report_json TEXT,
                expires_at DATETIME DEFAULT (datetime('now', '+7 days')),
                FOREIGN KEY (upload_id) REFERENCES uploads (id)
              )
            `, (err) => {
              if (err) {
                console.error('Error creating reports table:', err);
                reject(err);
              } else {
                resolve(db!);
              }
            });
          }
        });
      }
    });
  });
};

export const saveUpload = async (uploadData: {
  data: any[];
  country: string;
  erp: string;
  rowsParsed: number;
}): Promise<string> => {
  await initializeDatabase();
  const uploadId = `u_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  return new Promise((resolve, reject) => {
    db!.run(
      'INSERT INTO uploads (id, country, erp, rows_parsed, data) VALUES (?, ?, ?, ?, ?)',
      [uploadId, uploadData.country, uploadData.erp, uploadData.rowsParsed, JSON.stringify(uploadData.data)],
      function(err) {
        if (err) {
          reject(err);
        } else {
          resolve(uploadId);
        }
      }
    );
  });
};

export const getUploadById = async (uploadId: string): Promise<any> => {
  await initializeDatabase();
  
  return new Promise((resolve, reject) => {
    db!.get(
      'SELECT * FROM uploads WHERE id = ?',
      [uploadId],
      (err, row: any) => {
        if (err) {
          reject(err);
        } else if (row) {
          resolve({
            ...row,
            data: JSON.parse(row.data)
          });
        } else {
          resolve(null);
        }
      }
    );
  });
};

export const saveReport = async (reportData: any): Promise<string> => {
  await initializeDatabase();
  const reportId = `r_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  return new Promise((resolve, reject) => {
    db!.run(
      'INSERT INTO reports (id, upload_id, scores_overall, report_json) VALUES (?, ?, ?, ?)',
      [reportId, reportData.uploadId, reportData.scores.overall, JSON.stringify(reportData)],
      function(err) {
        if (err) {
          reject(err);
        } else {
          resolve(reportId);
        }
      }
    );
  });
};

export const getReportById = async (reportId: string): Promise<any> => {
  await initializeDatabase();
  
  return new Promise((resolve, reject) => {
    db!.get(
      'SELECT * FROM reports WHERE id = ?',
      [reportId],
      (err, row: any) => {
        if (err) {
          reject(err);
        } else if (row) {
          resolve(JSON.parse(row.report_json));
        } else {
          resolve(null);
        }
      }
    );
  });
};

export const getRecentReports = async (limit: number = 10): Promise<any[]> => {
  await initializeDatabase();
  
  return new Promise((resolve, reject) => {
    db!.all(
      'SELECT id, created_at, scores_overall FROM reports ORDER BY created_at DESC LIMIT ?',
      [limit],
      (err, rows: any[]) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows || []);
        }
      }
    );
  });
};

export const query = async <T = any>(sql: string, params: any[] = []): Promise<{ rows: T[] }> => {
  await initializeDatabase();
  
  return new Promise((resolve, reject) => {
    db!.all(sql, params, (err, rows: any[]) => {
      if (err) {
        reject(err);
      } else {
        resolve({ rows: rows as T[] || [] });
      }
    });
  });
};