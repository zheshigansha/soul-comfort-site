import { persistentStorage } from './persistence';

// 客户端ID生成和持久化工具
export class ClientStorage {
  private static readonly STORAGE_KEY = 'soul_comfort_client_id';
  private static readonly DEVICE_ID_KEY = 'soul_comfort_device_id';
  private static readonly USER_MAPPING_KEY = 'soul_comfort_user_mapping';

  /**
   * 生成唯一的客户端ID
   */
  private static generateClientId(): string {
    const timestamp = Date.now().toString(36);
    const randomPart = Math.random().toString(36).substring(2, 10);
    // 确保生成的ID长度在8-50之间，且符合正则规则
    return `sc_${timestamp}_${randomPart}`;
  }

  /**
   * 生成设备指纹（基于浏览器特征）
   */
  private static generateDeviceFingerprint(): string {
    if (typeof window === 'undefined') {
      return 'server_device';
    }

    const features = [
      navigator.userAgent,
      navigator.language,
      screen.width,
      screen.height,
      new Date().getTimezoneOffset()
    ];

    return features.join('|');
  }

  /**
   * 获取或创建客户端ID - 混合持久化方案
   */
  public static async getOrCreateClientId(): Promise<string> {
    if (typeof window === 'undefined') {
      // 服务端环境，返回临时ID
      return `server_${Date.now()}`;
    }

    try {
      // 1. 检查localStorage中的客户端ID
      let clientId = localStorage.getItem(this.STORAGE_KEY);
      
      if (clientId) {
        // 验证ID格式
        if (clientId.startsWith('sc_') && clientId.length > 10) {
          return clientId;
        }
      }

      // 2. 生成新的客户端ID
      clientId = this.generateClientId();
      
      // 3. 保存到localStorage
      localStorage.setItem(this.STORAGE_KEY, clientId);
      
      // 4. 保存设备指纹用于恢复
      const deviceId = this.generateDeviceFingerprint();
      localStorage.setItem(this.DEVICE_ID_KEY, deviceId);
      
      return clientId;
    } catch (error) {
      // localStorage不可用时，使用内存中的临时ID
      console.warn('无法访问localStorage，使用临时客户端ID');
      return `temp_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    }
  }

  /**
   * 迁移旧的客户端ID到新的持久化系统
   */
  public static async migrateLegacyClientId(oldClientId: string): Promise<string> {
    const newClientId = await this.getOrCreateClientId();
    
    if (oldClientId && oldClientId !== newClientId) {
      try {
        // 迁移旧数据
        const oldUsage = await persistentStorage.getUserUsage(oldClientId);
        if (oldUsage.count > 0) {
          // 将旧数据迁移到新ID
          for (let i = 0; i < oldUsage.count; i++) {
            await persistentStorage.incrementUserUsage(newClientId);
          }
          
          // 迁移付费状态
          if (oldUsage.isPremium && oldUsage.premiumData) {
            await persistentStorage.setUserPremium(newClientId, oldUsage.premiumData);
          }
        }
      } catch (error) {
        console.error('迁移客户端ID数据失败:', error);
      }
    }
    
    return newClientId;
  }

  /**
   * 检查客户端ID是否有效
   */
  public static isValidClientId(clientId: string): boolean {
    return typeof clientId === 'string' && 
           clientId.length >= 8 && 
           clientId.length <= 50 && 
           /^[a-zA-Z0-9_-]+$/.test(clientId);
  }

  /**
   * 获取设备信息（用于分析）
   */
  public static getDeviceInfo(): {
    clientId: string;
    deviceFingerprint: string;
    timestamp: string;
  } | null {
    if (typeof window === 'undefined') return null;
    
    try {
      const clientId = localStorage.getItem(this.STORAGE_KEY);
      const deviceFingerprint = localStorage.getItem(this.DEVICE_ID_KEY);
      
      return {
        clientId: clientId || 'unknown',
        deviceFingerprint: deviceFingerprint || 'unknown',
        timestamp: new Date().toISOString()
      };
    } catch {
      return null;
    }
  }

  /**
   * 清除客户端数据（用户退出时）
   */
  public static clearClientData(): void {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.removeItem(this.STORAGE_KEY);
      localStorage.removeItem(this.DEVICE_ID_KEY);
      localStorage.removeItem(this.USER_MAPPING_KEY);
    } catch (error) {
      console.warn('清除客户端数据失败:', error);
    }
  }

  /**
   * 备份客户端数据（用于迁移）
   */
  public static async backupClientData(): Promise<string> {
    if (typeof window === 'undefined') return '';
    
    try {
      const data = {
        clientId: localStorage.getItem(this.STORAGE_KEY),
        deviceId: localStorage.getItem(this.DEVICE_ID_KEY),
        userMapping: localStorage.getItem(this.USER_MAPPING_KEY),
        timestamp: new Date().toISOString()
      };
      
      return JSON.stringify(data);
    } catch (error) {
      console.error('备份客户端数据失败:', error);
      return '';
    }
  }

  /**
   * 恢复客户端数据
   */
  public static async restoreClientData(backup: string): Promise<boolean> {
    if (typeof window === 'undefined') return false;
    
    try {
      const data = JSON.parse(backup);
      
      if (data.clientId) {
        localStorage.setItem(this.STORAGE_KEY, data.clientId);
      }
      if (data.deviceId) {
        localStorage.setItem(this.DEVICE_ID_KEY, data.deviceId);
      }
      if (data.userMapping) {
        localStorage.setItem(this.USER_MAPPING_KEY, data.userMapping);
      }
      
      return true;
    } catch (error) {
      console.error('恢复客户端数据失败:', error);
      return false;
    }
  }
}

// 简化的API包装器
export const clientStorage = {
  getClientId: ClientStorage.getOrCreateClientId,
  validate: ClientStorage.isValidClientId,
  migrate: ClientStorage.migrateLegacyClientId,
  clear: ClientStorage.clearClientData,
  backup: ClientStorage.backupClientData,
  restore: ClientStorage.restoreClientData,
  getDeviceInfo: ClientStorage.getDeviceInfo
};