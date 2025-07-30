'use client';

import { useLocale } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';

export function LocaleSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  
  const switchLocale = () => {
    const newLocale = locale === 'zh' ? 'en' : 'zh';
    
    console.log('Switching from', locale, 'to', newLocale);
    console.log('Current pathname:', pathname);
    
    // 更智能的路径处理
    let newPath;
    if (pathname === `/${locale}` || pathname === '/') {
      // 首页情况
      newPath = `/${newLocale}`;
    } else if (pathname.startsWith(`/${locale}/`)) {
      // 有语言前缀的路径
      newPath = pathname.replace(`/${locale}/`, `/${newLocale}/`);
    } else {
      // 没有语言前缀的路径（默认语言）
      newPath = `/${newLocale}${pathname}`;
    }
    
    console.log('New path:', newPath);
    
    // 使用 window.location 进行硬跳转，确保中间件正确处理
    window.location.href = newPath;
  };
  
  return (
    <button 
      onClick={switchLocale}
      className="h-8 px-3 text-xs border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
      title={`Switch to ${locale === 'zh' ? 'English' : '中文'}`}
    >
      {locale === 'zh' ? '中文' : 'English'}
    </button>
  );
} 