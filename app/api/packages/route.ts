import { NextResponse } from 'next/server';

// 模拟套餐数据
const mockPackages = [
  {
    id: "pkg_basic",
    name: "基础套餐",
    price: 9.99,
    credits: 100,
    description: "适合偶尔使用的用户"
  },
  {
    id: "pkg_standard",
    name: "标准套餐",
    price: 19.99,
    credits: 250,
    description: "我们最受欢迎的套餐"
  },
  {
    id: "pkg_premium",
    name: "高级套餐",
    price: 49.99,
    credits: 1000,
    description: "适合重度使用的用户"
  }
];

export async function GET() {
  try {
    // 返回模拟数据
    return NextResponse.json({ packages: mockPackages });
  } catch (error) {
    console.error('Error fetching packages:', error);
    return NextResponse.json({ error: 'Failed to fetch packages' }, { status: 500 });
  }
}