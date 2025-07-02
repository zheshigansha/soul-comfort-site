'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminPage() {
  const router = useRouter();
  const [adminKey, setAdminKey] = useState('');
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [siteUsage, setSiteUsage] = useState<any>(null);
  const [maxLimit, setMaxLimit] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  // 验证和获取使用数据
  const fetchData = async () => {
    setIsLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/admin/usage', {
        headers: {
          'x-admin-key': adminKey
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSiteUsage(data);
        setMaxLimit(data.max_limit.toString());
        setIsAuthorized(true);
      } else {
        setMessage('管理员密钥无效');
        setIsAuthorized(false);
      }
    } catch (error) {
      setMessage('获取数据失败');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // 更新限制
  const updateLimit = async () => {
    setIsLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/admin/usage', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          adminKey,
          maxLimit: parseInt(maxLimit)
        })
      });

      if (response.ok) {
        setMessage('使用限制已更新');
        fetchData();
      } else {
        const data = await response.json();
        setMessage(data.error || '更新失败');
      }
    } catch (error) {
      setMessage('更新失败');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // 重置计数
  const resetCount = async () => {
    if (!confirm('确定要重置本月使用计数吗？此操作不可撤销!')) {
      return;
    }

    setIsLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/admin/usage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ adminKey })
      });

      if (response.ok) {
        setMessage('使用计数已重置');
        fetchData();
      } else {
        const data = await response.json();
        setMessage(data.error || '重置失败');
      }
    } catch (error) {
      setMessage('重置失败');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
          <h1 className="text-2xl font-bold mb-6">站点API使用量管理</h1>
          
          {!isAuthorized ? (
            <div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">管理员密钥</label>
                <input
                  type="password"
                  value={adminKey}
                  onChange={(e) => setAdminKey(e.target.value)}
                  className="w-full p-2 border rounded"
                  placeholder="输入管理员密钥"
                />
              </div>
              
              <button
                onClick={fetchData}
                disabled={isLoading || !adminKey}
                className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
              >
                {isLoading ? '验证中...' : '验证密钥'}
              </button>
            </div>
          ) : (
            <>
              {siteUsage && (
                <div className="mb-6">
                  <h2 className="text-xl font-semibold mb-4">当月使用情况 ({siteUsage.month})</h2>
                  
                  <div className="mb-4">
                    <div className="flex justify-between mb-1">
                      <span>已使用: {siteUsage.total_count} 次</span>
                      <span>限制: {siteUsage.max_limit} 次</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className="bg-blue-600 h-2.5 rounded-full"
                        style={{
                          width: `${Math.min((siteUsage.total_count / siteUsage.max_limit) * 100, 100)}%`
                        }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">月度使用限制</label>
                      <div className="flex">
                        <input
                          type="number"
                          value={maxLimit}
                          onChange={(e) => setMaxLimit(e.target.value)}
                          className="w-full p-2 border rounded-l"
                        />
                        <button
                          onClick={updateLimit}
                          disabled={isLoading}
                          className="bg-green-600 text-white px-4 py-2 rounded-r disabled:opacity-50"
                        >
                          更新
                        </button>
                      </div>
                    </div>
                    
                    <div className="flex items-end">
                      <button
                        onClick={resetCount}
                        disabled={isLoading}
                        className="bg-red-600 text-white px-4 py-2 rounded disabled:opacity-50"
                      >
                        重置使用计数
                      </button>
                    </div>
                  </div>
                </div>
              )}
              
              <div>
                <button
                  onClick={() => setIsAuthorized(false)}
                  className="text-gray-600 hover:text-gray-800"
                >
                  退出管理
                </button>
              </div>
            </>
          )}
          
          {message && (
            <div className={`mt-4 p-3 rounded ${message.includes('失败') ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
              {message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}