'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Container } from '@/components/ui';
import { UpgradePrompt } from './UpgradePrompt';

export function UpgradePageClient() {
  const t = useTranslations('UpgradePage');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 处理套餐选择
  const handleSelectPackage = async (packageId: string) => {
    setIsProcessing(true);
    setError(null);
    
    try {
      // 在实际项目中，这里应该调用API创建支付会话
      // 现在我们只是模拟一个支付流程
      console.log(`Selected package: ${packageId}`);
      
      // 模拟API调用延迟
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // 模拟支付成功
      alert(`模拟支付处理: ${packageId}`);
      
    } catch (err) {
      console.error('Payment initialization error:', err);
      setError(t('errorPaymentInit'));
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Container>
      <div className="py-12">
        <h1 className="text-3xl font-bold mb-2">{t('title')}</h1>
        <p className="text-muted-foreground mb-8">{t('description')}</p>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}
        
        <UpgradePrompt 
          onSelectPackage={handleSelectPackage}
          isProcessing={isProcessing}
        />
      </div>
    </Container>
  );
} 