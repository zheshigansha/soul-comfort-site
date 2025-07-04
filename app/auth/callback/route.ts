import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { type NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const cookieStore = cookies();

  if (code) {
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    // 用授权码交换会话
    await supabase.auth.exchangeCodeForSession(code);
  }

  // 智能重定向逻辑
  // 1. 从 cookie 中获取用户当前的语言环境
  const locale = cookieStore.get('NEXT_LOCALE')?.value || 'en';

  // 2. 直接重定向到带有正确语言前缀的主页
  const redirectUrl = `${requestUrl.origin}/${locale}`;
  return NextResponse.redirect(redirectUrl);
}