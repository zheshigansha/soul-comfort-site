// 创建内存存储
export const usageCounters: Map<string, number> = new Map();
export const paymentRecords: Map<string, any> = new Map();

// 免费用户默认限制
export const FREE_USAGE_LIMIT = 10;

// 添加premium数据类型定义
interface PremiumData {
  type: 'subscription' | 'credits';
  expiresAt?: string;
  unlimited?: boolean;
  credits?: number;
}

// 获取用户付费状态和限制
export function getUserPremiumStatus(clientId: string): {
  isPremium: boolean;
  premiumData: PremiumData | null;
  limit: number;
  expired?: boolean;
} {
  const paymentRecord = paymentRecords.get(clientId);
  
  if (!paymentRecord) {
    return {
      isPremium: false,
      premiumData: null,
      limit: FREE_USAGE_LIMIT
    };
  }
  
  // 检查是否为订阅类型且已过期
  if (paymentRecord.premium.type === 'subscription' && paymentRecord.premium.expiresAt) {
    const now = new Date();
    const expiresAt = new Date(paymentRecord.premium.expiresAt);
    
    if (now > expiresAt) {
      return {
        isPremium: false,
        expired: true,
        premiumData: null,
        limit: FREE_USAGE_LIMIT
      };
    }
  }
  
  // 确定用户限制
  let limit = FREE_USAGE_LIMIT;
  
  if (paymentRecord.premium.unlimited) {
    limit = Infinity;
  } else if (paymentRecord.premium.credits) {
    limit = paymentRecord.premium.credits + FREE_USAGE_LIMIT;
  }
  
  return {
    isPremium: true,
    premiumData: paymentRecord.premium,
    limit
  };
}

// 获取用户使用情况
export function getUserUsage(clientId: string): {
  clientId: string;
  count: number;
  limit: number;
  remaining: number;
  isLimitReached: boolean;
  isPremium: boolean;
  premiumData: PremiumData | null;
} {
  const count = usageCounters.get(clientId) || 0;
  const { isPremium, premiumData, limit } = getUserPremiumStatus(clientId);
  
  return {
    clientId,
    count,
    limit,
    remaining: Math.max(0, limit - count),
    isLimitReached: count >= limit,
    isPremium,
    premiumData
  };
}

// 增加用户使用计数
export function incrementUserUsage(clientId: string):ReturnType<typeof getUserUsage> {
  const currentCount = usageCounters.get(clientId) || 0;
  const newCount = currentCount + 1;
  usageCounters.set(clientId, newCount);
  
  return getUserUsage(clientId);
}