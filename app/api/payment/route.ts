import { NextRequest, NextResponse } from 'next/server';
// 暂时注释掉Supabase相关导入
// import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { logger } from '@/lib/logger';
import { ApiResponse } from '@/types';

// 强制动态渲染
export const dynamic = 'force-dynamic'

// 模拟套餐数据，以替代数据库查询
const mockPackages = [
  {
    id: "pkg_basic",
    name: "基础套餐",
    price: 9.99,
    price_usd: 9.99,
    credits_amount: 100,
    description: "适合偶尔使用的用户"
  },
  {
    id: "pkg_standard",
    name: "标准套餐",
    price: 19.99,
    price_usd: 19.99,
    credits_amount: 250,
    description: "我们最受欢迎的套餐"
  },
  {
    id: "pkg_premium",
    name: "高级套餐",
    price: 49.99,
    price_usd: 49.99,
    credits_amount: 1000,
    description: "适合重度使用的用户"
  }
];

// --- PayPal Helper Functions ---

/**
 * 获取 PayPal 的访问令牌
 * @returns {Promise<string>} Access Token
 */
async function getPayPalAccessToken(): Promise<string> {
  const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
  const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;
  const PAYPAL_API_URL = process.env.PAYPAL_API_URL || 'https://api-m.sandbox.paypal.com';

  if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
    throw new Error('PayPal credentials not configured');
  }

  const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString('base64');

  const response = await fetch(`${PAYPAL_API_URL}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
    cache: 'no-store',
  });

  if (!response.ok) {
    const errorBody = await response.text();
    logger.error('Failed to get PayPal access token', new Error(errorBody));
    throw new Error('Failed to get PayPal access token');
  }

  const data = await response.json();
  return data.access_token as string;
}

// --- Main API Route ---

export async function POST(request: NextRequest) {
  const cookieStore = cookies();
  // 暂时注释掉Supabase客户端创建
  // const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

  try {
    // 1. 验证用户身份 - 暂时跳过，使用模拟用户
    // const { data: { user }, error: userError } = await supabase.auth.getUser();
    // if (userError || !user) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }
    
    // 使用模拟用户数据
    const user = { id: 'mock-user-id' };

    // 2. 解析请求体
    const body = await request.json();
    // **重要**: 确保前端发送的是 `packageId`
    const { packageId, locale = 'en' } = body; 

    if (!packageId) {
      return NextResponse.json({ error: 'Missing packageId' }, { status: 400 });
    }

    // 3. 从模拟数据中查找套餐信息
    const conversationPackage = mockPackages.find(pkg => pkg.id === packageId);

    if (!conversationPackage) {
      return NextResponse.json({ error: 'Package not found' }, { status: 404 });
    }
    
    // 4. 模拟支付流程, 直接返回一个成功的URL
    // 在真实应用中, 这里会调用 getPayPalAccessToken 和创建订单
    const NEXT_PUBLIC_APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    
    // 创建一个模拟的支付成功链接，并附带一些参数
    const mockPaymentUrl = `${NEXT_PUBLIC_APP_URL}/${locale}/payment-success?package_id=${packageId}&user_id=${user.id}&transaction_id=mock_${Date.now()}`;
    
    logger.info(`模拟支付流程: 为用户 ${user.id} 创建套餐 ${packageId} 的支付链接`, { 
      userId: user.id, 
      packageId, 
      paymentUrl: mockPaymentUrl 
    });
    
    // 直接返回模拟的支付链接
    return NextResponse.json({ paymentUrl: mockPaymentUrl });

  } catch (error) {
    logger.error('POST /api/payment error', error instanceof Error ? error : new Error(String(error)));
    return NextResponse.json({ 
      error: 'Internal Server Error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}