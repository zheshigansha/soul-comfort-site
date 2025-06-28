import { getRequestConfig } from 'next-intl/server';

export default getRequestConfig(async ({locale}) => {
  // 直接使用传入的locale参数
  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default
  };
});