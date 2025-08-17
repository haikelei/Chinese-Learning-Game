// 环境配置工具
export const envConfig = {
  // 当前环境
  ENV: process.env.REACT_APP_ENV || 'local',
  
  // API Host配置 - 只配置host，不包含具体路径
  API_HOST: process.env.REACT_APP_API_HOST || 'http://localhost:8000',
  
  // 环境判断
  isLocal: () => envConfig.ENV === 'local',
  isTest: () => envConfig.ENV === 'test',
  isProduction: () => envConfig.ENV === 'production',
  
  // 获取完整的API URL
  getApiUrl: (path: string) => {
    // 本地开发使用代理，直接使用相对路径
    if (envConfig.isLocal()) {
      return path.startsWith('/') ? path : `/${path}`;
    }
    // 其他环境使用完整URL
    return `${envConfig.API_HOST}${path.startsWith('/') ? path : `/${path}`}`;
  },
  
  // 调试信息
  getDebugInfo: () => ({
    env: envConfig.ENV,
    apiHost: envConfig.API_HOST,
    isLocal: envConfig.isLocal(),
    timestamp: new Date().toISOString()
  })
};

// 在开发环境下打印配置信息
if (envConfig.isLocal()) {
  console.log('🔧 Environment Config:', envConfig.getDebugInfo());
}