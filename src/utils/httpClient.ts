import axios, { AxiosInstance, AxiosResponse, AxiosError, AxiosRequestConfig } from 'axios';
import { useUserStore } from './userStore';
import { envConfig } from './envConfig';

// 定义API响应的标准格式
export interface ApiResponse<T = any> {
  code: number;
  msg: string;
  data: T;
}

// 定义HTTP客户端的配置选项
export interface HttpClientConfig {
  baseURL?: string;
  timeout?: number;
  headers?: Record<string, string>;
}

// 定义错误处理回调函数类型
export type ErrorCallback = (error: AxiosError, message: string) => void;

// 创建HTTP客户端类
export class HttpClient {
  private instance: AxiosInstance;
  private errorCallback?: ErrorCallback;

  constructor(config: HttpClientConfig = {}) {
    // 创建axios实例
    this.instance = axios.create({
      baseURL: config.baseURL || envConfig.API_HOST,
      timeout: config.timeout || 10000,
      headers: {
        'Content-Type': 'application/json',
        ...config.headers,
      },
    });

    // 配置请求拦截器
    this.setupRequestInterceptor();
    
    // 配置响应拦截器
    this.setupResponseInterceptor();
  }

  // 设置请求拦截器
  private setupRequestInterceptor() {
    this.instance.interceptors.request.use(
      async (config) => {
        // 自动添加认证token
        try {
          const token = useUserStore.getState().accessToken;
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          } else {
            // 如果没有token，尝试获取匿名用户token
            const anonymousToken = await useUserStore.getState().getOrCreateAnonymousToken();
            if (anonymousToken) {
              config.headers.Authorization = `Bearer ${anonymousToken}`;
            }
          }
        } catch (error) {
          console.warn('⚠️ 获取token失败，请求将不带认证:', error);
        }
        
        console.log(`🚀 发送请求: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        console.error('❌ 请求拦截器错误:', error);
        return Promise.reject(error);
      }
    );
  }

  // 设置响应拦截器
  private setupResponseInterceptor() {
    this.instance.interceptors.response.use(
      (response: AxiosResponse<ApiResponse>) => {
        console.log(`✅ 收到响应: ${response.status} ${response.config.url}`);
        
        const { data } = response;
        
        console.log('🔍 原始响应数据:', data);
        console.log('🔍 响应数据类型:', typeof data);
        
        // 检查响应格式是否符合预期
        if (data && typeof data === 'object' && 'code' in data) {
          console.log('🔍 响应包含code字段:', data.code);
          // 如果code为0，表示成功
          if (data.code === 0) {
            console.log('🔍 业务成功，返回data字段:', data.data);
            console.log('🔍 data.data类型:', typeof data.data);
            console.log('🔍 data.data是否为undefined:', data.data === undefined);
            // 直接返回data字段，让上层业务代码使用
            return data.data;
          } else {
            // code不为0，表示业务异常
            const errorMessage = data.msg || '未知错误';
            console.error(`❌ 业务异常: ${errorMessage} (code: ${data.code})`);
            
            // 如果有错误回调，调用它
            if (this.errorCallback) {
              this.errorCallback(response as any, errorMessage);
            }
            
            // 抛出错误，包含业务错误信息
            const error = new Error(errorMessage);
            (error as any).code = data.code;
            (error as any).isBusinessError = true;
            return Promise.reject(error);
          }
        } else {
          // 响应格式不符合预期
          console.warn('⚠️ 响应格式不符合预期:', data);
          return data;
        }
      },
            async (error: AxiosError) => {
        console.error('❌ 网络请求错误:', error);
        
        let errorMessage = '网络请求失败';
        
        if (error.response) {
          // 服务器返回了错误状态码
          const status = error.response.status;
          const statusText = error.response.statusText;
          
          if (status === 401) {
            errorMessage = '未授权，请重新登录';
            // 尝试自动刷新token
            try {
              const newToken = await useUserStore.getState().refreshAccessToken();
              if (newToken) {
                console.log('🔄 Token自动刷新成功，可以重试请求');
                // 这里可以重试原始请求，但为了简单起见，我们让上层处理
              }
            } catch (refreshError) {
              console.error('❌ Token自动刷新失败:', refreshError);
              // 清除无效的token
              useUserStore.getState().clearUser();
            }
          } else if (status === 403) {
            errorMessage = '权限不足';
          } else if (status === 404) {
            errorMessage = '请求的资源不存在';
          } else if (status === 500) {
            errorMessage = '服务器内部错误';
          } else {
            errorMessage = `请求失败: ${status} ${statusText}`;
          }
          
          // 尝试解析错误响应体
          try {
            const errorData = error.response.data as ApiResponse;
            if (errorData && errorData.msg) {
              errorMessage = errorData.msg;
            }
          } catch (e) {
            // 忽略解析错误
          }
        } else if (error.request) {
          // 请求已发送但没有收到响应
          errorMessage = '网络连接超时，请检查网络';
        } else {
          // 其他错误
          errorMessage = error.message || '未知错误';
        }
        
        // 如果有错误回调，调用它
        if (this.errorCallback) {
          this.errorCallback(error, errorMessage);
        }
        
        // 抛出错误
        const customError = new Error(errorMessage);
        (customError as any).originalError = error;
        (customError as any).isNetworkError = true;
        return Promise.reject(customError);
      }
    );
  }

  // 设置错误回调函数
  public setErrorCallback(callback: ErrorCallback) {
    this.errorCallback = callback;
  }

  // GET请求
  public async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.instance.get(url, config);
  }

  // POST请求
  public async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.instance.post(url, data, config);
  }

  // PUT请求
  public async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.instance.put(url, data, config);
  }

  // DELETE请求
  public async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.instance.delete(url, config);
  }

  // PATCH请求
  public async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.instance.patch(url, data, config);
  }

  // 获取axios实例（用于高级配置）
  public getInstance(): AxiosInstance {
    return this.instance;
  }
}

// 创建默认的HTTP客户端实例
export const httpClient = new HttpClient();

// 导出便捷的请求方法
export const api = {
  get: <T = any>(url: string, config?: AxiosRequestConfig) => httpClient.get<T>(url, config),
  post: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) => httpClient.post<T>(url, data, config),
  put: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) => httpClient.put<T>(url, data, config),
  delete: <T = any>(url: string, config?: AxiosRequestConfig) => httpClient.delete<T>(url, config),
  patch: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) => httpClient.patch<T>(url, data, config),
};

// 类型已经在文件顶部定义，不需要重复导出
