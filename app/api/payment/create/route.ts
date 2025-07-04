import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { createPayPalOrder } from '@/lib/paypal-client'

export async function POST(req: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { package_id, locale = 'zh' } = await req.json()
    
    // 验证用户是否登录
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json({ error: '用户未登录' }, { status: 401 })
    }
    
    // 验证package_id是否存在
    const { data: packageData, error: packageError } = await supabase
      .from('conversation_packages')
      .select('*')
      .eq('id', package_id)
      .single()
    
    if (packageError || !packageData) {
      return NextResponse.json({ error: '无效的对话包' }, { status: 400 })
    }
    
    // 创建交易记录
    const { data: transaction, error: transactionError } = await supabase
      .from('credit_transactions')
      .insert({
        user_id: user.id,
        package_id: package_id,
        amount: packageData.conversation_count,
        type: 'purchase',
        status: 'pending',
        description: `购买 ${packageData.name}`
      })
      .select()
      .single()
    
    if (transactionError) {
      console.error('创建交易记录失败:', transactionError)
      return NextResponse.json({ error: '创建交易记录失败' }, { status: 500 })
    }
    
    // 设置回调URL
    const baseUrl = process.env.NEXT_PUBLIC_URL || `https://${req.headers.get('host')}`
    const successUrl = `${baseUrl}/api/payment/success?transaction_id=${transaction.id}&locale=${locale}`
    const cancelUrl = `${baseUrl}/api/payment/cancel?transaction_id=${transaction.id}&locale=${locale}`
    
    try {
      // 调用PayPal创建订单
      const paypalOrder = await createPayPalOrder({
        orderId: transaction.id,
        description: `Soul Comfort - ${packageData.name}`,
        amount: packageData.price,
        returnUrl: successUrl,
        cancelUrl: cancelUrl
      })
      
      // 更新交易记录，添加PayPal订单ID
      await supabase
        .from('credit_transactions')
        .update({
          reference_id: paypalOrder.id
        })
        .eq('id', transaction.id)
      
      // 返回支付链接
      return NextResponse.json({
        success: true,
        paymentUrl: paypalOrder.paymentUrl,
        sessionId: paypalOrder.id,
        transactionId: transaction.id
      })
      
    } catch (paymentError) {
      console.error('创建PayPal订单失败:', paymentError)
      
      // 更新交易状态为失败
      await supabase
        .from('credit_transactions')
        .update({
          status: 'failed',
          description: `${transaction.description} - 创建支付失败`
        })
        .eq('id', transaction.id)
      
      return NextResponse.json({ error: '创建支付失败' }, { status: 500 })
    }
    
  } catch (error) {
    console.error('处理支付请求错误:', error)
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
}