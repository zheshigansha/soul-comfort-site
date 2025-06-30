import type { Metadata } from "next";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import "../globals.css";
import { ClientProvider } from './providers'; // 添加这一行

export const metadata: Metadata = {
  title: "Soul Comfort Site",
  description: "A place to find peace and comfort.",
};

// 这个函数告诉 Next.js 需要为哪些语言生成静态页面
export function generateStaticParams() {
  return [{ locale: 'en' }, { locale: 'zh' }];
}

interface RootLayoutProps {
  children: React.ReactNode;
  params: {
    locale: string;
  };
}

export default async function RootLayout({
  children,
  params: { locale }
}: RootLayoutProps) {
  const messages = await getMessages({locale});

  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <ClientProvider> {/* 添加这个包装器 */}
            {children}
          </ClientProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}