/**
 * 组件根级导出管理
 * 提供整个应用的组件导出入口
 */

// UI基础组件
export * from './ui';

// 通用组件
export * from './common';

// 布局组件
export * from './layouts';

// 功能组件
export * from './features';

// 组件分类说明
export const COMPONENT_CATEGORIES = {
  UI: 'Basic UI components (buttons, inputs, cards, etc.)',
  COMMON: 'Reusable common components (QuoteCard, etc.)',
  LAYOUTS: 'Layout and navigation components (Navbar, etc.)',
  FEATURES: 'Feature-specific components (Chat, Payment, etc.)'
} as const;