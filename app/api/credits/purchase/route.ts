import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

// 导入Creem SDK或API客户端
// 根据Creem文档调整导入方式
import { CreamClient } from '@/lib/creem-client'

// 初始化Creem客户端
const creem = new CreamClient(process.env.CREEM_API_KEY)

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
    const successUrl = `${process.env.NEXT_PUBLIC_URL}/api/payment/success?session_id={SESSION_ID}&locale=${locale}`
    const cancelUrl = `${process.env.NEXT_PUBLIC_URL}/api/payment/cancel?session_id={SESSION_ID}&locale=${locale}`
    
    try {
      // 调用Creem API创建支付会话
      // 以下代码需要根据Creem的实际API文档调整
      const creamSession = await creem.createPayment({
        // 订单信息
        orderId: transaction.id,
        amount: packageData.price,
        currency: 'CNY',
        
        // 产品信息
        productName: packageData.name,
        productDescription: `${packageData.conversation_count}次对话`,
        
        // 客户信息
        customerEmail: user.email,
        customerName: user.user_metadata?.name || user.email,
        
        // 回调URL
        successUrl: successUrl,
        cancelUrl: cancelUrl,
        
        // 元数据（用于回调处理）
        metadata: {
          userId: user.id,
          transactionId: transaction.id,
          packageId: package_id,
          packageName: packageData.name
        }
      })
      
      // 返回支付会话信息
      return NextResponse.json({
        sessionId: creamSession.id,
        paymentUrl: creamSession.paymentUrl,
        transactionId: transaction.id
      })
      
    } catch (paymentError) {
      console.error('创建Creem支付会话失败:', paymentError)
      
      // 更新交易状态为失败
      await supabase
        .from('credit_transactions')
        .update({
          status: 'failed',
          description: `${transaction.description} - 创建支付会话失败`
        })
        .eq('id', transaction.id)
      
      return NextResponse.json({ error: '创建支付会话失败' }, { status: 500 })
    }
    
  } catch (error) {
    console.error('处理购买请求错误:', error)
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
}