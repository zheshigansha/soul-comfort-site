#!/usr/bin/env node

/**
 * 生成安全的管理员密钥
 * 使用方法: node scripts/generate-admin-key.js
 */

const crypto = require('crypto');

function generateAdminKey(length = 64) {
  return crypto.randomBytes(length).toString('hex');
}

function main() {
  const adminKey = generateAdminKey();
  console.log('🔐 新生成的管理员密钥:');
  console.log('');
  console.log(`ADMIN_KEY=${adminKey}`);
  console.log('');
  console.log('请将此密钥添加到您的 .env.local 文件中');
  console.log('⚠️  警告: 请妥善保管此密钥，不要提交到代码仓库！');
}

if (require.main === module) {
  main();
}

module.exports = { generateAdminKey };