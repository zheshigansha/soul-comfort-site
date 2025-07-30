/**
 * 数据迁移脚本 - 将本地文件系统数据迁移到Supabase
 * 
 * 使用方法：
 * node scripts/migrate-to-supabase.js
 */

// 导入必要的模块
require('dotenv').config();
const { persistentStorage } = require('../lib/persistence');
const { logger } = require('../lib/logger');

// 确保Supabase环境变量已设置
function checkEnvironment() {
  const requiredVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY'
  ];

  const missing = requiredVars.filter(varName => !process.env[varName]);
  if (missing.length > 0) {
    logger.error(`缺少必要的环境变量: ${missing.join(', ')}`);
    logger.error('请确保在.env文件中设置了这些变量，或者在运行此脚本时提供它们');
    process.exit(1);
  }
}

// 执行迁移
async function migrate() {
  try {
    logger.info('开始数据迁移...');
    
    // 检查环境变量
    checkEnvironment();
    
    // 执行迁移
    const result = await persistentStorage.migrateToSupabase();
    
    logger.info('迁移完成！');
    logger.info(`创建用户: ${result.usersCreated}`);
    logger.info(`迁移使用记录: ${result.usageRecordsMigrated}`);
    logger.info(`迁移支付记录: ${result.paymentsMigrated}`);
    
    // 设置环境变量，标记使用Supabase
    logger.info('请在.env文件中添加以下环境变量:');
    logger.info('USE_SUPABASE_STORAGE=true');
    
    process.exit(0);
  } catch (error) {
    logger.error('迁移失败:', error);
    process.exit(1);
  }
}

// 执行迁移
migrate(); 