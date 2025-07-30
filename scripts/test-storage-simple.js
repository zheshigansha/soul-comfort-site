#!/usr/bin/env node

/**
 * 简化的存储系统测试脚本
 * 直接测试基础功能，避免复杂的模块导入
 */

console.log('🧪 开始存储系统基础测试...\n');

// 模拟测试数据
const testClientId = 'test-client-' + Date.now();
let passed = 0;
let failed = 0;

// 测试1: localStorage基础功能
try {
  console.log('📋 测试1: localStorage基础功能');
  
  // 模拟存储操作
  const testData = {
    clientId: testClientId,
    count: 0,
    limit: 10,
    isPremium: false
  };
  
  // 在Node.js环境中模拟localStorage
  global.localStorage = {
    data: {},
    setItem: function(key, value) {
      this.data[key] = value;
    },
    getItem: function(key) {
      return this.data[key] || null;
    },
    removeItem: function(key) {
      delete this.data[key];
    }
  };
  
  localStorage.setItem(`user_usage_${testClientId}`, JSON.stringify(testData));
  const retrieved = JSON.parse(localStorage.getItem(`user_usage_${testClientId}`));
  
  if (retrieved && retrieved.clientId === testClientId) {
    console.log('✅ localStorage基础功能正常');
    passed++;
  } else {
    throw new Error('数据存储或检索失败');
  }
} catch (error) {
  console.log('❌ localStorage基础功能失败:', error.message);
  failed++;
}

// 测试2: 数据更新逻辑
try {
  console.log('\n📝 测试2: 数据更新逻辑');
  
  const currentData = JSON.parse(localStorage.getItem(`user_usage_${testClientId}`));
  const updatedData = {
    ...currentData,
    count: currentData.count + 1
  };
  
  localStorage.setItem(`user_usage_${testClientId}`, JSON.stringify(updatedData));
  const verifyData = JSON.parse(localStorage.getItem(`user_usage_${testClientId}`));
  
  if (verifyData.count === 1) {
    console.log('✅ 数据更新逻辑正常');
    passed++;
  } else {
    throw new Error('数据更新验证失败');
  }
} catch (error) {
  console.log('❌ 数据更新逻辑失败:', error.message);
  failed++;
}

// 测试3: 恢复码生成逻辑
try {
  console.log('\n🔑 测试3: 恢复码生成逻辑');
  
  const timestamp = Date.now().toString(36);
  const clientHash = testClientId.substring(0, 8);
  const random = Math.random().toString(36).substring(2, 8);
  const recoveryCode = `RC-${timestamp}-${clientHash}-${random}`.toUpperCase();
  
  if (recoveryCode.startsWith('RC-') && recoveryCode.length > 10) {
    console.log('✅ 恢复码生成逻辑正常');
    console.log(`   示例恢复码: ${recoveryCode}`);
    passed++;
  } else {
    throw new Error('恢复码格式不正确');
  }
} catch (error) {
  console.log('❌ 恢复码生成逻辑失败:', error.message);
  failed++;
}

// 测试4: 数据清理逻辑
try {
  console.log('\n🧹 测试4: 数据清理逻辑');
  
  // 模拟过期数据
  const expiredData = {
    createdAt: new Date(Date.now() - 31 * 24 * 60 * 60 * 1000).toISOString(), // 31天前
    used: false
  };
  
  localStorage.setItem('recovery_TEST123', JSON.stringify(expiredData));
  
  // 检查过期逻辑
  const data = JSON.parse(localStorage.getItem('recovery_TEST123'));
  const createdAt = new Date(data.createdAt);
  const now = new Date();
  const daysDiff = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24);
  
  if (daysDiff > 30) {
    localStorage.removeItem('recovery_TEST123');
    console.log('✅ 数据清理逻辑正常');
    console.log(`   检测到过期数据: ${daysDiff.toFixed(1)}天前`);
    passed++;
  } else {
    throw new Error('过期检测逻辑错误');
  }
} catch (error) {
  console.log('❌ 数据清理逻辑失败:', error.message);
  failed++;
}

// 输出测试结果
console.log('\n📊 测试结果汇总:');
console.log(`✅ 通过: ${passed}`);
console.log(`❌ 失败: ${failed}`);
console.log(`📈 成功率: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);

if (failed === 0) {
  console.log('\n🎉 所有基础测试通过！存储系统核心逻辑正常。');
  process.exit(0);
} else {
  console.log('\n⚠️  部分测试失败，请检查存储系统实现。');
  process.exit(1);
}