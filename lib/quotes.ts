// lib/quotes.ts
import { quotes, Quote } from '@/data/quotes';

/**
 * 获取一条随机的句子
 */
export function getRandomQuote(): Quote {
  const randomIndex = Math.floor(Math.random() * quotes.length);
  return quotes[randomIndex];
}

/**
 * 根据ID获取特定的句子
 */
export function getQuoteById(id: string): Quote | undefined {
  return quotes.find(quote => quote.id === id);
}

/**
 * 根据类别获取句子
 */
export function getQuotesByCategory(category: string): Quote[] {
  return quotes.filter(quote => quote.category === category);
}