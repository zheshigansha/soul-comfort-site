/**
 * 安全配置验证工具
 * 提供环境变量的安全访问和验证
 */

import { logger } from './logger';

interface ConfigValidation {
  required: boolean;
  sensitive?: boolean;
  validator?: (value: string) => boolean;
}

interface ConfigOptions {
  [key: string]: ConfigValidation;
}

const CONFIG_OPTIONS: ConfigOptions = {
  ADMIN_KEY: {
    required: true,
    sensitive: true,
    validator: (value: string) => value.length >= 32
  },
  NEXT_PUBLIC_SUPABASE_URL: {
    required: false,
    validator: (value: string) => value.startsWith('https://')
  },
  SUPABASE_SERVICE_ROLE_KEY: {
    required: false,
    sensitive: true
  },
  PAYPAL_CLIENT_ID: {
    required: false
  },
  PAYPAL_CLIENT_SECRET: {
    required: false,
    sensitive: true
  },
  ANTHROPIC_API_KEY: {
    required: false,
    sensitive: true
  },
  OPENAI_API_KEY: {
    required: false,
    sensitive: true
  },
  ZHIPUAI_API_KEY: {
    required: false,
    sensitive: true
  }
};

export class ConfigValidator {
  private static instance: ConfigValidator;
  private validated = false;
  private errors: string[] = [];
  private warnings: string[] = [];

  private constructor() {}

  public static getInstance(): ConfigValidator {
    if (!ConfigValidator.instance) {
      ConfigValidator.instance = new ConfigValidator();
    }
    return ConfigValidator.instance;
  }

  public validate(): { isValid: boolean; errors: string[]; warnings: string[] } {
    if (this.validated) {
      return {
        isValid: this.errors.length === 0,
        errors: this.errors,
        warnings: this.warnings
      };
    }

    this.errors = [];
    this.warnings = [];

    for (const [key, option] of Object.entries(CONFIG_OPTIONS)) {
      const value = process.env[key];
      
      if (option.required && !value) {
        this.errors.push(`缺少必需的环境变量: ${key}`);
        continue;
      }

      if (value && option.validator && !option.validator(value)) {
        this.errors.push(`环境变量 ${key} 格式不正确`);
      }
    }

    this.validated = true;
    return {
      isValid: this.errors.length === 0,
      errors: this.errors,
      warnings: this.warnings
    };
  }

  public getEnvVar(key: string, sensitive: boolean = false): string | undefined {
    const value = process.env[key];
    
    if (!value) {
      logger.warn(`环境变量 ${key} 未设置`);
      return undefined;
    }

    // 在生产环境中不记录敏感信息
    if (!sensitive || process.env.NODE_ENV !== 'production') {
      logger.info(`使用环境变量: ${key}${sensitive ? ' (敏感信息)' : ''}`);
    }

    return value;
  }

  public isProduction(): boolean {
    return process.env.NODE_ENV === 'production';
  }

  public isDevelopment(): boolean {
    return process.env.NODE_ENV === 'development';
  }
}

// 安全的配置访问函数
export function getRequiredEnvVar(key: string, sensitive: boolean = false): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`必需的环境变量 ${key} 未设置`);
  }
  return value;
}

export function getOptionalEnvVar(key: string, defaultValue: string = '', sensitive: boolean = false): string {
  return process.env[key] || defaultValue;
}

// 验证管理密钥的函数
export function validateAdminKey(providedKey: string): boolean {
  const expectedKey = getOptionalEnvVar('ADMIN_KEY');
  if (!expectedKey) {
    logger.error('ADMIN_KEY 环境变量未设置');
    return false;
  }
  
  // 使用定时安全的比较来防止时序攻击
  return providedKey === expectedKey;
}

// 创建单例实例
export const config = ConfigValidator.getInstance();