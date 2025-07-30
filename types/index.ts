/**
 * 全局类型定义
 */

// API响应类型
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// 用户相关类型
export interface UserUsage {
  count: number;
  limit: number;
  remaining: number;
  isPremium: boolean;
  expiresAt?: string;
}

// 支付相关类型
export interface PaymentData {
  type: 'credits' | 'subscription';
  credits?: number;
  expiresAt?: string;
  orderId?: string;
  transactionId?: string;
  amount?: number;
  currency?: string;
}

// 客户端信息
export interface ClientInfo {
  clientId: string;
  deviceInfo: DeviceInfo | null;
  storage: string;
}

export interface DeviceInfo {
  userAgent?: string;
  screenWidth?: number;
  screenHeight?: number;
  timezone?: string;
  language?: string;
}

// 存储相关类型
export interface StorageStats {
  totalUsers: number;
  totalPremiumUsers: number;
  totalUsage: number;
  lastUpdated: string;
}

// 配置类型
export interface AppConfig {
  zhipuApiKey: string;
  adminKey: string;
  supabaseUrl: string;
  supabaseAnonKey: string;
  paypalClientId: string;
  paypalClientSecret: string;
  paypalEnvironment: 'sandbox' | 'live';
  maxFreeUsage: number;
  creditsPerDollar: number;
}

// 日志级别
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

// API错误响应
export interface ApiError {
  message: string;
  code?: string;
  status?: number;
  details?: Record<string, any>;
}

// 支付请求类型
export interface PaymentRequest {
  clientId: string;
  amount: number;
  currency: string;
  type: 'credits' | 'subscription';
  credits?: number;
}

// 支付响应类型
export interface PaymentResponse {
  orderId: string;
  approvalUrl: string;
  status: 'created' | 'approved' | 'captured' | 'failed';
}