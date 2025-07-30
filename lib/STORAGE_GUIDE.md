# 存储系统使用指南

## 📋 概述

改进后的存储系统提供了更可靠的数据持久化和恢复机制，解决了原有localStorage数据丢失的风险。

## 🏗️ 架构组件

### 1. **StorageManager** (`lib/storage-manager.ts`)
- **职责**: 核心存储管理，提供安全的数据操作
- **特性**: 重试机制、数据验证、健康检查
- **使用**: 所有数据操作的主要入口

### 2. **DataRecovery** (`lib/data-recovery.ts`)
- **职责**: 数据恢复和备份系统
- **特性**: 恢复码生成、自动备份、数据同步
- **使用**: 付费用户数据保护

### 3. **PersistentStorage** (`lib/persistence.ts`)
- **职责**: 底层数据持久化
- **特性**: 多存储策略、数据迁移
- **使用**: 由StorageManager调用

## 🚀 快速开始

### 基础用法

```typescript
import { 
  getUserUsageSafely, 
  incrementUserUsageSafely,
  storageManager 
} from '@/lib/storage';

// 获取用户数据（推荐）
const userData = await getUserUsageSafely(clientId);

// 增加使用计数（推荐）
const updatedData = await incrementUserUsageSafely(clientId);

// 健康检查
const health = await storageManager.healthCheck();
```

### 高级用法

```typescript
import { 
  generateUserRecoveryCode,
  recoverUserData,
  performSystemMaintenance 
} from '@/lib/storage';

// 为付费用户生成恢复码
const recoveryCode = await generateUserRecoveryCode(clientId);

// 使用恢复码恢复数据
const success = await recoverUserData(recoveryCode, newClientId);

// 系统维护
await performSystemMaintenance();
```

## 🔧 配置选项

### StorageStrategy

```typescript
enum StorageStrategy {
  LOCAL_ONLY = 'local_only',      // 仅本地存储
  SERVER_BACKUP = 'server_backup', // 服务器备份
  HYBRID = 'hybrid'                // 混合模式（推荐）
}
```

### 自定义配置

```typescript
import { StorageManager, StorageStrategy } from '@/lib/storage-manager';

const customManager = StorageManager.getInstance({
  strategy: StorageStrategy.HYBRID,
  autoBackupInterval: 12 * 60 * 60 * 1000, // 12小时
  maxRetries: 5,
  enableRecoveryCode: true
});
```

## 🛡️ 数据安全特性

### 1. **恢复码系统**
- 付费用户可生成恢复码
- 30天有效期
- 一次性使用
- 格式: `RC-{timestamp}-{hash}-{random}`

### 2. **自动备份**
- 定期自动备份用户数据
- 保留最近5个备份
- 支持手动触发备份

### 3. **数据同步检查**
- 检测数据一致性问题
- 自动修复常见问题
- 提供冲突报告

### 4. **重试机制**
- 数据操作失败自动重试
- 指数退避策略
- 最大重试次数限制

## 📊 监控和维护

### 健康检查

```typescript
const health = await storageManager.healthCheck();

console.log('状态:', health.status);        // 'healthy' | 'warning' | 'error'
console.log('问题:', health.issues);        // 问题列表
console.log('统计:', health.stats);         // 系统统计
```

### 数据清理

```typescript
const cleanup = await storageManager.cleanupExpiredData();

console.log('清理项目:', cleanup.cleaned);   // 清理的项目数
console.log('错误:', cleanup.errors);       // 清理过程中的错误
```

### 系统维护

```typescript
// 执行完整的系统维护
const success = await performSystemMaintenance();

// 包含：健康检查 + 数据清理 + 自动备份
```

## 🧪 测试

### 运行存储系统测试

```bash
# 运行完整测试套件
node scripts/test-storage-system.js

# 或者在npm scripts中
npm run test:storage
```

### 测试覆盖范围
- ✅ 基础数据获取
- ✅ 数据更新操作
- ✅ 系统健康检查
- ✅ 数据清理功能
- ✅ 恢复码生成和使用
- ✅ 数据迁移功能

## 🚨 故障排除

### 常见问题

1. **数据丢失**
   ```typescript
   // 使用恢复码恢复
   const success = await recoverUserData(recoveryCode, clientId);
   ```

2. **存储空间不足**
   ```typescript
   // 清理过期数据
   await storageManager.cleanupExpiredData();
   ```

3. **数据同步问题**
   ```typescript
   // 检查同步状态
   const syncResult = await dataRecovery.syncCheck(clientId);
   ```

### 错误处理

```typescript
try {
  const userData = await getUserUsageSafely(clientId);
} catch (error) {
  // 处理错误
  console.error('数据获取失败:', error.message);
  
  // 使用默认值或恢复机制
  const defaultData = {
    count: 0,
    limit: FREE_USAGE_LIMIT,
    // ...
  };
}
```

## 📈 性能优化

### 最佳实践

1. **使用安全方法**
   - 优先使用 `getUserUsageSafely()` 而不是 `getUserUsage()`
   - 使用 `incrementUserUsageSafely()` 进行计数更新

2. **定期维护**
   - 设置定期的系统维护任务
   - 监控存储空间使用情况
   - 及时清理过期数据

3. **错误处理**
   - 始终包含适当的错误处理
   - 提供用户友好的错误信息
   - 实现降级策略

4. **监控指标**
   - 定期检查系统健康状态
   - 监控数据操作成功率
   - 跟踪存储空间使用情况

## 🔄 迁移指南

### 从旧存储系统迁移

```typescript
// 旧方式
const userData = await getUserUsage(clientId);
const updated = await incrementUserUsage(clientId);

// 新方式（推荐）
const userData = await getUserUsageSafely(clientId);
const updated = await incrementUserUsageSafely(clientId);
```

### 渐进式迁移

1. 保持旧API兼容性
2. 逐步替换为新的安全方法
3. 添加监控和日志
4. 验证迁移效果
5. 移除旧代码

## 📚 API参考

详细的API文档请参考各个模块的TypeScript类型定义和注释。

---

**注意**: 这个存储系统是为了解决localStorage数据丢失问题而设计的。在生产环境中，建议配合服务器端数据库使用以获得最佳的数据持久性。