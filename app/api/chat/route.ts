import { NextResponse } from "next/server";
import { ZhipuAI } from "zhipuai-sdk-nodejs-v4";
import { Readable } from "stream";
import { incrementUserUsage, isSiteLimitReached, incrementSiteUsage } from "../../../lib/db-supabase";

// 添加类型定义
type ChatMode = 'listening' | 'comfort' | 'challenge' | 'debate';

// 初始化智谱AI SDK
const zhipuAI = new ZhipuAI({
  apiKey: process.env.ZHIPU_API_KEY || "", // 从环境变量获取API密钥
});

// 为不同模式定义系统提示词（中文）
const zhSystemPrompts: Record<ChatMode, string> = {
  listening: "你是一个专注倾听的AI助手。你的主要任务是倾听用户的想法和感受，不要急于提供解决方案，而是通过提问和回应来鼓励用户继续表达。表现出同理心，让用户感到被理解和被重视。",
  comfort: "你是一个提供情感支持的AI助手。你的任务是理解用户的情感状态，提供温暖、理解和支持。使用温和、关怀的语气，避免过度乐观或轻视用户的感受。提供适当的安慰和鼓励，帮助用户感到被理解和支持。",
  challenge: "你是一个思维挑战型AI助手。你的任务是以友好但挑战性的方式回应用户，帮助他们从不同角度思考问题。提出有建设性的问题，指出可能被忽略的因素，但始终保持尊重和支持的态度。",
  debate: "你是一个辩论训练AI助手。你的任务是针对用户的观点提出合理的反论，帮助他们锻炼思辨能力。提供有力的反驳和不同视角，但保持礼貌和专业。目标是帮助用户加强论证能力，而非否定他们。"
};

// 为不同模式定义系统提示词（英文）
const enSystemPrompts: Record<ChatMode, string> = {
  listening: "You are an AI assistant focused on listening. Your main task is to listen to users' thoughts and feelings without rushing to provide solutions. Encourage further expression through questions and responses. Show empathy to make users feel understood and valued.",
  comfort: "You are an AI assistant providing emotional support. Your task is to understand users' emotional states and offer warmth, understanding, and support. Use a gentle, caring tone, avoiding excessive optimism or dismissing users' feelings. Provide appropriate comfort and encouragement to help users feel understood and supported.",
  challenge: "You are a thought-challenging AI assistant. Your task is to respond to users in a friendly but challenging way, helping them think about issues from different perspectives. Ask constructive questions and point out potentially overlooked factors, while maintaining a respectful and supportive attitude.",
  debate: "You are a debate training AI assistant. Your task is to present reasonable counterarguments to users' views, helping them exercise their critical thinking skills. Provide strong rebuttals and different perspectives while remaining polite and professional. The goal is to help users strengthen their argumentation skills, not to negate them."
};

// 为不同模式定义多样化的回复（中文）- 作为备用
const zhMockResponses: Record<ChatMode, string[]> = {
  listening: [
    "我在倾听你的想法。能告诉我更多吗？我理解这对你来说很重要。",
    "我明白你的感受，这确实值得关注。你能再多分享一些吗？",
    "听到你这样说，我能感受到这件事对你的影响。请继续说下去。",
    "我在这里认真听你说的每一句话。你的感受是有价值的。"
  ],
  comfort: [
    "我能理解你的感受。这确实不容易，但你已经做得很好了。也许你可以尝试给自己一些时间和空间，不要对自己太苛刻。",
    "这种情况确实很有挑战性，但我相信你有能力度过这个阶段。记得要善待自己，给自己一些关爱。",
    "面对这样的情况，你的感受是完全正常的。或许可以尝试一些让自己放松的活动，哪怕只是短暂的休息。",
    "你已经迈出了很重要的一步，就是愿意分享你的感受。这需要勇气，你做得很棒。"
  ],
  challenge: [
    "这是个有趣的观点。不过，你有没有考虑过从另一个角度看这个问题？有时候换个思路可能会带来新的发现。",
    "我理解你的立场，但这个想法可能忽略了一些重要因素。你是否考虑过其他可能性？",
    "这个想法很有价值，但让我们试着挑战一下：如果情况恰恰相反，会怎么样？",
    "从不同角度思考，你认为还有什么其他可能被忽略的因素吗？"
  ],
  debate: [
    "我理解你的立场，但让我提出一些不同的观点：首先，这个论点可能忽略了一些关键因素；其次，有一些相反的证据值得考虑。你怎么看？",
    "你的论点有一定道理，但从另一个角度看，可能存在一些逻辑漏洞。比如说，这个前提是否总是成立？",
    "这是个有力的论点，但让我作为反方提出质疑：这种情况是否适用于所有场景？有没有例外情况？",
    "我想提出一个反论：如果我们考虑更长远的影响，这个观点可能面临一些挑战。你认为呢？"
  ]
};

// 为不同模式定义多样化的回复（英文）- 作为备用
const enMockResponses: Record<ChatMode, string[]> = {
  listening: [
    "I'm listening to your thoughts. Could you tell me more? I understand this is important to you.",
    "I hear what you're saying. Would you like to share more about how you feel?",
    "I'm here to listen. Please continue sharing your thoughts.",
    "Your feelings are valid. I'm listening attentively."
  ],
  comfort: [
    "I understand how you feel. It's not easy, but you're doing well. Perhaps try giving yourself some time and space, don't be too hard on yourself.",
    "This situation is challenging, but I believe you have the strength to get through it. Remember to be kind to yourself.",
    "It's completely normal to feel this way in your situation. Maybe try some activities that help you relax, even if just for a short while.",
    "You've taken an important step by sharing your feelings. That takes courage, and you're doing great."
  ],
  challenge: [
    "That's an interesting perspective. Have you considered looking at this from another angle? Sometimes a different approach can lead to new insights.",
    "I understand your position, but this idea might overlook some important factors. Have you considered other possibilities?",
    "That's a valuable thought, but let's challenge it: what if the opposite were true?",
    "Thinking from different perspectives, what other factors might be overlooked here?"
  ],
  debate: [
    "I understand your position, but let me offer a different viewpoint: first, this argument might overlook some key factors; second, there's some contrary evidence worth considering. What do you think?",
    "Your argument has merit, but from another perspective, there might be some logical gaps. For instance, is this premise always true?",
    "That's a strong point, but allow me to challenge it: does this apply to all scenarios? Are there exceptions?",
    "Let me present a counterargument: if we consider the longer-term implications, this view might face some challenges. What's your take on that?"
  ]
};

// 辅助函数 - 处理响应行
function processLine(line: string, encoder: TextEncoder, controller: ReadableStreamDefaultController) {
  // 处理智谱AI特定的响应格式
  if (line.startsWith('data: ')) {
    // 提取data:后面的部分
    const dataContent = line.substring(6).trim();

    // 显式处理[DONE]标记
    if (dataContent === '[DONE]') {
      console.log("收到结束标记，流式响应结束");
      return;
    }

    // 尝试解析JSON
    try {
      const jsonData = JSON.parse(dataContent);
      const content = jsonData.choices?.[0]?.delta?.content || "";
      if (content) {
        console.log("提取的内容:", content);
        controller.enqueue(encoder.encode(content));
      }
    } catch (parseError) {
      // 只记录错误，不中断处理
      console.log(`跳过无法解析的数据: "${dataContent}"`);
    }
  } 
  // 处理可能的直接JSON响应
  else if (line.trim() && line.trim()[0] === '{') {
    try {
      const jsonData = JSON.parse(line);
      const content = jsonData.choices?.[0]?.delta?.content || "";
      if (content) {
        controller.enqueue(encoder.encode(content));
      }
    } catch (parseError) {
      // 如果不是JSON但看起来像有意义的内容，可能是纯文本
      if (line && !line.includes('"id":') && !line.includes('data:')) {
        controller.enqueue(encoder.encode(line));
      }
    }
  }
}

export async function POST(req: Request) {
  try {
    // 解析请求数据 - 添加clientId
    const { message, mode = "listening", locale = "zh", clientId, messages = [] } = await req.json();
    
    // 验证clientId是否存在
    if (!clientId) {
      return NextResponse.json({ error: locale === "en" ? "Missing client ID" : "缺少客户端ID" }, { status: 400 });
    }
    
    // 检查站点总量限制
    try {
      const siteLimitReached = await isSiteLimitReached();
      if (siteLimitReached) {
        const errorMessage = locale === "en" 
          ? "The site has reached its monthly API usage limit. Please try again next month."
          : "网站已达到本月API使用总量限制，请下月再试。";
        return NextResponse.json({ error: errorMessage }, { status: 429 });
      }
    } catch (error) {
      console.error("检查站点限制错误:", error);
      // 继续处理，不中断用户请求
    }

    console.log("收到请求:", { message, mode, locale, clientId });
    console.log("API密钥:", process.env.ZHIPU_API_KEY ? "已设置" : "未设置");
    
    // 确保mode是有效的ChatMode类型
    const validMode = (mode as string) in zhSystemPrompts ? (mode as ChatMode) : 'listening';
    
    try {
      // 尝试调用智谱AI API
      console.log("尝试调用智谱AI API...");
      
      // 根据当前语言选择系统提示词
      const systemPrompts = locale === "en" ? enSystemPrompts : zhSystemPrompts;
      
      // 获取当前模式的系统提示词
      const systemPrompt = systemPrompts[validMode];
      
      // 调用智谱AI API - 使用正确的方法
      const result = await zhipuAI.createCompletions({
        model: "glm-4", // 使用GLM-4模型
        messages: [
          {
            role: "system",
            content: systemPrompt
          },
          {
            role: "user",
            content: message
          }
        ],
        stream: true, // 启用流式响应
        temperature: 0.7, // 适当的温度值，可以根据需要调整
        maxTokens: 1000 // 最大生成令牌数
      });
      
      console.log("智谱AI API调用成功，开始处理响应...");
      
      // 创建流式响应
      const stream = new ReadableStream({
        async start(controller) {
          const encoder = new TextEncoder();
          
          try {
            // 修复流式处理 - 根据SDK返回类型调整
            if (result instanceof Readable) {
              // 如果是Node.js Readable流
              result.on('data', (chunk) => {
                try {
                  const chunkText = chunk.toString();
                  console.log("收到数据块:", chunkText);
                  
                  // 处理可能的多行数据
                  const lines = chunkText.split('\n').filter((line: string) => line.trim() !== '');
                  
                  for (const line of lines) {
                    processLine(line, encoder, controller);
                  }
                } catch (error) {
                  console.error("处理数据块错误:", error);
                }
              });
              
              result.on('end', () => {
                console.log("流式响应结束");
                controller.close();
              });
              
              result.on('error', (error) => {
                console.error("流错误:", error);
                controller.error(error);
              });
            } else {
              // 如果是普通响应对象
              const responseText = JSON.stringify(result);
              console.log("收到响应:", responseText);
              
              // 从响应中提取文本
              let content = "";
              if (result.choices && result.choices[0] && result.choices[0].message) {
                content = result.choices[0].message.content || "";
              }
              
              if (content) {
                controller.enqueue(encoder.encode(content));
              }
              
              controller.close();
            }
          } catch (error) {
            console.error("流式响应错误:", error);
            // 出错时发送错误信息
            controller.enqueue(encoder.encode(locale === "en" 
              ? "Sorry, there was an error processing your request." 
              : "抱歉，发生了错误。请稍后再试。"));
            controller.close();
          }
        }
      });

      // 增加使用次数 - 添加此段代码
      try {
        const origin = req.headers.get('origin') || 'http://localhost:3001';
        fetch(`${origin}/api/usage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ clientId })
        }).catch(err => console.error('记录使用次数失败', err));
      } catch (error) {
        console.error("记录使用次数错误:", error);
      }
      
      // 增加站点总使用计数
      try {
        await incrementSiteUsage();
      } catch (error) {
        console.error("增加站点用量错误:", error);
      }
      
      // 返回流式响应
      return new NextResponse(stream);
      
    } catch (error) {
      console.error("智谱AI API错误:", error);
      
      // 使用备用响应
      console.log("使用备用响应...");
      
      // 根据当前语言选择响应集
      const responses = locale === "en" ? enMockResponses : zhMockResponses;
      
      // 获取当前模式的响应数组
      const modeResponses = responses[validMode];
      
      // 随机选择一个响应
      const randomIndex = Math.floor(Math.random() * modeResponses.length);
      const response = modeResponses[randomIndex];
      
      // 创建流式响应
      const stream = new ReadableStream({
        async start(controller) {
          const encoder = new TextEncoder();
          
          // 模拟流式打字效果，一个字符一个字符地发送
          for (let i = 0; i < response.length; i++) {
            const char = response[i];
            controller.enqueue(encoder.encode(char));
            
            // 添加随机延迟模拟打字效果
            await new Promise(resolve => setTimeout(resolve, Math.random() * 50 + 10));
          }
          
          controller.close();
        }
      });
      
      // 增加使用次数 - 也记录备用响应
      try {
        const origin = req.headers.get('origin') || 'http://localhost:3001';
        fetch(`${origin}/api/usage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ clientId })
        }).catch(err => console.error('记录使用次数失败', err));
      } catch (error) {
        console.error("记录使用次数错误:", error);
      }
      
      // 增加站点总使用计数
      try {
        await incrementSiteUsage();
      } catch (error) {
        console.error("增加站点用量错误:", error);
      }
      
      // 返回流式响应
      return new NextResponse(stream);
    }
    
  } catch (error) {
    console.error("API错误:", error);
    
    // 从请求中获取locale，如果获取失败则默认为zh
    let locale = "zh";
    try {
      const { locale: reqLocale } = await req.json();
      if (reqLocale) locale = reqLocale;
    } catch (e) {
      // 忽略解析错误
    }
    
    return NextResponse.json(
      { error: locale === "en" ? "Error processing request" : "处理请求时出错" },
      { status: 500 }
    );
  }
}