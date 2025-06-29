"use client";

import { useState, useRef, useEffect } from "react";
import { useTranslations } from "next-intl";
import ChatMessage from "./ChatMessage";
import ChatInput from "./ChatInput";
import ModeSelector from "./ModeSelector"; // 导入模式选择器组件

export default function ChatInterface() {
  const t = useTranslations("Chat");
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState("listening"); // 默认为倾听模式
  const messagesEndRef = useRef(null);

  // 滚动到底部
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 处理模式变更
  const handleModeChange = (newMode) => {
    setMode(newMode);
    
    // 可选：添加一条系统消息，告知用户模式已更改
    const modeMessages = {
      listening: "已切换到倾听模式。我会专注于倾听您的想法，不会给出评价或建议。",
      comfort: "已切换到安慰模式。我会提供温和的支持和建议，帮助您感到安心。",
      challenge: "已切换到思维挑战模式。我会帮助您挑战思维模式，提供新的视角。",
      debate: "已切换到辩论训练模式。我会与您进行有益的辩论，帮助您锻炼思维能力。"
    };
    
    if (messages.length > 0) {
      setMessages(prev => [...prev, {
        role: "system",
        content: modeMessages[newMode]
      }]);
    }
  };

  // 发送消息
  const handleSendMessage = async (message) => {
    if (message.trim() === "") return;
    
    // 添加用户消息到列表
    setMessages(prev => [...prev, { role: "user", content: message }]);
    setIsLoading(true);
    
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          message,
          mode, // 发送当前模式
          locale: window.location.pathname.split('/')[1] || 'zh', // 从URL获取当前语言
          messages: messages.filter(msg => msg.role !== "system") // 过滤掉系统消息
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
    }
  };

  return (
    <div className="flex flex-col h-[80vh] md:h-[70vh] bg-background border rounded-lg shadow-sm">
      {/* 模式选择器 */}
      <div className="p-4 border-b">
        <ModeSelector currentMode={mode} onModeChange={handleModeChange} />
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
        <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
      </div>
    </div>
  );
}