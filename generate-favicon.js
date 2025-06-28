const fs = require('fs');
const { createCanvas } = require('canvas');

// 创建一个 32x32 的 canvas
const canvas = createCanvas(32, 32);
const ctx = canvas.getContext('2d');

// 创建渐变背景 - 紫色到蓝色的渐变，符合我们的"极光UI"主题
const gradient = ctx.createLinearGradient(0, 0, 32, 32);
gradient.addColorStop(0, '#8A2BE2');  // 紫色
gradient.addColorStop(1, '#4169E1');  // 蓝色

// 填充背景
ctx.fillStyle = gradient;
ctx.fillRect(0, 0, 32, 32);

// 在中间绘制一个心形
ctx.fillStyle = 'white';
ctx.beginPath();
ctx.moveTo(16, 10);
ctx.bezierCurveTo(14, 7, 8, 7, 8, 14);
ctx.bezierCurveTo(8, 18, 12, 22, 16, 26);
ctx.bezierCurveTo(20, 22, 24, 18, 24, 14);
ctx.bezierCurveTo(24, 7, 18, 7, 16, 10);
ctx.fill();

// 将 canvas 转换为 PNG buffer
const buffer = canvas.toBuffer('image/png');

// 保存为文件
fs.writeFileSync('./public/favicon.ico', buffer);

console.log('Favicon created successfully!');