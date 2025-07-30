import { cn } from "@/lib/utils";

// 定义消息类型
export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

interface ChatMessageProps {
  message: ChatMessage;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";
  const isSystem = message.role === "system";
  
  // 系统消息使用特殊样式
  if (isSystem) {
    return (
      <div className="p-3 bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800 rounded-lg text-center text-sm">
        <div dangerouslySetInnerHTML={{ __html: message.content }} />
      </div>
    );
  }
  
  return (
    <div className={cn(
      "flex",
      isUser ? "justify-end" : "justify-start"
    )}>
      <div className={cn(
        "max-w-[80%] rounded-2xl p-4",
        isUser ? "bg-purple-600 text-white" : "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
      )}>
        {message.content}
      </div>
    </div>
  );
} 