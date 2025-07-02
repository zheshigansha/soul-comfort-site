import { NextRequest, NextResponse } from 'next/server';
import { getUserUsage, incrementUserUsage } from '../../../lib/db-supabase';

export async function GET(request: NextRequest) {
  const clientId = request.nextUrl.searchParams.get('clientId');
  
  if (!clientId) {
    return NextResponse.json({ error: "Missing client ID" }, { status: 400 });
  }
  
  try {
    const usageData = await getUserUsage(clientId);
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
    const updatedUsageData = await incrementUserUsage(clientId);
    return NextResponse.json(updatedUsageData);
  } catch (error) {
    console.error("Error updating usage data:", error);
    return NextResponse.json({ error: "Failed to update usage data" }, { status: 500 });
  }
}