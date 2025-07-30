#!/usr/bin/env node

/**
 * 安全配置检查脚本
 * 检查项目中的安全问题并提供修复建议
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

class SecurityChecker {
  constructor() {
    this.issues = [];
    this.warnings = [];
  }

  async check() {
    console.log('🔍 开始安全检查...\n');
    
    await this.checkHardcodedSecrets();
    await this.checkEnvironmentFiles();
    await this.checkSensitiveFiles();
    await this.checkDependencies();
    
    this.printResults();
  }

  async checkHardcodedSecrets() {
    const sensitivePatterns = [
      /password\s*=\s*['"][^'"]+['"]/gi,
      /secret\s*=\s*['"][^'"]+['"]/gi,
      /key\s*=\s*['"][^'"]{20,}['"]/gi,
      /token\s*=\s*['"][^'"]+['"]/gi,
      /ADMIN_KEY\s*=\s*['"][^'"]+['"]/gi,
      /process\.env\.\w+\s*=\s*['"][^'"]+['"]/gi
    ];

    const files = [
      'app/api/admin/usage/route.ts',
      'lib/supabase.ts',
      'lib/db-supabase.ts'
    ];

    for (const file of files) {
      const filePath = path.join(process.cwd(), file);
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8');
        
        for (const pattern of sensitivePatterns) {
          const matches = content.match(pattern);
          if (matches) {
            this.issues.push(`发现硬编码敏感信息: ${file} (${matches.length} 处)`);
          }
        }
      }
    }
  }

  async checkEnvironmentFiles() {
    const envFiles = ['.env', '.env.local', '.env.production'];
    
    for (const envFile of envFiles) {
      const envPath = path.join(process.cwd(), envFile);
      if (fs.existsSync(envPath)) {
        const content = fs.readFileSync(envPath, 'utf8');
        
        if (content.includes('your_') || content.includes('example_')) {
          this.warnings.push(`${envFile} 包含示例值，请替换为真实配置`);
        }
        
        if (!content.includes('ADMIN_KEY')) {
          this.warnings.push(`${envFile} 缺少 ADMIN_KEY 配置`);
        }
      }
    }
    
    // 检查 .gitignore
    const gitignorePath = path.join(process.cwd(), '.gitignore');
    if (fs.existsSync(gitignorePath)) {
      const gitignore = fs.readFileSync(gitignorePath, 'utf8');
      if (!gitignore.includes('.env')) {
        this.warnings.push('.gitignore 应该包含 .env* 文件');
      }
    }
  }

  async checkSensitiveFiles() {
    const sensitiveFiles = [
      '.env',
      '.env.local',
      '.env.production',
      'secrets.json',
      'private.key',
      'id_rsa'
    ];

    for (const file of sensitiveFiles) {
      const filePath = path.join(process.cwd(), file);
      if (fs.existsSync(filePath)) {
        const stat = fs.statSync(filePath);
        const mode = stat.mode.toString(8);
        
        if (mode.slice(-2) !== '00') {
          this.warnings.push(`${file} 文件权限可能过宽 (建议 600)`);
        }
      }
    }
  }

  async checkDependencies() {
    const packagePath = path.join(process.cwd(), 'package.json');
    if (fs.existsSync(packagePath)) {
      const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
      
      if (pkg.dependencies && Object.keys(pkg.dependencies).length > 50) {
        this.warnings.push('依赖包过多，建议定期审计');
      }
    }
  }

  generateAdminKey() {
    return crypto.randomBytes(32).toString('hex');
  }

  printResults() {
    console.log('\n📊 安全检查结果:');
    console.log('='.repeat(50));
    
    if (this.issues.length === 0) {
      console.log('✅ 未发现严重安全问题');
    } else {
      console.log('❌ 发现的安全问题:');
      this.issues.forEach(issue => console.log(`   - ${issue}`));
    }
    
    if (this.warnings.length > 0) {
      console.log('\n⚠️  安全警告:');
      this.warnings.forEach(warning => console.log(`   - ${warning}`));
    }
    
    console.log('\n🔐 安全建议:');
    console.log('1. 确保 .env 文件已添加到 .gitignore');
    console.log('2. 为 ADMIN_KEY 设置强随机字符串');
    console.log('3. 定期轮换敏感密钥');
    console.log('4. 使用环境变量管理敏感配置');
    console.log('5. 限制文件权限 (chmod 600 .env)');
    
    if (!fs.existsSync(path.join(process.cwd(), '.env.local'))) {
      console.log(`\n🎯 下一步:`);
      console.log('1. 复制 .env.example 到 .env.local');
      console.log('2. 设置 ADMIN_KEY:', this.generateAdminKey());
    }
  }
}

// 如果是直接运行此脚本
if (require.main === module) {
  const checker = new SecurityChecker();
  checker.check().catch(console.error);
}

module.exports = SecurityChecker;