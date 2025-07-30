/**
 * 改进的客户端ID管理器
 * 使用混合存储方案解决持久性问题
 */

import { ClientStorage } from './client-storage';
import { persistentStorage } from './persistence';

// 生成随机ID的函数
function generateRandomId(length = 16): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

/**
 * 获取或创建客户端ID - 简化同步版本
 */
export function getClientId(): string {
  // 确保代码仅在浏览器环境中运行
  if (typeof window === 'undefined') {
    // 生成符合验证规则的服务端ID
    const timestamp = Date.now().toString(36);
    const randomPart = generateRandomId(8);
    return `server_${timestamp}_${randomPart}`;
  }

  try {
    // 尝试从localStorage获取现有ID
    const existingId = localStorage.getItem('soul_comfort_client_id');
    if (existingId && validateClientId(existingId)) {
      return existingId;
    }
    
    // 生成新的客户端ID
    const timestamp = Date.now().toString(36);
    const randomPart = generateRandomId(8);
    const newId = `client_${timestamp}_${randomPart}`;
    
    // 保存到localStorage
    localStorage.setItem('soul_comfort_client_id', newId);
    return newId;
  } catch (error) {
    console.error('获取客户端ID失败:', error);
    
    // 降级方案：生成临时ID
    return `fallback_${Date.now()}_${generateRandomId(8)}`;
  }
}

/**
 * 验证客户端ID格式
 */
export function validateClientId(clientId: string): boolean {
  return typeof clientId === 'string' && 
         clientId.length >= 8 && 
         clientId.length <= 50 && 
         /^[a-zA-Z0-9_-]+$/.test(clientId);
}

/**
 * 获取客户端信息（用于调试）
 */
export async function getClientInfo() {
  if (typeof window === 'undefined') {
    return {
      clientId: 'server',
      deviceInfo: null,
      storage: 'server'
    };
  }

  try {
    const clientId = await getClientId();
    const deviceInfo = ClientStorage.getDeviceInfo();
    
    return {
      clientId,
      deviceInfo,
      storage: 'localStorage+fileSystem'
    };
  } catch (error) {
    return {
      clientId: 'error',
      deviceInfo: null,
      storage: 'error'
    };
  }
}

/**
 * 迁移旧的客户端ID到新的系统
 */
export async function migrateClientId(): Promise<string> {
  if (typeof window === 'undefined') {
    return await getClientId();
  }

  try {
    // 获取旧的客户端ID
    const oldClientId = localStorage.getItem('soul_comfort_client_id');
    
    if (oldClientId) {
      // 迁移数据到新的系统
      const newClientId = await ClientStorage.migrateLegacyClientId(oldClientId);
      
      // 清理旧的存储项
      localStorage.removeItem('soul_comfort_client_id');
      
      return newClientId;
    }
    
    return await getClientId();
  } catch (error) {
    console.error('迁移客户端ID失败:', error);
    return await getClientId();
  }
}

/**
 * 清除客户端数据
 */
export async function clearClientData(): Promise<void> {
  if (typeof window === 'undefined') return;
  
  try {
    ClientStorage.clearClientData();
  } catch (error) {
    console.error('清除客户端数据失败:', error);
  }
}

// 默认导出
const clientIdManager = {
  getClientId,
  validate: validateClientId,
  migrate: migrateClientId,
  getInfo: getClientInfo,
  clear: clearClientData
};

export default clientIdManager;