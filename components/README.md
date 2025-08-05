# 组件架构说明

## 📁 目录结构

```
components/
├── ui/                 # 基础UI组件
│   ├── button.tsx     # 按钮组件
│   ├── card.tsx       # 卡片组件
│   ├── input.tsx      # 输入框组件
│   ├── progress.tsx   # 进度条组件
│   ├── tabs.tsx       # 标签页组件
│   └── index.tsx      # UI组件统一导出
├── common/            # 通用组件
│   ├── QuoteCard.tsx  # 引言卡片组件
│   ├── ErrorMessage.tsx # 错误信息组件
│   ├── LoadingState.tsx # 加载状态组件
│   └── index.tsx      # 通用组件统一导出
├── layouts/           # 布局组件
│   ├── Navbar.tsx     # 导航栏组件
│   ├── LocaleSwitcher.tsx # 语言切换组件
│   └── index.tsx      # 布局组件统一导出
├── features/          # 功能组件
│   ├── chat/          # 聊天功能组件
│   ├── payment/       # 支付功能组件
│   ├── pricing/       # 定价功能组件
│   └── index.tsx      # 功能组件统一导出
├── chat/              # 聊天专用组件
│   ├── ChatInterface.tsx # 聊天界面组件
│   ├── MessageList.tsx   # 消息列表组件
│   ├── ChatInput.tsx     # 聊天输入组件
│   └── index.ts          # 聊天组件导出
├── framework/         # 架构框架组件
│   ├── component-architecture.ts # 组件架构定义
│   ├── data-flow-manager.ts     # 数据流管理
│   └── component-testing.ts     # 组件测试框架
└── index.tsx          # 根级组件导出
```

## 🏗️ 组件分层原则

### 1. **UI层 (ui/)**
- **职责**: 提供基础的、无业务逻辑的UI组件
- **特点**: 高度可复用、样式统一、无状态或简单状态
- **示例**: Button, Input, Card, Progress
- **依赖**: 只依赖样式库(Tailwind)和基础React

### 2. **通用层 (common/)**
- **职责**: 提供跨功能模块使用的通用组件
- **特点**: 包含一定业务逻辑、可在多个页面使用
- **示例**: QuoteCard, LoadingSpinner, ErrorBoundary
- **依赖**: 可依赖UI层组件和通用工具函数

### 3. **布局层 (layouts/)**
- **职责**: 提供页面布局和导航相关组件
- **特点**: 控制页面结构、导航逻辑、全局状态
- **示例**: Navbar, Sidebar, Footer, LocaleSwitcher
- **依赖**: 可依赖UI层、通用层组件和路由

### 4. **功能层 (features/)**
- **职责**: 提供特定功能模块的组件
- **特点**: 包含复杂业务逻辑、功能相对独立
- **示例**: ChatInterface, PaymentForm, UserProfile
- **依赖**: 可依赖所有其他层的组件

### 5. **专用层 (chat/)**
- **职责**: 提供聊天功能的专用组件
- **特点**: 高度专业化、性能优化、功能完整
- **示例**: ChatInterface, MessageList, ChatInput
- **依赖**: 可依赖UI层、通用层组件

### 6. **框架层 (framework/)**
- **职责**: 提供架构级别的组件和工具
- **特点**: 系统级功能、开发工具、测试框架
- **示例**: ComponentArchitecture, DataFlowManager, ComponentTesting
- **依赖**: 独立模块，为其他层提供支持

## 📦 导入规范

### ✅ 推荐的导入方式

```typescript
// 从根级导入（推荐）
import { Button, Card, ChatInterface } from '@/components';

// 从分类导入（也可以）
import { Button } from '@/components/ui';
import { ChatInterface } from '@/components/features';
```

### ❌ 不推荐的导入方式

```typescript
// 直接从文件导入（不推荐）
import { Button } from '@/components/ui/button';
import { ChatInterface } from '@/components/features/chat/ChatInterface';
```

## 🔄 组件依赖关系

```
framework/ ──────────────────────────────────────┐
                                                  │
features/ ──┐                                     │
            ├──→ layouts/ ──┐                     │
            │               ├──→ common/ ──→ ui/ ──┘
            └───────────────┘
                            
chat/ ──────────────────────→ common/ ──→ ui/
```

- **UI层**: 不依赖其他组件层
- **通用层**: 只依赖UI层
- **布局层**: 依赖UI层和通用层
- **功能层**: 可依赖所有其他层
- **专用层**: 依赖UI层和通用层
- **框架层**: 独立层，为所有层提供支持

## 🛠️ 开发指南

### 新增组件时的决策流程

1. **是否是纯UI组件？** → 放入 `ui/`
2. **是否跨多个功能使用？** → 放入 `common/`
3. **是否是布局导航相关？** → 放入 `layouts/`
4. **是否是特定功能组件？** → 放入 `features/`

### 组件命名规范

- **文件名**: PascalCase (如: `ChatInterface.tsx`)
- **组件名**: PascalCase (如: `ChatInterface`)
- **导出**: 使用命名导出，避免默认导出

### 类型定义规范

```typescript
// 组件Props类型定义
interface ChatInterfaceProps {
  // props定义
}

// 导出组件和类型
export { ChatInterface, type ChatInterfaceProps };
```

## 🔍 维护指南

### 定期检查事项

1. **依赖关系**: 确保组件依赖关系符合分层原则
2. **导出管理**: 确保所有组件都通过index.tsx正确导出
3. **重复组件**: 检查是否有功能重复的组件需要合并
4. **未使用组件**: 清理不再使用的组件

### 重构建议

- 当组件变得过于复杂时，考虑拆分为更小的组件
- 当多个组件有相似逻辑时，考虑提取为通用组件
- 定期review组件的职责边界，确保符合分层原则

---

## 📋 里程碑记录

**创建时间**: 2025-08-01  
**版本**: v1.0 - 组件架构优化完成  
**状态**: ✅ 稳定版本

### 主要成就
- ✅ 解决了路由404问题
- ✅ 修复了Object.keys()错误  
- ✅ 优化了i18n配置
- ✅ 建立了组件分层架构
- ✅ 创建了完整的组件文档
- ✅ 实现了统一的导入导出规范
- ✅ 完成了架构修复项目(2025年1月)
- ✅ 建立了完整的质量保障体系
- ✅ 实现了标准化的开发流程

### 回滚说明
如果需要回滚到此稳定版本，请参考 `.kiro/milestones/` 目录中的里程碑记录。