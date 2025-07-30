import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from './i18n/config';

export default createMiddleware({
  // 支持的语言列表
  locales,

  // 默认语言
  defaultLocale,
  
  // 使用路径前缀进行国际化，但允许根路径重定向
  localePrefix: 'as-needed'
});

export const config = {
  // 匹配所有路径，除了以下特殊路径
  matcher: [
    // 匹配所有路径，除了以 `/api`, `/auth`, `/_next` 或 包含 `.` 的路径 (例如静态文件)
    '/((?!api|auth|_next|.*\\.|favicon.ico).*)'
  ]
};