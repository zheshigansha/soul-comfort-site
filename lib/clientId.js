// 生成随机ID的函数
function generateRandomId(length = 16) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
  }
  
  // 获取或创建客户端ID
  export function getClientId() {
    // 确保代码仅在浏览器环境中运行
    if (typeof window === 'undefined') return null;
    
    // 尝试从本地存储中获取ID
    let clientId = localStorage.getItem('soul_comfort_client_id');
    
    // 如果没有ID，则创建一个新的
    if (!clientId) {
      clientId = generateRandomId();
      localStorage.setItem('soul_comfort_client_id', clientId);
    }
    
    return clientId;
  }