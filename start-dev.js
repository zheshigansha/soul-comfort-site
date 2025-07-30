#!/usr/bin/env node

/**
 * 简化的开发服务器启动脚本
 * 绕过复杂的检查，直接启动项目
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 启动开发服务器...\n');

// 1. 快速检查基本文件
console.log('📁 检查基本文件:');
const requiredFiles = ['package.json', 'next.config.mjs'];
let allFilesExist = true;

requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`  ✅ ${file}`);
  } else {
    console.log(`  ❌ ${file} - 缺失`);
    allFilesExist = false;
  }
});

if (!allFilesExist) {
  console.error('❌ 缺少必要文件，无法启动');
  process.exit(1);
}

// 2. 确保 .data 目录存在
const dataDir = path.join(process.cwd(), '.data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
  console.log('✅ 创建数据目录: .data/');
}

// 3. 确保存储文件存在
const storageFile = path.join(dataDir, 'storage.json');
if (!fs.existsSync(storageFile)) {
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
  console.log('✅ 创建存储文件: storage.json');
}

console.log('\n🎯 启动 Next.js 开发服务器...');

// 4. 启动 Next.js
const nextProcess = spawn('npx', ['next', 'dev'], {
  stdio: 'inherit',
  shell: true
});

nextProcess.on('error', (error) => {
  console.error('❌ 启动失败:', error);
  process.exit(1);
});

nextProcess.on('close', (code) => {
  console.log(`\n🔚 开发服务器已停止 (退出码: ${code})`);
});

// 处理 Ctrl+C
process.on('SIGINT', () => {
  console.log('\n🛑 正在停止开发服务器...');
  nextProcess.kill('SIGINT');
});