# 课程包管理 API

## 概述

课程包是系统的顶级内容组织单位，每个课程包包含多个相关课程。课程包在商店中展示，用户可以浏览和选择感兴趣的内容。

## 数据模型

### CoursePackage

```typescript
interface CoursePackage {
  id: string;                    // 课程包ID
  title: string;                 // 课程包标题
  description: string;           // 课程包描述
  category: string;              // 分类
  level: number;                 // 难度等级 (1-5)
  estimatedHours: number;        // 预计学习时长(小时)
  price: number;                 // 价格
  originalPrice?: number;        // 原价
  imageUrl?: string;            // 封面图片
  tags: string[];               // 标签
  isPublished: boolean;         // 是否发布
  publishedAt?: string;         // 发布时间
  createdAt: string;            // 创建时间
  updatedAt: string;            // 更新时间
  courseCount: number;          // 包含课程数
  totalExercises: number;       // 总练习数
  courses?: Course[];           // 课程列表 (详情接口返回)
}
```

## 公开接口 (商店)

### 1. 获取课程包列表

**请求**
```
GET /api/store/packages
```

**查询参数**
- `page` (optional): 页码，默认1
- `limit` (optional): 每页数量，默认20，最大100
- `category` (optional): 分类筛选
- `level` (optional): 难度等级筛选 (1-5)
- `minPrice` (optional): 最低价格筛选
- `maxPrice` (optional): 最高价格筛选
- `search` (optional): 搜索关键词
- `sortBy` (optional): 排序字段 (price|level|createdAt|popularity)，默认createdAt
- `sortOrder` (optional): 排序方向 (asc|desc)，默认desc
- `tags` (optional): 标签筛选，逗号分隔

**响应示例**
```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "title": "日常对话入门",
      "description": "学习基础的日常对话，包括问候、自我介绍、购物等场景",
      "category": "日常交流",
      "level": 1,
      "estimatedHours": 10,
      "price": 99,
      "originalPrice": 199,
      "imageUrl": "https://example.com/image.jpg",
      "tags": ["入门", "对话", "日常"],
      "isPublished": true,
      "publishedAt": "2024-01-15T10:00:00Z",
      "createdAt": "2024-01-10T10:00:00Z",
      "updatedAt": "2024-01-15T10:00:00Z",
      "courseCount": 12,
      "totalExercises": 156
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 25,
    "totalPages": 2,
    "hasNext": true,
    "hasPrev": false
  }
}
```

### 2. 获取课程包详情

**请求**
```
GET /api/store/packages/:id
```

**路径参数**
- `id`: 课程包ID

**响应示例**
```json
{
  "success": true,
  "data": {
    "id": "1",
    "title": "日常对话入门",
    "description": "学习基础的日常对话，包括问候、自我介绍、购物等场景",
    "category": "日常交流",
    "level": 1,
    "estimatedHours": 10,
    "price": 99,
    "originalPrice": 199,
    "imageUrl": "https://example.com/image.jpg",
    "tags": ["入门", "对话", "日常"],
    "isPublished": true,
    "publishedAt": "2024-01-15T10:00:00Z",
    "createdAt": "2024-01-10T10:00:00Z",
    "updatedAt": "2024-01-15T10:00:00Z",
    "courseCount": 12,
    "totalExercises": 156,
    "courses": [
      {
        "id": "1",
        "title": "基本问候",
        "description": "学习如何用中文问候他人",
        "orderIndex": 1,
        "estimatedMinutes": 30,
        "exerciseCount": 8
      }
      // ... 更多课程
    ]
  }
}
```

### 3. 获取分类列表

**请求**
```
GET /api/store/categories
```

**响应示例**
```json
{
  "success": true,
  "data": [
    {
      "name": "日常交流",
      "count": 12,
      "description": "日常生活中的对话场景"
    },
    {
      "name": "商务中文",
      "count": 8,
      "description": "商务环境下的中文交流"
    }
  ]
}
```

### 4. 获取统计信息

**请求**
```
GET /api/store/stats
```

**响应示例**
```json
{
  "success": true,
  "data": {
    "totalPackages": 25,
    "totalCourses": 156,
    "totalExercises": 2340,
    "averagePrice": 129,
    "categoriesCount": 8,
    "publishedPackages": 20,
    "recentPackages": 3
  }
}
```

## 管理接口

以下接口需要管理员认证。

### 5. 创建课程包

**请求**
```
POST /api/store/packages
Authorization: Bearer <admin-token>
Content-Type: application/json
```

**请求体**
```json
{
  "title": "新课程包",
  "description": "课程包描述",
  "category": "日常交流",
  "level": 2,
  "estimatedHours": 15,
  "price": 159,
  "originalPrice": 299,
  "tags": ["中级", "对话"]
}
```

**响应示例**
```json
{
  "success": true,
  "message": "课程包创建成功",
  "data": {
    "id": "26",
    // ... 其他课程包字段
  }
}
```

### 6. 更新课程包

**请求**
```
PUT /api/store/packages/:id
Authorization: Bearer <admin-token>
Content-Type: application/json
```

**路径参数**
- `id`: 课程包ID

**请求体**
```json
{
  "title": "更新后的标题",
  "price": 199,
  "tags": ["更新", "标签"]
}
```

### 7. 发布/下架课程包

**请求**
```
PATCH /api/store/packages/:id/publish
Authorization: Bearer <admin-token>
Content-Type: application/json
```

**请求体**
```json
{
  "isPublished": true
}
```

### 8. 删除课程包

**请求**
```
DELETE /api/store/packages/:id
Authorization: Bearer <admin-token>
```

**响应示例**
```json
{
  "success": true,
  "message": "课程包删除成功"
}
```

## 错误代码

- `PACKAGE_NOT_FOUND` - 课程包不存在
- `PACKAGE_NOT_PUBLISHED` - 课程包未发布
- `INVALID_CATEGORY` - 无效的分类
- `INVALID_LEVEL` - 无效的难度等级 (必须1-5)
- `INVALID_PRICE` - 无效的价格 (必须大于0)

## 使用示例

### 前端获取课程包列表

```javascript
// 获取入门级别的日常交流课程包
const response = await fetch('/api/store/packages?category=日常交流&level=1&sortBy=price&sortOrder=asc');
const result = await response.json();

if (result.success) {
  const packages = result.data;
  const pagination = result.pagination;
  // 渲染课程包列表
}
```

### 前端获取课程包详情

```javascript
const packageId = '1';
const response = await fetch(`/api/store/packages/${packageId}`);
const result = await response.json();

if (result.success) {
  const packageDetail = result.data;
  // 渲染课程包详情和课程列表
}
```