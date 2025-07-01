import { NextRequest, NextResponse } from 'next/server';
import { getUserUsage, incrementUserUsage } from '../../../lib/storage';

export async function GET(request: NextRequest) {
  const clientId = request.nextUrl.searchParams.get('clientId');
  
  if (!clientId) {
    return NextResponse.json({ error: "Missing client ID" }, { status: 400 });
  }
  
  // 使用共享存储获取使用数据
  const usageData = getUserUsage(clientId);
  
  return NextResponse.json(usageData);
}

export async function POST(request: NextRequest) {
  const clientId = request.nextUrl.searchParams.get('clientId');
  
  if (!clientId) {
    return NextResponse.json({ error: "Missing client ID" }, { status: 400 });
  }
  
  // 增加使用计数并返回更新后的数据
  const updatedUsageData = incrementUserUsage(clientId);
  
  return NextResponse.json(updatedUsageData);
}