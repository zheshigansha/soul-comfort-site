'use client';

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Navbar } from "@/components/ui/Navbar";
import { CheckCircle, ArrowRight } from "lucide-react";
import { useSearchParams } from "next/navigation";

export default function PaymentSuccessPage({ params }: { params: { locale: string } }) {
  const t = useTranslations("Payment");
  const searchParams = useSearchParams();
  const transactionId = searchParams.get('transaction_id');
  const [transactionDetails, setTransactionDetails] = useState<any>(null);
  
  useEffect(() => {
    // 可以选择性地加载交易详情
    const fetchTransactionDetails = async () => {
      if (!transactionId) return;
      
      try {
        const response = await fetch(`/api/credits/transaction?id=${transactionId}`);
        if (response.ok) {
          const data = await response.json();
          setTransactionDetails(data.transaction);
        }
      } catch (error) {
        console.error("获取交易详情失败:", error);
      }
    };
    
    fetchTransactionDetails();
  }, [transactionId]);

  return (
    <>
      <Navbar locale={params.locale} />
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
            
            {transactionDetails && (
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6 text-left">
                <h2 className="text-lg font-semibold mb-2">{t("transactionDetails")}</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  {t("packageName")}: {transactionDetails.package?.name}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  {t("creditsAdded")}: {transactionDetails.amount}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t("transactionDate")}: {new Date(transactionDetails.created_at).toLocaleString()}
                </p>
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
    </>
  );
}