import { api, handleApiError, addErrorCallback } from './apiConfig';

// 示例1: 基本的API调用
export const exampleBasicUsage = async () => {
  try {
    // 直接获取data字段，拦截器已经处理了响应格式
    const courseData = await api.get('/api/courses/123');
    console.log('课程数据:', courseData);
    
    // 不需要检查 response.success，直接使用数据
    return courseData;
  } catch (error) {
    // 使用全局错误处理
    handleApiError(error);
    throw error;
  }
};

// 示例2: 带数据的POST请求
export const examplePostRequest = async (courseData: any) => {
  try {
    const result = await api.post('/api/courses', courseData);
    console.log('创建成功:', result);
    return result;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

// 示例3: 带查询参数的GET请求
export const exampleGetWithParams = async (page: number, limit: number) => {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    });
    
    const result = await api.get(`/api/courses?${params}`);
    console.log('分页数据:', result);
    return result;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

// 示例4: 设置全局错误回调
export const setupGlobalErrorHandling = () => {
  // 添加全局错误回调，可以用于记录日志、显示通知等
  addErrorCallback((errorInfo) => {
    console.log('全局错误回调:', errorInfo);
    
    // 根据错误类型执行不同的处理逻辑
    switch (errorInfo.type) {
      case 'AUTH_ERROR':
        // 处理认证错误，比如跳转到登录页
        console.log('需要重新登录');
        break;
      case 'NETWORK_ERROR':
        // 处理网络错误，比如显示重试按钮
        console.log('网络错误，建议重试');
        break;
      case 'BUSINESS_ERROR':
        // 处理业务错误，比如显示具体的错误信息
        console.log('业务错误:', errorInfo.message);
        break;
      default:
        console.log('其他错误:', errorInfo.message);
    }
  });
};

// 示例5: 在组件中使用
export const exampleComponentUsage = async () => {
  try {
    // 获取课程包列表
    const coursePackages = await api.get('/api/store/packages');
    
    // 获取课程详情
    const courseDetail = await api.get('/api/courses/456');
    
    // 提交练习答案
    const submitResult = await api.post('/api/exercises/789/submit', {
      answer: '用户答案',
      timeSpent: 120
    });
    
    return {
      packages: coursePackages,
      course: courseDetail,
      submitResult
    };
  } catch (error) {
    // 错误已经被全局处理器处理了，这里可以做一些组件特定的处理
    console.log('组件中捕获到错误:', error);
    throw error;
  }
};

// 示例6: 错误处理的完整流程
export const exampleCompleteErrorHandling = async () => {
  try {
    const result = await api.get('/api/some-endpoint');
    return result;
  } catch (error: any) {
    // 检查是否是业务错误
    if (error.isBusinessError) {
      console.log('业务错误:', error.message, '错误码:', error.code);
      // 可以显示具体的业务错误信息
    } else if (error.isNetworkError) {
      console.log('网络错误:', error.message);
      // 可以显示网络错误提示
    } else {
      console.log('其他错误:', error.message);
    }
    
    // 使用全局错误处理器
    handleApiError(error);
    
    // 重新抛出错误，让上层处理
    throw error;
  }
};
