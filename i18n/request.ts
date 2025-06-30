import { getRequestConfig } from 'next-intl/server';

export default getRequestConfig(async ({ requestLocale }) => {
  // 使用新的requestLocale API，这需要await
  const locale = await requestLocale || 'en';
  
  // 验证locale是否是支持的语言，如果不是则使用默认值
  // 这里我们从中间件中直接使用支持的语言列表
  const supportedLocales = ['en', 'zh'];
  const validatedLocale = supportedLocales.includes(locale) ? locale : 'en';
  
  return {
    // 现在需要显式返回locale
    locale: validatedLocale,
    messages: (await import(`../messages/${validatedLocale}.json`)).default
  };
});