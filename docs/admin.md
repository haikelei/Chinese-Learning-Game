# 管理员 API

## 概述

管理员API提供后台管理功能，包括课程包管理、课程创建、练习编辑、片段管理、AI任务重试等。

⚠️ **开发环境说明**: 当前系统运行在开发模式，管理员接口会跳过认证检查。生产环境需要配置相应的管理员认证机制。

## 数据模型

### AI处理状态

```typescript
interface AIProcessingStatus {
  // 文本分析状态
  textAnalysisStatus?: 'pending' | 'processing' | 'completed' | 'failed';
  textAnalysisError?: string;
  textAnalysisRetries?: number;
  
  // 练习生成状态  
  exerciseGenerationStatus?: 'pending' | 'processing' | 'completed' | 'failed';
  exerciseGenerationError?: string;
  exerciseGenerationRetries?: number;
  
  // 分段生成状态
  segmentGenerationStatus?: 'pending' | 'processing' | 'completed' | 'failed';
  segmentGenerationError?: string;
  segmentGenerationRetries?: number;
  
  // 音频生成状态
  audioGenerationStatus?: 'pending' | 'processing' | 'completed' | 'failed';
  audioGenerationError?: string;
  audioGenerationRetries?: number;
}
```

## 认证

生产环境需要管理员JWT token：

```
Authorization: Bearer <admin-token>
```

开发环境自动跳过认证检查。

## 课程包管理

### 1. 获取所有课程包 (含详细信息)

**请求**
```
GET /api/admin/course-packages
```

**响应示例**
```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "title": "日常对话入门",
      "description": "学习基础的日常对话",
      "category": "日常交流",
      "level": 1,
      "estimatedHours": 10,
      "price": 99,
      "isPublished": true,
      "courseCount": 12,
      "totalExercises": 156,
      "createdAt": "2024-01-10T10:00:00Z",
      "courses": [
        {
          "id": "1",
          "title": "基本问候",
          "orderIndex": 1,
          "textAnalysisStatus": "completed",
          "exerciseGenerationStatus": "completed",
          "exercises": [
            {
              "id": "1",
              "content": "你好！",
              "exerciseType": "listening",
              "segmentGenerationStatus": "completed",
              "audioResource": {
                "chineseText": "你好！",
                "pinyin": "nǐ hǎo ！",
                "audioUrl": "https://mandarin-loop-bucket.s3.us-east-1.amazonaws.com/audio/xxx.mp3"
              },
              "exerciseSegments": [
                {
                  "id": "1",
                  "content": "你好！",
                  "segmentType": "single",
                  "audioGenerationStatus": "completed",
                  "audioResourceId": "2"
                }
              ]
            }
          ]
        }
      ]
    }
  ]
}
```

### 2. 创建课程包

**请求**
```
POST /api/admin/course-packages
Content-Type: application/json
```

**请求体**
```json
{
  "title": "商务中文进阶",
  "description": "适合有一定基础的学习者",
  "category": "商务中文",
  "level": 3,
  "estimatedHours": 25,
  "price": 299,
  "tags": ["商务", "进阶", "口语"]
}
```

### 3. 删除课程包

**请求**
```
DELETE /api/admin/course-packages/:packageId
```

**响应示例**
```json
{
  "success": true,
  "message": "课程包删除成功"
}
```

## 课程管理

### 4. 使用AI创建课程

**请求**
```
POST /api/admin/courses/create-with-ai
Content-Type: application/json
```

**请求体**
```json
{
  "coursePackageId": "1",
  "title": "餐厅点餐",
  "description": "学习在餐厅点餐的对话",
  "textContent": "服务员：您好，请问需要点什么？客人：我想要一份宫保鸡丁和一碗米饭。服务员：好的，请稍等。",
  "estimatedMinutes": 30
}
```

**响应示例**
```json
{
  "success": true,
  "message": "课程创建成功，AI处理任务已启动",
  "data": {
    "courseId": "25",
    "title": "餐厅点餐",
    "aiTaskIds": {
      "textAnalysis": "task_123",
      "exerciseGeneration": "pending"
    }
  }
}
```

### 5. 更新课程

**请求**
```
PUT /api/admin/courses/:courseId
Content-Type: application/json
```

**请求体**
```json
{
  "title": "餐厅点餐对话",
  "description": "更新后的描述",
  "estimatedMinutes": 35
}
```

### 6. 删除课程

**请求**
```
DELETE /api/admin/courses/:courseId
```

## 练习管理

### 7. 更新练习

**请求**
```
PUT /api/admin/exercises/:exerciseId
Content-Type: application/json
```

**请求体**
```json
{
  "exerciseType": "pronunciation",
  "difficultyLevel": 2,
  "explanation": "跟读练习，注意声调",
  "audioResource": {
    "chineseText": "你好！",
    "pinyin": "nǐ hǎo ！",
    "translation": "Hello!"
  }
}
```

### 8. 删除练习

**请求**
```
DELETE /api/admin/exercises/:exerciseId
```

## 练习片段管理

### 9. 获取练习片段

**请求**
```
GET /api/admin/exercises/:exerciseId/segments
```

**响应示例**
```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "content": "你好！",
      "pinyin": "nǐ hǎo ！",
      "translation": "Hello!",
      "segmentType": "single",
      "segmentIndex": 1,
      "practiceOrder": 1,
      "difficultyLevel": 1,
      "audioResourceId": "2",
      "audioGenerationStatus": "completed",
      "audioGenerationRetries": 0,
      "createdAt": "2024-01-10T10:00:00Z"
    },
    {
      "id": "2",
      "content": "你好！很高兴认识你！",
      "segmentType": "combination",
      "segmentIndex": 2,
      "sourceSegments": [1, 3],
      "difficultyLevel": 2,
      "audioGenerationStatus": "processing"
    }
  ]
}
```

### 10. 创建练习片段

**请求**
```
POST /api/admin/exercise-segments
Content-Type: application/json
```

**请求体**
```json
{
  "exerciseId": "1",
  "segments": [
    {
      "content": "早上好！",
      "pinyin": "zǎo shàng hǎo ！",
      "translation": "Good morning!",
      "segmentType": "single",
      "segmentIndex": 1,
      "difficultyLevel": 1
    },
    {
      "content": "早上好！今天天气真不错！",
      "segmentType": "combination",
      "segmentIndex": 2,
      "sourceSegments": [1, 2],
      "difficultyLevel": 2
    }
  ]
}
```

### 11. 更新练习片段

**请求**
```
PUT /api/admin/exercise-segments/:segmentId
Content-Type: application/json
```

**请求体**
```json
{
  "content": "早上好！",
  "pinyin": "zǎo shàng hǎo ！",
  "translation": "Good morning!",
  "difficultyLevel": 2
}
```

### 12. 删除练习片段

**请求**
```
DELETE /api/admin/exercise-segments/:segmentId
```

### 13. 生成组合片段

**请求**
```
POST /api/admin/exercises/:exerciseId/generate-combinations
```

**响应示例**
```json
{
  "success": true,
  "message": "成功生成 6 个组合片段",
  "data": {
    "generatedCount": 6,
    "segments": [
      {
        "content": "你好！我是李明。",
        "sourceSegments": [1, 2],
        "difficultyLevel": 2
      },
      {
        "content": "你好！我是李明。很高兴认识你。",
        "sourceSegments": [1, 2, 3],
        "difficultyLevel": 3
      }
    ]
  }
}
```

## 批量数据导入

### 14. 导入完整课程包数据

**请求**
```
POST /api/admin/import-complete
Content-Type: application/json
```

**请求体**
```json
{
  "coursePackage": {
    "title": "旅游中文",
    "description": "旅游场景下的中文对话",
    "category": "旅游",
    "level": 2,
    "price": 199
  },
  "courses": [
    {
      "title": "酒店入住",
      "textContent": "前台：欢迎光临！请问您预订了房间吗？客人：是的，我预订了一间双人房。",
      "orderIndex": 1,
      "estimatedMinutes": 40
    },
    {
      "title": "问路指引", 
      "textContent": "游客：请问去故宫怎么走？本地人：您坐地铁1号线到天安门东站。",
      "orderIndex": 2,
      "estimatedMinutes": 35
    }
  ]
}
```

**响应示例**
```json
{
  "success": true,
  "message": "导入任务已启动",
  "data": {
    "taskId": "33",
    "coursePackageId": "33",
    "coursesCount": 3,
    "estimatedTimeMinutes": 10
  }
}
```

### 15. 查询导入任务状态

**请求**
```
GET /api/admin/import-status/:taskId
```

**响应示例**
```json
{
  "success": true,
  "data": {
    "taskId": "33",
    "status": "processing",
    "progress": {
      "totalCourses": 3,
      "completedCourses": 1,
      "currentStep": "exercise-generation",
      "progressPercentage": 33
    },
    "startedAt": "2024-01-20T15:00:00Z",
    "estimatedCompletion": "2024-01-20T15:10:00Z"
  }
}
```

## AI任务重试

### 16. 重试文本分析

**请求**
```
POST /api/ai-status/retry/text-analysis
Content-Type: application/json
```

**请求体**
```json
{
  "courseId": "25",
  "priority": 1
}
```

### 17. 重试练习生成

**请求**
```
POST /api/ai-status/retry/exercise-creation
Content-Type: application/json
```

**请求体**
```json
{
  "courseId": "25",
  "priority": 1
}
```

### 18. 重试分段生成

**请求**
```
POST /api/ai-status/retry/segment-generation
Content-Type: application/json
```

**请求体**
```json
{
  "exerciseId": "156",
  "priority": 1
}
```

### 19. 重试音频生成

**请求**
```
POST /api/ai-status/retry/audio-generation
Content-Type: application/json
```

**请求体**
```json
{
  "segmentId": "380",
  "priority": 1
}
```

### 20. 为单个片段生成音频

**请求**
```
POST /api/admin/segments/:segmentId/generate-audio
```

**响应示例**
```json
{
  "success": true,
  "message": "音频生成任务已启动",
  "data": {
    "taskId": "audio_456"
  }
}
```

## 管理员登录

### 21. 管理员登录 (生产环境)

**请求**
```
POST /api/admin/login
Content-Type: application/json
```

**请求体**
```json
{
  "username": "admin",
  "password": "admin_password"
}
```

**响应示例**
```json
{
  "success": true,
  "message": "登录成功",
  "data": {
    "token": "jwt_token_here",
    "expiresIn": "24h",
    "adminInfo": {
      "id": "admin1",
      "username": "admin",
      "role": "administrator"
    }
  }
}
```

## AI处理流程说明

### 完整的AI处理流程

1. **导入课程包** → 创建课程包和课程记录
2. **文本分析** → AI分析课程文本内容
3. **练习生成** → 基于分析结果生成练习
4. **分段生成** → 为每个练习生成学习片段
5. **音频生成** → 为每个片段生成TTS音频

### 状态监控

每个步骤都有对应的状态字段：
- `pending` - 等待处理
- `processing` - 正在处理
- `completed` - 处理完成
- `failed` - 处理失败 (可重试)

### 错误处理

- 失败的任务会记录错误信息和重试次数
- 可以通过重试接口重新启动失败的任务
- 系统会自动处理依赖关系 (如练习生成依赖文本分析)

## 使用示例

### 管理后台 - 创建课程包并导入课程

```javascript
async function createPackageWithCourses(packageData, coursesData) {
  try {
    // 导入完整课程包数据
    const response = await fetch('/api/admin/import-complete', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${adminToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        coursePackage: packageData,
        courses: coursesData
      })
    });
    
    const result = await response.json();
    
    if (result.success) {
      const taskId = result.data.taskId;
      
      // 监控导入进度
      monitorImportProgress(taskId);
      
      return result.data;
    }
  } catch (error) {
    console.error('导入失败:', error);
  }
}

async function monitorImportProgress(taskId) {
  const checkStatus = async () => {
    const response = await fetch(`/api/admin/import-status/${taskId}`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    
    const result = await response.json();
    
    if (result.success) {
      const status = result.data;
      
      if (status.status === 'completed') {
        console.log('导入完成！');
        // 刷新课程包列表
        loadCoursePackages();
      } else if (status.status === 'failed') {
        console.error('导入失败:', status.error);
      } else {
        // 继续监控
        setTimeout(checkStatus, 2000);
      }
    }
  };
  
  checkStatus();
}
```

### 管理后台 - 重试失败的AI任务

```javascript
async function retryFailedTasks(courseId) {
  try {
    // 重试文本分析
    await fetch('/api/ai-status/retry/text-analysis', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${adminToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        courseId: courseId,
        priority: 1
      })
    });
    
    console.log('文本分析重试任务已启动');
    
    // 2秒后重试练习生成
    setTimeout(async () => {
      await fetch('/api/ai-status/retry/exercise-creation', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          courseId: courseId,
          priority: 1
        })
      });
      
      console.log('练习生成重试任务已启动');
    }, 2000);
    
  } catch (error) {
    console.error('重试任务启动失败:', error);
  }
}
```