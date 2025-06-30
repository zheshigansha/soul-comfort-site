"use client";

import { useState } from 'react';
import { useClient } from '@/app/[locale]/providers';

export default function UpgradePrompt({ onClose }) {
  const { clientId } = useClient();
  const [selectedTab, setSelectedTab] = useState('subscription');
  const [isLoading, setIsLoading] = useState(false);
  
  // 获取当前语言
  const locale = typeof window !== 'undefined' ? 
    window.location.pathname.split('/')[1] || 'zh' : 'zh';
  
  // 在实际项目中，此函数会调用支付API
  // 现在我们只是模拟一个支付流程
  const handlePayment = async (productType, productId) => {
    setIsLoading(true);
    
    try {
      // 这里应该是真实的支付处理
      // 现在我们只是演示，直接模拟支付成功
      alert(`模拟支付处理: ${productType} - ${productId}`);
      
      // 假设支付成功，生成一个模拟的支付令牌
      const mockPaymentToken = `PAID_${clientId}_${Date.now()}`;
      
      // 存储支付令牌（在实际项目中，这应该由服务器验证后设置）
      localStorage.setItem('soul_comfort_payment_token', mockPaymentToken);
      
      // 更新用户状态
      // 在实际项目中，这应该基于服务器响应
      const newUsageInfo = {
        limit: productType === 'subscription' ? 1000 : 100,
        used: 0,
        isPremium: productType === 'subscription'
      };
      localStorage.setItem('soul_comfort_usage', JSON.stringify(newUsageInfo));
      
      // 刷新页面以应用新状态
      window.location.reload();
    } catch (error) {
      console.error('Payment error:', error);
      alert(locale === 'en' ? 'Payment failed' : '支付失败');
    } finally {
      setIsLoading(false);
      onClose();
    }
  };
  
  const title = locale === 'en' ? 'Upgrade Your Plan' : '升级您的方案';
  const subscriptionTab = locale === 'en' ? 'Subscription' : '会员订阅';
  const creditsTab = locale === 'en' ? 'Credits' : '购买积分';
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">{title}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* 标签切换 */}
        <div className="flex border-b mb-4">
          <button 
            className={`py-2 px-4 ${selectedTab === 'subscription' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-500'}`}
            onClick={() => setSelectedTab('subscription')}
          >
            {subscriptionTab}
          </button>
          <button 
            className={`py-2 px-4 ${selectedTab === 'credits' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-500'}`}
            onClick={() => setSelectedTab('credits')}
          >
            {creditsTab}
          </button>
        </div>
        
        {/* 订阅选项 */}
        {selectedTab === 'subscription' && (
          <div className="space-y-4">
            <div 
              className="border rounded-lg p-4 hover:shadow-md cursor-pointer" 
              onClick={() => !isLoading && handlePayment('subscription', 'monthly')}
            >
              <div className="flex justify-between">
                <h4 className="font-medium">{locale === 'en' ? 'Monthly Plan' : '月度会员'}</h4>
                <span className="font-bold">¥29.99</span>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                {locale === 'en' ? 'Unlimited AI conversations for 30 days' : '每日无限AI对话，为期30天'}
              </p>
            </div>
            
            <div 
              className="border rounded-lg p-4 hover:shadow-md cursor-pointer" 
              onClick={() => !isLoading && handlePayment('subscription', 'quarterly')}
            >
              <div className="flex justify-between">
                <h4 className="font-medium">{locale === 'en' ? 'Quarterly Plan' : '季度会员'}</h4>
                <span className="font-bold">¥79.99</span>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                {locale === 'en' ? 'Unlimited AI conversations for 90 days' : '每日无限AI对话，为期90天'}
              </p>
            </div>
            
            <div 
              className="border rounded-lg p-4 hover:shadow-md cursor-pointer bg-gray-50" 
              onClick={() => !isLoading && handlePayment('subscription', 'yearly')}
            >
              <div className="flex justify-between">
                <h4 className="font-medium">{locale === 'en' ? 'Annual Plan' : '年度会员'}</h4>
                <span className="font-bold">¥299.99</span>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                {locale === 'en' ? 'Unlimited AI conversations for 365 days' : '每日无限AI对话，为期365天'}
              </p>
              <div className="mt-2 text-xs inline-block bg-green-100 text-green-800 px-2 py-1 rounded">
                {locale === 'en' ? 'Best value' : '最具性价比'}
              </div>
            </div>
          </div>
        )}
        
        {/* 积分选项 */}
        {selectedTab === 'credits' && (
          <div className="space-y-4">
            <div 
              className="border rounded-lg p-4 hover:shadow-md cursor-pointer" 
              onClick={() => !isLoading && handlePayment('credits', 'small')}
            >
              <div className="flex justify-between">
                <h4 className="font-medium">{locale === 'en' ? '50 Conversations' : '50次对话'}</h4>
                <span className="font-bold">¥19.99</span>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                {locale === 'en' ? '50 AI conversations, never expires' : '50次AI对话，不限时间使用'}
              </p>
            </div>
            
            <div 
              className="border rounded-lg p-4 hover:shadow-md cursor-pointer bg-gray-50" 
              onClick={() => !isLoading && handlePayment('credits', 'medium')}
            >
              <div className="flex justify-between">
                <h4 className="font-medium">{locale === 'en' ? '120 Conversations' : '120次对话'}</h4>
                <span className="font-bold">¥39.99</span>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                {locale === 'en' ? '120 AI conversations, never expires' : '120次AI对话，不限时间使用'}
              </p>
              <div className="mt-2 text-xs inline-block bg-green-100 text-green-800 px-2 py-1 rounded">
                {locale === 'en' ? 'Popular choice' : '热门选择'}
              </div>
            </div>
            
            <div 
              className="border rounded-lg p-4 hover:shadow-md cursor-pointer" 
              onClick={() => !isLoading && handlePayment('credits', 'large')}
            >
              <div className="flex justify-between">
                <h4 className="font-medium">{locale === 'en' ? '300 Conversations' : '300次对话'}</h4>
                <span className="font-bold">¥79.99</span>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                {locale === 'en' ? '300 AI conversations, never expires' : '300次AI对话，不限时间使用'}
              </p>
            </div>
          </div>
        )}
        
        {isLoading && (
          <div className="mt-4 flex justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-indigo-600"></div>
          </div>
        )}
        
        <div className="mt-6 text-sm text-center text-gray-500">
          {locale === 'en' ? 'Secure payment provided by Creem' : '支付安全由Creem保障'}
        </div>
      </div>
    </div>
  );
}