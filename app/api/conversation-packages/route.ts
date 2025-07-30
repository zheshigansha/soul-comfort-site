import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

// 强制动态渲染
export const dynamic = 'force-dynamic'

// 获取所有可用的对话包
export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // 获取所有激活的对话包
    const { data: packages, error } = await supabase
      .from('conversation_packages')
      .select('*')
      .eq('is_active', true)
      .order('price', { ascending: true })
    
    if (error) {
      console.error('获取对话包错误:', error)
      return NextResponse.json({ error: '获取对话包失败' }, { status: 500 })
    }
    
    return NextResponse.json({ 
      packages,
      message: '成功获取对话包列表'
    })
  } catch (error) {
    console.error('处理对话包请求错误:', error)
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
}