// 配置导出
export {
  locales,
  defaultLocale,
  localeNames,
  isValidLocale,
  getValidLocale
} from './config';

// 类型导出
export type {
  Locale
} from './config';

// 客户端工具函数导出
export {
  useCurrentLocale,
  useSwitchLocalePath,
  useLocaleSwitch
} from './utils/clientHelpers'; 