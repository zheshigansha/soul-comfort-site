import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

// 强制动态渲染
export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
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
    
    if (error) {
      console.error('获取积分信息失败:', error)
      return NextResponse.json({ error: '获取积分信息失败' }, { status: 500 })
    }
    
    // 获取用户的交易历史
    const { data: transactions, error: transactionsError } = await supabase
      .from('credit_transactions')
      .select(`
        *,
        package:package_id (name, conversation_count)
      `)
      .eq('user_id', user.id)
      .eq('status', 'completed')
      .order('created_at', { ascending: false })
      .limit(10)
    
    if (transactionsError) {
      console.error('获取交易历史失败:', transactionsError)
      // 继续处理，不返回错误，因为这只是附加信息
    }
    
    // 如果用户没有积分记录，返回默认值
    if (!credits) {
      return NextResponse.json({
        remaining_credits: 0,
        total_purchased: 0,
        transactions: transactions || []
      })
    }
    
    return NextResponse.json({
      remaining_credits: credits.remaining_credits,
      total_purchased: credits.total_purchased,
      last_updated: credits.last_updated,
      transactions: transactions || []
    })
    
  } catch (error) {
    console.error('处理积分查询请求错误:', error)
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
}