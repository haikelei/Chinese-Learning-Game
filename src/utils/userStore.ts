import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { generateAnonymousUsername, getDeviceFingerprint } from './anonymousUser';

// 用户信息接口
export interface UserInfo {
  id: string;
  username: string;
  isRegistered: boolean;
  displayName?: string;
  chineseLevel?: string;
  preferredMode?: string;
  avatarUrl?: string;
}

// Token接口
export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  user: UserInfo;
}

// 用户状态接口
interface UserState {
  // 用户信息
  user: UserInfo | null;
  
  // Token相关
  accessToken: string | null;
  refreshToken: string | null;
  
  // 讨论板用户名（保持向后兼容）
  discussBoardUsername: string;
  isEditingDiscussBoard: boolean;
  
  // 加载状态
  isLoading: boolean;
  isInitializing: boolean;
  
  // 操作方法
  setUser: (user: UserInfo) => void;
  setTokens: (tokens: TokenResponse) => void;
  clearUser: () => void;
  
        // Token管理
      getOrCreateAnonymousToken: () => Promise<string>;
      refreshAccessToken: () => Promise<string>;
      createAnonymousToken: () => Promise<string>;
      isTokenExpired: (token: string) => boolean;
  
  // 讨论板用户名管理
  setDiscussBoardUsername: (username: string) => void;
  startEditingDiscussBoard: () => void;
  stopEditingDiscussBoard: () => void;
  resetDiscussBoardUsername: () => void;
  getDisplayUsername: () => string;
  
  // 初始化
  initializeUser: () => Promise<void>;
}

// 生成设备ID（基于设备指纹）
function generateDeviceId(): string {
  const fingerprint = getDeviceFingerprint();
  const combined = Object.values(fingerprint).join('|');
  
  // 简单的哈希算法
  let hash = 0;
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // 转换为32位整数
  }
  
  return `device_${Math.abs(hash).toString(36)}`;
}

// 生成持久化设备ID（用于在浏览器重启后保持一致）
function generatePersistentDeviceId(): string {
  const fingerprint = getDeviceFingerprint();
  const combined = Object.values(fingerprint).join('|');
  
  // 简单的哈希算法
  let hash = 0;
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // 转换为32位整数
  }
  
  return `persistent_device_${Math.abs(hash).toString(36)}`;
}

// 检查token是否过期
function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Math.floor(Date.now() / 1000);
    return payload.exp < currentTime;
  } catch {
    return true; // 如果解析失败，认为已过期
  }
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      // 初始状态
      user: null,
      accessToken: null,
      refreshToken: null,
      discussBoardUsername: '',
      isEditingDiscussBoard: false,
      isLoading: false,
      isInitializing: false,

      // 设置用户信息
      setUser: (user: UserInfo) => set({ user }),

      // 设置token
      setTokens: (tokens: TokenResponse) => set({
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        user: tokens.user,
      }),

      // 清除用户信息
      clearUser: () => set({
        user: null,
        accessToken: null,
        refreshToken: null,
      }),

      // 检查token是否过期
      isTokenExpired: (token: string) => isTokenExpired(token),

      // 获取或创建匿名用户token
      getOrCreateAnonymousToken: async () => {
        const { accessToken, refreshToken, isLoading } = get();
        
        // 如果正在加载，等待
        if (isLoading) {
          return new Promise((resolve, reject) => {
            const checkLoading = () => {
              if (!get().isLoading) {
                resolve(get().accessToken || '');
              } else {
                setTimeout(checkLoading, 100);
              }
            };
            checkLoading();
          });
        }

        // 检查是否有有效的存储token
        if (accessToken && !isTokenExpired(accessToken)) {
          return accessToken;
        }

        // 如果没有有效token，尝试刷新
        if (refreshToken) {
          try {
            const newToken = await get().refreshAccessToken();
            return newToken;
          } catch (error) {
            console.log('Token刷新失败，创建新的匿名用户token');
          }
        }

        // 创建新的匿名用户token
        return get().createAnonymousToken();
      },

      // 创建匿名用户token
      createAnonymousToken: async () => {
        set({ isLoading: true });
        
        try {
          // 优先使用本地存储的设备ID
          const STORAGE_KEY = 'persistent_device_id';
          let deviceId = localStorage.getItem(STORAGE_KEY);
          
          // 如果没有本地存储的设备ID，才生成新的
          if (!deviceId) {
            deviceId = generatePersistentDeviceId();
            // 保存到本地存储
            localStorage.setItem(STORAGE_KEY, deviceId);
            console.log('🆕 生成新的设备ID:', deviceId);
          } else {
            console.log('✅ 使用本地存储的设备ID:', deviceId);
          }
          
          // 调用后端API获取token
          const response = await fetch('/api/auth/token', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ deviceId }),
          });

          if (!response.ok) {
            throw new Error(`获取token失败: ${response.statusText}`);
          }

          const result = await response.json();
          
          if (result.code === 0) {
            const tokens: TokenResponse = {
              accessToken: result.data.tokens.accessToken,
              refreshToken: result.data.tokens.refreshToken,
              user: result.data.user,
            };
            
            // 存储token和用户信息
            set({
              accessToken: tokens.accessToken,
              refreshToken: tokens.refreshToken,
              user: tokens.user,
              isLoading: false,
            });
            
            console.log('✅ 匿名用户token创建成功');
            return tokens.accessToken;
          } else {
            throw new Error(result.msg || '获取token失败');
          }
        } catch (error) {
          console.error('❌ 创建匿名用户token失败:', error);
          set({ isLoading: false });
          throw error;
        }
      },

      // 刷新token
      refreshAccessToken: async () => {
        const { refreshToken: currentRefreshToken } = get();
        
        if (!currentRefreshToken) {
          throw new Error('没有refresh token');
        }

        try {
          const response = await fetch('/api/auth/refresh', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ refreshToken: currentRefreshToken }),
          });

          if (!response.ok) {
            throw new Error(`刷新token失败: ${response.statusText}`);
          }

          const result = await response.json();
          
          if (result.code === 0) {
            const tokens: TokenResponse = {
              accessToken: result.data.tokens.accessToken,
              refreshToken: result.data.tokens.refreshToken,
              user: result.data.user || get().user!,
            };
            
            // 存储新token
            set({
              accessToken: tokens.accessToken,
              refreshToken: tokens.refreshToken,
              user: tokens.user,
            });
            
            console.log('✅ Token刷新成功');
            return tokens.accessToken;
          } else {
            throw new Error(result.msg || '刷新token失败');
          }
        } catch (error) {
          console.error('❌ Token刷新失败:', error);
          // 清除无效的token
          get().clearUser();
          throw error;
        }
      },

      // 讨论板用户名管理
      setDiscussBoardUsername: (username: string) => {
        set({ discussBoardUsername: username.trim() });
      },

      startEditingDiscussBoard: () => {
        set({ isEditingDiscussBoard: true });
      },

      stopEditingDiscussBoard: () => {
        set({ isEditingDiscussBoard: false });
      },

      resetDiscussBoardUsername: () => {
        const defaultUsername = generateAnonymousUsername();
        set({ 
          discussBoardUsername: defaultUsername, 
          isEditingDiscussBoard: false 
        });
      },

      getDisplayUsername: () => {
        const { discussBoardUsername } = get();
        return discussBoardUsername || generateAnonymousUsername();
      },

      // 初始化用户
      initializeUser: async () => {
        set({ isInitializing: true });
        
        try {
          // 尝试获取或创建匿名用户token
          await get().getOrCreateAnonymousToken();
        } catch (error) {
          console.error('用户初始化失败:', error);
        } finally {
          set({ isInitializing: false });
        }
      },
    }),
    {
      name: 'user-store', // localStorage key
      // 只持久化关键数据，不持久化加载状态
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        discussBoardUsername: state.discussBoardUsername,
      }),
    }
  )
);

// 便捷的hooks和函数
export const useUser = () => useUserStore((state) => state.user);
export const useAccessToken = () => useUserStore((state) => state.accessToken);
export const useIsLoading = () => useUserStore((state) => state.isLoading);
export const useIsInitializing = () => useUserStore((state) => state.isInitializing);

// 讨论板用户名相关（保持向后兼容）
export const useDiscussBoardUserStore = () => ({
  username: useUserStore((state) => state.discussBoardUsername),
  isEditing: useUserStore((state) => state.isEditingDiscussBoard),
  setUsername: useUserStore((state) => state.setDiscussBoardUsername),
  startEditing: useUserStore((state) => state.startEditingDiscussBoard),
  stopEditing: useUserStore((state) => state.stopEditingDiscussBoard),
  resetToDefault: useUserStore((state) => state.resetDiscussBoardUsername),
  getDisplayUsername: useUserStore((state) => state.getDisplayUsername),
});

// 讨论板用户名验证
export const validateDiscussBoardUsername = (username: string): { isValid: boolean; error?: string } => {
  if (!username.trim()) {
    return { isValid: false, error: '用户名不能为空' };
  }
  
  if (username.length < 2) {
    return { isValid: false, error: '用户名至少需要2个字符' };
  }
  
  if (username.length > 20) {
    return { isValid: false, error: '用户名不能超过20个字符' };
  }
  
  // 检查是否包含特殊字符
  const specialCharRegex = /[<>:"/\\|?*]/;
  if (specialCharRegex.test(username)) {
    return { isValid: false, error: '用户名不能包含特殊字符' };
  }
  
  return { isValid: true };
};