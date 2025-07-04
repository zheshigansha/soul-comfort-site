import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams
    const transactionId = searchParams.get('transaction_id')
    const locale = searchParams.get('locale') || 'zh'
    
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
    return NextResponse.redirect(new URL(`/${searchParams.get('locale') || 'zh'}/upgrade?payment=error`, req.url))
  }
}