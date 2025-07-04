import createMiddleware from 'next-intl/middleware';
 
export default createMiddleware({
  // 支持的语言列表
  locales: ['en', 'zh'],
 
  // 默认语言
  defaultLocale: 'en',
  
  // 使用路径前缀进行国际化
  localePrefix: 'always'
});
 
export const config = {
  // 匹配所有路径，除了以下特殊路径
  matcher: [
    // 匹配所有路径，除了以 `/api`, `/auth`, `/_next` 或 包含 `.` 的路径 (例如静态文件)
    '/((?!api|auth|_next|.*\\.|favicon.ico).*)'
  ]
};