import {notFound} from 'next/navigation';
import {getRequestConfig} from 'next-intl/server';
 
// 可用的语言列表
const locales = ['en', 'zh'];
 
export default getRequestConfig(async ({locale}) => {
  // 验证请求的语言是否在我们支持的列表中
  if (!locales.includes(locale as any)) notFound();
 
  return {
    messages: (await import(`./messages/${locale}.json`)).default
  };
});