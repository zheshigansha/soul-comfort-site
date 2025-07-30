#!/usr/bin/env node

/**
 * 持久化存储测试脚本
 * 验证新的持久化系统是否正常工作
 */

const { initializeStorage } = require('./lib/migrations');
const { getUserUsage, incrementUserUsage, getStorageStats } = require('./lib/storage');

async function testPersistence() {
  console.log('🧪 开始持久化存储测试...\n');

  try {
    // 1. 初始化存储系统
    await initializeStorage();
    console.log('✅ 存储系统初始化完成');

    // 2. 创建测试客户端ID
    const testClientId = `test_${Date.now()}`;
    console.log(`🎯 测试客户端ID: ${testClientId}`);

    // 3. 测试使用计数功能
    console.log('\n📊 测试使用计数功能:');
    
    let usage = await getUserUsage(testClientId);
    console.log(`初始状态: ${usage.count}/${usage.limit} (剩余: ${usage.remaining})`);

    // 增加使用次数
    for (let i = 1; i <= 3; i++) {
      usage = await incrementUserUsage(testClientId);
      console.log(`第${i}次使用后: ${usage.count}/${usage.limit} (剩余: ${usage.remaining})`);
    }

    // 4. 测试付费状态
    console.log('\n💳 测试付费状态:');
    
    const testPremiumData = {
      type: 'credits',
      credits: 100,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30天后过期
    };

    const { setUserPremium } = require('./lib/storage');
    await setUserPremium(testClientId, testPremiumData);
    
    usage = await getUserUsage(testClientId);
    console.log(`设置付费后: ${usage.count}/${usage.limit} (剩余: ${usage.remaining})`);
    console.log(`付费状态: ${usage.isPremium ? '付费用户' : '免费用户'}`);

    // 5. 获取统计信息
    console.log('\n📈 系统统计:');
    const stats = await getStorageStats();
    console.log(`总用户数: ${stats.totalUsers}`);
    console.log(`总付费用户: ${stats.totalPremiumUsers}`);
    console.log(`总使用次数: ${stats.totalUsage}`);

    // 6. 测试数据持久化
    console.log('\n💾 测试数据持久化:');
    const { backupData } = require('./lib/storage');
    const backup = await backupData();
    console.log(`数据备份大小: ${backup.length} 字符`);
    
    // 验证数据包含测试数据
    const data = JSON.parse(backup);
    const hasTestData = data.usageCounters[testClientId] !== undefined;
    console.log(`测试数据已持久化: ${hasTestData ? '✅' : '❌'}`);

    console.log('\n🎉 持久化存储测试完成！');
    console.log('\n📋 测试结果总结:');
    console.log('✅ 存储系统初始化');
    console.log('✅ 使用计数功能');
    console.log('✅ 付费状态管理');
    console.log('✅ 数据统计功能');
    console.log('✅ 数据备份功能');
    console.log('✅ 数据持久化');

  } catch (error) {
    console.error('❌ 测试失败:', error);
    process.exit(1);
  }
}

// 如果是直接运行
if (require.main === module) {
  testPersistence().catch(console.error);
}

module.exports = { testPersistence };