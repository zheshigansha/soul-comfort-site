import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  // 关键改动：将 searchParams 的定义提升到 try-catch 外部
  const searchParams = req.nextUrl.searchParams
  const locale = searchParams.get('locale') || 'zh'

  try {
    const transactionId = searchParams.get('transaction_id')
    
    if (transactionId) {
      const supabase = createRouteHandlerClient({ cookies })
      
      // 更新交易状态为取消
      await supabase
        .from('credit_transactions')
        .update({
          status: 'cancelled',
          description: '用户取消支付'
        })
        .eq('id', transactionId)
    }
    
    // 重定向回升级页面
    return NextResponse.redirect(new URL(`/${locale}/upgrade?payment=cancelled`, req.url))
  } catch (error) {
    console.error('处理支付取消错误:', error)
    // 出错时也重定向回升级页面
    // 现在这里的 locale 变量可以被正确访问了
    return NextResponse.redirect(new URL(`/${locale}/upgrade?payment=error`, req.url))
  }
}