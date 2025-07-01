'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Container } from './Container';

export function Navbar({ locale }: { locale: string }) {
  const t = useTranslations('Navigation'); // 初始化翻译函数
  const router = useRouter();
  const pathName = usePathname();
  
  // 获取当前路径的非语言部分
  const currentPath = pathName.split('/').slice(2).join('/');
  
  // 计算另一种语言
  const otherLocale = locale === 'en' ? 'zh' : 'en';
  
  const switchLanguage = (newLocale: string) => {
    const newPath = `/${newLocale}/${currentPath}`;
    router.push(newPath);
  };
  
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
            {/* 导航链接 */}
            <Link 
              href={`/${locale}`} 
              className="text-sm font-medium text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition"
            >
              {t('home')}
            </Link>
            
            <Link 
              href={`/${locale}/tree-hole`} 
              className="text-sm font-medium text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition"
            >
              {t('treeHole')}
            </Link>
            
            {/* 语言切换 */}
            <Link 
              href={`/${otherLocale}/${currentPath}`}
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