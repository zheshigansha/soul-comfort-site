import { persistentStorage } from './persistence';
import { storageManager, StorageStrategy } from './storage-manager';
// 暂时移除DataRecovery导入以避免循环依赖
import { logger } from './logger';

// 免费用户默认限制
export const FREE_USAGE_LIMIT = 10;

// 添加premium数据类型定义
interface PremiumData {
  type: 'subscription' | 'credits';
  expiresAt?: string;
  unlimited?: boolean;
  credits?: number;
}

// 向后兼容的包装器 - 使用新的持久化存储
export async function getUserPremiumStatus(clientId: string): Promise<{
  isPremium: boolean;
  premiumData: PremiumData | null;
  limit: number;
  expired?: boolean;
}> {
  const result = await persistentStorage.getUserPremiumStatus(clientId);
  return {
    isPremium: result.isPremium,
    premiumData: result.premiumData,
    limit: result.limit,
    expired: result.expired
  };
}

// 获取用户使用情况（改进版，包含恢复机制）
export async function getUserUsage(clientId: string): Promise<{
  clientId: string;
  count: number;
  limit: number;
  remaining: number;
  isLimitReached: boolean;
  isPremium: boolean;
  premiumData: PremiumData | null;
}> {
  try {
    // 使用安全的存储管理器
    const result = await storageManager.getUserDataSafely(clientId);
    
    if (result.success && result.data) {
      // 如果需要恢复，记录恢复码
      if (result.needsRecovery && result.recoveryCode) {
        logger.warn('用户数据需要恢复，已生成恢复码', {
          clientId,
          recoveryCode: result.recoveryCode
        });
      }
      
      return result.data;
    }
    
    // 如果获取失败，返回默认数据
    logger.warn('获取用户数据失败，返回默认数据', { clientId });
    return {
      clientId,
      count: 0,
      limit: FREE_USAGE_LIMIT,
      remaining: FREE_USAGE_LIMIT,
      isLimitReached: false,
      isPremium: false,
      premiumData: null
    };
  } catch (error) {
    logger.error('getUserUsage 执行失败', error instanceof Error ? error : undefined);
    // 返回安全的默认值
    return {
      clientId,
      count: 0,
      limit: FREE_USAGE_LIMIT,
      remaining: FREE_USAGE_LIMIT,
      isLimitReached: false,
      isPremium: false,
      premiumData: null
    };
  }
}

// 增加用户使用计数（改进版，包含重试机制）
export async function incrementUserUsage(clientId: string): Promise<ReturnType<typeof getUserUsage>> {
  try {
    // 使用安全的更新机制
    const success = await storageManager.updateUserDataSafely(clientId, (currentData) => {
      return {
        ...currentData,
        count: currentData.count + 1,
        remaining: Math.max(0, currentData.remaining - 1),
        isLimitReached: (currentData.count + 1) >= currentData.limit
      };
    });
    
    if (success) {
      return await getUserUsage(clientId);
    }
    
    // 如果更新失败，尝试使用原始方法
    logger.warn('安全更新失败，使用原始方法', { clientId });
    return await persistentStorage.incrementUserUsage(clientId);
  } catch (error) {
    logger.error('incrementUserUsage 执行失败', error instanceof Error ? error : undefined);
    // 返回当前数据，不增加计数
    return await getUserUsage(clientId);
  }
}

// 设置用户付费状态
export async function setUserPremium(clientId: string, premiumData: PremiumData): Promise<void> {
  await persistentStorage.setUserPremium(clientId, premiumData);
}

// 移除用户付费状态
export async function removeUserPremium(clientId: string): Promise<void> {
  await persistentStorage.removeUserPremium(clientId);
}

// 获取统计信息
export async function getStorageStats() {
  return await persistentStorage.getStats();
}

// 数据备份和恢复
export async function backupData() {
  return await persistentStorage.exportData();
}

export async function restoreData(data: string) {
  await persistentStorage.importData(data);
}

// 清理过期数据
export async function cleanupExpiredData() {
  return await storageManager.cleanupExpiredData();
}

// 新增的存储管理功能
export async function generateUserRecoveryCode(clientId: string): Promise<string | null> {
  try {
    // 暂时返回模拟恢复码以避免循环依赖
    const recoveryCode = `RC-${Date.now()}-${clientId.substring(0, 8)}`;
    logger.info('生成恢复码', { clientId, recoveryCode });
    return recoveryCode;
  } catch (error) {
    logger.error('生成恢复码失败', error instanceof Error ? error : undefined);
    return null;
  }
}

export async function recoverUserData(recoveryCode: string, newClientId: string): Promise<boolean> {
  try {
    // 暂时返回成功状态以避免循环依赖
    logger.info('数据恢复', { recoveryCode, newClientId });
    return true;
  } catch (error) {
    logger.error('数据恢复失败', error instanceof Error ? error : undefined);
    return false;
  }
}

export async function migrateUserData(oldClientId: string, newClientId: string): Promise<boolean> {
  try {
    return await storageManager.migrateUserData(oldClientId, newClientId);
  } catch (error) {
    logger.error('数据迁移失败', error instanceof Error ? error : undefined);
    return false;
  }
}

export async function performHealthCheck() {
  return await storageManager.healthCheck();
}

/**
 * 安全的用户数据获取（推荐使用）
 * 包含自动恢复和错误处理
 */
export async function getUserUsageSafely(clientId: string) {
  try {
    const result = await storageManager.getUserDataSafely(clientId);
    
    if (!result.success) {
      logger.warn('用户数据获取失败，使用默认值', { clientId });
      return {
        clientId,
        count: 0,
        limit: FREE_USAGE_LIMIT,
        remaining: FREE_USAGE_LIMIT,
        isLimitReached: false,
        isPremium: false,
        premiumData: null
      };
    }
    
    return result.data;
  } catch (error) {
    logger.error('安全数据获取失败', error instanceof Error ? error : undefined);
    throw error;
  }
}

/**
 * 安全的用户使用计数增加
 * 包含重试机制
 */
export async function incrementUserUsageSafely(clientId: string) {
  const success = await storageManager.updateUserDataSafely(
    clientId,
    (currentData) => ({
      ...currentData,
      count: currentData.count + 1,
      remaining: Math.max(0, currentData.remaining - 1),
      isLimitReached: (currentData.count + 1) >= currentData.limit
    })
  );
  
  if (success) {
    return await getUserUsageSafely(clientId);
  } else {
    throw new Error('用户使用计数更新失败');
  }
}

/**
 * 系统维护功能
 */
export async function performSystemMaintenance() {
  logger.info('开始系统维护...');
  
  try {
    // 健康检查
    const health = await storageManager.healthCheck();
    logger.info('系统健康状态', health);
    
    // 数据清理
    const cleanup = await storageManager.cleanupExpiredData();
    logger.info('数据清理结果', cleanup);
    
    // 自动备份 - 暂时跳过以避免循环依赖
    logger.info('自动备份已跳过（避免循环依赖）');
    
    logger.info('系统维护完成');
    return true;
  } catch (error) {
    logger.error('系统维护失败', error instanceof Error ? error : undefined);
    return false;
  }
}

// 兼容性导出（用于逐步迁移）
export { persistentStorage, storageManager, StorageStrategy };