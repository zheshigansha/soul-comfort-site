'use client';

import { useState } from 'react';
import { Quote } from '@/data/quotes';
import { RefreshCw } from 'lucide-react';
import { getRandomQuote } from '@/lib/quotes';
import { useTranslations } from 'next-intl';

interface QuoteCardProps {
  initialQuote: Quote;
  locale: string;
}

export function QuoteCard({ initialQuote, locale }: QuoteCardProps) {
  // 使用服务端传递的initialQuote初始化状态，确保SSR/CSR一致性
  const [quote, setQuote] = useState<Quote>(initialQuote);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const t = useTranslations('QuoteCard');
  
  // 根据当前语言选择对应的文本
  const quoteText = locale === 'en' ? quote.text.en : quote.text.zh;
  const quoteAuthor = quote.author 
    ? (locale === 'en' ? quote.author.en : quote.author.zh) 
    : undefined;
  
  // 处理刷新按钮点击 - 添加loading状态提升用户体验
  const handleRefresh = () => {
    setIsRefreshing(true);
    // 使用setTimeout模拟异步操作，提供更好的用户反馈
    setTimeout(() => {
      const newQuote = getRandomQuote();
      setQuote(newQuote);
      setIsRefreshing(false);
    }, 300);
  };

  return (
    <div className="p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-2xl w-full backdrop-blur-sm bg-opacity-70 dark:bg-opacity-70 border border-white/20 relative group">
      <button 
        onClick={handleRefresh}
        disabled={isRefreshing}
        className={`absolute top-4 right-4 p-2 rounded-full bg-purple-100 dark:bg-gray-700 text-purple-600 dark:text-purple-300 opacity-50 hover:opacity-100 transition-opacity duration-300 ${
          isRefreshing ? 'animate-spin' : 'transform hover:rotate-180'
        }`}
        aria-label={t('getNewQuote')}
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