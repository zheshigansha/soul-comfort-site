"use client";

export default function ChatMessage({ message }) {
  // 根据消息角色设置不同的样式
  const isUser = message.role === "user";
  const isSystem = message.role === "system";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[80%] rounded-lg p-3 ${
          isUser
            ? "bg-primary text-primary-foreground"
            : isSystem
            ? "bg-muted/70 text-muted-foreground text-sm italic"
            : "bg-secondary"
        }`}
      >
        {message.content}
      </div>
    </div>
  );
}