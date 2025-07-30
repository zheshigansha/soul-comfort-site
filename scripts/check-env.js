#!/usr/bin/env node

/**
 * 环境变量检查脚本
 * 用于在部署前验证环境配置
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 检查环境变量配置...\n');

// 检查必需的环境文件
const requiredFiles = ['.env.example'];
const optionalFiles = ['.env', '.env.local', '.env.production'];

console.log('📁 检查环境文件:');
requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`  ✅ ${file} - 存在`);
  } else {
    console.log(`  ❌ ${file} - 缺失`);
    process.exit(1);
  }
});

optionalFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`  ✅ ${file} - 存在`);
  } else {
    console.log(`  ⚠️  ${file} - 不存在 (可选)`);
  }
});

// 检查 .gitignore 配置
console.log('\n🔒 检查 Git 安全配置:');
if (fs.existsSync('.gitignore')) {
  const gitignore = fs.readFileSync('.gitignore', 'utf8');
  const requiredIgnores = ['.env', '.env*.local'];
  
  requiredIgnores.forEach(pattern => {
    if (gitignore.includes(pattern)) {
      console.log(`  ✅ ${pattern} - 已忽略`);
    } else {
      console.log(`  ❌ ${pattern} - 未忽略 (安全风险!)`);
    }
  });
} else {
  console.log('  ❌ .gitignore 文件不存在');
}

// 检查环境变量示例文件的完整性
console.log('\n📋 检查环境变量示例:');
if (fs.existsSync('.env.example')) {
  const exampleContent = fs.readFileSync('.env.example', 'utf8');
  const requiredVars = [
    'ZHIPU_API_KEY',
    'NEXT_PUBLIC_APP_URL',
    'ADMIN_KEY',
    'PAYPAL_CLIENT_ID'
  ];
  
  requiredVars.forEach(varName => {
    if (exampleContent.includes(varName)) {
      console.log(`  ✅ ${varName} - 已包含`);
    } else {
      console.log(`  ⚠️  ${varName} - 缺失`);
    }
  });
}

// 生成安全建议
console.log('\n🛡️  安全建议:');
console.log('  1. 确保所有 .env* 文件都在 .gitignore 中');
console.log('  2. 使用强随机字符串作为密钥');
console.log('  3. 定期轮换API密钥');
console.log('  4. 在生产环境中使用环境变量而非文件');
console.log('  5. 启用双因素认证保护第三方服务账户');

console.log('\n✅ 环境配置检查完成!');