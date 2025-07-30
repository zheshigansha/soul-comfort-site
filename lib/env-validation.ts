/**
 * 环境变量验证工具
 * 确保所有必需的环境变量都已正确配置
 */

import { logger } from './logger';

interface EnvConfig {
  key: string;
  required: boolean;
  description: string;
  sensitive?: boolean;
  defaultValue?: string;
  validator?: (value: string) => boolean;
}

const ENV_CONFIGS: EnvConfig[] = [
  // 基础配置
  {
    key: 'NODE_ENV',
    required: true,
    description: '运行环境',
    defaultValue: 'development'
  },
  {
    key: 'NEXT_PUBLIC_APP_URL',
    required: true,
    description: '应用基础URL'
  },

  // AI服务配置
  {
    key: 'ZHIPU_API_KEY',
    required: true,
    description: '智谱AI API密钥',
    sensitive: true,
    validator: (value) => value.length > 10
  },

  // 数据库配置
  {
    key: 'USE_SUPABASE_STORAGE',
    required: false,
    description: '是否使用Supabase存储',
    defaultValue: 'false'
  },

  // 支付配置
  {
    key: 'PAYPAL_CLIENT_ID',
    required: false,
    description: 'PayPal客户端ID',
    sensitive: true
  },
  {
    key: 'PAYPAL_CLIENT_SECRET',
    required: false,
    description: 'PayPal客户端密钥',
    sensitive: true
  },

  // 管理员配置
  {
    key: 'ADMIN_KEY',
    required: false,
    description: '管理员访问密钥',
    sensitive: true,
    validator: (value) => value.length >= 16
  },

  // 功能配置
  {
    key: 'FREE_USAGE_LIMIT',
    required: false,
    description: '免费使用限制',
    defaultValue: '10',
    validator: (value) => !isNaN(Number(value)) && Number(value) > 0
  }
];

export class EnvValidator {
  private errors: string[] = [];
  private warnings: string[] = [];

  /**
   * 验证所有环境变量
   */
  public validateAll(): { isValid: boolean; errors: string[]; warnings: string[] } {
    this.errors = [];
    this.warnings = [];

    for (const config of ENV_CONFIGS) {
      this.validateSingle(config);
    }

    // 输出验证结果
    if (this.errors.length > 0) {
      logger.error('环境变量验证失败:');
      this.errors.forEach(error => logger.error(`  - ${error}`));
    }

    if (this.warnings.length > 0) {
      logger.warn('环境变量警告:');
      this.warnings.forEach(warning => logger.warn(`  - ${warning}`));
    }

    if (this.errors.length === 0 && this.warnings.length === 0) {
      logger.info('✅ 所有环境变量验证通过');
    }

    return {
      isValid: this.errors.length === 0,
      errors: this.errors,
      warnings: this.warnings
    };
  }

  /**
   * 验证单个环境变量
   */
  private validateSingle(config: EnvConfig): void {
    const value = process.env[config.key];

    // 检查必需变量
    if (config.required && !value) {
      this.errors.push(`缺少必需的环境变量: ${config.key} (${config.description})`);
      return;
    }

    // 使用默认值
    if (!value && config.defaultValue) {
      process.env[config.key] = config.defaultValue;
      this.warnings.push(`使用默认值: ${config.key} = ${config.defaultValue}`);
      return;
    }

    // 跳过未设置的可选变量
    if (!value) {
      return;
    }

    // 自定义验证
    if (config.validator && !config.validator(value)) {
      this.errors.push(`环境变量格式错误: ${config.key} (${config.description})`);
      return;
    }

    // 记录成功配置的变量（敏感信息不显示值）
    if (config.sensitive) {
      logger.debug(`✓ ${config.key}: [已设置]`);
    } else {
      logger.debug(`✓ ${config.key}: ${value}`);
    }
  }

  /**
   * 获取环境变量，带类型转换和默认值
   */
  public static getString(key: string, defaultValue?: string): string {
    return process.env[key] || defaultValue || '';
  }

  public static getNumber(key: string, defaultValue?: number): number {
    const value = process.env[key];
    if (!value) return defaultValue || 0;
    const num = Number(value);
    return isNaN(num) ? (defaultValue || 0) : num;
  }

  public static getBoolean(key: string, defaultValue?: boolean): boolean {
    const value = process.env[key];
    if (!value) return defaultValue || false;
    return value.toLowerCase() === 'true';
  }

  /**
   * 检查是否为生产环境
   */
  public static isProduction(): boolean {
    return process.env.NODE_ENV === 'production';
  }

  /**
   * 检查是否为开发环境
   */
  public static isDevelopment(): boolean {
    return process.env.NODE_ENV === 'development';
  }
}

// 导出单例实例
export const envValidator = new EnvValidator();

// 在应用启动时自动验证
if (typeof window === 'undefined') {
  // 只在服务器端验证
  const result = envValidator.validateAll();
  
  if (!result.isValid && EnvValidator.isProduction()) {
    logger.error('生产环境环境变量验证失败，应用可能无法正常运行');
    // 在生产环境中，可以选择退出进程
    // process.exit(1);
  }
}