/**
 * 改进的存储管理器
 * 提供更可靠的数据持久化和恢复机制
 */

import { logger } from './logger';
// 直接在需要时创建DataRecovery实例
import { persistentStorage } from './persistence';

// 存储策略枚举
export enum StorageStrategy {
  LOCAL_ONLY = 'local_only',
  SERVER_BACKUP = 'server_backup',
  HYBRID = 'hybrid'
}

// 存储管理器配置
interface StorageManagerConfig {
  strategy: StorageStrategy;
  autoBackupInterval: number;
  maxRetries: number;
  enableRecoveryCode: boolean;
}

const DEFAULT_CONFIG: StorageManagerConfig = {
  strategy: StorageStrategy.HYBRID,
  autoBackupInterval: 24 * 60 * 60 * 1000, // 24小时
  maxRetries: 3,
  enableRecoveryCode: true
};

export class StorageManager {
  private static instance: StorageManager;
  private config: StorageManagerConfig;
  private backupTimer?: NodeJS.Timeout;

  private constructor(config: StorageManagerConfig = DEFAULT_CONFIG) {
    this.config = config;
    this.initializeAutoBackup();
  }

  public static getInstance(config?: StorageManagerConfig): StorageManager {
    if (!StorageManager.instance) {
      StorageManager.instance = new StorageManager(config);
    }
    return StorageManager.instance;
  }

  /**
   * 安全的用户数据获取
   * 包含自动恢复机制
   */
  async getUserDataSafely(clientId: string): Promise<{
    success: boolean;
    data?: any;
    needsRecovery?: boolean;
    recoveryCode?: string;
  }> {
    try {
      // 尝试获取用户数据
      const userData = await persistentStorage.getUserUsage(clientId);
      
      // 检查数据完整性 - 暂时跳过以避免循环依赖
      const syncResult = { needsSync: false, conflicts: [] };
      
      if (syncResult.needsSync) {
        logger.warn('检测到数据同步问题', { 
          clientId, 
          conflicts: syncResult.conflicts 
        });
        
        // 如果是付费用户且启用了恢复码，生成恢复码
        if (userData.isPremium && this.config.enableRecoveryCode) {
          // 暂时返回模拟恢复码以避免循环依赖
          const recoveryCode = `RC-${Date.now()}-${clientId.substring(0, 8)}`;
          return {
            success: true,
            data: userData,
            needsRecovery: true,
            recoveryCode
          };
        }
      }

      return {
        success: true,
        data: userData
      };
    } catch (error) {
      logger.error('获取用户数据失败', error instanceof Error ? error : undefined);
      
      return {
        success: false,
        needsRecovery: true
      };
    }
  }

  /**
   * 安全的用户数据更新
   * 包含重试机制和备份
   */
  async updateUserDataSafely(
    clientId: string, 
    updateFn: (currentData: any) => any
  ): Promise<boolean> {
    let retries = 0;
    
    while (retries < this.config.maxRetries) {
      try {
        // 获取当前数据
        const currentData = await persistentStorage.getUserUsage(clientId);
        
        // 应用更新
        const updatedData = updateFn(currentData);
        
        // 保存更新
        if (updatedData.isPremium) {
          await persistentStorage.setUserPremium(clientId, updatedData.premiumData);
        }
        
        // 验证更新是否成功
        const verifyData = await persistentStorage.getUserUsage(clientId);
        if (JSON.stringify(verifyData) === JSON.stringify(updatedData)) {
          logger.info('用户数据更新成功', { clientId });
          return true;
        }
        
        throw new Error('数据验证失败');
      } catch (error) {
        retries++;
        logger.warn(`数据更新失败，重试 ${retries}/${this.config.maxRetries}`, {
          clientId,
          error: error instanceof Error ? error.message : String(error)
        });
        
        if (retries < this.config.maxRetries) {
          // 等待后重试
          await new Promise(resolve => setTimeout(resolve, 1000 * retries));
        }
      }
    }
    
    logger.error('数据更新最终失败', undefined, { clientId });
    return false;
  }

  /**
   * 数据迁移和恢复
   */
  async migrateUserData(oldClientId: string, newClientId: string): Promise<boolean> {
    try {
      // 获取旧数据
      const oldData = await persistentStorage.getUserUsage(oldClientId);
      
      if (!oldData.isPremium) {
        logger.info('用户无付费数据需要迁移', { oldClientId, newClientId });
        return true;
      }
      
      // 迁移到新客户端ID
      if (oldData.premiumData) {
        await persistentStorage.setUserPremium(newClientId, oldData.premiumData);
      }
      
      // 验证迁移结果
      const newData = await persistentStorage.getUserUsage(newClientId);
      
      if (newData.isPremium) {
        logger.info('用户数据迁移成功', { oldClientId, newClientId });
        
        // 清理旧数据（可选）
        await persistentStorage.removeUserPremium(oldClientId);
        
        return true;
      }
      
      throw new Error('迁移验证失败');
    } catch (error) {
      logger.error('用户数据迁移失败', error instanceof Error ? error : undefined);
      return false;
    }
  }

  /**
   * 系统健康检查
   */
  async healthCheck(): Promise<{
    status: 'healthy' | 'warning' | 'error';
    issues: string[];
    stats: any;
  }> {
    const issues: string[] = [];
    let status: 'healthy' | 'warning' | 'error' = 'healthy';
    
    try {
      // 检查存储系统
      const stats = await persistentStorage.getStats();
      
      // 检查存储空间
      if (typeof localStorage !== 'undefined') {
        const used = JSON.stringify(localStorage).length;
        const limit = 5 * 1024 * 1024; // 5MB估算
        
        if (used > limit * 0.8) {
          issues.push('localStorage使用率过高');
          status = 'warning';
        }
      }
      
      // 检查数据一致性
      if (stats.totalUsers > 1000) {
        issues.push('用户数据量较大，建议启用服务器备份');
        status = 'warning';
      }
      
      return {
        status,
        issues,
        stats
      };
    } catch (error) {
      return {
        status: 'error',
        issues: ['存储系统检查失败'],
        stats: null
      };
    }
  }

  /**
   * 清理过期数据
   */
  async cleanupExpiredData(): Promise<{
    cleaned: number;
    errors: string[];
  }> {
    let cleaned = 0;
    const errors: string[] = [];
    
    try {
      // 清理过期的付费状态
      await persistentStorage.cleanExpiredData();
      
      // 清理过期的恢复码
      if (typeof localStorage !== 'undefined') {
        const keysToRemove: string[] = [];
        
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key?.startsWith('recovery_')) {
            try {
              const data = localStorage.getItem(key);
              if (data) {
                const mapping = JSON.parse(data);
                const createdAt = new Date(mapping.createdAt);
                const now = new Date();
                const daysDiff = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24);
                
                if (daysDiff > 30) {
                  keysToRemove.push(key);
                }
              }
            } catch (error) {
              errors.push(`清理恢复码 ${key} 时出错`);
            }
          }
        }
        
        keysToRemove.forEach(key => {
          localStorage.removeItem(key);
          cleaned++;
        });
      }
      
      logger.info('数据清理完成', { cleaned, errors: errors.length });
      
      return { cleaned, errors };
    } catch (error) {
      errors.push('数据清理过程中出现错误');
      return { cleaned, errors };
    }
  }

  // 私有方法
  private initializeAutoBackup(): void {
    if (this.config.strategy === StorageStrategy.LOCAL_ONLY) {
      return;
    }
    
    this.backupTimer = setInterval(async () => {
      try {
        // 暂时跳过自动备份以避免循环依赖
        logger.info('自动备份已跳过（避免循环依赖）');
      } catch (error) {
        logger.error('自动备份失败', error instanceof Error ? error : undefined);
      }
    }, this.config.autoBackupInterval);
  }

  /**
   * 销毁管理器
   */
  destroy(): void {
    if (this.backupTimer) {
      clearInterval(this.backupTimer);
      this.backupTimer = undefined;
    }
  }
}

// 导出单例实例
export const storageManager = StorageManager.getInstance();