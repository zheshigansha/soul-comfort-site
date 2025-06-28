import {getRequestConfig} from 'next-intl/server';
 
export default getRequestConfig(async ({locale}) => {
  // 明确返回 locale 参数
  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default
  };
});