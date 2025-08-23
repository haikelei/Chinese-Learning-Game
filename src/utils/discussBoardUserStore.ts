import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { generateAnonymousUsername } from './anonymousUser';

interface DiscussBoardUserStore {
  // 讨论板用户名状态
  username: string;
  isEditing: boolean;
  
  // 操作方法
  setUsername: (username: string) => void;
  startEditing: () => void;
  stopEditing: () => void;
  resetToDefault: () => void;
  
  // 获取讨论板用户名（如果为空则使用默认值）
  getDisplayUsername: () => string;
}

export const useDiscussBoardUserStore = create<DiscussBoardUserStore>()(
  persist(
    (set, get) => ({
      // 初始状态
      username: '',
      isEditing: false,
      
      // 设置讨论板用户名
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
      
      // 获取显示用的讨论板用户名
      getDisplayUsername: () => {
        const { username } = get();
        return username || generateAnonymousUsername();
      }
    }),
    {
      name: 'discuss-board-user-settings', // localStorage key
      // 只持久化讨论板用户名，不持久化编辑状态
      partialize: (state) => ({ username: state.username })
    }
  )
);

// 讨论板用户名验证
export const validateDiscussBoardUsername = (username: string): { valid: boolean; message?: string } => {
  const trimmed = username.trim();
  
  if (!trimmed) {
    return { valid: false, message: 'Username cannot be empty' };
  }
  
  if (trimmed.length > 20) {
    return { valid: false, message: 'Username cannot exceed 20 characters' };
  }
  
  if (!/^[\u4e00-\u9fa5a-zA-Z0-9_\-\s]+$/.test(trimmed)) {
    return { valid: false, message: 'Username can only contain Chinese characters, letters, numbers, underscores and hyphens' };
  }
  
  return { valid: true };
};