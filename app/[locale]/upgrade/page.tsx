'use client';

import { useTranslations } from "next-intl";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Navbar } from "@/components/ui/Navbar";
import { getClientId } from "@/lib/clientId";
import { CreditCard, CheckCircle, Calendar, ArrowLeft, Loader2 } from "lucide-react";

// 定义类型
type PlanType = 'monthly' | 'credits100' | 'credits500' | 'credits1000';

interface UsageData {
  count: number;
  limit: number;
  isLimitReached: boolean;
}

export default function UpgradePage({ params }: { params: { locale: string } }) {
  const t = useTranslations("Upgrade");
  
  const [usageData, setUsageData] = useState<UsageData>({
    count: 0,
    limit: 10,
    isLimitReached: false
  });
  
  // 支付状态
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PlanType | null>(null);
  const [referralCode, setReferralCode] = useState('');
  
  const handlePayment = async (plan: PlanType) => {
    const clientId = getClientId();
    if (!clientId) return;
    
    setIsProcessingPayment(true);
    
    try {
      const response = await fetch('/api/payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          clientId, 
          plan,
          referralCode: referralCode || undefined 
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        
        // 存储付费状态到localStorage
        localStorage.setItem('premium_status', JSON.stringify({
          isPremium: true,
          premiumData: data.premium
        }));
        
        alert(t("paymentSuccess"));
        
        // 重定向回聊天页面
        window.location.href = `/${params.locale}/tree-hole`;
      } else {
        alert(t("paymentFailed"));
      }
    } catch (error) {
      console.error('支付处理错误:', error);
      alert(t("paymentError"));
    } finally {
      setIsProcessingPayment(false);
    }
  };
  
  const applyReferralCode = () => {
    if (!referralCode.trim()) {
      alert('请输入推荐码');
      return;
    }
    
    // 这里可以添加验证推荐码的逻辑
    alert('推荐码已应用！');
  };
  
  useEffect(() => {
    const fetchUsageData = async () => {
      const clientId = getClientId();
      if (!clientId) return;
      
      try {
        const response = await fetch(`/api/usage?clientId=${clientId}`);
        if (response.ok) {
          const data = await response.json();
          setUsageData({
            count: data.count || 0,
            limit: data.limit || 10,
            isLimitReached: data.count >= data.limit
          });
        }
      } catch (error) {
        console.error("获取使用数据失败:", error);
      }
    };
    
    fetchUsageData();
  }, []);

  return (
    <>
      <Navbar locale={params.locale} />
      <main className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-teal-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <Container className="py-20">
          <Link 
            href={`/${params.locale}/tree-hole`} 
            className="flex items-center text-sm text-blue-600 hover:text-blue-800 mb-8"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            {t("returnToChat")}
          </Link>
          
          <h1 className="text-4xl font-bold mb-2">{t("title")}</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">{t("subtitle")}</p>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-8">
            <p className="text-gray-700 dark:text-gray-300">
              {t("usageCount", { count: usageData.count, limit: usageData.limit })}
            </p>
            <div className="w-full bg-gray-200 rounded-full h-2.5 my-4">
              <div 
                className="bg-blue-600 h-2.5 rounded-full" 
                style={{ width: `${Math.min(usageData.count / usageData.limit * 100, 100)}%` }}
              ></div>
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            {/* 月度订阅选项 */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border-2 border-transparent hover:border-blue-500 transition">
              <div className="flex items-center mb-4">
                <Calendar className="w-6 h-6 text-blue-500 mr-2" />
                <h2 className="text-xl font-bold">{t("monthlySubscription")}</h2>
              </div>
              <p className="text-2xl font-bold text-blue-600 mb-4">{t("perMonth")}</p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span>{t("unlimitedConversations")}</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span>{t("prioritySupport")}</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span>{t("allModes")}</span>
                </li>
              </ul>
              <button 
                onClick={() => handlePayment('monthly')}
                disabled={isProcessingPayment}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessingPayment ? (
                  <span className="flex items-center justify-center">
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    {t("processing")}
                  </span>
                ) : t("subscribeNow")}
              </button>
            </div>
            
            {/* 积分套餐选项 */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <div className="flex items-center mb-4">
                <CreditCard className="w-6 h-6 text-purple-500 mr-2" />
                <h2 className="text-xl font-bold">{t("payAsYouGo")}</h2>
              </div>
              
              <div className="space-y-4 mb-6">
                <div 
                  className={`flex items-center justify-between border ${
                    selectedPlan === 'credits100' 
                      ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20' 
                      : 'border-gray-200 dark:border-gray-700'
                  } p-3 rounded-lg cursor-pointer hover:border-purple-500`}
                  onClick={() => setSelectedPlan('credits100')}
                >
                  <div>
                    <span className="font-medium">{t("credits100")}</span>
                  </div>
                  <span className="font-bold">$4.99</span>
                </div>
                
                <div 
                  className={`flex items-center justify-between border ${
                    selectedPlan === 'credits500' 
                      ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20' 
                      : 'border-gray-200 dark:border-gray-700'
                  } p-3 rounded-lg cursor-pointer hover:border-purple-500`}
                  onClick={() => setSelectedPlan('credits500')}
                >
                  <div>
                    <span className="font-medium">{t("credits500")}</span>
                    <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                      {t("bestValue")}
                    </span>
                  </div>
                  <span className="font-bold">$19.99</span>
                </div>
                
                <div 
                  className={`flex items-center justify-between border ${
                    selectedPlan === 'credits1000' 
                      ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20' 
                      : 'border-gray-200 dark:border-gray-700'
                  } p-3 rounded-lg cursor-pointer hover:border-purple-500`}
                  onClick={() => setSelectedPlan('credits1000')}
                >
                  <div>
                    <span className="font-medium">{t("credits1000")}</span>
                  </div>
                  <span className="font-bold">$34.99</span>
                </div>
              </div>
              
              <ul className="space-y-2 mb-6">
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span>{t("noCommitment")}</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span>{t("neverExpire")}</span>
                </li>
              </ul>
              
              <button 
                onClick={() => selectedPlan ? handlePayment(selectedPlan) : null}
                disabled={!selectedPlan || isProcessingPayment}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessingPayment ? (
                  <span className="flex items-center justify-center">
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    {t("processing")}
                  </span>
                ) : t("buyCredits")}
              </button>
            </div>
          </div>
          
          {/* 推荐码部分 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
            <h3 className="text-lg font-medium mb-4">
              {t("referralCode")}
            </h3>
            <div className="flex">
              <input
                type="text"
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value)}
                placeholder={t("enterCode")}
                className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button 
                onClick={applyReferralCode}
                className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white py-2 px-4 rounded-r-lg font-medium transition"
              >
                {t("apply")}
              </button>
            </div>
          </div>
          
          <div className="text-center text-sm text-gray-500 dark:text-gray-400">
            <p>{t("securePayment")}</p>
          </div>
        </Container>
      </main>
    </>
  );
}