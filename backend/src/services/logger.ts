// src/services/logger.ts
export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3
}

export class Logger {
  private static level: LogLevel = LogLevel.INFO;

  static setLevel(level: LogLevel): void {
    this.level = level;
  }

  static getLevel(): LogLevel {
    return this.level;
  }

  static error(message: string, meta?: any): void {
    if (this.level >= LogLevel.ERROR) {
      this.log('ERROR', message, meta);
    }
  }

  static warn(message: string, meta?: any): void {
    if (this.level >= LogLevel.WARN) {
      this.log('WARN', message, meta);
    }
  }

  static info(message: string, meta?: any): void {
    if (this.level >= LogLevel.INFO) {
      this.log('INFO', message, meta);
    }
  }

  static debug(message: string, meta?: any): void {
    if (this.level >= LogLevel.DEBUG) {
      this.log('DEBUG', message, meta);
    }
  }

  private static log(level: string, message: string, meta?: any): void {
    const timestamp = new Date().toISOString();
    const logEntry: any = {
      timestamp,
      level,
      message
    };

    if (meta) {
      logEntry.meta = meta;
    }

    console.log(JSON.stringify(logEntry));
  }

  static createRequestLogger() {
    return (req: any, res: any, next: any) => {
      const start = Date.now();

      res.on('finish', () => {
        const duration = Date.now() - start;
        this.info('Request completed', {
          method: req.method,
          url: req.url,
          status: res.statusCode,
          duration: `${duration}ms`,
          userAgent: req.get('User-Agent')
        });
      });

      next();
    };
  }
}

// Initialize logger based on environment
const logLevel = process.env.LOG_LEVEL?.toUpperCase() as keyof typeof LogLevel;
if (logLevel && LogLevel[logLevel] !== undefined) {
  Logger.setLevel(LogLevel[logLevel]);
}