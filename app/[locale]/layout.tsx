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
            <NextIntlClientProvider messages={messages}>
              <ClientProvider>
                <div className="flex flex-col min-h-screen">
                  <Navbar /> {/* <-- 在这里使用服务端的 Navbar */}
                  <main className="flex-grow">{children}</main> {/* <-- 你的页面内容会显示在这里 */}
                </div>
              </ClientProvider>
            </NextIntlClientProvider>
          </body>
        </html>
      );
    }