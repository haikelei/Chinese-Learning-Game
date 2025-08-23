# 中文学习平台 API 文档

## 概述

中文学习平台是一个基于TypeScript和Express的后端服务，提供完整的中文学习体验，包括课程管理、练习生成、音频播放和学习进度追踪。

## 系统架构概述

```
课程包 (CoursePackage)
├── 课程 (Course)
    ├── 练习 (Exercise) 
        ├── 练习片段 (ExerciseSegment)
            └── 音频资源 (AudioResource)
```

### 核心概念

- **课程包 (Course Package)**: 主题化的课程集合，如"日常对话"、"商务中文"等
- **课程 (Course)**: 课程包下的具体课程，包含相关文本内容
- **练习 (Exercise)**: 基于课程内容AI生成的学习练习
- **练习片段 (Exercise Segment)**: 练习的细分片段，支持渐进式学习
- **音频资源 (Audio Resource)**: 通过火山引擎TTS生成的音频文件

## API 基础信息

- **基础URL**: `http://localhost:8000/api`
- **内容类型**: `application/json`
- **认证方式**: JWT Bearer Token (部分接口)

## 文档导航

- [课程包管理 API](./course-packages.md) - 课程包的增删改查
- [课程学习 API](./courses.md) - 用户课程学习相关接口  
- [练习系统 API](./exercises.md) - 练习内容和提交答案
- [音频资源 API](./audio-resources.md) - 音频文件管理
- [学习中心 API](./learning-center.md) - 用户学习数据和进度
- [管理员 API](./admin.md) - 后台管理功能
- [AI处理流程](./ai-workflow.md) - AI生成练习和音频的完整流程

## 快速开始

### 1. 获取课程包列表

```bash
GET /api/store/packages
```

### 2. 获取课程包详情

```bash
GET /api/store/packages/:id
```

### 3. 获取课程内容 (需要认证)

```bash
GET /api/courses/:id
Authorization: Bearer <your-token>
```

### 4. 播放音频

```bash
GET /api/audio-resources/:id
```

## 常用响应格式

### 成功响应
```json
{
  "success": true,
  "data": { /* 数据内容 */ },
  "pagination": { /* 分页信息 (可选) */ }
}
```

### 错误响应
```json
{
  "success": false,
  "error": "错误描述"
}
```

## 状态码说明

- `200` - 请求成功
- `201` - 创建成功  
- `400` - 请求参数错误
- `401` - 认证失败
- `403` - 权限不足
- `404` - 资源不存在
- `500` - 服务器内部错误

## 认证说明

部分接口需要用户认证，请在请求头中包含JWT token：

```
Authorization: Bearer <your-jwt-token>
```

## 开发环境

当前系统运行在开发模式，管理员接口会跳过认证检查。生产环境需要配置相应的认证机制。