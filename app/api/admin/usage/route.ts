process.env.ADMIN_KEY = "42d4089c1173f415b6ebeb58dbb16a8306d249e6a271320199e60c1bf555a20f";

import { NextResponse } from "next/server";
// import { getSiteUsage } from "@/lib/db-supabase"; // 移除数据库依赖
// import { supabase } from "@/lib/supabase"; // 移除数据库依赖

// 模拟的获取站点使用情况函数
async function getMockSiteUsage() {
  console.log("正在使用模拟的 getSiteUsage 函数");
  const currentMonth = new Date().toISOString().slice(0, 7);
  return Promise.resolve({
    month: currentMonth,
    total_count: 123, // 模拟数据
    max_limit: 1000,  // 模拟数据
  });
}

// 获取站点使用情况
export async function GET(request: Request) {
  try {
    const adminKey = request.headers.get('x-admin-key');
    if (adminKey !== process.env.ADMIN_KEY) {
      return NextResponse.json({ error: "无权访问管理员API" }, { status: 403 });
    }
    
    // 使用模拟函数
    const data = await getMockSiteUsage();
    return NextResponse.json(data);
  } catch (error) {
    console.error("获取站点使用量错误:", error);
    return NextResponse.json({ 
      error: "获取站点使用量失败",
      message: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}

// 更新站点用量限制
export async function PATCH(request: Request) {
  try {
    const { maxLimit, adminKey } = await request.json();
    if (adminKey !== process.env.ADMIN_KEY) {
      return NextResponse.json({ error: "管理员密钥无效" }, { status: 403 });
    }
    
    console.log(`模拟更新限制为: ${maxLimit}`);
    // 直接返回成功的模拟数据
    return NextResponse.json([{
      month: new Date().toISOString().slice(0, 7),
      max_limit: maxLimit,
      total_count: 123 // 维持模拟数据
    }]);
  } catch (error) {
    console.error("更新站点使用量限制错误:", error);
    return NextResponse.json({ 
      error: "更新站点使用量限制失败",
      message: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}

// 重置当月使用量计数(谨慎使用)
export async function POST(request: Request) {
  try {
    const { adminKey } = await request.json();
    if (adminKey !== process.env.ADMIN_KEY) {
      return NextResponse.json({ error: "管理员密钥无效" }, { status: 403 });
    }

    console.log("模拟重置使用量计数");
    return NextResponse.json({ 
      message: "使用量计数已成功模拟重置", 
      data: [{
        month: new Date().toISOString().slice(0, 7),
        total_count: 0, // 重置为0
        max_limit: 1000
      }] 
    });
  } catch (error) {
    console.error("重置使用量计数错误:", error);
    return NextResponse.json({ 
      error: "重置使用量计数失败",
      message: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}

// 辅助端点 - 检查环境变量是否正确加载
export async function OPTIONS() {
  try {
    const adminKeyStatus = process.env.ADMIN_KEY ? `已设置 (长度: ${process.env.ADMIN_KEY.length})` : "未设置";
    const supabaseUrlStatus = process.env.NEXT_PUBLIC_SUPABASE_URL ? "已设置" : "未设置";
    const supabaseKeyStatus = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "已设置" : "未设置";
    
    return NextResponse.json({
      envStatus: {
        adminKey: adminKeyStatus,
        supabaseUrl: supabaseUrlStatus,
        supabaseKey: supabaseKeyStatus
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json({ error: "检查环境变量失败" }, { status: 500 });
  }
}