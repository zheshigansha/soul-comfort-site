"use client";

import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { getClientId } from '@/lib/client-id-manager';
import { ChatMessage as ChatMessageType } from './ChatMessage';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { ModeSelector } from './ModeSelector';

// 定义聊天模式类型
type ChatMode = 'listening' | 'comfort' | 'challenge' | 'debate';

export function ChatInterface() {
  const t = useTranslations('Chat');
  const tModes = useTranslations('Modes');
  // 使用window.location.pathname获取当前语言，避免使用useLocale()
  const getLocale = () => {
    const path = window.location.pathname.split('/');
    return path[1] === 'en' ? 'en' : 'zh';
  };
  const locale = getLocale();
  
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<ChatMode>("listening"); // 默认为倾听模式
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  // 添加以下状态
  const [usageCount, setUsageCount] = useState(0);
  const [usageLimit, setUsageLimit] = useState(10); // 默认免费限额
  const [isLimitReached, setIsLimitReached] = useState(false);

  // 添加获取使用次数的函数
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

  // 初始化时获取使用数据
  useEffect(() => {
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
      // 构建升级提示
      const limitMessage = t('limitReachedMessage');
      
      const upgradeButton = `
        <div class="mt-4">
          <a href="/${locale}/upgrade" class="inline-block bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md text-sm font-medium transition-colors">
            ${t('upgradeNow')}
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
  }, [isLimitReached, locale, t]);

  // 模式消息定义
  const modeMessages: Record<ChatMode, string> = {
    listening: tModes('listeningModeMessage'),
    comfort: tModes('comfortModeMessage'),
    challenge: tModes('challengeModeMessage'),
    debate: tModes('debateModeMessage')
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

  // 处理发送消息
  const handleSendMessage = async (message: string) => {
    if (isLoading || isLimitReached) return;
    
    // 添加用户消息到列表
    setMessages(prev => [...prev, { role: "user", content: message }]);
    
    // 如果是第一条消息，添加模式介绍
    if (messages.length === 0) {
      setMessages(prev => [...prev, { 
        role: "system", 
        content: modeMessages[mode] 
      }]);
    }
    
    setIsLoading(true);
    
    try {
      const clientId = getClientId();
      if (!clientId) {
        throw new Error("无法获取客户端ID");
      }
      
      // 调用API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          mode,
          clientId,
          locale
        }),
      });
      
      // 处理限额达到的情况
      if (response.status === 429) {
        const data = await response.json();
        setIsLimitReached(true);
        throw new Error(data.error || t('limitReachedMessage'));
      }
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      // 处理流式响应
      if (response.body) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let result = '';
        
        // 添加一个空的AI消息作为占位符
        setMessages(prev => [...prev, { role: "assistant", content: "" }]);
        
        while (true) {
          const { done, value } = await reader.read();
          
          if (done) {
            break;
          }
          
          // 将新的文本块添加到结果中
          const chunk = decoder.decode(value, { stream: true });
          result += chunk;
          
          // 更新最后一条消息的内容
          setMessages(prev => {
            const newMessages = [...prev];
            const lastMessage = newMessages[newMessages.length - 1];
            if (lastMessage && lastMessage.role === "assistant") {
              lastMessage.content = result;
            }
            return newMessages;
          });
        }
      } else {
        throw new Error("No response body");
      }
      
      // 每次成功对话后，刷新用户使用情况
      await fetchUsageData();
      
    } catch (error) {
      console.error("发送消息失败:", error);
      
      // 添加错误消息
      setMessages(prev => [...prev, { 
        role: "system", 
        content: error instanceof Error ? error.message : t('errorMessage')
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[80vh] md:h-[70vh] bg-background border rounded-lg shadow-sm">
      {/* 模式选择器和使用情况 */}
      <div className="p-4 border-b flex justify-between items-center">
        <ModeSelector currentMode={mode} onModeChange={handleModeChange} />
        <div className="text-sm text-muted-foreground">
          {t('usageCounter', { count: usageCount, limit: usageLimit })}
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