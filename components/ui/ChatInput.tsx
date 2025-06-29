'use client';

import { useState } from 'react';
import { Send } from 'lucide-react';
import { useTranslations } from "next-intl";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  placeholder?: string;
  buttonText?: string;
}

export default function ChatInput({ 
  onSendMessage, 
  isLoading, 
  placeholder, 
  buttonText 
}: ChatInputProps) {
  const t = useTranslations("Chat");
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isLoading) {
      onSendMessage(message);
      setMessage('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2">
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder={placeholder || t("inputPlaceholder") || "输入消息..."}
        disabled={isLoading}
        className="flex-1 p-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50"
      />
      <button
        type="submit"
        disabled={!message.trim() || isLoading}
        className="p-3 rounded-xl bg-purple-600 text-white hover:bg-purple-700 disabled:bg-purple-400 transition-colors"
        aria-label={buttonText || t("send") || "发送"}
      >
        {isLoading ? (
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : (
          <Send size={20} />
        )}
      </button>
    </form>
  );
}