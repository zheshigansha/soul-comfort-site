    // 路径: app/[locale]/layout.tsx
    import '../globals.css';
    import { type ReactNode } from 'react';
    import { NextIntlClientProvider } from 'next-intl';
    import { getMessages } from 'next-intl/server';
    import { Navbar } from '@/components/layouts';
    import { ClientProvider} from './providers.js'; // 确保这个路径正确
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

      // 将zh-CN简化为zh，确保客户端和服务器端一致
      const htmlLang = locale === 'zh' ? 'zh' : locale;

      return (
        <html lang={htmlLang}>
          <body>
            {/*
              * 修改后的布局:
              * 由于Navbar现在是客户端组件，需要将其放入NextIntlClientProvider内部
              * 以便它可以使用国际化翻译
            */}
            <div className="flex flex-col min-h-screen">
              <NextIntlClientProvider messages={messages} locale={locale}>
                <Navbar />
                <ClientProvider>
                  <main className="flex-grow">{children}</main>
                </ClientProvider>
              </NextIntlClientProvider>
            </div>
          </body>
        </html>
      );
    }