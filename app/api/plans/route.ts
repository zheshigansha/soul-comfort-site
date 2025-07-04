import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // 获取所有激活的套餐
    const { data: plans, error } = await supabase
      .from('plans')
      .select('*')
      .eq('is_active', true)
      .order('price_usd', { ascending: true })
    
    if (error) {
      console.error('获取套餐错误:', error)
      return NextResponse.json({ error: '获取套餐失败' }, { status: 500 })
    }
    
    // 处理features字段，确保它是数组
    const processedPlans = plans.map(plan => ({
      ...plan,
      features: typeof plan.features === 'string' 
        ? JSON.parse(plan.features)
        : plan.features
    }))
    
    return NextResponse.json({ plans: processedPlans })
  } catch (error) {
    console.error('处理套餐请求错误:', error)
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
}