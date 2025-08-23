# HTTP客户端和拦截器使用说明

## 概述

这个项目现在使用基于axios的HTTP客户端，并配置了全局拦截器来处理RESTful风格的API响应格式。所有API响应都应该是 `{code: 0, msg: "...", data: ...}` 的格式。

## 核心特性

### 1. 自动响应解析
- 当 `code === 0` 时，拦截器自动提取 `data` 字段并返回给上层业务代码
- 当 `code !== 0` 时，拦截器自动抛出错误，错误信息在 `msg` 字段中

### 2. 全局错误处理
- 自动处理网络错误、业务错误、认证错误等
- 支持全局错误回调，可以统一处理错误日志、通知等
- 提供用户友好的错误消息

### 3. 类型安全
- 完整的TypeScript类型定义
- 支持泛型，可以指定返回数据的类型

## 使用方法

### 基本导入

```typescript
import { api, handleApiError } from './utils/apiConfig';
```

### 基本API调用

```typescript
// GET请求
try {
  const courseData = await api.get('/api/courses/123');
  // courseData 直接就是 data 字段的内容，不需要 response.data
  console.log('课程数据:', courseData);
} catch (error) {
  handleApiError(error);
}

// POST请求
try {
  const result = await api.post('/api/courses', {
    title: '新课程',
    description: '课程描述'
  });
  console.log('创建成功:', result);
} catch (error) {
  handleApiError(error);
}
```

### 带查询参数的请求

```typescript
try {
  const params = new URLSearchParams({
    page: '1',
    limit: '10',
    category: 'daily'
  });
  
  const result = await api.get(`/api/courses?${params}`);
  console.log('分页数据:', result);
} catch (error) {
  handleApiError(error);
}
```

### 错误处理

```typescript
try {
  const result = await api.get('/api/some-endpoint');
  return result;
} catch (error: any) {
  // 检查错误类型
  if (error.isBusinessError) {
    console.log('业务错误:', error.message, '错误码:', error.code);
  } else if (error.isNetworkError) {
    console.log('网络错误:', error.message);
  }
  
  // 使用全局错误处理
  handleApiError(error);
  throw error;
}
```

## 错误类型

### 1. 业务错误 (BUSINESS_ERROR)
- `code !== 0` 的API响应
- 错误信息在 `msg` 字段中
- 可以通过 `error.code` 获取错误码

### 2. 网络错误 (NETWORK_ERROR)
- HTTP状态码错误 (4xx, 5xx)
- 网络连接超时
- 可以通过 `error.response?.status` 获取HTTP状态码

### 3. 认证错误 (AUTH_ERROR)
- 401: 未授权，需要重新登录
- 403: 权限不足
- 自动处理认证相关的错误

### 4. 验证错误 (VALIDATION_ERROR)
- 422: 输入数据验证失败
- 通常包含具体的验证错误信息

## 全局错误处理

### 设置全局错误回调

```typescript
import { addErrorCallback, ErrorType } from './utils/apiConfig';

addErrorCallback((errorInfo) => {
  switch (errorInfo.type) {
    case ErrorType.AUTH_ERROR:
      // 处理认证错误，比如跳转到登录页
      console.log('需要重新登录');
      break;
    case ErrorType.NETWORK_ERROR:
      // 处理网络错误，比如显示重试按钮
      console.log('网络错误，建议重试');
      break;
    case ErrorType.BUSINESS_ERROR:
      // 处理业务错误，比如显示具体的错误信息
      console.log('业务错误:', errorInfo.message);
      break;
  }
});
```

### 移除错误回调

```typescript
import { removeErrorCallback } from './utils/apiConfig';

// 保存回调引用
const errorCallback = (errorInfo) => { /* ... */ };

// 添加回调
addErrorCallback(errorCallback);

// 移除回调
removeErrorCallback(errorCallback);
```

## 高级配置

### 自定义HTTP客户端

```typescript
import { HttpClient } from './utils/httpClient';

const customClient = new HttpClient({
  baseURL: 'https://api.example.com',
  timeout: 15000,
  headers: {
    'X-Custom-Header': 'value'
  }
});

// 使用自定义客户端
const result = await customClient.get('/api/endpoint');
```

### 获取axios实例

```typescript
import { httpClient } from './utils/apiConfig';

const axiosInstance = httpClient.getInstance();

// 可以直接使用axios实例的方法
axiosInstance.interceptors.request.use(/* ... */);
```

## 迁移指南

### 从fetch迁移到新的HTTP客户端

**之前 (fetch):**
```typescript
const response = await fetch('/api/courses');
const result = await response.json();

if (result.success) {
  const courseData = result.data;
  // 使用 courseData
} else {
  console.error('API错误:', result.message);
}
```

**现在 (新的HTTP客户端):**
```typescript
try {
  const courseData = await api.get('/api/courses');
  // 直接使用 courseData，不需要检查 success
} catch (error) {
  handleApiError(error);
}
```

### 从旧的API调用迁移

**之前:**
```typescript
const response = await fetchCoursePackages(params);
if (response.success) {
  setCoursePackages(response.data);
} else {
  setError('获取课程包数据失败');
}
```

**现在:**
```typescript
try {
  const coursePackages = await api.get('/api/store/packages', {
    params: params
  });
  setCoursePackages(coursePackages);
} catch (error) {
  setError(`获取课程包数据失败：${error.message}`);
}
```

## 注意事项

1. **响应格式**: 确保后端API返回格式为 `{code: 0, msg: "...", data: ...}`
2. **错误处理**: 建议在组件中使用 `try-catch` 包装API调用
3. **类型定义**: 可以为API响应定义具体的类型接口
4. **调试**: 在开发环境下，拦截器会输出详细的请求和响应日志

## 示例文件

- `apiExamples.ts`: 详细的使用示例
- `httpClient.ts`: HTTP客户端核心实现
- `errorHandler.ts`: 全局错误处理逻辑
- `apiConfig.ts`: 配置和导出文件
