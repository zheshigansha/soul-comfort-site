import { getRequestConfig } from 'next-intl/server';

// 支持的语言列表
const locales = ['en', 'zh'] as const;
type Locale = typeof locales[number];

export default getRequestConfig(async ({ requestLocale }) => {
  // 获取并验证语言设置
  const locale = await requestLocale;
  const validatedLocale = locales.includes(locale as Locale) ? locale as Locale : 'en';
  
  // 直接加载对应的翻译文件
  const messages = (await import(`../messages/${validatedLocale}.json`)).default;
  
  return {
    locale: validatedLocale,
    messages
  };
});