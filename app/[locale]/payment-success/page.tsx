'use client';

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Container } from "@/components/ui";
import { CheckCircle, ArrowRight } from "lucide-react";
import { useSearchParams } from "next/navigation";

// 模拟的套餐信息, 用于在成功页面显示
const mockPackageDetails: { [key: string]: { name: string, credits: number } } = {
  "pkg_basic": { name: "基础套餐", credits: 100 },
  "pkg_standard": { name: "标准套餐", credits: 250 },
  "pkg_premium": { name: "高级套餐", credits: 1000 },
};

export default function PaymentSuccessPage({ params }: { params: { locale: string } }) {
  const t = useTranslations("Payment");
  const searchParams = useSearchParams();
  
  // 从 URL 获取信息
  const packageId = searchParams.get('package_id');
  const transactionId = searchParams.get('transaction_id');
  
  const [packageName, setPackageName] = useState('');
  const [creditsAdded, setCreditsAdded] = useState(0);

  useEffect(() => {
    // 根据从URL获取的packageId，从模拟数据中查找套餐详情
    if (packageId && mockPackageDetails[packageId]) {
      const details = mockPackageDetails[packageId];
      setPackageName(details.name); 
      setCreditsAdded(details.credits);
    }
    // 这里不再调用那个会引起错误的API
  }, [packageId]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-teal-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Container className="py-20">
        <div className="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
          </div>
          
          <h1 className="text-2xl font-bold mb-4">{t("paymentSuccessTitle")}</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {t("paymentSuccessDescription")}
          </p>
          
          {/* 显示从 URL 解析的模拟交易详情 */}
          {packageId && (
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6 text-left">
              <h2 className="text-lg font-semibold mb-2">{t("transactionDetails")}</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                {t("packageName")}: {packageName}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                {t("creditsAdded")}: {creditsAdded}
              </p>
              {transactionId && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {/* 使用客户端时间模拟交易日期 */}
                  {t("transactionDate")}: {new Date().toLocaleString()}
                </p>
              )}
            </div>
          )}
          
          <Link 
            href={`/${params.locale}/tree-hole`}
            className="inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-lg font-medium transition"
          >
            {t("backToChat")}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
        </div>
      </Container>
    </main>
  );
}