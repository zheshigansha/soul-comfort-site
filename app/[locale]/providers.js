'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { getClientId } from '@/lib/clientId';

// 创建上下文
export const ClientContext = createContext({
  clientId: null,
  paymentToken: null,
  usageInfo: { limit: 10, used: 0, isPremium: false },
  setPaymentToken: () => {},
});

// 提供者组件
export function ClientProvider({ children }) {
  const [clientId, setClientId] = useState(null);
  const [paymentToken, setPaymentToken] = useState(null);
  const [usageInfo, setUsageInfo] = useState({
    limit: 10, // 默认免费额度
    used: 0,   // 默认已使用次数
    isPremium: false // 默认非付费用户
  });
  
  useEffect(() => {
    // 当组件加载时，获取或创建客户端ID
    const id = getClientId();
    setClientId(id);
    
    // 从本地存储加载支付令牌（如果有）
    const storedToken = localStorage.getItem('soul_comfort_payment_token');
    if (storedToken) {
      setPaymentToken(storedToken);
    }
    
    // 从本地存储加载使用信息
    const storedUsage = localStorage.getItem('soul_comfort_usage');
    if (storedUsage) {
      try {
        setUsageInfo(JSON.parse(storedUsage));
      } catch (error) {
        console.error('Failed to parse usage info:', error);
      }
    }
  }, []);
  
  // 更新支付令牌
  const handleSetPaymentToken = (token) => {
    setPaymentToken(token);
    if (token) {
      localStorage.setItem('soul_comfort_payment_token', token);
      // 如果是付费用户，更新使用限额
      const newUsageInfo = {
        ...usageInfo,
        isPremium: true,
        limit: 100 // 假设付费用户的限额是100次
      };
      setUsageInfo(newUsageInfo);
      localStorage.setItem('soul_comfort_usage', JSON.stringify(newUsageInfo));
    }
  };
  
  // 记录API使用
  const recordUsage = () => {
    const newUsageInfo = {
      ...usageInfo,
      used: usageInfo.used + 1
    };
    setUsageInfo(newUsageInfo);
    localStorage.setItem('soul_comfort_usage', JSON.stringify(newUsageInfo));
    return newUsageInfo.used < newUsageInfo.limit; // 返回是否仍有可用额度
  };
  
  return (
    <ClientContext.Provider value={{
      clientId,
      paymentToken,
      usageInfo,
      setPaymentToken: handleSetPaymentToken,
      recordUsage
    }}>
      {children}
    </ClientContext.Provider>
  );
}

// 使用钩子
export function useClient() {
  return useContext(ClientContext);
}