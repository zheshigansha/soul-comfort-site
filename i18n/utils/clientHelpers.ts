'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { Locale, locales } from '../config';

/**
 * 获取当前语言
 * 客户端工具函数，用于从路径中提取当前语言
 * @returns 当前语言代码
 */
export function useCurrentLocale(): Locale {
  const locale = useLocale() as Locale;
  return locale;
}

/**
 * 获取从当前语言切换到目标语言的路径
 * @param targetLocale 目标语言
 * @returns 切换后的路径
 */
export function useSwitchLocalePath(targetLocale: Locale): string {
  const pathname = usePathname();
  const currentLocale = useCurrentLocale();
  
  if (!pathname) return `/${targetLocale}`;
  
  // 替换路径中的语言部分
  if (pathname.startsWith(`/${currentLocale}/`)) {
    return pathname.replace(`/${currentLocale}/`, `/${targetLocale}/`);
  } else if (pathname === `/${currentLocale}`) {
    return `/${targetLocale}`;
  }
  
  // 如果路径中不包含语言部分，添加语言前缀
  return `/${targetLocale}${pathname}`;
}

/**
 * 语言切换钩子函数
 * 提供切换到其他语言的方法
 */
export function useLocaleSwitch() {
  const router = useRouter();
  const currentLocale = useCurrentLocale();
  
  /**
   * 切换到指定语言
   * @param locale 目标语言
   */
  const switchToLocale = (locale: Locale) => {
    if (locale === currentLocale) return;
    
    const newPath = useSwitchLocalePath(locale);
    router.replace(newPath);
  };
  
  /**
   * 切换到下一个语言
   * 按顺序循环切换支持的语言
   */
  const switchToNextLocale = () => {
    const currentIndex = locales.indexOf(currentLocale);
    const nextIndex = (currentIndex + 1) % locales.length;
    const nextLocale = locales[nextIndex];
    switchToLocale(nextLocale);
  };
  
  return {
    currentLocale,
    switchToLocale,
    switchToNextLocale
  };
} 