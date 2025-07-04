import { NextRequest, NextResponse } from 'next/server';
// import { getUserUsage, incrementUserUsage } from '../../../lib/db-supabase'; // <--- 移除所有数据库依赖

// 模拟获取用户使用情况
async function getMockUserUsage(clientId: string) {
  console.log(`正在为客户端 ${clientId} 使用模拟的 getUserUsage`);
  return Promise.resolve({
    clientId: clientId,
    count: 5, // 模拟已使用次数
    limit: 10 // 模拟总限制次数
  });
}

// 模拟增加用户使用情况
async function incrementMockUserUsage(clientId: string) {
  console.log(`正在为客户端 ${clientId} 使用模拟的 incrementUserUsage`);
  const currentUsage = await getMockUserUsage(clientId);
  return Promise.resolve({
    ...currentUsage,
    count: currentUsage.count + 1
  });
}

export async function GET(request: NextRequest) {
  const clientId = request.nextUrl.searchParams.get('clientId');
  
  if (!clientId) {
    return NextResponse.json({ error: "Missing client ID" }, { status: 400 });
  }
  
  try {
    // 使用模拟函数
    const usageData = await getMockUserUsage(clientId);
    return NextResponse.json(usageData);
  } catch (error) {
    console.error("Error getting usage data:", error);
    return NextResponse.json({ error: "Failed to get usage data" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const clientId = request.nextUrl.searchParams.get('clientId');
  
  if (!clientId) {
    return NextResponse.json({ error: "Missing client ID" }, { status: 400 });
  }
  
  try {
    // 使用模拟函数
    const updatedUsageData = await incrementMockUserUsage(clientId);
    return NextResponse.json(updatedUsageData);
  } catch (error) {
    console.error("Error updating usage data:", error);
    return NextResponse.json({ error: "Failed to update usage data" }, { status: 500 });
  }
}