process.env.ADMIN_KEY = "42d4089c1173f415b6ebeb58dbb16a8306d249e6a271320199e60c1bf555a20f";

import { NextResponse } from "next/server";
import { getSiteUsage } from "@/lib/db-supabase";
import { supabase } from "@/lib/supabase";

// 获取站点使用情况
export async function GET(request: Request) {
  try {
    // 简单验证管理员访问权限
    const adminKey = request.headers.get('x-admin-key');

    // 详细调试信息
    console.log("接收到的管理员密钥:", adminKey);
    console.log("环境变量中的密钥:", process.env.ADMIN_KEY);
    console.log("密钥比较结果:", adminKey === process.env.ADMIN_KEY);
    console.log("请求头:", Object.fromEntries(request.headers));
    
    if (adminKey !== process.env.ADMIN_KEY) {
      console.log("密钥验证失败，返回403");
      return NextResponse.json({ 
        error: "无权访问管理员API",
        providedKey: adminKey ? `${adminKey.substring(0, 3)}...${adminKey.substring(adminKey.length - 3)}` : "未提供",
        keyLength: adminKey ? adminKey.length : 0
      }, { status: 403 });
    }
    
    const data = await getSiteUsage();
    console.log("成功获取站点使用数据:", data);
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
    
    // 调试信息
    console.log("PATCH请求:", { maxLimit, adminKeyProvided: !!adminKey });
    console.log("环境变量中的密钥:", process.env.ADMIN_KEY);
    
    // 验证管理员密钥
    if (adminKey !== process.env.ADMIN_KEY) {
      console.log("PATCH - 密钥验证失败");
      return NextResponse.json({ error: "管理员密钥无效" }, { status: 403 });
    }
    
    const currentMonth = new Date().toISOString().slice(0, 7);
    console.log("更新月份:", currentMonth);
    
    const { data, error } = await supabase
      .from('site_usage')
      .update({ max_limit: maxLimit })
      .eq('month', currentMonth)
      .select();
      
    if (error) {
      console.error("Supabase更新错误:", error);
      throw error;
    }
    
    console.log("限制更新成功:", data);
    return NextResponse.json(data);
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
    
    // 调试信息
    console.log("POST请求 - 重置计数:", { adminKeyProvided: !!adminKey });
    
    // 验证管理员密钥
    if (adminKey !== process.env.ADMIN_KEY) {
      console.log("POST - 密钥验证失败");
      return NextResponse.json({ error: "管理员密钥无效" }, { status: 403 });
    }
    
    const currentMonth = new Date().toISOString().slice(0, 7);
    
    const { data, error } = await supabase
      .from('site_usage')
      .update({ total_count: 0 })
      .eq('month', currentMonth)
      .select();
      
    if (error) {
      console.error("Supabase重置错误:", error);
      throw error;
    }
    
    console.log("使用计数重置成功:", data);
    return NextResponse.json({ 
      message: "使用量计数已重置", 
      data 
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
    const adminKeyStatus = process.env.ADMIN_KEY ? 
      `已设置 (长度: ${process.env.ADMIN_KEY.length})` : "未设置";
    
    const supabaseUrlStatus = process.env.NEXT_PUBLIC_SUPABASE_URL ? 
      "已设置" : "未设置";
    
    const supabaseKeyStatus = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 
      "已设置" : "未设置";
    
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