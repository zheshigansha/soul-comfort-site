// 暂时注释掉Supabase相关导入
// import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { type NextRequest, NextResponse } from 'next/server';

// 强制动态渲染
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const cookieStore = cookies();

  // 暂时注释掉Supabase代码
  // if (code) {
  //   const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
  //   // 用授权码交换会话
  //   await supabase.auth.exchangeCodeForSession(code);
  // }

  // 智能重定向逻辑
  // 1. 从 cookie 中获取用户当前的语言环境
  const locale = cookieStore.get('NEXT_LOCALE')?.value || 'en';

  // 2. 直接重定向到带有正确语言前缀的主页
  const redirectUrl = `${requestUrl.origin}/${locale}`;
  return NextResponse.redirect(redirectUrl);
}