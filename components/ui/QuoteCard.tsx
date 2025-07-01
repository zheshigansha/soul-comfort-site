'use client';

import { useState } from 'react';
import { Quote } from '@/data/quotes';
import { RefreshCw } from 'lucide-react';
import { getRandomQuote } from '@/lib/quotes';

interface QuoteCardProps {
  initialQuote: Quote;
  locale: string;
}

export function QuoteCard({ initialQuote, locale }: QuoteCardProps) {
  const [quote, setQuote] = useState<Quote>(initialQuote);
  
  // 根据当前语言选择对应的文本
  const quoteText = locale === 'en' ? quote.text.en : quote.text.zh;
  const quoteAuthor = quote.author 
    ? (locale === 'en' ? quote.author.en : quote.author.zh) 
    : undefined;
  
  // 处理刷新按钮点击
  const handleRefresh = () => {
    const newQuote = getRandomQuote();
    setQuote(newQuote);
  };

  return (
    <div className="p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-2xl w-full backdrop-blur-sm bg-opacity-70 dark:bg-opacity-70 border border-white/20 relative group">
      <button 
        onClick={handleRefresh}
        className="absolute top-4 right-4 p-2 rounded-full bg-purple-100 dark:bg-gray-700 text-purple-600 dark:text-purple-300 opacity-50 hover:opacity-100 transition-opacity transform hover:rotate-180 duration-300"
        aria-label="Get new quote"
      >
        <RefreshCw size={16} />
      </button>
      
      <p className="text-xl text-gray-700 dark:text-gray-300 italic">
          &quot;{quoteText}&quot;
      </p>
      
      {quoteAuthor && (
        <p className="mt-4 text-right text-gray-500 dark:text-gray-400">
          — {quoteAuthor}
        </p>
      )}
    </div>
  );
}