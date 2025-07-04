'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

// 定义套餐的数据结构
interface Package {
  id: string;
  name: string;
  price: number;
  credits: number;
  description: string;
}

// 定义组件的 props 接口
interface UpgradePageClientProps {
  locale: string;
}

export default function UpgradePageClient({ locale }: UpgradePageClientProps) {
  const t = useTranslations('UpgradePage');
  const router = useRouter();
  const supabase = createClientComponentClient();

  const [session, setSession] = useState<any>(null);
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPurchasing, setIsPurchasing] = useState<string | null>(null); // 用于跟踪正在购买的套餐ID

  useEffect(() => {
    // 获取套餐数据
    const fetchPackages = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/packages');
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }
        const data = await response.json();
        setPackages(data.packages || []);
        setError(null);
      } catch (err) {
        console.error('Error fetching packages:', err);
        setError(t('errorLoadPackages'));
      } finally {
        setLoading(false);
      }
    };
    
    // 初始检查会话状态并根据情况获取数据
    const checkSessionAndFetchData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      if (session) {
        await fetchPackages();
      } else {
        setLoading(false);
      }
    };
    
    checkSessionAndFetchData();
    
    // 设置身份验证状态变化监听器
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        fetchPackages();
      } else {
        setPackages([]); // 用户登出后清空套餐
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, [supabase, router, t]);

  // 处理购买逻辑
  const handlePurchase = async (packageId: string) => {
    setIsPurchasing(packageId);
    setError(null);
    try {
      const response = await fetch('/api/payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          packageId: packageId, // 使用驼峰命名
          locale: locale
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || t('errorPaymentInit'));
      }

      const data = await response.json();
      if (data.paymentUrl) {
        // 跳转到支付页面
        window.location.href = data.paymentUrl;
      } else {
        throw new Error(t('errorInvalidUrl'));
      }
    } catch (err: any) {
      console.error('Failed to create payment:', err);
      setError(err.message || t('errorPaymentInit'));
      setIsPurchasing(null);
    }
  };

  // 页面加载状态
  if (loading) {
    return <div className="flex justify-center items-center h-64"><Progress value={50} className="w-1/2" /></div>;
  }

  // 用户未登录状态
  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <p className="text-lg mb-4">{t('loginPrompt')}</p>
        <Button onClick={() => router.push(`/${locale}/login`)}>{t('loginButton')}</Button>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold">{t('title')}</h1>
        <p className="text-muted-foreground mt-2">{t('description')}</p>
      </div>
      
      {/* 错误信息展示 */}
      {error && <div className="text-red-500 text-center mb-4 p-4 bg-red-50 rounded-md">{error}</div>}

      {/* 套餐列表 */}
      {packages.length > 0 ? (
        <div className="grid md:grid-cols-3 gap-8">
          {packages.map((pkg) => (
            <Card key={pkg.id} className="flex flex-col">
              <CardHeader>
                <CardTitle>{t(pkg.id.replace('pkg_', 'name_'))}</CardTitle>
                <CardDescription>{t(pkg.id.replace('pkg_', 'desc_'))}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-3xl font-bold">${pkg.price.toFixed(2)}</p>
                <p className="text-muted-foreground">{t('credits', { count: pkg.credits })}</p>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full" 
                  onClick={() => handlePurchase(pkg.id)}
                  disabled={isPurchasing === pkg.id}
                >
                  {isPurchasing === pkg.id ? t('buttonProcessing') : t('purchaseButton')}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        // 如果没有获取到套餐
        !error && <div className="text-center py-12"><p className="text-lg">{t('noPackages')}</p></div>
      )}
    </div>
  );
}