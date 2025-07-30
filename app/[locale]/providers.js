'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { getClientId } from '@/lib/client-id-manager';

// 创建上下文
export const ClientContext = createContext({
  clientId: null,
  paymentToken: null,
  usageInfo: { limit: 10, used: 0, isPremium: false },
  setPaymentToken: () => {},
  recordUsage: () => false,
});

// 提供者组件
export function ClientProvider({ children }) {
  const [mounted, setMounted] = useState(false);
  const [clientId, setClientId] = useState(null);
  const [paymentToken, setPaymentToken] = useState(null);
  const [usageInfo, setUsageInfo] = useState({
    limit: 10, // 默认免费额度
    used: 0,   // 默认已使用次数
    isPremium: false // 默认非付费用户
  });
  
  useEffect(() => {
    // 标记组件已在客户端挂载
    setMounted(true);
    
    // 当组件加载时，获取或创建客户端ID
    const id = getClientId();
    setClientId(id);
    
    // 安全地访问localStorage（仅在客户端）
    if (typeof window !== 'undefined') {
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
    }
  }, []);
  
  // 在服务端渲染时，直接返回children避免hydration错误
  if (!mounted) {
    return (
      <ClientContext.Provider value={{
        clientId: null,
        paymentToken: null,
        usageInfo: { limit: 10, used: 0, isPremium: false },
        setPaymentToken: () => {},
        recordUsage: () => false,
      }}>
        {children}
      </ClientContext.Provider>
    );
  }
  
  // 更新支付令牌 - 添加客户端安全检查
  const handleSetPaymentToken = (token) => {
    if (!mounted) return; // 确保只在客户端执行
    
    setPaymentToken(token);
    if (token && typeof window !== 'undefined') {
      try {
        localStorage.setItem('soul_comfort_payment_token', token);
        // 如果是付费用户，更新使用限额
        const newUsageInfo = {
          ...usageInfo,
          isPremium: true,
          limit: 100 // 假设付费用户的限额是100次
        };
        setUsageInfo(newUsageInfo);
        localStorage.setItem('soul_comfort_usage', JSON.stringify(newUsageInfo));
      } catch (error) {
        console.error('Failed to save payment token:', error);
      }
    }
  };
  
  // 记录API使用 - 添加客户端安全检查
  const recordUsage = () => {
    if (!mounted) return false; // 确保只在客户端执行
    
    const newUsageInfo = {
      ...usageInfo,
      used: usageInfo.used + 1
    };
    setUsageInfo(newUsageInfo);
    
    // 确保在浏览器环境中才访问localStorage
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('soul_comfort_usage', JSON.stringify(newUsageInfo));
      } catch (error) {
        console.error('Failed to save usage info:', error);
      }
    }
    
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