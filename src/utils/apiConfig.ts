import { httpClient } from './httpClient';
import { globalErrorHandler } from './errorHandler';

// 配置HTTP客户端的错误回调
httpClient.setErrorCallback((error, message) => {
  // 将错误传递给全局错误处理器
  globalErrorHandler.handleError(error);
});

// 导出配置好的HTTP客户端
export { httpClient, globalErrorHandler };

// 导出便捷的API方法
export { api } from './httpClient';

// 导出错误处理相关
export { 
  handleApiError, 
  addErrorCallback, 
  removeErrorCallback,
  ErrorType 
} from './errorHandler';

// 导出类型
export type { ApiResponse, HttpClientConfig, ErrorCallback } from './httpClient';
export type { ErrorInfo } from './errorHandler';
