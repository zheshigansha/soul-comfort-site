import { NextRequest, NextResponse } from 'next/server';
import { paymentRecords, getUserUsage } from '../../../lib/storage';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { clientId, plan, referralCode } = body;
    
    if (!clientId) {
      return NextResponse.json({ error: "Missing client ID" }, { status: 400 });
    }
    
    // 创建支付记录 (实际环境中会与支付网关集成)
    const paymentId = `payment_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const now = new Date();
    
    // 根据计划设置权益
    let premium = {};
    
    if (plan === 'monthly') {
      // 月度订阅 - 30天无限制
      const expiryDate = new Date(now);
      expiryDate.setDate(expiryDate.getDate() + 30);
      
      premium = {
        type: 'subscription',
        expiresAt: expiryDate.toISOString(),
        unlimited: true
      };
    } else if (plan.startsWith('credits')) {
      // 积分套餐
      let credits = 0;
      if (plan === 'credits100') credits = 100;
      else if (plan === 'credits500') credits = 500;
      else if (plan === 'credits1000') credits = 1000;
      
      premium = {
        type: 'credits',
        credits,
        unlimited: false
      };
    }
    
    // 保存支付记录
    const record = {
      id: paymentId,
      clientId,
      plan,
      premium,
      createdAt: now.toISOString(),
      referralCode: referralCode || undefined
    };
    
    paymentRecords.set(clientId, record);
    
    // 在实际环境中，这里会返回来自支付网关的响应
    // 在测试环境中，我们直接模拟支付成功
    
    return NextResponse.json({
      success: true,
      paymentId,
      premium,
      message: "Payment processed successfully"
    });
    
  } catch (error) {
    console.error("Payment processing error:", error);
    return NextResponse.json({ error: "Payment processing failed" }, { status: 500 });
  }
}

// 获取支付状态
export async function GET(request: NextRequest) {
  try {
    const clientId = request.nextUrl.searchParams.get('clientId');
    
    if (!clientId) {
      return NextResponse.json({ error: "Missing client ID" }, { status: 400 });
    }
    
    // 直接使用共享存储中的getUserUsage获取状态
    const { isPremium, premiumData } = getUserUsage(clientId);
    
    return NextResponse.json({
      hasPremium: isPremium,
      premium: premiumData
    });
    
  } catch (error) {
    console.error("Error checking payment status:", error);
    return NextResponse.json({ error: "Failed to check payment status" }, { status: 500 });
  }
}