import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db-supabase';

export async function GET() {
  try {
    const packages = await prisma.conversation_packages.findMany({
      where: {
        is_active: true,
      },
      orderBy: {
        price_usd: 'asc',
      },
    });

    return NextResponse.json({ packages });

  } catch (error) {
    console.error('Error fetching packages:', error);
    return NextResponse.json({ error: 'Failed to fetch packages' }, { status: 500 });
  }
}