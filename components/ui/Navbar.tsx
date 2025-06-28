import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Container } from './Container';

export function Navbar({ locale }: { locale: string }) {
  const t = useTranslations('Navigation');
  
  // 获取另一种语言的代码
  const otherLocale = locale === 'en' ? 'zh' : 'en';
  
  return (
    <header className="py-4 bg-gradient-to-r from-purple-500/10 via-blue-500/10 to-teal-500/10 backdrop-blur-sm border-b border-white/10">
      <Container>
        <nav className="flex items-center justify-between">
          <div className="flex items-center">
            <Link href={`/${locale}`} className="text-xl font-medium text-gray-800 dark:text-white">
              Soul Comfort
            </Link>
          </div>
          
          <div className="flex items-center space-x-6">
            {/* 预留导航链接，将来会添加更多页面 */}
            <Link 
              href={`/${locale}`} 
              className="text-sm font-medium text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition"
            >
              {t('home')}
            </Link>
            
            {/* 语言切换 */}
            <Link 
              href={`/${otherLocale}`}
              className="text-sm font-medium text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition"
            >
              {otherLocale === 'en' ? 'English' : '中文'}
            </Link>
          </div>
        </nav>
      </Container>
    </header>
  );
}