'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button, Card } from '@/components/ui';
import { CheckCircle } from 'lucide-react';

interface Package {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  credits?: number;
  duration?: number;
  popular?: boolean;
  bestValue?: boolean;
}

interface UpgradePromptProps {
  onSelectPackage: (packageId: string) => void;
  isProcessing: boolean;
}

export function UpgradePrompt({ onSelectPackage, isProcessing }: UpgradePromptProps) {
  const t = useTranslations('UpgradePrompt');
  const [activeTab, setActiveTab] = useState('subscription');

  // 订阅套餐
  const subscriptionPackages: Package[] = [
    {
      id: 'monthly',
      name: t('monthlyPlan'),
      description: t('monthlyDescription'),
      price: 29.99,
      currency: 'USD',
      duration: 30
    },
    {
      id: 'quarterly',
      name: t('quarterlyPlan'),
      description: t('quarterlyDescription'),
      price: 69.99,
      currency: 'USD',
      duration: 90,
      popular: true
    },
    {
      id: 'annual',
      name: t('annualPlan'),
      description: t('annualDescription'),
      price: 199.99,
      currency: 'USD',
      duration: 365,
      bestValue: true
    }
  ];

  // 积分套餐
  const creditPackages: Package[] = [
    {
      id: 'credits-50',
      name: t('conversations50'),
      description: t('conversations50Desc'),
      price: 9.99,
      currency: 'USD',
      credits: 50
    },
    {
      id: 'credits-120',
      name: t('conversations120'),
      description: t('conversations120Desc'),
      price: 19.99,
      currency: 'USD',
      credits: 120,
      popular: true
    },
    {
      id: 'credits-300',
      name: t('conversations300'),
      description: t('conversations300Desc'),
      price: 39.99,
      currency: 'USD',
      credits: 300,
      bestValue: true
    }
  ];

  // 渲染套餐卡片
  const renderPackageCard = (pkg: Package) => (
    <Card key={pkg.id} className="relative overflow-hidden border-2 hover:border-purple-400 transition-all duration-300">
      {/* 热门或最佳价值标签 */}
      {pkg.popular && (
        <div className="absolute top-0 right-0 bg-blue-500 text-white px-3 py-1 text-xs font-medium">
          {t('popularChoice')}
        </div>
      )}
      {pkg.bestValue && (
        <div className="absolute top-0 right-0 bg-green-500 text-white px-3 py-1 text-xs font-medium">
          {t('bestValue')}
        </div>
      )}
      
      <div className="p-6">
        <h3 className="text-xl font-bold mb-2">{pkg.name}</h3>
        <p className="text-gray-500 dark:text-gray-400 mb-4 text-sm">{pkg.description}</p>
        
        <div className="flex items-baseline mb-4">
          <span className="text-3xl font-bold">${pkg.price}</span>
          <span className="text-gray-500 ml-1">USD</span>
        </div>
        
        <Button 
          className="w-full" 
          onClick={() => onSelectPackage(pkg.id)}
          disabled={isProcessing}
        >
          {isProcessing ? t('buttonProcessing') : t('purchaseButton')}
        </Button>
      </div>
    </Card>
  );

  return (
    <div className="w-full max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-center mb-6">{t('title')}</h2>
      
      <div className="mb-8 grid grid-cols-2 gap-2">
        <button 
          className={`py-2 px-4 text-center rounded-md ${activeTab === 'subscription' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'}`}
          onClick={() => setActiveTab('subscription')}
        >
          {t('subscriptionTab')}
        </button>
        <button 
          className={`py-2 px-4 text-center rounded-md ${activeTab === 'credits' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'}`}
          onClick={() => setActiveTab('credits')}
        >
          {t('creditsTab')}
        </button>
      </div>
      
      {activeTab === 'subscription' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {subscriptionPackages.map(renderPackageCard)}
        </div>
      )}
      
      {activeTab === 'credits' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {creditPackages.map(renderPackageCard)}
        </div>
      )}
      
      <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400 flex items-center justify-center">
        <CheckCircle className="w-4 h-4 mr-2" />
        {t('securePayment')}
      </div>
    </div>
  );
} 