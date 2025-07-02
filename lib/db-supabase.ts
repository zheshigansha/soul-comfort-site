import { supabase } from './supabase';

const FREE_USAGE_LIMIT = 10;

// 用户相关操作
export async function getOrCreateUser(clientId: string) {
  // 查找用户
  let { data: user, error } = await supabase
    .from('users')
    .select('*, payments(*)')
    .eq('client_id', clientId)
    .single();
  
  // 如果用户不存在，创建用户
  if (error || !user) {
    const { data: newUser, error: createError } = await supabase
      .from('users')
      .insert([{ client_id: clientId }])
      .select('*')
      .single();
    
    if (createError) {
      console.error('创建用户失败:', createError);
      throw createError;
    }
    
    user = newUser;
  }
  
  return user;
}

// 使用记录相关操作
export async function getUserUsage(clientId: string) {
  const user = await getOrCreateUser(clientId);
  
  // 获取今天的使用次数
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const { data: usage, error } = await supabase
    .from('usages')
    .select('count')
    .eq('user_id', user.id)
    .gte('date', today.toISOString())
    .single();
  
  const count = usage?.count || 0;
  const { isPremium, premiumData, limit } = getUserPremiumStatus(user);
  
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

export async function incrementUserUsage(clientId: string) {
  const user = await getOrCreateUser(clientId);
  
  // 获取今天的日期
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // 查找今天的使用记录
  const { data: usage, error } = await supabase
    .from('usages')
    .select('*')
    .eq('user_id', user.id)
    .gte('date', today.toISOString())
    .single();
  
  if (usage) {
    // 更新现有记录
    await supabase
      .from('usages')
      .update({ count: usage.count + 1 })
      .eq('id', usage.id);
  } else {
    // 创建新记录
    await supabase
      .from('usages')
      .insert([{
        user_id: user.id,
        count: 1,
        date: new Date().toISOString()
      }]);
  }
  
  return getUserUsage(clientId);
}

// 获取站点当月使用情况
export async function getSiteUsage() {
  const currentMonth = new Date().toISOString().slice(0, 7); // 格式: "2023-01"
  
  // 获取当月记录
  const { data, error } = await supabase
    .from('site_usage')
    .select('*')
    .eq('month', currentMonth)
    .single();
  
  // 如果不存在当月记录，创建一个
  if (error || !data) {
    const { data: newData, error: createError } = await supabase
      .from('site_usage')
      .insert([{ 
        month: currentMonth,
        total_count: 0,
        max_limit: 10000 // 默认每月10000次
      }])
      .select()
      .single();
      
    if (createError) throw createError;
    return newData;
  }
  
  return data;
}

// 增加网站使用计数
export async function incrementSiteUsage() {
  const currentMonth = new Date().toISOString().slice(0, 7);
  
  const siteUsage = await getSiteUsage();
  
  // 增加计数
  const { data, error } = await supabase
    .from('site_usage')
    .update({ total_count: siteUsage.total_count + 1 })
    .eq('month', currentMonth)
    .select()
    .single();
    
  if (error) throw error;
  return data;
}

// 检查网站是否达到总使用限制
export async function isSiteLimitReached() {
  const siteUsage = await getSiteUsage();
  return siteUsage.total_count >= siteUsage.max_limit;
}

// 支付相关操作
export async function createPaymentRecord(clientId: string, plan: string, premium: any, referralCode?: string) {
  const user = await getOrCreateUser(clientId);
  
  // 检查是否已有支付记录
  const { data: existingPayment } = await supabase
    .from('payments')
    .select('*')
    .eq('user_id', user.id)
    .single();
  
  const paymentData = {
    user_id: user.id,
    plan,
    premium_type: premium.type,
    expires_at: premium.expiresAt,
    unlimited: premium.unlimited || false,
    credits: premium.credits || null,
    referral_code: referralCode || null
  };
  
  if (existingPayment) {
    // 更新现有记录
    const { data, error } = await supabase
      .from('payments')
      .update(paymentData)
      .eq('id', existingPayment.id)
      .select();
      
    if (error) throw error;
    return data;
  } else {
    // 创建新记录
    const { data, error } = await supabase
      .from('payments')
      .insert([paymentData])
      .select();
      
    if (error) throw error;
    return data;
  }
}

// 辅助函数
function getUserPremiumStatus(user: any) {
  // 获取用户的付款记录
  const payment = user.payments?.[0];
  
  if (!payment) {
    return {
      isPremium: false,
      premiumData: null,
      limit: FREE_USAGE_LIMIT
    };
  }
  
  // 检查订阅是否过期
  if (payment.premium_type === 'subscription' && payment.expires_at) {
    const now = new Date();
    const expiresAt = new Date(payment.expires_at);
    
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
  
  if (payment.unlimited) {
    limit = Infinity;
  } else if (payment.credits) {
    limit = payment.credits + FREE_USAGE_LIMIT;
  }
  
  return {
    isPremium: true,
    premiumData: {
      type: payment.premium_type,
      expiresAt: payment.expires_at,
      unlimited: payment.unlimited,
      credits: payment.credits
    },
    limit
  };
}