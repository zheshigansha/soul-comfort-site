import { logger } from './logger';
import { PaymentData, StorageStats } from '@/types';
import { supabase } from './supabase';
// 暂时禁用Prisma数据库功能，使用本地存储
// import { getOrCreateUser, getUserUsage as fetchUserUsage, incrementUserUsage as incrementUsage } from './db-supabase';

interface UserUsageResponse {
  clientId: string;
  count: number;
  limit: number;
  remaining: number;
  isLimitReached: boolean;
  isPremium: boolean;
  premiumData: PaymentData | null;
}

interface PremiumStatusResponse {
  isPremium: boolean;
  premiumData: PaymentData | null;
  limit: number;
  expired?: boolean;
}

export class PersistentStorage {
  private static instance: PersistentStorage;
  private initialized = false;
  // 配置为始终使用Supabase

  private constructor() {
    // 验证必要的环境变量
    this.validateEnvironmentVariables();
    
    // 始终使用Supabase，不再支持本地文件系统
  }
  
  private validateEnvironmentVariables(): void {
    const requiredVars = [
      'NEXT_PUBLIC_SUPABASE_URL',
      'SUPABASE_SERVICE_ROLE_KEY'
    ];

    const missing = requiredVars.filter(varName => !process.env[varName]);
    
    if (missing.length > 0) {
      const errorMessage = `缺少必要的 Supabase 环境变量: ${missing.join(', ')}。请确保在 .env 文件中设置这些变量。`;
      
      // 在开发环境中只记录警告，在生产环境中抛出错误
      if (process.env.NODE_ENV === 'production') {
        logger.error(errorMessage);
        throw new Error(errorMessage);
      } else {
        logger.warn(errorMessage);
        logger.warn('在开发环境中继续运行，但某些功能可能无法正常工作。');
      }
    }
  }

  public static getInstance(): PersistentStorage {
    if (!PersistentStorage.instance) {
      PersistentStorage.instance = new PersistentStorage();
    }
    return PersistentStorage.instance;
  }

  // 不再需要本地文件系统相关的方法

  public async init(): Promise<void> {
    if (!this.initialized) {
      this.initialized = true;
    }
  }

  // 用户数据操作
  public async getUserUsage(clientId: string): Promise<UserUsageResponse> {
      try {
      // 使用本地存储实现
      return this.getLocalUserUsage(clientId);
      } catch (error) {
      logger.error('获取用户使用数据失败', error instanceof Error ? error : new Error(String(error)));
      throw new Error('获取用户使用数据失败，请稍后再试');
      }
  }

  public async incrementUserUsage(clientId: string): Promise<UserUsageResponse> {
      try {
      // 使用本地存储实现
      return this.incrementLocalUserUsage(clientId);
      } catch (error) {
      logger.error('增加用户使用计数失败', error instanceof Error ? error : new Error(String(error)));
      throw new Error('增加用户使用计数失败，请稍后再试');
    }
  }

  public async getUserPremiumStatus(clientId: string): Promise<PremiumStatusResponse> {
    try {
    const usage = await this.getUserUsage(clientId);
    return {
      isPremium: usage.isPremium,
      premiumData: usage.premiumData,
      limit: usage.limit,
      expired: usage.premiumData ? false : undefined
    };
    } catch (error) {
      logger.error('获取用户付费状态失败', error instanceof Error ? error : new Error(String(error)));
      throw new Error('获取用户付费状态失败，请稍后再试');
    }
  }

  public async setUserPremium(clientId: string, premiumData: PaymentData): Promise<void> {
      try {
        // 使用本地存储实现
        this.setLocalUserPremium(clientId, premiumData);
        logger.info('用户付费状态已设置', { clientId, premiumData });
      } catch (error) {
      logger.error('设置用户付费状态失败', error instanceof Error ? error : new Error(String(error)));
      throw new Error('设置用户付费状态失败，请稍后再试');
    }
  }

  public async removeUserPremium(clientId: string): Promise<void> {
      try {
        // 使用本地存储实现
        this.removeLocalUserPremium(clientId);
        logger.info('用户付费状态已移除', { clientId });
      } catch (error) {
      logger.error('移除用户付费状态失败', error instanceof Error ? error : new Error(String(error)));
      throw new Error('移除用户付费状态失败，请稍后再试');
    }
  }

  // 客户端ID映射（解决持久性问题）
  public async mapClientToUser(clientId: string, userId: string): Promise<void> {
    try {
      await ((supabase as any)
        .from('users')
        .update({ user_id: userId })
        .eq('client_id', clientId));
    } catch (error) {
      logger.error('映射客户端ID到用户ID失败', error instanceof Error ? error : new Error(String(error)));
      throw new Error('映射客户端ID到用户ID失败，请稍后再试');
    }
  }

  public async getUserIdByClientId(clientId: string): Promise<string | null> {
    try {
      const { data } = await ((supabase as any)
        .from('users')
        .select('user_id')
        .eq('client_id', clientId)
        .single());
        
      return data?.user_id || null;
    } catch (error) {
      logger.error('通过客户端ID获取用户ID失败', error instanceof Error ? error : new Error(String(error)));
      return null;
    }
  }

  // 备份和恢复
  public async exportData(): Promise<string> {
    try {
      const { data: users } = await (supabase as any).from('users').select('*');
      const { data: usages } = await (supabase as any).from('usages').select('*');
      const { data: payments } = await (supabase as any).from('payments').select('*');
      
      return JSON.stringify({
        users,
        usages,
        payments,
        metadata: {
          exportedAt: new Date().toISOString(),
          version: '1.0.0'
        }
      }, null, 2);
    } catch (error) {
      logger.error('导出数据失败', error instanceof Error ? error : new Error(String(error)));
      throw new Error('导出数据失败，请稍后再试');
    }
  }

  public async importData(dataStr: string): Promise<void> {
    try {
      const data = JSON.parse(dataStr);
      
      // 清空现有数据
      await (supabase as any).from('payments').delete().neq('id', 0);
      await (supabase as any).from('usages').delete().neq('id', 0);
      await (supabase as any).from('users').delete().neq('id', 0);
      
      // 导入新数据
      if (data.users?.length) await supabase.from('users').insert(data.users);
      if (data.usages?.length) await supabase.from('usages').insert(data.usages);
      if (data.payments?.length) await supabase.from('payments').insert(data.payments);
      
      logger.info('数据导入成功');
    } catch (error) {
      logger.error('导入数据失败', error instanceof Error ? error : new Error(String(error)));
      throw new Error('导入数据失败，请检查数据格式');
    }
  }

  // 数据清理
  public async cleanExpiredData(): Promise<void> {
    try {
      const now = new Date().toISOString();
    
      // 删除过期的付费记录
      await ((supabase as any)
        .from('payments')
        .delete()
        .lt('expires_at', now));
        
      logger.info('过期数据清理完成');
    } catch (error) {
      logger.error('清理过期数据失败', error instanceof Error ? error : new Error(String(error)));
      throw new Error('清理过期数据失败，请稍后再试');
    }
  }

  // 获取统计数据
  public async getStats(): Promise<StorageStats> {
    try {
      // 获取用户数量
      const { count: userCount } = await ((supabase as any)
        .from('users')
        .select('*', { count: 'exact', head: true }));
        
      // 获取今日使用量
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const { data: todayUsages } = await (supabase
        .from('usages')
        .select('count')
        .gte('date', today.toISOString()) as any);
        
      // 计算今日总使用量
      const todayTotal = todayUsages?.reduce((sum: number, item: any) => sum + (item.count || 0), 0) || 0;
      
      // 获取付费用户数量
      const { count: premiumCount } = await supabase
        .from('payments')
        .select('*', { count: 'exact', head: true })
        .gt('expires_at', new Date().toISOString()) as any;
    
    return {
        totalUsers: userCount || 0,
        totalUsage: todayTotal,
        totalPremiumUsers: premiumCount || 0,
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      logger.error('获取统计信息失败', error instanceof Error ? error : new Error(String(error)));
      return {
        totalUsers: 0,
        totalUsage: 0,
        totalPremiumUsers: 0,
        lastUpdated: new Date().toISOString()
    };
    }
  }
  
  /**
   * 迁移功能已不再需要，因为我们现在直接使用 Supabase
   * 保留此方法是为了兼容性，但它现在只返回一个空结果
   */
  public async migrateToSupabase(): Promise<{
    usersCreated: number;
    usageRecordsMigrated: number;
    paymentsMigrated: number;
  }> {
    logger.info('不再需要迁移，系统已直接使用 Supabase');
      return {
      usersCreated: 0,
      usageRecordsMigrated: 0,
      paymentsMigrated: 0
      };
  }

  // 本地存储实现方法
  private getLocalUserUsage(clientId: string): UserUsageResponse {
    const defaultUsage = {
      clientId,
      count: 0,
      limit: 10,
      remaining: 10,
      isPremium: false,
      isLimitReached: false,
      premiumData: null
    };

    if (typeof localStorage === 'undefined') {
      return defaultUsage;
    }

    try {
      const data = localStorage.getItem(`user_usage_${clientId}`);
      if (data) {
        const parsed = JSON.parse(data);
        return {
          ...defaultUsage,
          ...parsed,
          remaining: Math.max(0, parsed.limit - parsed.count),
          isLimitReached: parsed.count >= parsed.limit
        };
      }
    } catch (error) {
      logger.error('读取本地用户数据失败', error instanceof Error ? error : undefined);
    }

    return defaultUsage;
  }

  private incrementLocalUserUsage(clientId: string): UserUsageResponse {
    const currentUsage = this.getLocalUserUsage(clientId);
    const newUsage = {
      ...currentUsage,
      count: currentUsage.count + 1
    };

    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem(`user_usage_${clientId}`, JSON.stringify(newUsage));
      } catch (error) {
        logger.error('保存本地用户数据失败', error instanceof Error ? error : undefined);
      }
    }

    return {
      ...newUsage,
      remaining: Math.max(0, newUsage.limit - newUsage.count),
      isLimitReached: newUsage.count >= newUsage.limit
    };
  }

  private setLocalUserPremium(clientId: string, premiumData: PaymentData): void {
    const currentUsage = this.getLocalUserUsage(clientId);
    const newUsage = {
      ...currentUsage,
      isPremium: true,
      premiumData,
      limit: premiumData.type === 'subscription' ? 1000 : (currentUsage.limit + (premiumData.credits || 0))
    };

    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem(`user_usage_${clientId}`, JSON.stringify(newUsage));
      } catch (error) {
        logger.error('保存本地付费数据失败', error instanceof Error ? error : undefined);
      }
    }
  }

  private removeLocalUserPremium(clientId: string): void {
    const currentUsage = this.getLocalUserUsage(clientId);
    const newUsage = {
      ...currentUsage,
      isPremium: false,
      premiumData: null,
      limit: 10 // 重置为默认限制
    };

    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem(`user_usage_${clientId}`, JSON.stringify(newUsage));
      } catch (error) {
        logger.error('移除本地付费数据失败', error instanceof Error ? error : undefined);
      }
    }
  }
}

// 单例导出
export const persistentStorage = PersistentStorage.getInstance();