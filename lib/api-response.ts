/**
 * 统一的API响应处理工具
 * 确保所有API端点返回一致的响应格式
 */

import { NextResponse } from 'next/server';
import { logger } from './logger';

// 标准API响应接口
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  code?: string;
}

// 错误代码枚举
export enum ApiErrorCode {
  // 客户端错误 (4xx)
  MISSING_PARAMS = 'MISSING_PARAMS',
  INVALID_PARAMS = 'INVALID_PARAMS',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  RATE_LIMITED = 'RATE_LIMITED',
  
  // 服务器错误 (5xx)
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  DATABASE_ERROR = 'DATABASE_ERROR',
  EXTERNAL_API_ERROR = 'EXTERNAL_API_ERROR'
}

// 错误代码到HTTP状态码的映射
const ERROR_STATUS_MAP: Record<ApiErrorCode, number> = {
  [ApiErrorCode.MISSING_PARAMS]: 400,
  [ApiErrorCode.INVALID_PARAMS]: 400,
  [ApiErrorCode.UNAUTHORIZED]: 401,
  [ApiErrorCode.FORBIDDEN]: 403,
  [ApiErrorCode.NOT_FOUND]: 404,
  [ApiErrorCode.RATE_LIMITED]: 429,
  [ApiErrorCode.INTERNAL_ERROR]: 500,
  [ApiErrorCode.SERVICE_UNAVAILABLE]: 503,
  [ApiErrorCode.DATABASE_ERROR]: 500,
  [ApiErrorCode.EXTERNAL_API_ERROR]: 502
};

/**
 * 创建成功响应
 */
export function createSuccessResponse<T>(data: T, message?: string): NextResponse<ApiResponse<T>> {
  return NextResponse.json({
    success: true,
    data,
    message
  });
}

/**
 * 创建错误响应
 */
export function createErrorResponse(
  error: string,
  code: ApiErrorCode = ApiErrorCode.INTERNAL_ERROR,
  details?: any
): NextResponse<ApiResponse> {
  const status = ERROR_STATUS_MAP[code];
  
  // 记录错误日志
  logger.error(`API Error [${code}]: ${error}`, undefined, { 
    code,
    details, 
    status 
  });
  
  return NextResponse.json({
    success: false,
    error,
    code,
    message: details?.message
  }, { status });
}

/**
 * 处理API异常的包装器
 */
export function withErrorHandling<T extends any[], R>(
  handler: (...args: T) => Promise<NextResponse<ApiResponse<R>>>
) {
  return async (...args: T): Promise<NextResponse<ApiResponse<R>>> => {
    try {
      return await handler(...args);
    } catch (error) {
      logger.error('Unhandled API error:', error instanceof Error ? error : undefined, {
        errorDetails: error instanceof Error ? error.message : String(error)
      });
      
      return createErrorResponse(
        'An unexpected error occurred',
        ApiErrorCode.INTERNAL_ERROR,
        { originalError: error instanceof Error ? error.message : String(error) }
      );
    }
  };
}

/**
 * 验证必需参数
 */
export function validateRequiredParams(
  params: Record<string, any>,
  required: string[]
): { isValid: boolean; missing: string[] } {
  const missing = required.filter(key => 
    params[key] === undefined || params[key] === null || params[key] === ''
  );
  
  return {
    isValid: missing.length === 0,
    missing
  };
}

/**
 * 多语言错误消息支持
 */
export function getLocalizedErrorMessage(
  errorCode: ApiErrorCode,
  locale: string = 'en'
): string {
  const messages: Record<string, Record<ApiErrorCode, string>> = {
    en: {
      [ApiErrorCode.MISSING_PARAMS]: 'Missing required parameters',
      [ApiErrorCode.INVALID_PARAMS]: 'Invalid parameters provided',
      [ApiErrorCode.UNAUTHORIZED]: 'Authentication required',
      [ApiErrorCode.FORBIDDEN]: 'Access denied',
      [ApiErrorCode.NOT_FOUND]: 'Resource not found',
      [ApiErrorCode.RATE_LIMITED]: 'Too many requests, please try again later',
      [ApiErrorCode.INTERNAL_ERROR]: 'Internal server error',
      [ApiErrorCode.SERVICE_UNAVAILABLE]: 'Service temporarily unavailable',
      [ApiErrorCode.DATABASE_ERROR]: 'Database operation failed',
      [ApiErrorCode.EXTERNAL_API_ERROR]: 'External service error'
    },
    zh: {
      [ApiErrorCode.MISSING_PARAMS]: '缺少必需参数',
      [ApiErrorCode.INVALID_PARAMS]: '参数无效',
      [ApiErrorCode.UNAUTHORIZED]: '需要身份验证',
      [ApiErrorCode.FORBIDDEN]: '访问被拒绝',
      [ApiErrorCode.NOT_FOUND]: '资源未找到',
      [ApiErrorCode.RATE_LIMITED]: '请求过于频繁，请稍后再试',
      [ApiErrorCode.INTERNAL_ERROR]: '服务器内部错误',
      [ApiErrorCode.SERVICE_UNAVAILABLE]: '服务暂时不可用',
      [ApiErrorCode.DATABASE_ERROR]: '数据库操作失败',
      [ApiErrorCode.EXTERNAL_API_ERROR]: '外部服务错误'
    }
  };
  
  return messages[locale]?.[errorCode] || messages.en[errorCode];
}