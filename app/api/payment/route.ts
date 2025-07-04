import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/db-supabase'; 

// --- PayPal Helper Functions ---

/**
 * 获取 PayPal 的访问令牌
 * @returns {Promise<string>} Access Token
 */
async function getPayPalAccessToken() {
  const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
  const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;
  const PAYPAL_API_URL = process.env.PAYPAL_API_URL || 'https://api-m.sandbox.paypal.com';

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
    console.error('Failed to get PayPal access token:', errorBody);
    throw new Error('Failed to get PayPal access token');
  }

  const data = await response.json();
  return data.access_token;
}

// --- Main API Route ---

export async function POST(request: NextRequest) {
  const cookieStore = cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

  try {
    // 1. 验证用户身份
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. 解析请求体
    const body = await request.json();
    const { package_id, locale = 'en' } = body; 

    if (!package_id) {
      return NextResponse.json({ error: 'Missing package_id' }, { status: 400 });
    }

    // 3. 从数据库查找套餐信息
    const conversationPackage = await prisma.conversation_packages.findUnique({
      where: { id: package_id },
    });

    if (!conversationPackage) {
      return NextResponse.json({ error: 'Package not found' }, { status: 404 });
    }
    
    // 4. 获取 PayPal 访问令牌
    const accessToken = await getPayPalAccessToken();
    const PAYPAL_API_URL = process.env.PAYPAL_API_URL || 'https://api-m.sandbox.paypal.com';
    const NEXT_PUBLIC_APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    
    // 5. 创建 PayPal 订单
    const orderResponse = await fetch(`${PAYPAL_API_URL}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'PayPal-Request-Id': `order-${Date.now()}` // 确保请求的幂等性
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [
          {
            amount: {
              currency_code: 'USD',
              value: conversationPackage.price_usd.toString(),
            },
            description: conversationPackage.description || `Conversation Package: ${conversationPackage.credits_amount} credits`,
            custom_id: user.id, // 将 Supabase User ID 传递给 PayPal
          },
        ],
        application_context: {
          return_url: `${NEXT_PUBLIC_APP_URL}/${locale}/payment-success`,
          cancel_url: `${NEXT_PUBLIC_APP_URL}/${locale}/upgrade`,
          brand_name: 'Soul Comfort',
          shipping_preference: 'NO_SHIPPING',
          user_action: 'PAY_NOW',
        },
      }),
    });

    if (!orderResponse.ok) {
        const errorBody = await orderResponse.json();
        console.error('Failed to create PayPal order:', JSON.stringify(errorBody, null, 2));
        return NextResponse.json({ error: 'Failed to create PayPal order' }, { status: 500 });
    }

    const orderData = await orderResponse.json();

    // 6. 在我们的数据库中创建一笔待处理的交易记录
    await prisma.credit_transactions.create({
      data: {
        user_id: user.id,
        package_id: conversationPackage.id,
        amount_usd: conversationPackage.price_usd,
        credits_amount: conversationPackage.credits_amount,
        payment_gateway: 'paypal',
        gateway_transaction_id: orderData.id, // 保存 PayPal 订单 ID
        status: 'pending',
      },
    });

    // 7. 返回支付链接给前端
    const approvalLink = orderData.links.find((link: any) => link.rel === 'approve');
    if (approvalLink) {
      return NextResponse.json({ paymentUrl: approvalLink.href });
    } else {
      return NextResponse.json({ error: 'Could not find PayPal approval link' }, { status: 500 });
    }

  } catch (error) {
    console.error('POST /api/payment/create error:', error);
    return NextResponse.json({ error: 'Internal ServerError' }, { status: 500 });
  }
}