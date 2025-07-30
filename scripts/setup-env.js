#!/usr/bin/env node

/**
 * 跨平台环境变量设置脚本
 * 支持 Windows, macOS, Linux
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 设置环境变量文件...\n');

const sourceFile = '.env.example';
const targetFile = '.env.local';

try {
  // 检查源文件是否存在
  if (!fs.existsSync(sourceFile)) {
    console.error(`❌ 源文件 ${sourceFile} 不存在`);
    process.exit(1);
  }

  // 检查目标文件是否已存在
  if (fs.existsSync(targetFile)) {
    console.log(`⚠️  ${targetFile} 已存在，是否要覆盖？`);
    console.log('如果要保留现有配置，请手动编辑文件');
    console.log('如果要重新开始，请删除现有文件后重新运行此脚本\n');
    
    // 显示现有文件的修改时间
    const stats = fs.statSync(targetFile);
    console.log(`现有文件修改时间: ${stats.mtime.toLocaleString()}`);
    console.log(`\n跳过复制，使用现有的 ${targetFile} 文件`);
    
  } else {
    // 复制文件
    const content = fs.readFileSync(sourceFile, 'utf8');
    fs.writeFileSync(targetFile, content, 'utf8');
    console.log(`✅ 已创建 ${targetFile} 文件`);
  }

  // 提供后续指导
  console.log('\n📝 下一步操作:');
  console.log(`1. 编辑 ${targetFile} 文件`);
  console.log('2. 填入你的真实API密钥和配置值');
  console.log('3. 特别注意以下必需的配置:');
  console.log('   - ZHIPU_API_KEY (智谱AI密钥，必需)');
  console.log('   - NEXT_PUBLIC_APP_URL (应用URL)');
  console.log('   - ADMIN_KEY (管理员密钥，可选)');
  
  console.log('\n🚀 配置完成后运行:');
  console.log('   npm run dev');
  
  console.log('\n✅ 环境设置完成!');

} catch (error) {
  console.error('❌ 设置环境文件时出错:', error.message);
  process.exit(1);
}