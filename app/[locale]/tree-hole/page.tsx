'use client';

import { Container } from "@/components/ui";
import { useTranslations } from "next-intl";
import { MessageSquareHeart, Settings } from "lucide-react";

export default function TreeHolePage() {
  const t = useTranslations("TreeHole");
  
  return (
    <Container>
      <div className="py-8">
        <h1 className="text-3xl font-bold mb-2">{t("title")}</h1>
        <p className="text-muted-foreground mb-6">{t("description")}</p>
        
        {/* 临时维护提示 */}
        <div className="max-w-2xl mx-auto">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6 text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-yellow-100 dark:bg-yellow-900/40 rounded-full">
                <Settings size={32} className="text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
            <h2 className="text-xl font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
              {t("maintenance") || "功能维护中"}
            </h2>
            <p className="text-yellow-700 dark:text-yellow-300 mb-4">
              {t("maintenanceMessage") || "AI聊天功能正在进行技术维护，我们正在优化服务质量。请稍后再试。"}
            </p>
            <div className="flex items-center justify-center text-sm text-yellow-600 dark:text-yellow-400">
              <MessageSquareHeart size={16} className="mr-2" />
              <span>{t("thankYou") || "感谢您的耐心等待"}</span>
            </div>
          </div>
          
          {/* 功能预览 */}
          <div className="mt-8 p-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <h3 className="text-lg font-medium mb-4">即将推出的功能：</h3>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li>• 智能情感分析和回应</li>
              <li>• 多种对话模式（倾听、安慰、建议）</li>
              <li>• 个性化的心理支持</li>
              <li>• 安全的匿名交流环境</li>
            </ul>
          </div>
        </div>
        
        <div className="mt-4 text-xs text-muted-foreground text-center">
          <p>{t("disclaimer")}</p>
        </div>
      </div>
    </Container>
  );
}