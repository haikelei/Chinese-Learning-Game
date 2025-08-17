import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { generateAnonymousUsername } from './anonymousUser';

interface UserStore {
  // 用户名状态
  username: string;
  isEditing: boolean;
  
  // 操作方法
  setUsername: (username: string) => void;
  startEditing: () => void;
  stopEditing: () => void;
  resetToDefault: () => void;
  
  // 获取用户名（如果为空则使用默认值）
  getDisplayUsername: () => string;
}

export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      // 初始状态
      username: '',
      isEditing: false,
      
      // 设置用户名
      setUsername: (username: string) => {
        set({ username: username.trim() });
      },
      
      // 开始编辑
      startEditing: () => {
        set({ isEditing: true });
      },
      
      // 停止编辑
      stopEditing: () => {
        set({ isEditing: false });
      },
      
      // 重置为默认值
      resetToDefault: () => {
        const defaultUsername = generateAnonymousUsername();
        set({ username: defaultUsername, isEditing: false });
      },
      
      // 获取显示用的用户名
      getDisplayUsername: () => {
        const { username } = get();
        return username || generateAnonymousUsername();
      }
    }),
    {
      name: 'user-settings', // localStorage key
      // 只持久化用户名，不持久化编辑状态
      partialize: (state) => ({ username: state.username })
    }
  )
);

// 用户名验证
export const validateUsername = (username: string): { valid: boolean; message?: string } => {
  const trimmed = username.trim();
  
  if (!trimmed) {
    return { valid: false, message: '用户名不能为空' };
  }
  
  if (trimmed.length > 20) {
    return { valid: false, message: '用户名不能超过20个字符' };
  }
  
  if (!/^[\u4e00-\u9fa5a-zA-Z0-9_\-\s]+$/.test(trimmed)) {
    return { valid: false, message: '用户名只能包含中文、英文、数字、下划线和短横线' };
  }
  
  return { valid: true };
};