import { NextResponse } from "next/server";

// 为不同模式定义多样化的回复（中文）
const zhMockResponses = {
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

// 为不同模式定义多样化的回复（英文）
const enMockResponses = {
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

export async function POST(req: Request) {
  try {
    // 解析请求数据
    const { message, mode = "listening", locale = "zh" } = await req.json();
    
    // 根据当前语言选择响应集
    const responses = locale === "en" ? enMockResponses : zhMockResponses;
    
    // 获取当前模式的响应数组
    const modeResponses = responses[mode] || responses.listening;
    
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
    
    // 返回流式响应
    return new NextResponse(stream);
    
  } catch (error) {
    console.error("API错误:", error);
    return NextResponse.json(
      { error: "处理请求时出错" },
      { status: 500 }
    );
  }
}