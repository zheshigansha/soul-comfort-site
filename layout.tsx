// 从 'next-intl/server' 导入 getMessages，这是为服务器组件准备的函数
import {NextIntlClientProvider} from 'next-intl';
import {getMessages} from 'next-intl/server';

// 新增代码块：登记所有合法的语言
export function generateStaticParams() {
  return [{locale: 'en'}, {locale: 'zh'}];
}

interface RootLayoutProps {
  children: React.ReactNode;
  params: {
    locale: string;
  };
}

// 关键1: 将函数声明为 async，以便在内部使用 await
export default async function RootLayout({
  children,
  params: {locale}
}: RootLayoutProps) {
  // 关键2: 使用 await getMessages() 在服务器端异步获取翻译文本
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body>
        {/*
          在服务器组件的布局中，我们只需要将所有 messages 传递给 Provider。
          Next.js 和 next-intl 会自动处理好后续的一切。
        */}
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}