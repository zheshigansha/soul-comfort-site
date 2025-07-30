// 测试水合问题的简单脚本
const { getRandomQuote } = require('./lib/quotes');

console.log('测试随机引言生成...');

// 测试多次调用是否会产生不同结果
for (let i = 0; i < 5; i++) {
  const quote = getRandomQuote();
  console.log(`第${i+1}次调用:`, quote.id, quote.text.zh);
}

console.log('\n测试完成。如果每次调用都返回不同的结果，这可能是水合问题的根源。');