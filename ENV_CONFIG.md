# 环境配置说明

## 环境变量配置

### 本地开发环境 (.env.local)
```bash
REACT_APP_API_HOST=http://localhost:8000
REACT_APP_ENV=local
```

### 测试环境 (.env.test)  
```bash
REACT_APP_API_HOST=https://your-ec2-domain.com
REACT_APP_ENV=test
```

### 生产环境 (.env.production)
```bash
REACT_APP_API_HOST=https://your-production-domain.com
REACT_APP_ENV=production
```

## 设计原则

### 只配置Host，不配置具体Endpoint
- ✅ `REACT_APP_API_HOST=https://api.example.com`
- ❌ `REACT_APP_DISCUSSION_API_URL=https://api.example.com/api/discussion`

### 智能URL构建
```javascript
// envConfig.getApiUrl() 会根据环境自动处理：
// 本地环境: '/api/discussion' (使用代理)
// 其他环境: 'https://api.example.com/api/discussion' (完整URL)
```

## 代理配置

### 本地开发
- `package.json` 中配置 `"proxy": "http://localhost:8000"`
- API调用使用相对路径 `/api/*`
- 自动代理到本地8000端口，解决CORS问题

### 测试/生产环境
- 使用完整URL: `${API_HOST}/api/endpoint`
- 需要服务器端配置CORS

## 使用方法

### API调用示例
```javascript
import { envConfig } from './utils/envConfig';

// 自动根据环境生成正确的URL
const apiUrl = envConfig.getApiUrl('/api/discussion');
const response = await fetch(apiUrl);
```

### 启动不同环境
```bash
# 本地开发（默认）
npm start

# 测试环境构建
REACT_APP_ENV=test npm run build

# 生产环境构建  
npm run build
```

### 环境变量优先级
1. `.env.local` - 本地开发（不应提交到git）
2. `.env.test` - 测试环境
3. `.env.production` - 生产环境

## AWS EC2 配置

1. 修改 `.env.test` 中的host：
   ```bash
   REACT_APP_API_HOST=https://your-ec2-instance.amazonaws.com
   ```

2. 确保EC2服务器配置CORS：
   ```javascript
   app.use((req, res, next) => {
     res.header('Access-Control-Allow-Origin', '*');
     res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
     res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
     next();
   });
   ```

## 调试信息

本地开发时控制台会显示环境配置，方便调试。