import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

// 强制动态渲染
export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams
    const transactionId = searchParams.get('id')
    
    if (!transactionId) {
      return NextResponse.json({ error: '缺少交易ID' }, { status: 400 })
    }
    
    const supabase = createRouteHandlerClient({ cookies })
    
    // 验证用户是否登录
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json({ error: '用户未登录' }, { status: 401 })
    }
    
    // 获取交易详情
    const { data: transaction, error } = await supabase
      .from('credit_transactions')
      .select(`
        *,
        package:package_id (name, conversation_count, price)
      `)
      .eq('id', transactionId)
      .eq('user_id', user.id) // 确保用户只能查看自己的交易
      .single()
    
    if (error || !transaction) {
      console.error('获取交易详情失败:', error)
      return NextResponse.json({ error: '获取交易详情失败' }, { status: 404 })
    }
    
    return NextResponse.json({ transaction })
  } catch (error) {
    console.error('处理交易查询请求错误:', error)
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
}