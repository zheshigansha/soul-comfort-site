#!/usr/bin/env node

/**
 * 翻译验证脚本
 * 检查翻译文件的完整性和一致性
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 验证翻译文件...\n');

// 读取翻译文件
const enMessages = JSON.parse(fs.readFileSync('messages/en.json', 'utf8'));
const zhMessages = JSON.parse(fs.readFileSync('messages/zh.json', 'utf8'));

// 递归获取所有键
function getAllKeys(obj, prefix = '') {
  let keys = [];
  for (const key in obj) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      keys = keys.concat(getAllKeys(obj[key], fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  return keys;
}

const enKeys = getAllKeys(enMessages);
const zhKeys = getAllKeys(zhMessages);

console.log(`📊 统计信息:`);
console.log(`  英文翻译键: ${enKeys.length}`);
console.log(`  中文翻译键: ${zhKeys.length}`);

// 检查缺失的键
const missingInZh = enKeys.filter(key => !zhKeys.includes(key));
const missingInEn = zhKeys.filter(key => !enKeys.includes(key));

if (missingInZh.length > 0) {
  console.log(`\n❌ 中文翻译中缺失的键 (${missingInZh.length}):`);
  missingInZh.forEach(key => console.log(`  - ${key}`));
}

if (missingInEn.length > 0) {
  console.log(`\n❌ 英文翻译中缺失的键 (${missingInEn.length}):`);
  missingInEn.forEach(key => console.log(`  - ${key}`));
}

if (missingInZh.length === 0 && missingInEn.length === 0) {
  console.log('\n✅ 所有翻译键都已同步！');
}

// 检查空值
function checkEmptyValues(obj, lang, prefix = '') {
  const emptyKeys = [];
  for (const key in obj) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      emptyKeys.push(...checkEmptyValues(obj[key], lang, fullKey));
    } else if (!obj[key] || obj[key].trim() === '') {
      emptyKeys.push(fullKey);
    }
  }
  return emptyKeys;
}

const emptyEnKeys = checkEmptyValues(enMessages, 'en');
const emptyZhKeys = checkEmptyValues(zhMessages, 'zh');

if (emptyEnKeys.length > 0) {
  console.log(`\n⚠️  英文翻译中的空值 (${emptyEnKeys.length}):`);
  emptyEnKeys.forEach(key => console.log(`  - ${key}`));
}

if (emptyZhKeys.length > 0) {
  console.log(`\n⚠️  中文翻译中的空值 (${emptyZhKeys.length}):`);
  emptyZhKeys.forEach(key => console.log(`  - ${key}`));
}

console.log('\n✅ 翻译验证完成!');

// 如果有错误，退出码为1
if (missingInZh.length > 0 || missingInEn.length > 0) {
  process.exit(1);
}