import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { capturePayPalOrder } from '@/lib/paypal-client'

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams
    const transactionId = searchParams.get('transaction_id')
    const paypalOrderId = searchParams.get('token') // PayPal在回调时会添加token参数
    const locale = searchParams.get('locale') || 'zh'
    
    if (!transactionId || !paypalOrderId) {
      console.error('缺少必要参数:', { transactionId, paypalOrderId })
      return NextResponse.redirect(new URL(`/${locale}/payment-error?error=missing_params`, req.url))
    }
    
    const supabase = createRouteHandlerClient({ cookies })
    
    // 获取交易记录
    const { data: transaction, error: findError } = await supabase
      .from('credit_transactions')
      .select('*')
      .eq('id', transactionId)
      .single()
    
    if (findError || !transaction) {
      console.error('未找到交易记录:', transactionId)
      return NextResponse.redirect(new URL(`/${locale}/payment-error?error=transaction_not_found`, req.url))
    }
    
    // 如果交易已完成，直接重定向到成功页面
    if (transaction.status === 'completed') {
      return NextResponse.redirect(new URL(`/${locale}/payment-success?transaction_id=${transactionId}`, req.url))
    }
    
    try {
      // 验证并捕获PayPal支付
      const captureResult = await capturePayPalOrder(paypalOrderId)
      
      if (captureResult.status === 'COMPLETED') {
        // 更新交易记录
        await supabase
          .from('credit_transactions')
          .update({
            status: 'completed',
            reference_id: captureResult.id,
            description: `${transaction.description} - 支付成功`
          })
          .eq('id', transactionId)
        
        // 查询用户现有积分
        const { data: credits } = await supabase
          .from('user_credits')
          .select('*')
          .eq('user_id', transaction.user_id)
          .maybeSingle()
        
        if (credits) {
          // 更新现有积分
          await supabase
            .from('user_credits')
            .update({
              remaining_credits: credits.remaining_credits + transaction.amount,
              total_purchased: credits.total_purchased + transaction.amount,
              last_updated: new Date().toISOString()
            })
            .eq('user_id', transaction.user_id)
        } else {
          // 创建新积分记录
          await supabase
            .from('user_credits')
            .insert({
              user_id: transaction.user_id,
              remaining_credits: transaction.amount,
              total_purchased: transaction.amount
            })
        }
        
        // 重定向到成功页面
        return NextResponse.redirect(new URL(`/${locale}/payment-success?transaction_id=${transactionId}`, req.url))
      } else {
        // 支付状态不是COMPLETED，更新交易状态
        await supabase
          .from('credit_transactions')
          .update({
            status: 'failed',
            description: `${transaction.description} - 支付未完成 (${captureResult.status})`
          })
          .eq('id', transactionId)
        
        return NextResponse.redirect(new URL(`/${locale}/payment-error?error=payment_incomplete`, req.url))
      }
    } catch (error) {
      console.error('验证PayPal支付失败:', error)
      
      // 更新交易状态为失败
      await supabase
        .from('credit_transactions')
        .update({
          status: 'failed',
          description: `${transaction.description} - 验证支付失败`
        })
        .eq('id', transactionId)
      
      return NextResponse.redirect(new URL(`/${locale}/payment-error?error=verification_failed`, req.url))
    }
  } catch (error) {
    console.error('处理支付成功回调错误:', error)
    return NextResponse.redirect(new URL(`/${searchParams.get('locale') || 'zh'}/payment-error?error=server_error`, req.url))
  }
}