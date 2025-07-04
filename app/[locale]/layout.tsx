    // 路径: app/[locale]/layout.tsx
    import '../globals.css';
    import { type ReactNode } from 'react';
    import { NextIntlClientProvider } from 'next-intl';
    import { getMessages } from 'next-intl/server';
    import { Navbar } from '@/components/ui/Navbar'; // 导入我们新的服务端 Navbar
    import { ClientProvider} from './providers'; // 确保这个路径正确
    import { type Metadata } from 'next';

    interface Props {
      children: ReactNode;
      params: {
        locale: string;
      };
    }

    export const metadata: Metadata = {
      title: "Soul Comfort Site",
      description: "A place to find peace and comfort.",
    };

    export function generateStaticParams() {
      return [{ locale: 'en' }, { locale: 'zh' }];
    }
    
    export default async function LocaleLayout({ children, params: { locale } }: Props) {
      const messages = await getMessages();

      return (
        <html lang={locale}>
          <body>
            {/*
              * 关键改动:
              * 1. 将 Navbar 移出 NextIntlClientProvider。
              *    这样，作为服务端组件的 Navbar 就可以在服务端正确渲染，
              *    而不会被客户端组件包裹，从而避免了水合作用错误。
              * 2. 将需要客户端上下文的 {children} (即页面内容) 保留在 Provider 内部。
            */}
            <div className="flex flex-col min-h-screen">
              <Navbar />
              <NextIntlClientProvider messages={messages}>
                <ClientProvider>
                  <main className="flex-grow">{children}</main>
                </ClientProvider>
              </NextIntlClientProvider>
            </div>
          </body>
        </html>
      );
    }