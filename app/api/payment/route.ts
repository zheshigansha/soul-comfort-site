import { NextRequest, NextResponse } from 'next/server';
import { createPaymentRecord, getUserUsage } from '../../../lib/db-supabase';

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
    await createPaymentRecord(clientId, plan, premium, referralCode);
    
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

export async function GET(request: NextRequest) {
  try {
    const clientId = request.nextUrl.searchParams.get('clientId');
    
    if (!clientId) {
      return NextResponse.json({ error: "Missing client ID" }, { status: 400 });
    }
    
    const usageData = await getUserUsage(clientId);
    
    return NextResponse.json({
      hasPremium: usageData.isPremium,
      premium: usageData.premiumData
    });
    
  } catch (error) {
    console.error("Error checking payment status:", error);
    return NextResponse.json({ error: "Failed to check payment status" }, { status: 500 });
  }
}