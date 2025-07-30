'use client';

import { useTranslations } from "next-intl";
import Link from "next/link";
import { Container } from "@/components/ui";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { useSearchParams } from "next/navigation";

export default function PaymentErrorPage({ params }: { params: { locale: string } }) {
  const t = useTranslations("Payment");
  const searchParams = useSearchParams();
  const errorCode = searchParams.get('error') || 'unknown_error';
  
  // 根据错误代码获取错误消息
  const getErrorMessage = (code: string) => {
    switch (code) {
      case 'missing_params':
        return t("errorMissingParams");
      case 'transaction_not_found':
        return t("errorTransactionNotFound");
      case 'payment_incomplete':
        return t("errorPaymentIncomplete");
      case 'verification_failed':
        return t("errorVerificationFailed");
      case 'server_error':
      default:
        return t("errorServerError");
    }
  };

  return (
    <>
      <main className="min-h-screen bg-gradient-to-br from-red-50 via-gray-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <Container className="py-20">
          <div className="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
              </div>
            </div>
            
            <h1 className="text-2xl font-bold mb-4">{t("paymentErrorTitle")}</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {getErrorMessage(errorCode)}
            </p>
            
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 justify-center">
              <Link 
                href={`/${params.locale}/upgrade`}
                className="inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-lg font-medium transition"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t("backToUpgrade")}
              </Link>
              
              <Link 
                href={`/${params.locale}/tree-hole`}
                className="inline-flex items-center justify-center bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 py-2 px-6 rounded-lg font-medium transition"
              >
                {t("backToChat")}
              </Link>
            </div>
          </div>
        </Container>
      </main>
    </>
  );
}