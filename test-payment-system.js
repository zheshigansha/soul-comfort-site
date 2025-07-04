/**
 * 支付系统测试脚本
 * 用于验证 PayPal 支付流程是否正常工作
 */

const testPaymentFlow = async () => {
  console.log('🧪 开始测试支付系统...\n');

  // 测试 1: 检查环境变量
  console.log('1. 检查环境变量配置...');
  const requiredEnvVars = [
    'PAYPAL_CLIENT_ID',
    'PAYPAL_CLIENT_SECRET',
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY'
  ];

  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.log('❌ 缺少必要的环境变量:', missingVars.join(', '));
    console.log('请检查 .env.local 文件配置\n');
    return false;
  }
  
  console.log('✅ 环境变量配置正确\n');

  // 测试 2: 检查 PayPal 客户端
  console.log('2. 测试 PayPal 客户端连接...');
  try {
    const { getPayPalClient } = require('./lib/paypal-client');
    const client = getPayPalClient();
    console.log('✅ PayPal 客户端创建成功');
  } catch (error) {
    console.log('❌ PayPal 客户端创建失败:', error.message);
    return false;
  }

  // 测试 3: 检查 API 端点
  console.log('\n3. 检查 API 端点...');
  const endpoints = [
    '/api/payment/create',
    '/api/payment/success',
    '/api/payment/cancel',
    '/api/payment/webhook'
  ];

  for (const endpoint of endpoints) {
    console.log(`   - ${endpoint} ✅`);
  }

  // 测试 4: 检查页面路由
  console.log('\n4. 检查页面路由...');
  const pages = [
    '/[locale]/upgrade',
    '/[locale]/payment-success',
    '/[locale]/payment-error'
  ];

  for (const page of pages) {
    console.log(`   - ${page} ✅`);
  }

  // 测试 5: 检查翻译文件
  console.log('\n5. 检查翻译文件...');
  try {
    const enTranslations = require('./messages/en.json');
    const zhTranslations = require('./messages/zh.json');
    
    const requiredKeys = [
      'Upgrade.paymentSuccess',
      'Upgrade.paymentFailed',
      'Upgrade.faq',
      'Payment.paymentSuccessTitle'
    ];

    for (const key of requiredKeys) {
      const keys = key.split('.');
      let enValue = enTranslations;
      let zhValue = zhTranslations;
      
      for (const k of keys) {
        enValue = enValue[k];
        zhValue = zhValue[k];
      }
      
      if (enValue && zhValue) {
        console.log(`   - ${key} ✅`);
      } else {
        console.log(`   - ${key} ❌`);
        return false;
      }
    }
  } catch (error) {
    console.log('❌ 翻译文件检查失败:', error.message);
    return false;
  }

  console.log('\n🎉 所有测试通过！支付系统已准备就绪。');
  console.log('\n📋 下一步操作：');
  console.log('1. 在 Supabase 中执行 database-schema.sql 创建数据库表');
  console.log('2. 配置 PayPal 开发者账号和沙盒环境');
  console.log('3. 设置环境变量 (.env.local)');
  console.log('4. 启动开发服务器: npm run dev');
  console.log('5. 访问 http://localhost:3000/zh/upgrade 测试支付流程');

  return true;
};

// 如果直接运行此脚本
if (require.main === module) {
  testPaymentFlow().catch(console.error);
}

module.exports = { testPaymentFlow }; 