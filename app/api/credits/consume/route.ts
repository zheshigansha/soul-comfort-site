import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

// 强制动态渲染
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { amount = 1, reason = '对话消费' } = await req.json()
    
    // 验证用户是否登录
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json({ error: '用户未登录' }, { status: 401 })
    }
    
    // 获取用户积分
    const { data: credits, error } = await supabase
      .from('user_credits')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle()
    
    // 如果用户没有积分记录或积分不足
    if (!credits) {
      return NextResponse.json({ 
        error: '积分不足', 
        remaining_credits: 0 
      }, { status: 402 }) // 402 Payment Required
    }
    
    if (credits.remaining_credits < amount) {
      return NextResponse.json({ 
        error: '积分不足', 
        remaining_credits: credits.remaining_credits 
      }, { status: 402 })
    }
    
    // 开始数据库事务
    // 注意：实际使用中，您应该使用Supabase的事务API或直接使用PostgreSQL事务
    // 这里为简化，我们使用分步更新
    
    // 1. 减少用户积分
    const { error: updateError } = await supabase
      .from('user_credits')
      .update({
        remaining_credits: credits.remaining_credits - amount,
        last_updated: new Date().toISOString()
      })
      .eq('user_id', user.id)
    
    if (updateError) {
      console.error('更新积分失败:', updateError)
      return NextResponse.json({ error: '消费积分失败' }, { status: 500 })
    }
    
    // 2. 创建消费记录
    const { error: transactionError } = await supabase
      .from('credit_transactions')
      .insert({
        user_id: user.id,
        amount: -amount, // 负数表示消费
        type: 'consume',
        status: 'completed',
        description: reason
      })
    
    if (transactionError) {
      console.error('创建消费记录失败:', transactionError)
      // 这里不返回错误，因为积分已经扣除成功
      // 在生产环境中，应该使用事务确保一致性
    }
    
    return NextResponse.json({
      success: true,
      message: '积分消费成功',
      remaining_credits: credits.remaining_credits - amount
    })
    
  } catch (error) {
    console.error('处理积分消费请求错误:', error)
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
}

// 检查用户是否有足够积分的辅助函数
// 关键改动：移除了 'export' 关键字，使其成为文件私有函数
async function checkCredits(userId: string, amount = 1) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    const { data: credits, error } = await supabase
      .from('user_credits')
      .select('remaining_credits')
      .eq('user_id', userId)
      .maybeSingle()
    
    if (error || !credits) {
      return {
        hasEnoughCredits: false,
        remaining: 0
      }
    }
    
    return {
      hasEnoughCredits: credits.remaining_credits >= amount,
      remaining: credits.remaining_credits
    }
  } catch (error) {
    console.error('检查积分失败:', error)
    return {
      hasEnoughCredits: false,
      remaining: 0,
      error
    }
  }
}