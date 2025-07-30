/**
 * 日志工具
 * 提供不同级别的日志记录，生产环境自动过滤低级别日志
 */

import { LogLevel } from '@/types';

class Logger {
  private static instance: Logger;
  private logLevel: LogLevel;

  private constructor() {
    // 生产环境只显示warn和error，开发环境显示所有
    this.logLevel = process.env.NODE_ENV === 'production' ? 'warn' : 'debug';
  }

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private shouldLog(level: LogLevel): boolean {
    const levels: Record<LogLevel, number> = {
      debug: 0,
      info: 1,
      warn: 2,
      error: 3
    };
    return levels[level] >= levels[this.logLevel];
  }

  private formatMessage(level: LogLevel, message: string, meta?: Record<string, any>): string {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level: level.toUpperCase(),
      message,
      ...(meta && Object.keys(meta).length > 0 && { meta })
    };

    return JSON.stringify(logEntry);
  }

  debug(message: string, meta?: Record<string, any>): void {
    if (this.shouldLog('debug')) {
      console.debug(this.formatMessage('debug', message, meta));
    }
  }

  info(message: string, meta?: Record<string, any>): void {
    if (this.shouldLog('info')) {
      console.info(this.formatMessage('info', message, meta));
    }
  }

  warn(message: string, meta?: Record<string, any>): void {
    if (this.shouldLog('warn')) {
      console.warn(this.formatMessage('warn', message, meta));
    }
  }

  error(message: string, error?: Error, meta?: Record<string, any>): void {
    if (this.shouldLog('error')) {
      const logMeta = {
        ...(meta && { meta }),
        ...(error && {
          error: {
            message: error.message,
            stack: error.stack,
            name: error.name
          }
        })
      };
      console.error(this.formatMessage('error', message, logMeta));
    }
  }

  // 快捷方法
  static debug(message: string, meta?: Record<string, any>): void {
    Logger.getInstance().debug(message, meta);
  }

  static info(message: string, meta?: Record<string, any>): void {
    Logger.getInstance().info(message, meta);
  }

  static warn(message: string, meta?: Record<string, any>): void {
    Logger.getInstance().warn(message, meta);
  }

  static error(message: string, error?: Error, meta?: Record<string, any>): void {
    Logger.getInstance().error(message, error, meta);
  }
}

export const logger = Logger;
export default Logger;