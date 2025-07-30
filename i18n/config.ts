/**
 * 国际化配置
 * 简化版本，移除不必要的复杂度
 */

// 支持的语言
export const locales = ['en', 'zh'] as const;
export type Locale = typeof locales[number];

// 默认语言
export const defaultLocale: Locale = 'en';

// 语言显示名称
export const localeNames: Record<Locale, string> = {
  en: 'English',
  zh: '中文'
};

// 验证语言是否支持
export function isValidLocale(locale: string): locale is Locale {
  return locales.includes(locale as Locale);
}

// 获取有效的语言设置
export function getValidLocale(locale: string | undefined): Locale {
  if (!locale) return defaultLocale;
  return isValidLocale(locale) ? locale : defaultLocale;
}