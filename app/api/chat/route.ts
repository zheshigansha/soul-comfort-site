import { NextResponse } from "next/server";
import { generateChatResponse, getSystemPrompt } from "@/lib/creem-client";
import { logger } from "@/lib/logger";
import { getUserUsage, incrementUserUsage } from "@/lib/storage";
import { clientStorage } from "@/lib/client-storage";
import { 
  createErrorResponse, 
  ApiErrorCode,
  validateRequiredParams,
  getLocalizedErrorMessage
} from "@/lib/api-response";

// 强制动态渲染
export const dynamic = 'force-dynamic'

type ChatMode = 'listening' | 'comfort' | 'challenge' | 'debate';

export async function POST(req: Request) {
  let locale = 'zh'; 
  
  try {
    const body = await req.json();
    locale = body.locale || 'zh';
    const { message, mode = "listening", clientId } = body;
    
    // 验证必需参数
    const validation = validateRequiredParams({ message, clientId }, ['message', 'clientId']);
    if (!validation.isValid) {
      return createErrorResponse(
        getLocalizedErrorMessage(ApiErrorCode.MISSING_PARAMS, locale),
        ApiErrorCode.MISSING_PARAMS
      );
    }
    
    // 验证客户端ID
    if (!clientStorage.validate(clientId)) {
      return createErrorResponse(
        locale === "en" ? "Invalid client ID format" : "无效的客户端ID格式",
        ApiErrorCode.INVALID_PARAMS
      );
    }
    
    // 检查用户使用量是否已达到限制
    const usageData = await getUserUsage(clientId);
    if (usageData.isLimitReached) {
      const errorMessage = locale === "en" 
        ? "Usage limit reached. Please upgrade to continue."
        : "已达到使用限制。请升级以继续使用。";
      return createErrorResponse(errorMessage, ApiErrorCode.RATE_LIMITED);
    }
    
    // 确保mode有效
    const validMode = ['listening', 'comfort', 'challenge', 'debate'].includes(mode as string) ? mode as ChatMode : 'listening';
    
    // 获取系统提示词
    const systemPrompt = getSystemPrompt(validMode, locale);
    
    // 构建消息数组
    const messages = [
      { role: "system", content: systemPrompt },
      { role: "user", content: message }
    ];
    
    // 调用AI服务
    logger.info(`Calling AI service with mode: ${validMode}, locale: ${locale}`);
    const aiResponse = await generateChatResponse(messages, { 
      stream: true,
      temperature: 0.7
    });
    
    // 【新增】AI服务调用成功后，增加用户使用计数
    // 使用 void 操作符确保这是一个非阻塞操作，不影响响应返回
    void incrementUserUsage(clientId).catch(err => {
      logger.error(`Failed to increment usage for client ${clientId}:`, err);
    });
    
    // 返回流式响应
    return new Response(aiResponse as any, {
      headers: { 'Content-Type': 'text/event-stream' },
    });

  } catch (error) {
    logger.error("AI Chat API error:", error instanceof Error ? error : new Error(String(error)));
    const errorMessage = locale === "en" 
      ? "Sorry, an unexpected error occurred in the AI service."
      : "抱歉，AI服务发生未知错误。";
    return createErrorResponse(errorMessage, ApiErrorCode.EXTERNAL_API_ERROR);
  }
}