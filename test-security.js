#!/usr/bin/env node

/**
 * 安全配置验证测试
 * 验证修复后的安全配置是否正常工作
 */

const fs = require('fs');
const path = require('path');

function testSecurityConfig() {
  console.log('🔐 安全配置验证测试...\n');
  
  // 检查环境变量
  const envPath = path.join(process.cwd(), '.env.local');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    
    const hasAdminKey = envContent.includes('ADMIN_KEY=') && 
                       !envContent.includes('ADMIN_KEY=your_');
    const hasZhipuKey = envContent.includes('ZHIPUAI_API_KEY=') && 
                       !envContent.includes('ZHIPUAI_API_KEY=your_');
    
    console.log('✅ 环境变量检查:');
    console.log(`   ADMIN_KEY: ${hasAdminKey ? '已设置 ✓' : '未设置 ✗'}`);
    console.log(`   ZHIPUAI_API_KEY: ${hasZhipuKey ? '已设置 ✓' : '未设置 ✗'}`);
    
    if (hasAdminKey) {
      console.log('\n🎯 管理员API测试命令:');
      console.log('curl -X GET http://localhost:3000/api/admin/usage \
  -H "x-admin-key: [你的ADMIN_KEY]"');
      
      console.log('\n🎯 AI API测试命令:');
      console.log('项目启动后，访问 http://localhost:3000/zh/tree-hole');
    }
  } else {
    console.log('❌ 未找到 .env.local 文件');
  }
  
  // 检查安全修复
  const adminRoutePath = path.join(process.cwd(), 'app/api/admin/usage/route.ts');
  const adminRouteContent = fs.readFileSync(adminRoutePath, 'utf8');
  
  const hasHardcodedKey = adminRouteContent.includes('42d4089c1173f415b6ebeb58dbb16a8306d249e6a271320199e60c1bf555a20f');
  const hasSecureImport = adminRouteContent.includes('validateAdminKey');
  
  console.log('\n🔒 安全修复检查:');
  console.log(`   硬编码密钥已移除: ${!hasHardcodedKey ? '✓' : '✗'}`);
  console.log(`   安全验证已添加: ${hasSecureImport ? '✓' : '✗'}`);
  
  console.log('\n🚀 测试步骤:');
  console.log('1. npm run dev');
  console.log('2. 测试管理员API (上面提供的curl命令)');
  console.log('3. 测试AI聊天功能');
}

testSecurityConfig();