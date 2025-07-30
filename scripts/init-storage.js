#!/usr/bin/env node

/**
 * 存储系统初始化脚本
 * 在项目启动前运行，确保存储系统正确设置
 * 并在需要时执行数据迁移
 */

const fs = require('fs');
const path = require('path');

// 检查环境变量
function loadEnv() {
  try {
    // Next.js 自动加载环境变量，不需要 dotenv
    console.log('✅ 使用 Next.js 内置环境变量加载');
    return true;
  } catch (error) {
    console.warn('⚠️ 环境变量加载失败');
    return false;
  }
}

async function initializeStorage() {
  console.log('🚀 初始化持久化存储系统...\n');

  try {
    // 加载环境变量
    loadEnv();

    // 检查并创建存储目录
    const dataDir = path.join(process.cwd(), '.data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
      console.log('✅ 创建数据存储目录: .data/');
    }

    // 检查存储文件
    const storageFile = path.join(dataDir, 'storage.json');
    if (!fs.existsSync(storageFile)) {
      // 创建初始存储文件
      const initialData = {
        usageCounters: {},
        paymentRecords: {},
        clientMappings: {},
        metadata: {
          version: "1.0.0",
          created: new Date().toISOString(),
          lastUpdated: new Date().toISOString()
        }
      };

      fs.writeFileSync(storageFile, JSON.stringify(initialData, null, 2));
      console.log('✅ 创建初始存储文件: storage.json');
    } else {
      console.log('✅ 存储文件已存在: storage.json');
    }

    // 设置文件权限（仅限类Unix系统）
    try {
      fs.chmodSync(dataDir, 0o755);
      fs.chmodSync(storageFile, 0o644);
      console.log('✅ 设置文件权限');
    } catch (error) {
      console.log('⚠️  跳过文件权限设置（Windows系统）');
    }

    // 创建.gitignore条目
    const gitignorePath = path.join(process.cwd(), '.gitignore');
    let gitignoreContent = '';
    
    if (fs.existsSync(gitignorePath)) {
      gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');
    }

    const gitignoreEntry = '\n# 存储数据\n.data/\n.env.local\n.env.production\n';
    
    if (!gitignoreContent.includes('.data/')) {
      fs.appendFileSync(gitignorePath, gitignoreEntry);
      console.log('✅ 更新 .gitignore');
    }

    // 检查是否需要执行数据迁移
    await checkAndMigrateData();

    console.log('\n🎉 存储系统初始化完成！');
    console.log('\n📋 下一步操作:');
    console.log('1. 运行: npm run dev');
    console.log('2. 测试持久化功能');
    console.log('3. 数据将保存在: ./.data/storage.json');

  } catch (error) {
    console.error('❌ 存储系统初始化失败:', error);
    process.exit(1);
  }
}

/**
 * 检查是否需要执行数据迁移
 * 如果环境变量USE_SUPABASE_STORAGE=true且是生产环境，则执行迁移
 */
async function checkAndMigrateData() {
  // 检查是否使用Supabase存储
  const useSupabase = process.env.USE_SUPABASE_STORAGE === 'true' || process.env.NODE_ENV === 'production';
  
  if (!useSupabase) {
    console.log('⏭️ 使用本地文件存储，跳过数据迁移');
    return;
  }

  // 检查必要的Supabase环境变量
  const requiredVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY'
  ];

  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  if (missingVars.length > 0) {
    console.warn(`⚠️ 缺少Supabase环境变量: ${missingVars.join(', ')}`);
    console.warn('⚠️ 跳过数据迁移，将使用本地文件存储');
    return;
  }

  console.log('🔄 检查数据迁移...');

  try {
    // 导入持久化存储模块
    const { persistentStorage } = require('../lib/persistence');
    
    // 检查迁移标记文件
    const migrationFlagFile = path.join(process.cwd(), '.data', 'migration_completed');
    if (fs.existsSync(migrationFlagFile)) {
      console.log('✅ 数据已迁移到Supabase');
      return;
    }

    console.log('🔄 开始将数据迁移到Supabase...');
    
    // 执行迁移
    const result = await persistentStorage.migrateToSupabase();
    
    console.log('✅ 数据迁移完成:');
    console.log(`   - 创建用户: ${result.usersCreated}`);
    console.log(`   - 迁移使用记录: ${result.usageRecordsMigrated}`);
    console.log(`   - 迁移支付记录: ${result.paymentsMigrated}`);
    
    // 创建迁移标记文件
    fs.writeFileSync(migrationFlagFile, new Date().toISOString());
    console.log('✅ 创建迁移标记文件');
    
  } catch (error) {
    console.error('❌ 数据迁移失败:', error);
    console.warn('⚠️ 将使用本地文件存储作为备选');
  }
}

// 如果是直接运行
if (require.main === module) {
  initializeStorage().catch(console.error);
}

module.exports = { initializeStorage };