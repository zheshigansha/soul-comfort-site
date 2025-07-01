"use client";

interface ChatMessage {
  role: 'user' | 'assistant' | 'system'; // 更精确的类型定义
  content: string;
}

// 定义聊天模式类型
type ChatMode = 'listening' | 'comfort' | 'challenge' | 'debate';

import Link from 'next/link';
import { useState, useRef, useEffect } from "react";
import { useTranslations } from "next-intl";
import ChatMessage from "./ChatMessage";
import ChatInput from "./ChatInput";
import ModeSelector from "./ModeSelector"; // 导入模式选择器组件
import { getClientId } from "../../lib/clientId"; // 添加这一行导入客户端ID

export default function ChatInterface() {
  const t = useTranslations("Chat");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<ChatMode>("listening"); // 默认为倾听模式
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  // 添加以下状态
  const [usageCount, setUsageCount] = useState(0);
  const [usageLimit, setUsageLimit] = useState(10); // 默认免费限额
  const [isLimitReached, setIsLimitReached] = useState(false);

  // 添加获取使用次数的函数
  useEffect(() => {
    const fetchUsageData = async () => {
      const clientId = getClientId();
      if (!clientId) return;
      
      try {
        const response = await fetch(`/api/usage?clientId=${clientId}`);
        if (response.ok) {
          const data = await response.json();
          setUsageCount(data.count || 0);
          setUsageLimit(data.limit || 10);
          setIsLimitReached(data.count >= data.limit);
          
          // 存储付费状态信息
          if (data.isPremium) {
            localStorage.setItem('premium_status', JSON.stringify({
              isPremium: data.isPremium,
              premiumData: data.premiumData
            }));
          }
        }
      } catch (error) {
        console.error("获取使用数据失败:", error);
      }
    };
    
    fetchUsageData();
  }, []);

  // 滚动到底部
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  // 添加检测使用限制的useEffect
  useEffect(() => {
    if (isLimitReached) {
      const locale = window.location.pathname.split('/')[1] || 'zh';
      const isEnglish = locale === 'en';
      
      // 构建升级提示
      const limitMessage = isEnglish 
        ? "<p>You've reached your free usage limit. Upgrade to continue the conversation and enjoy unlimited access.</p>" 
        : "<p>您已达到免费使用次数上限。升级后可继续对话并享受无限访问权限。</p>";
      
      const upgradeButton = `
        <div class="mt-4">
          <a href="/${locale}/upgrade" class="inline-block bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md text-sm font-medium transition-colors">
            ${isEnglish ? 'Upgrade Now' : '立即升级'}
          </a>
        </div>
      `;
      
      // 只有当最后一条消息不是升级提示时，才添加提示
      setMessages(prev => {
        const lastMsg = prev[prev.length - 1];
        if (lastMsg && lastMsg.role === "system" && lastMsg.content.includes("upgrade")) {
          return prev;
        }
        return [...prev, { 
          role: "system", 
          content: `${limitMessage} ${upgradeButton}`
        }];
      });
    }
  }, [isLimitReached]);

  // 模式消息定义
  const modeMessages: Record<ChatMode, string> = {
    listening: "已切换到倾听模式。我会专注于倾听您的想法，不会给出评价或建议。",
    comfort: "已切换到安慰模式。我会提供温和的支持和建议，帮助您感到安心。",
    challenge: "已切换到思维挑战模式。我会帮助您挑战思维模式，提供新的视角。",
    debate: "已切换到辩论训练模式。我会与您进行有益的辩论，帮助您锻炼思维能力。"
  };

  // 处理模式变更
  const handleModeChange = (newMode: string) => {
    // 确保是有效的ChatMode
    if (['listening', 'comfort', 'challenge', 'debate'].includes(newMode)) {
      setMode(newMode as ChatMode);
    
      // 可选：添加一条系统消息，告知用户模式已更改
      if (messages.length > 0) {
        setMessages(prev => [...prev, {
          role: "system",
          content: modeMessages[newMode as ChatMode]
        }]);
      }
    }
  };

  // 发送消息
  const handleSendMessage = async (message: string) => {
    if (message.trim() === "") return;
    
    // 检查使用限制
    if (isLimitReached) {
      const locale = window.location.pathname.split('/')[1] || 'zh';
      const isEnglish = locale === 'en';
      
      // 构建升级提示
      const limitMessage = isEnglish 
        ? "<p>You've reached your free usage limit. Upgrade to continue the conversation and enjoy unlimited access.</p>" 
        : "<p>您已达到免费使用次数上限。升级后可继续对话并享受无限访问权限。</p>";
      
      const upgradeButton = `
        <div class="mt-4">
          <a href="/${locale}/upgrade" class="inline-block bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md text-sm font-medium transition-colors">
            ${isEnglish ? 'Upgrade Now' : '立即升级'}
          </a>
        </div>
      `;
      
      // 只有当最后一条消息不是升级提示时，才添加提示
      setMessages(prev => {
        const lastMsg = prev[prev.length - 1];
        if (lastMsg && lastMsg.role === "system" && lastMsg.content.includes("upgrade")) {
          return prev;
        }
        return [...prev, { 
          role: "system", 
          content: `${limitMessage} ${upgradeButton}`
        }];
      });
      return;
    }
      
    // 添加用户消息到列表
    setMessages(prev => [...prev, { role: "user", content: message }]);
    setIsLoading(true);
    
    try {
      const clientId = getClientId();
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          message,
          mode, // 发送当前模式
          locale: window.location.pathname.split('/')[1] || 'zh', // 从URL获取当前语言
          messages: messages.filter(msg => msg.role !== "system"), // 过滤掉系统消息
          clientId // 添加客户端ID
        }),
      });
      
      if (!response.ok) {
        throw new Error("网络错误");
      }
      
      // 处理流式响应
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let partialResponse = "";
      
      // 添加一个空的AI回复，用于流式更新
      setMessages(prev => [...prev, { role: "assistant", content: "" }]);
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const text = decoder.decode(value);
        partialResponse += text;
        
        // 更新最后一条消息的内容
        setMessages(prev => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1].content = partialResponse;
          return newMessages;
        });
      }
      
    } catch (error) {
      console.error("发送消息失败:", error);
      setMessages(prev => [...prev, { 
        role: "system", 
        content: "抱歉，发生了错误，请稍后再试。" 
      }]);
    } finally {
      setIsLoading(false);
      
      // 更新使用次数并检查限制
      const clientId = getClientId();
      if (clientId) {
        try {
          const usageResponse = await fetch(`/api/usage?clientId=${clientId}`, {
            method: "POST" // 增加计数
          });
          
          if (usageResponse.ok) {
            const data = await usageResponse.json();
            setUsageCount(data.count);
            setUsageLimit(data.limit);
            setIsLimitReached(data.isLimitReached);
          }
        } catch (error) {
          console.error("更新使用计数失败:", error);
        }
      }
    }
  };

  return (
    <div className="flex flex-col h-[80vh] md:h-[70vh] bg-background border rounded-lg shadow-sm">
      {/* 模式选择器和使用情况 */}
      <div className="p-4 border-b flex justify-between items-center">
        <ModeSelector currentMode={mode} onModeChange={handleModeChange} />
        <div className="text-sm text-muted-foreground">
          已使用 <span className={usageCount >= usageLimit ? "text-red-500 font-bold" : ""}>{usageCount}</span>/{usageLimit} 次
        </div>
      </div>
      
      {/* 消息列表 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-muted-foreground p-4">
            {t("startConversation")}
          </div>
        ) : (
          messages.map((message, index) => (
            <ChatMessage key={index} message={message} />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      
      {/* 输入框 */}
      <div className="border-t p-4">
        <ChatInput 
          onSendMessage={handleSendMessage} 
          isLoading={isLoading}
          disabled={isLimitReached} // 添加disabled属性
        />
      </div>
    </div>
  );
}