import { ZhipuAI } from 'zhipuai-sdk-nodejs-v4';
import { logger } from './logger';

import { EnvValidator } from './env-validation';

// 获取API密钥
const apiKey = EnvValidator.getString('ZHIPU_API_KEY');
if (!apiKey && EnvValidator.isProduction()) {
  logger.error('ZHIPU_API_KEY is not defined in environment variables');
}

// 创建智谱AI客户端实例
const zhipuClient = new ZhipuAI({
  apiKey: apiKey || 'dummy_key_for_development',
});

/**
 * 生成聊天回复
 * @param messages 消息历史
 * @param options 其他选项
 * @returns 流式响应
 */
export async function generateChatResponse(
  messages: Array<{role: string, content: string}>,
  options: {
    temperature?: number;
    stream?: boolean;
    locale?: string;
  } = {}
) {
  try {
    // 开发环境检查
    if (!apiKey && EnvValidator.isProduction()) {
      throw new Error('API key not configured');
    }

    // 调用GLM-4模型
    const response = await zhipuClient.createCompletions({
      model: 'glm-4',
      messages: messages as any, // 临时类型断言，避免类型冲突
      temperature: options.temperature || 0.7,
      stream: options.stream !== undefined ? options.stream : true,
      topP: 0.95,
    });
    
    return response;
  } catch (error) {
    logger.error('AI API Error:', error instanceof Error ? error : new Error(String(error)));
    throw error;
  }
}

/**
 * 为不同模式生成系统提示词
 * @param mode 对话模式
 * @param locale 语言
 * @returns 系统提示词
 */
export function getSystemPrompt(mode: string, locale: string): string {
  const systemPrompts: Record<string, Record<string, string>> = {
    listening: {
      en: "You are an empathetic AI assistant focused on listening. Your goal is to be a supportive listener who provides a safe space for the user to express themselves. Respond with brief, understanding comments that encourage the user to continue sharing.",
      zh: "你是一个专注倾听的AI助手。你的目标是成为一个支持性的倾听者，为用户提供一个安全的表达空间。用简短、理解的评论回应，鼓励用户继续分享。"
    },
    comfort: {
      en: "You are an AI assistant providing emotional support. Your goal is to comfort the user and help them feel better. Respond with empathy, validation, and gentle encouragement.",
      zh: "你是一个提供情感支持的AI助手。你的目标是安慰用户，帮助他们感觉更好。以同理心、认可和温和的鼓励来回应。"
    },
    challenge: {
      en: "You are a thought-provoking AI assistant. Your goal is to challenge the user's thinking in a constructive way. Ask questions that help them see different perspectives and think more deeply.",
      zh: "你是一个引发思考的AI助手。你的目标是以建设性的方式挑战用户的思维。提出能帮助他们看到不同角度并更深入思考的问题。"
    },
    debate: {
      en: "You are a debate coach AI assistant. Your goal is to help the user strengthen their arguments. Respond with constructive criticism, point out logical fallacies, and suggest stronger counterarguments.",
      zh: "你是一个辩论教练AI助手。你的目标是帮助用户加强他们的论点。提供建设性的批评，指出逻辑谬误，并建议更有力的反驳论点。"
    }
  };

  // 获取对应模式和语言的提示词，如果不存在则使用默认值
  return systemPrompts[mode]?.[locale] || 
         systemPrompts.listening[locale] || 
         systemPrompts.listening.en;
}
