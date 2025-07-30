#!/usr/bin/env node

/**
 * 存储系统测试脚本
 * 测试改进后的存储系统的各项功能
 */

// 使用CommonJS导入方式
const { storageManager } = require('../lib/storage-manager');
const { dataRecovery } = require('../lib/data-recovery');

async function testStorageSystem() {
  console.log('🧪 开始存储系统测试...\n');
  
  const testClientId = 'test-client-' + Date.now();
  let passed = 0;
  let failed = 0;
  
  // 测试1: 基础数据获取
  try {
    console.log('📋 测试1: 基础数据获取');
    const result = await storageManager.getUserDataSafely(testClientId);
    
    if (result.success && result.data) {
      console.log('✅ 基础数据获取成功');
      passed++;
    } else {
      throw new Error('数据获取失败');
    }
  } catch (error) {
    console.log('❌ 基础数据获取失败:', error.message);
    failed++;
  }
  
  // 测试2: 数据更新
  try {
    console.log('\n📝 测试2: 数据更新');
    const updateSuccess = await storageManager.updateUserDataSafely(
      testClientId,
      (data) => ({
        ...data,
        count: data.count + 1
      })
    );
    
    if (updateSuccess) {
      console.log('✅ 数据更新成功');
      passed++;
    } else {
      throw new Error('数据更新失败');
    }
  } catch (error) {
    console.log('❌ 数据更新失败:', error.message);
    failed++;
  }
  
  // 测试3: 健康检查
  try {
    console.log('\n🏥 测试3: 系统健康检查');
    const health = await storageManager.healthCheck();
    
    console.log(`   状态: ${health.status}`);
    console.log(`   问题数: ${health.issues.length}`);
    
    if (health.status !== 'error') {
      console.log('✅ 健康检查通过');
      passed++;
    } else {
      throw new Error('系统状态异常');
    }
  } catch (error) {
    console.log('❌ 健康检查失败:', error.message);
    failed++;
  }
  
  // 测试4: 数据清理
  try {
    console.log('\n🧹 测试4: 数据清理');
    const cleanup = await storageManager.cleanupExpiredData();
    
    console.log(`   清理项目: ${cleanup.cleaned}`);
    console.log(`   错误数: ${cleanup.errors.length}`);
    
    console.log('✅ 数据清理完成');
    passed++;
  } catch (error) {
    console.log('❌ 数据清理失败:', error.message);
    failed++;
  }
  
  // 输出测试结果
  console.log('\n📊 测试结果汇总:');
  console.log(`✅ 通过: ${passed}`);
  console.log(`❌ 失败: ${failed}`);
  console.log(`📈 成功率: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);
  
  if (failed === 0) {
    console.log('\n🎉 所有测试通过！存储系统工作正常。');
    process.exit(0);
  } else {
    console.log('\n⚠️  部分测试失败，请检查存储系统配置。');
    process.exit(1);
  }
}

// 运行测试
testStorageSystem().catch(error => {
  console.error('❌ 测试运行失败:', error);
  process.exit(1);
});

module.exports = { testStorageSystem };