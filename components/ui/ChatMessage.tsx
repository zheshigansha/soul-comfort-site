"use client";

export default function ChatMessage({ message }) {
  // 根据消息角色设置不同的样式
  const isUser = message.role === "user";
  const isSystem = message.role === "system";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      {isSystem ? (
        // 系统消息使用HTML渲染
      <div
        className="max-w-[80%] rounded-lg p-3 bg-muted/70 text-muted-foreground text-sm italic"
        dangerouslySetInnerHTML={{ __html: message.content }}
      />
    ) : (
      // 用户和AI消息使用普通文本
      <div
          className={`max-w-[80%] rounded-lg p-3 ${
            isUser
              ? "bg-primary text-primary-foreground"
              : "bg-secondary"
          }`}
        >
          {message.content}
        </div>
      )}
    </div>
  );
}