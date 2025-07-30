import { createClient } from '@supabase/supabase-js';
import { getRequiredEnvVar, getOptionalEnvVar } from './config';
import { logger } from './logger';

// 使用开发模式标志
const isDevelopment = process.env.NODE_ENV === 'development';

// 创建一个模拟的Supabase客户端
const createMockClient = () => {
  return {
    auth: {
      getUser: async () => ({ data: { user: null }, error: null }),
      getSession: async () => ({ data: { session: null }, error: null }),
      signOut: async () => ({ error: null }),
      onAuthStateChange: () => ({ 
        data: { subscription: { unsubscribe: () => {} } } 
      })
    },
    from: () => ({
      select: () => ({
        eq: () => ({
          single: async () => ({ data: null, error: null }),
          order: () => ({
            limit: () => ({
              data: [],
              error: null
            })
          })
        }),
        gte: () => ({
          data: [],
          error: null
        }),
        gt: () => ({
          data: [],
          error: null
        }),
        order: () => ({
          limit: () => ({
            data: [],
            error: null
          })
        })
      }),
      insert: async () => ({ data: null, error: null }),
      update: async () => ({ data: null, error: null }),
      delete: async () => ({ data: null, error: null }),
      count: async () => ({ count: 0, error: null })
    })
  };
};

// 安全地获取配置
function getSupabaseConfig() {
  if (isDevelopment) {
    logger.warn('⚠️  使用模拟Supabase客户端（开发模式）');
    return { url: '', key: '' };
  }

  try {
    const url = getRequiredEnvVar('NEXT_PUBLIC_SUPABASE_URL');
    const key = getRequiredEnvVar('SUPABASE_SERVICE_ROLE_KEY');
    
    // 验证URL格式
    if (!url.startsWith('https://')) {
      throw new Error('Supabase URL 必须以 https:// 开头');
    }
    
    return { url, key };
  } catch (error) {
    logger.error('❌ Supabase配置错误', error instanceof Error ? error : new Error(String(error)));
    
    // 在生产环境中抛出错误，在开发环境中回退到模拟客户端
    if (isDevelopment) {
      logger.warn('⚠️  回退到模拟客户端');
      return { url: '', key: '' };
    } else {
      throw error;
    }
  }
}

interface MockClient {
  auth: {
    getUser: () => Promise<{ data: { user: null }; error: null }>;
    getSession: () => Promise<{ data: { session: null }; error: null }>;
    signOut: () => Promise<{ error: null }>;
    onAuthStateChange: () => { data: { subscription: { unsubscribe: () => void } } };
  };
  from: () => {
    select: () => {
      eq: () => {
        single: () => Promise<{ data: null; error: null }>;
        order: () => {
          limit: () => { data: []; error: null };
        };
      };
      gte: () => { data: []; error: null };
      gt: () => { data: []; error: null };
      order: () => {
        limit: () => { data: []; error: null };
      };
    };
    insert: () => Promise<{ data: null; error: null }>;
    update: () => Promise<{ data: null; error: null }>;
    delete: () => Promise<{ data: null; error: null }>;
    count: () => Promise<{ count: number; error: null }>;
  };
}

// 在开发模式下使用模拟客户端，在生产模式下使用真实客户端
let supabaseInstance: any;

if (isDevelopment) {
  supabaseInstance = createMockClient();
} else {
  try {
    const { url, key } = getSupabaseConfig();
    supabaseInstance = createClient(url, key, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false
      }
    });
  } catch (error) {
    logger.error('❌ 无法创建Supabase客户端', error instanceof Error ? error : new Error(String(error)));
    // 在生产环境中，如果没有正确配置，应该抛出错误
    if (!isDevelopment) {
      throw error;
    }
    supabaseInstance = createMockClient();
  }
}

export const supabase = supabaseInstance;