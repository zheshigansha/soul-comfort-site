import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    // 获取PayPal webhook负载
    const payload = await req.json()
    
    console.log('收到PayPal webhook:', JSON.stringify(payload, null, 2))
    
    // 验证webhook签名（实际应用中应实现）
    // 参考: https://developer.paypal.com/api/rest/webhooks/
    
    const eventType = payload.event_type
    const resource = payload.resource
    
    // 处理订单捕获完成事件
    if (eventType === 'PAYMENT.CAPTURE.COMPLETED' || eventType === 'CHECKOUT.ORDER.APPROVED') {
      const supabase = createRouteHandlerClient({ cookies })
      const referenceId = resource.supplementary_data?.related_ids?.order_id || 
                         resource.purchase_units?.[0]?.reference_id ||
                         resource.id
      
      if (!referenceId) {
        console.error('无法从webhook获取交易ID')
        return NextResponse.json({ success: false, error: 'missing_reference_id' })
      }
      
      // 查找交易记录
      const { data: transaction } = await supabase
        .from('credit_transactions')
        .select('*')
        .or(`id.eq.${referenceId},reference_id.eq.${referenceId}`)
        .single()
      
      if (!transaction) {
        console.error('未找到交易记录:', referenceId)
        return NextResponse.json({ success: false, error: 'transaction_not_found' })
      }
      
      // 如果交易已完成，避免重复处理
      if (transaction.status === 'completed') {
        return NextResponse.json({ success: true, message: 'already_processed' })
      }
      
      // 更新交易记录
      await supabase
        .from('credit_transactions')
        .update({
          status: 'completed',
          description: `${transaction.description} - 通过webhook确认支付成功`
        })
        .eq('id', transaction.id)
      
      // 更新用户积分
      const { data: credits } = await supabase
        .from('user_credits')
        .select('*')
        .eq('user_id', transaction.user_id)
        .maybeSingle()
      
      if (credits) {
        await supabase
          .from('user_credits')
          .update({
            remaining_credits: credits.remaining_credits + transaction.amount,
            total_purchased: credits.total_purchased + transaction.amount,
            last_updated: new Date().toISOString()
          })
          .eq('user_id', transaction.user_id)
      } else {
        await supabase
          .from('user_credits')
          .insert({
            user_id: transaction.user_id,
            remaining_credits: transaction.amount,
            total_purchased: transaction.amount
          })
      }
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('处理PayPal webhook错误:', error)
    return NextResponse.json({ error: 'server_error' }, { status: 500 })
  }
}