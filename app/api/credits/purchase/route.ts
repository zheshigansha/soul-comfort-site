import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

// 导入Creem SDK或API客户端
// 根据Creem文档调整导入方式
// import { CreamClient } from '@/lib/creem-client' // <--- 注释掉有问题的导入

// 初始化Creem客户端
// const creem = new CreamClient(process.env.CREEM_API_KEY) // <--- 注释掉客户端初始化

// 强制动态渲染
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { package_id, locale = 'zh' } = await req.json()
    
    // 验证用户是否登录
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json({ error: '用户未登录' }, { status: 401 })
    }
    
    // -------------------------------------------------------------------------
    //  以下是模拟支付流程
    //  我们暂时绕过了数据库查询和真实的支付API调用
    // -------------------------------------------------------------------------

    console.log(`模拟支付流程: 用户 ${user.id} 尝试购买套餐 ${package_id}`);

    // 直接构造一个模拟的成功回调URL
    const transactionId = `mock_tx_${Date.now()}`;
    const successUrl = `${process.env.NEXT_PUBLIC_URL}/${locale}/payment-success?transaction_id=${transactionId}&package_id=${package_id}`;
    
    // 直接返回一个模拟的支付链接，让前端可以跳转
    return NextResponse.json({
      sessionId: `mock_session_${Date.now()}`,
      paymentUrl: successUrl, // 直接使用我们构造的成功URL
      transactionId: transactionId
    });
    
  } catch (error) {
    console.error('处理购买请求错误:', error)
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
}