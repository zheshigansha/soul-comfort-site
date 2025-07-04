import { NextResponse } from "next/server";

type ChatMode = 'listening' | 'comfort' | 'challenge' | 'debate';

// 为不同模式定义系统提示词（中文） - 保留用于模拟逻辑
const zhSystemPrompts: Record<ChatMode, string> = {
  listening: "你是一个专注倾听的AI助手。",
  comfort: "你是一个提供情感支持的AI助手。",
  challenge: "你是一个思维挑战型AI助手。",
  debate: "你是一个辩论训练AI助手。"
};

// 为不同模式定义多样化的模拟回复（中文）
const zhMockResponses: Record<ChatMode, string[]> = {
  listening: [
    "嗯嗯，我在听。", "我明白...", "然后呢？", "原来是这样。", "继续说，我在这里。"
  ],
  comfort: [
    "没关系，都会好起来的。", "抱抱你。", "这一定很难熬吧。", "你已经做得很棒了。", "别担心，有我陪着你。"
  ],
  challenge: [
    "但你有没有想过，万一...？", "从另一个角度看呢？", "这真的是唯一的解释吗？", "如果事实恰好相反会怎样？"
  ],
  debate: [
    "我反对。因为第一...", "你的论据站不住脚。", "这个前提本身就有问题。", "恕我直言，这个逻辑不通。"
  ]
};

// 为不同模式定义多样化的模拟回复（英文）
const enMockResponses: Record<ChatMode, string[]> = {
  listening: [
    "Mmm-hmm, I'm listening.", "I see...", "And then?", "So that's how it is.", "Go on, I'm here."
  ],
  comfort: [
    "It's okay, everything will be alright.", "Hugs.", "That must be tough.", "You've done great.", "Don't worry, I'm with you."
  ],
  debate: [
    "I disagree. Firstly...", "Your argument doesn't hold up.", "The premise itself is flawed.", "With all due respect, that logic is faulty."
  ],
  challenge: [
    "But have you ever thought, what if...?", "What about from another perspective?", "Is that really the only explanation?", "What if the opposite were true?"
  ]
};


export async function POST(req: Request) {
  // 单独声明 locale 以便 catch 块可以访问
  let locale = 'zh'; 
  
  try {
    const body = await req.json();
    locale = body.locale || 'zh'; // 更新 locale
    const { message, mode = "listening", clientId } = body;
    
    if (!clientId) {
      return NextResponse.json({ error: locale === "en" ? "Missing client ID" : "缺少客户端ID" }, { status: 400 });
    }
    
    // 确保mode有效
    const validMode = (mode as string) in zhSystemPrompts ? (mode as ChatMode) : 'listening';
    
    // 根据语言和模式选择模拟回复
    const mockResponses = locale === "en" ? enMockResponses : zhMockResponses;
    const responsesForMode = mockResponses[validMode];
    const randomResponse = responsesForMode[Math.floor(Math.random() * responsesForMode.length)];

    // 模拟一个流式响应
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        const chunks = randomResponse.split(''); // 将回复拆分成单个字符
        
        for (const chunk of chunks) {
          controller.enqueue(encoder.encode(chunk));
          // 模拟打字延迟
          await new Promise(resolve => setTimeout(resolve, 50)); 
        }
        
        controller.close();
      }
    });

    return new Response(stream, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });

  } catch (error) {
    console.error("模拟聊天API出错:", error);
    // 关键改动：使用在 try-catch 外部定义的 locale 变量
    const errorMessage = locale === "en" 
      ? "Sorry, an unexpected error occurred in the mock chat."
      : "抱歉，模拟聊天时发生未知错误。";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}