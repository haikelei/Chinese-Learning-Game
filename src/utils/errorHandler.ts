import { AxiosError } from 'axios';

// 错误类型枚举
export enum ErrorType {
  BUSINESS_ERROR = 'BUSINESS_ERROR',    // 业务逻辑错误
  NETWORK_ERROR = 'NETWORK_ERROR',      // 网络错误
  VALIDATION_ERROR = 'VALIDATION_ERROR', // 验证错误
  AUTH_ERROR = 'AUTH_ERROR',            // 认证错误
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'       // 未知错误
}

// 错误信息接口
export interface ErrorInfo {
  type: ErrorType;
  message: string;
  code?: number;
  originalError?: any;
}

// 全局错误处理函数
export class GlobalErrorHandler {
  private static instance: GlobalErrorHandler;
  private errorCallbacks: Array<(error: ErrorInfo) => void> = [];

  private constructor() {}

  public static getInstance(): GlobalErrorHandler {
    if (!GlobalErrorHandler.instance) {
      GlobalErrorHandler.instance = new GlobalErrorHandler();
    }
    return GlobalErrorHandler.instance;
  }

  // 添加错误回调
  public addErrorCallback(callback: (error: ErrorInfo) => void) {
    this.errorCallbacks.push(callback);
  }

  // 移除错误回调
  public removeErrorCallback(callback: (error: ErrorInfo) => void) {
    const index = this.errorCallbacks.indexOf(callback);
    if (index > -1) {
      this.errorCallbacks.splice(index, 1);
    }
  }

  // 处理错误
  public handleError(error: any): ErrorInfo {
    let errorInfo: ErrorInfo;

    if (error.isBusinessError) {
      // 业务逻辑错误
      errorInfo = {
        type: ErrorType.BUSINESS_ERROR,
        message: error.message || '业务处理失败',
        code: error.code,
        originalError: error
      };
    } else if (error.isNetworkError) {
      // 网络错误
      errorInfo = {
        type: ErrorType.NETWORK_ERROR,
        message: error.message || '网络连接失败',
        originalError: error
      };
    } else if (error instanceof AxiosError) {
      // Axios错误
      if (error.response?.status === 401) {
        errorInfo = {
          type: ErrorType.AUTH_ERROR,
          message: '登录已过期，请重新登录',
          code: 401,
          originalError: error
        };
      } else if (error.response?.status === 403) {
        errorInfo = {
          type: ErrorType.AUTH_ERROR,
          message: '权限不足',
          code: 403,
          originalError: error
        };
      } else if (error.response?.status === 422) {
        errorInfo = {
          type: ErrorType.VALIDATION_ERROR,
          message: '输入数据验证失败',
          code: 422,
          originalError: error
        };
      } else {
        errorInfo = {
          type: ErrorType.NETWORK_ERROR,
          message: error.message || '网络请求失败',
          code: error.response?.status,
          originalError: error
        };
      }
    } else {
      // 其他未知错误
      errorInfo = {
        type: ErrorType.UNKNOWN_ERROR,
        message: error.message || '未知错误',
        originalError: error
      };
    }

    // 调用所有错误回调
    this.errorCallbacks.forEach(callback => {
      try {
        callback(errorInfo);
      } catch (callbackError) {
        console.error('错误回调执行失败:', callbackError);
      }
    });

    return errorInfo;
  }

  // 显示用户友好的错误消息
  public showUserFriendlyMessage(error: ErrorInfo): void {
    let message = error.message;
    
    // 根据错误类型调整消息
    switch (error.type) {
      case ErrorType.AUTH_ERROR:
        if (error.code === 401) {
          message = '登录已过期，请重新登录';
          // 可以在这里触发重新登录逻辑
          // this.redirectToLogin();
        }
        break;
      case ErrorType.NETWORK_ERROR:
        message = '网络连接失败，请检查网络后重试';
        break;
      case ErrorType.VALIDATION_ERROR:
        message = '输入数据有误，请检查后重试';
        break;
      case ErrorType.BUSINESS_ERROR:
        // 业务错误消息保持原样
        break;
      default:
        message = '操作失败，请稍后重试';
    }

    // 这里可以集成你的UI组件库来显示错误消息
    // 例如：toast.error(message) 或 alert(message)
    console.error('用户友好错误消息:', message);
    
    // 临时使用alert，你可以替换为你的UI组件
    if (process.env.NODE_ENV === 'development') {
      alert(`错误: ${message}`);
    }
  }

  // 处理API错误的标准流程
  public handleApiError(error: any): ErrorInfo {
    const errorInfo = this.handleError(error);
    this.showUserFriendlyMessage(errorInfo);
    return errorInfo;
  }
}

// 导出单例实例
export const globalErrorHandler = GlobalErrorHandler.getInstance();

// 便捷的错误处理函数
export const handleApiError = (error: any) => globalErrorHandler.handleApiError(error);
export const addErrorCallback = (callback: (error: ErrorInfo) => void) => globalErrorHandler.addErrorCallback(callback);
export const removeErrorCallback = (callback: (error: ErrorInfo) => void) => globalErrorHandler.removeErrorCallback(callback);
