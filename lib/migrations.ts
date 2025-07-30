/**
 * 数据迁移工具
 * 从旧的内存存储迁移到新的持久化存储
 */

import { persistentStorage } from './persistence';
import { clientStorage } from './client-storage';
import { logger } from './logger';
import { PaymentData, StorageStats } from '@/types';

// 旧的内存数据（如果有的话）
// 注意：这些只在运行时存在，重启后会丢失
interface LegacyMemoryData {
  usageCounters: Map<string, number>;
  paymentRecords: Map<string, PaymentData>;
}

let legacyMemoryData: LegacyMemoryData = {
  usageCounters: new Map<string, number>(),
  paymentRecords: new Map<string, PaymentData>()
};

/**
 * 迁移单个用户的数据
 */
export async function migrateUserData(
  clientId: string,
  usageCount: number,
  paymentData?: PaymentData
): Promise<void> {
  try {
    // 迁移使用计数
    if (usageCount > 0) {
      for (let i = 0; i < usageCount; i++) {
        await persistentStorage.incrementUserUsage(clientId);
      }
    }

    // 迁移付费数据
    if (paymentData) {
      await persistentStorage.setUserPremium(clientId, paymentData);
    }

    logger.info(`✅ 用户 ${clientId} 的数据迁移完成`);
  } catch (error) {
    logger.error(`❌ 用户 ${clientId} 的数据迁移失败`, error instanceof Error ? error : new Error(String(error)));
  }
}

/**
 * 批量迁移内存中的数据
 */
export async function migrateMemoryData(): Promise<{
  migratedUsers: number;
  migratedUsage: number;
  migratedPremium: number;
}> {
  let migratedUsers = 0;
  let migratedUsage = 0;
  let migratedPremium = 0;

  try {
    // 迁移使用计数
    for (const [clientId, count] of Array.from(legacyMemoryData.usageCounters.entries())) {
      if (count > 0) {
        await migrateUserData(clientId, count);
        migratedUsers++;
        migratedUsage += count;
      }
    }

    // 迁移付费记录
    for (const [clientId, paymentData] of Array.from(legacyMemoryData.paymentRecords.entries())) {
      await migrateUserData(clientId, 0, paymentData);
      migratedPremium++;
    }

    // 清空内存数据
    legacyMemoryData.usageCounters.clear();
    legacyMemoryData.paymentRecords.clear();

    logger.info(`🚀 数据迁移完成: ${migratedUsers} 用户, ${migratedUsage} 次使用, ${migratedPremium} 付费记录`);
    
    return {
      migratedUsers,
      migratedUsage,
      migratedPremium
    };
  } catch (error) {
    logger.error('❌ 数据迁移失败', error instanceof Error ? error : new Error(String(error)));
    throw error;
  }
}

/**
 * 创建数据备份
 */
export async function createBackup(): Promise<{
  timestamp: string;
  storageData: string;
  clientData: string | null;
  stats: any;
}> {
  try {
    const storageData = await persistentStorage.exportData();
    const stats = await persistentStorage.getStats();
    
    let clientData = null;
    if (typeof window !== 'undefined') {
      clientData = await clientStorage.backup();
    }

    const backup = {
      timestamp: new Date().toISOString(),
      storageData,
      clientData,
      stats
    };

    logger.info('💾 数据备份创建完成');
    return backup;
  } catch (error) {
    logger.error('❌ 数据备份失败', error instanceof Error ? error : new Error(String(error)));
    throw error;
  }
}

/**
 * 从备份恢复数据
 */
export async function restoreFromBackup(backup: {
  timestamp: string;
  storageData: string;
  clientData: string | null;
}): Promise<void> {
  try {
    await persistentStorage.importData(backup.storageData);
    
    if (backup.clientData && typeof window !== 'undefined') {
      await clientStorage.restore(backup.clientData);
    }

    logger.info('🔄 数据恢复完成');
  } catch (error) {
    logger.error('❌ 数据恢复失败', error instanceof Error ? error : new Error(String(error)));
    throw error;
  }
}

/**
 * 验证迁移后的数据完整性
 */
export async function validateMigration(): Promise<{
  isValid: boolean;
  errors: string[];
  stats: any;
}> {
  const errors: string[] = [];
  
  try {
    const stats = await persistentStorage.getStats();
    
    // 检查数据结构完整性
    if (stats.totalUsers < 0) {
      errors.push('用户数量异常');
    }
    
    if (stats.totalUsage < 0) {
      errors.push('使用次数异常');
    }
    
    logger.info('✅ 数据验证完成');
    
    return {
      isValid: errors.length === 0,
      errors,
      stats
    };
  } catch (error) {
    errors.push(`验证失败: ${error instanceof Error ? error.message : String(error)}`);
    return {
      isValid: false,
      errors,
      stats: null
    };
  }
}

/**
 * 自动清理过期数据
 */
export async function autoCleanup(): Promise<{
  cleanedUsers: number;
  cleanedRecords: number;
}> {
  try {
    const beforeStats = await persistentStorage.getStats();
    
    await persistentStorage.cleanExpiredData();
    
    const afterStats = await persistentStorage.getStats();
    
    const cleanedUsers = beforeStats.totalUsers - afterStats.totalUsers;
    const cleanedRecords = beforeStats.totalPremiumUsers - afterStats.totalPremiumUsers;
    
    logger.info(`🧹 自动清理完成: ${cleanedUsers} 过期用户, ${cleanedRecords} 过期记录`);
    
    return {
      cleanedUsers,
      cleanedRecords
    };
  } catch (error) {
    logger.error('❌ 自动清理失败', error instanceof Error ? error : new Error(String(error)));
    throw error;
  }
}

/**
 * 初始化存储系统
 */
export async function initializeStorage(): Promise<void> {
  try {
    // 初始化持久化存储
    await persistentStorage.init();
    
    // 清理过期数据
    await autoCleanup();
    
    // 验证数据完整性
    const validation = await validateMigration();
    if (!validation.isValid) {
      logger.warn('⚠️ 数据验证警告', { errors: validation.errors });
    }
    
    logger.info('🎉 存储系统初始化完成');
  } catch (error) {
    logger.error('❌ 存储系统初始化失败', error instanceof Error ? error : new Error(String(error)));
    throw error;
  }
}

// 导出用于调试的工具
export const debugTools = {
  getLegacyData: (): LegacyMemoryData => legacyMemoryData,
  setLegacyData: (data: Partial<LegacyMemoryData>) => { 
    legacyMemoryData = { ...legacyMemoryData, ...data };
  }
};