import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
// 假设这是您的Creem SDK集成，需要根据实际情况调整
// import { CreemClient } from '@/lib/creem-client'

// const creem = new CreemClient(process.env.CREEM_API_KEY || '');

// 强制动态渲染
export const dynamic = 'force-dynamic'

// POST: 创建新订阅
export async function POST(req: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { plan_id, auto_renew = false, clientId } = await req.json()
    
    // 获取当前登录用户
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json({ error: '用户未登录' }, { status: 401 })
    }
    
    // 验证plan_id是否存在
    const { data: plan, error: planError } = await supabase
      .from('plans')
      .select('*')
      .eq('id', plan_id)
      .single()
    
    if (planError || !plan) {
      return NextResponse.json({ error: '无效的订阅计划' }, { status: 400 })
    }
    
    // 检查用户是否已有有效订阅
    const { data: existingSubscriptions } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
    
    // 如果已有活跃订阅，可以选择取消旧订阅或拒绝新订阅请求
    if (existingSubscriptions && existingSubscriptions.length > 0) {
      // 这里可以根据业务需求选择如何处理
      // 例如: 自动将旧订阅设置为不活跃
      await supabase
        .from('subscriptions')
        .update({ status: 'cancelled' })
        .eq('id', existingSubscriptions[0].id)
    }
    
    // 使用Creem创建支付会话
    try {
      // 注意: 以下是Creem集成的示例代码，需要根据实际API调整
      /*
      const session = await creem.checkoutSessions.create({
        customer_email: user.email,
        line_items: [{
          price_data: {
            currency: 'cny',
            product_data: {
              name: plan.name,
              description: `订阅计划: ${plan.name}，每月${plan.monthly_limit}次对话`
            },
            unit_amount: Math.round(plan.price_usd * 100), // 以分为单位
            recurring: {
              interval: 'month'
            }
          },
          quantity: 1
        }],
        mode: 'subscription',
        success_url: `${process.env.NEXT_PUBLIC_URL}/api/payment/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.NEXT_PUBLIC_URL}/payment/cancel`
      });
      */
      
      // 临时模拟支付会话
      const sessionId = `sub_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
      
      // 计算订阅到期时间 (30天后)
      const expires_at = new Date()
      expires_at.setDate(expires_at.getDate() + 30)
      
      // 创建订阅记录
      const { data: subscription, error: subscriptionError } = await supabase
        .from('subscriptions')
        .insert({
          user_id: user.id,
          plan_id,
          auto_renew,
          status: 'active',
          expires_at
        })
        .select()
        .single()
      
      if (subscriptionError) {
        console.error('创建订阅失败:', subscriptionError)
        return NextResponse.json({ error: '创建订阅失败' }, { status: 500 })
      }
      
      // 在实际集成中，这里会返回支付URL
      // return NextResponse.json({ 
      //   sessionId: session.id,
      //   sessionUrl: session.url 
      // })
      
      // 临时返回模拟的支付结果
      return NextResponse.json({ 
        message: '订阅创建成功',
        sessionId,
        subscription
      })
      
    } catch (paymentError) {
      console.error('创建支付会话失败:', paymentError)
      return NextResponse.json({ error: '创建支付会话失败' }, { status: 500 })
    }
    
  } catch (error) {
    console.error('处理订阅请求失败:', error)
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
}

// GET: 获取当前用户的订阅信息
export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // 获取当前登录用户
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json({ error: '用户未登录' }, { status: 401 })
    }
    
    // 查询用户的订阅
    const { data: subscriptions, error } = await supabase
      .from('subscriptions')
      .select(`
        *,
        plans:plan_id (*)
      `)
      .eq('user_id', user.id)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
    
    if (error) {
      return NextResponse.json({ error: '获取订阅失败' }, { status: 500 })
    }
    
    return NextResponse.json({ 
      subscriptions,
      activeSubscription: subscriptions.length > 0 ? subscriptions[0] : null
    })
  } catch (error) {
    console.error('处理获取订阅请求失败:', error)
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
}