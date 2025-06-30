import { NextRequest, NextResponse } from 'next/server';

// 在实际项目中，这应该保存在数据库中
// 这里使用内存存储作为示例
const usageStore: { [clientId: string]: number } = {};
const DEFAULT_LIMIT = 10;

export async function GET(request: NextRequest) {
  // 从URL参数中获取clientId
  const { searchParams } = new URL(request.url);
  const clientId = searchParams.get('clientId');

  if (!clientId) {
    return NextResponse.json({ error: '缺少客户端ID' }, { status: 400 });
  }

  // 获取该客户端的使用次数
  const count = usageStore[clientId] || 0;
  
  // 这里可以根据不同条件返回不同的限制
  // 例如，根据用户是否付费来设置不同的限制
  const limit = DEFAULT_LIMIT;

  return NextResponse.json({
    clientId,
    count,
    limit,
    isLimitReached: count >= limit
  });
}

// 用于增加使用次数的端点
export async function POST(request: NextRequest) {
  const { clientId } = await request.json();

  if (!clientId) {
    return NextResponse.json({ error: '缺少客户端ID' }, { status: 400 });
  }

  // 增加使用次数
  if (!usageStore[clientId]) {
    usageStore[clientId] = 0;
  }
  usageStore[clientId] += 1;

  const count = usageStore[clientId];
  const limit = DEFAULT_LIMIT;

  return NextResponse.json({
    clientId,
    count,
    limit,
    isLimitReached: count >= limit
  });
}