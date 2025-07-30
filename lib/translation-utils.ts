/**
 * 翻译工具函数
 * 提供安全的翻译处理和错误降级
 */

import { useTranslations } from 'next-intl';

/**
 * 安全的翻译钩子
 * 当翻译键不存在时提供降级处理
 */
export function useSafeTranslations(namespace: string) {
  const t = useTranslations(namespace);
  
  return (key: string, fallback?: string) => {
    try {
      const translation = t(key);
      // 如果翻译返回的是键本身（表示未找到翻译），使用降级
      if (translation === key && fallback) {
        return fallback;
      }
      return translation;
    } catch (error) {
      console.warn(`Translation missing: ${namespace}.${key}`);
      return fallback || key;
    }
  };
}

/**
 * 翻译键验证函数
 * 检查翻译键是否存在
 * 注意：这个函数只能在React组件内部使用
 */
export function useValidateTranslationKey(namespace: string, key: string): boolean {
  try {
    const t = useTranslations(namespace);
    const result = t(key);
    return result !== key; // 如果返回键本身，说明翻译不存在
  } catch {
    return false;
  }
}

/**
 * 批量翻译函数
 * 安全地获取多个翻译键
 */
export function useBatchTranslations(namespace: string, keys: string[], fallbacks: Record<string, string> = {}) {
  const t = useTranslations(namespace);
  
  return keys.reduce((acc, key) => {
    try {
      const translation = t(key);
      acc[key] = translation === key ? (fallbacks[key] || key) : translation;
    } catch {
      acc[key] = fallbacks[key] || key;
    }
    return acc;
  }, {} as Record<string, string>);
}