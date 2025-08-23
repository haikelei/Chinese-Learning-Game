# 课程学习 API

## 概述

课程学习API提供用户与课程内容交互的接口，包括查看课程详情、学习进度追踪等功能。

## 数据模型

### Course

```typescript
interface Course {
  id: string;                     // 课程ID
  title: string;                  // 课程标题
  description?: string;           // 课程描述
  textContent?: string;           // 课程文本内容
  orderIndex: number;             // 在课程包中的排序
  estimatedMinutes?: number;      // 预计学习时长(分钟)
  coursePackageId: string;        // 所属课程包ID
  createdAt: string;             // 创建时间
  updatedAt: string;             // 更新时间
  
  // AI处理状态
  textAnalysisStatus?: string;    // 文本分析状态
  exerciseGenerationStatus?: string; // 练习生成状态
  
  // 关联数据
  exercises?: Exercise[];         // 练习列表
  coursePackage?: CoursePackage;  // 课程包信息
  progress?: CourseProgress;      // 学习进度 (用户相关)
}
```

### CourseProgress

```typescript
interface CourseProgress {
  id: string;
  userId: string;
  courseId: string;
  isCompleted: boolean;           // 是否完成
  completedAt?: string;           // 完成时间
  lastAccessedAt: string;         // 最后访问时间
  progressPercentage: number;     // 完成百分比 (0-100)
  completedExercises: number;     // 已完成练习数
  totalExercises: number;         // 总练习数
  timeSpentMinutes: number;       // 学习时长(分钟)
}
```

## 课程学习接口

### 1. 获取课程详情 (需要认证)

**请求**
```
GET /api/courses/:id
Authorization: Bearer <user-token>
```

**路径参数**
- `id`: 课程ID

**响应示例**
```json
{
  "success": true,
  "data": {
    "id": "1",
    "title": "基本问候",
    "description": "学习如何用中文问候他人",
    "textContent": "你好！您好！早上好！晚安！再见！",
    "orderIndex": 1,
    "estimatedMinutes": 30,
    "coursePackageId": "1",
    "createdAt": "2024-01-10T10:00:00Z",
    "updatedAt": "2024-01-15T10:00:00Z",
    "textAnalysisStatus": "completed",
    "exerciseGenerationStatus": "completed",
    "coursePackage": {
      "id": "1",
      "title": "日常对话入门",
      "category": "日常交流",
      "level": 1
    },
    "exercises": [
      {
        "id": "1",
        "content": "你好！",
        "exerciseType": "listening",
        "difficultyLevel": 1,
        "orderIndex": 1,
        "audioResource": {
          "id": "1",
          "chineseText": "你好！",
          "pinyin": "nǐ hǎo ！",
          "audioUrl": "https://mandarin-loop-bucket.s3.us-east-1.amazonaws.com/audio/xxx.mp3",
          "durationSeconds": 1
        },
        "exerciseSegments": [
          {
            "id": "1",
            "content": "你好！",
            "segmentType": "single",
            "segmentIndex": 1,
            "audioResourceId": "1"
          }
        ]
      }
    ],
    "progress": {
      "id": "1",
      "userId": "user123",
      "courseId": "1",
      "isCompleted": false,
      "lastAccessedAt": "2024-01-20T14:30:00Z",
      "progressPercentage": 25,
      "completedExercises": 2,
      "totalExercises": 8,
      "timeSpentMinutes": 15
    }
  }
}
```

### 2. 获取课程学习进度 (需要认证)

**请求**
```
GET /api/courses/:id/progress
Authorization: Bearer <user-token>
```

**响应示例**
```json
{
  "success": true,
  "data": {
    "id": "1",
    "userId": "user123",
    "courseId": "1",
    "isCompleted": false,
    "lastAccessedAt": "2024-01-20T14:30:00Z",
    "progressPercentage": 25,
    "completedExercises": 2,
    "totalExercises": 8,
    "timeSpentMinutes": 15,
    "exerciseProgress": [
      {
        "exerciseId": "1",
        "isCompleted": true,
        "completedAt": "2024-01-20T14:00:00Z",
        "attempts": 1,
        "bestScore": 100
      },
      {
        "exerciseId": "2",
        "isCompleted": true,
        "completedAt": "2024-01-20T14:15:00Z",
        "attempts": 2,
        "bestScore": 85
      }
    ]
  }
}
```

### 3. 更新学习进度 (需要认证)

**请求**
```
POST /api/courses/:id/progress
Authorization: Bearer <user-token>
Content-Type: application/json
```

**请求体**
```json
{
  "action": "start_learning",        // start_learning | complete_exercise | complete_course
  "exerciseId": "1",                 // 可选：完成练习时提供
  "timeSpentMinutes": 5,             // 本次学习时长
  "score": 85                        // 可选：练习得分
}
```

**响应示例**
```json
{
  "success": true,
  "message": "学习进度已更新",
  "data": {
    "progressPercentage": 37,
    "completedExercises": 3,
    "totalTimeSpent": 20
  }
}
```

### 4. 获取课程包下所有课程 (需要认证)

**请求**
```
GET /api/courses/package/:packageId
Authorization: Bearer <user-token>
```

**路径参数**
- `packageId`: 课程包ID

**响应示例**
```json
{
  "success": true,
  "data": {
    "coursePackage": {
      "id": "1",
      "title": "日常对话入门",
      "description": "学习基础的日常对话",
      "level": 1,
      "estimatedHours": 10
    },
    "courses": [
      {
        "id": "1",
        "title": "基本问候",
        "orderIndex": 1,
        "estimatedMinutes": 30,
        "exerciseCount": 8,
        "progress": {
          "progressPercentage": 25,
          "isCompleted": false,
          "completedExercises": 2
        }
      },
      {
        "id": "2", 
        "title": "自我介绍",
        "orderIndex": 2,
        "estimatedMinutes": 45,
        "exerciseCount": 12,
        "progress": {
          "progressPercentage": 0,
          "isCompleted": false,
          "completedExercises": 0
        }
      }
    ],
    "overallProgress": {
      "totalCourses": 12,
      "completedCourses": 0,
      "totalExercises": 156,
      "completedExercises": 2,
      "overallPercentage": 1,
      "totalTimeSpent": 15
    }
  }
}
```

## AI处理状态说明

课程创建后会经过AI处理流程：

### 状态值
- `pending` - 等待处理
- `processing` - 处理中  
- `completed` - 处理完成
- `failed` - 处理失败

### 处理流程
1. **文本分析** (`textAnalysisStatus`) - AI分析课程文本内容
2. **练习生成** (`exerciseGenerationStatus`) - 基于文本生成练习
3. **分段生成** - 为每个练习生成学习片段
4. **音频生成** - 为片段生成TTS音频

## 错误代码

- `COURSE_NOT_FOUND` - 课程不存在
- `COURSE_NOT_ACCESSIBLE` - 课程不可访问 (未购买课程包)
- `PROGRESS_UPDATE_FAILED` - 进度更新失败
- `EXERCISE_NOT_FOUND` - 练习不存在
- `INVALID_ACTION` - 无效的操作类型

## 使用示例

### 前端获取课程详情

```javascript
async function loadCourse(courseId) {
  const response = await fetch(`/api/courses/${courseId}`, {
    headers: {
      'Authorization': `Bearer ${userToken}`,
      'Content-Type': 'application/json'
    }
  });
  
  const result = await response.json();
  
  if (result.success) {
    const course = result.data;
    // 渲染课程内容和练习列表
    renderCourse(course);
  }
}
```

### 前端更新学习进度

```javascript
async function startLearning(courseId) {
  const response = await fetch(`/api/courses/${courseId}/progress`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${userToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      action: 'start_learning',
      timeSpentMinutes: 1
    })
  });
  
  const result = await response.json();
  if (result.success) {
    console.log('开始学习，进度已更新');
  }
}

async function completeExercise(courseId, exerciseId, score) {
  const response = await fetch(`/api/courses/${courseId}/progress`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${userToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      action: 'complete_exercise',
      exerciseId: exerciseId,
      score: score,
      timeSpentMinutes: 3
    })
  });
  
  const result = await response.json();
  if (result.success) {
    console.log('练习完成，进度已更新');
  }
}
```