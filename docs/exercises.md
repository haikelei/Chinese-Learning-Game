# 练习系统 API

## 概述

练习系统是学习平台的核心功能，提供各种类型的中文学习练习，包括听力、发音、翻译等。每个练习包含多个学习片段，支持渐进式学习。

## 数据模型

### Exercise

```typescript
interface Exercise {
  id: string;                     // 练习ID
  content: string;                // 练习内容
  exerciseType: ExerciseType;     // 练习类型
  difficultyLevel: number;        // 难度等级 (1-5)
  orderIndex: number;             // 在课程中的排序
  explanation?: string;           // 练习说明
  courseId: string;               // 所属课程ID
  audioResourceId?: string;       // 关联音频资源ID
  createdAt: string;              // 创建时间
  updatedAt: string;              // 更新时间
  
  // AI处理状态
  segmentGenerationStatus?: string; // 分段生成状态
  segmentGenerationError?: string;  // 分段生成错误信息
  segmentGenerationRetries?: number; // 重试次数
  
  // 关联数据
  audioResource?: AudioResource;   // 音频资源
  exerciseSegments?: ExerciseSegment[]; // 练习片段
  course?: Course;                // 所属课程
  attempts?: ExerciseAttempt[];   // 练习尝试记录 (用户相关)
}

type ExerciseType = 'listening' | 'pronunciation' | 'translation' | 'comprehension';
```

### ExerciseSegment

```typescript
interface ExerciseSegment {
  id: string;                     // 片段ID
  content: string;                // 片段内容
  pinyin?: string;               // 拼音
  translation?: string;          // 翻译
  segmentType: SegmentType;      // 片段类型
  segmentIndex: number;          // 片段顺序
  practiceOrder?: number;        // 练习顺序
  difficultyLevel: number;       // 难度等级
  exerciseId: string;            // 所属练习ID
  audioResourceId?: string;      // 音频资源ID
  sourceSegments?: number[];     // 源片段ID数组 (组合片段)
  createdAt: string;             // 创建时间
  
  // AI处理状态
  audioGenerationStatus?: string; // 音频生成状态
  audioGenerationError?: string;  // 音频生成错误
  audioGenerationRetries?: number; // 重试次数
  
  // 关联数据
  audioResource?: AudioResource; // 音频资源
  exercise?: Exercise;           // 所属练习
}

type SegmentType = 'single' | 'combination';
```

### ExerciseAttempt

```typescript
interface ExerciseAttempt {
  id: string;
  userId: string;
  exerciseId: string;
  score: number;                  // 得分 (0-100)
  isCompleted: boolean;           // 是否完成
  timeSpentSeconds: number;       // 用时(秒)
  submittedAnswer?: string;       // 提交的答案
  feedback?: string;              // 反馈信息
  createdAt: string;              // 尝试时间
  
  exercise?: Exercise;            // 练习信息
}
```

## 练习相关接口

### 1. 获取练习详情 (需要认证)

**请求**
```
GET /api/exercises/:id
Authorization: Bearer <user-token>
```

**路径参数**
- `id`: 练习ID

**响应示例**
```json
{
  "success": true,
  "data": {
    "id": "1",
    "content": "你好！我是李明。很高兴认识你。",
    "exerciseType": "listening",
    "difficultyLevel": 1,
    "orderIndex": 1,
    "explanation": "听音频，然后跟读",
    "courseId": "1",
    "audioResourceId": "1",
    "createdAt": "2024-01-10T10:00:00Z",
    "updatedAt": "2024-01-15T10:00:00Z",
    "segmentGenerationStatus": "completed",
    "audioResource": {
      "id": "1",
      "chineseText": "你好！我是李明。很高兴认识你。",
      "pinyin": "nǐ hǎo ！ wǒ shì lǐ míng 。 hěn gāo xīng rèn shí nǐ 。",
      "translation": "Hello! I am Li Ming. Nice to meet you.",
      "audioUrl": "https://mandarin-loop-bucket.s3.us-east-1.amazonaws.com/audio/xxx.mp3",
      "durationSeconds": 3
    },
    "exerciseSegments": [
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
        "audioResource": {
          "id": "2",
          "chineseText": "你好！",
          "pinyin": "nǐ hǎo ！",
          "audioUrl": "https://mandarin-loop-bucket.s3.us-east-1.amazonaws.com/audio/yyy.mp3",
          "durationSeconds": 1
        }
      },
      {
        "id": "2",
        "content": "我是李明。",
        "pinyin": "wǒ shì lǐ míng 。",
        "translation": "I am Li Ming.",
        "segmentType": "single",
        "segmentIndex": 2,
        "practiceOrder": 2,
        "difficultyLevel": 1,
        "audioResourceId": "3"
      },
      {
        "id": "3",
        "content": "你好！我是李明。",
        "segmentType": "combination",
        "segmentIndex": 3,
        "practiceOrder": 3,
        "difficultyLevel": 2,
        "sourceSegments": [1, 2],
        "audioResourceId": "4"
      }
    ],
    "course": {
      "id": "1",
      "title": "基本问候",
      "coursePackageId": "1"
    },
    "attempts": [
      {
        "id": "1",
        "score": 85,
        "isCompleted": true,
        "timeSpentSeconds": 45,
        "createdAt": "2024-01-20T14:00:00Z"
      }
    ]
  }
}
```

### 2. 提交练习答案 (需要认证)

**请求**
```
POST /api/exercises/:id/submit
Authorization: Bearer <user-token>
Content-Type: application/json
```

**路径参数**
- `id`: 练习ID

**请求体**
```json
{
  "answer": "你好！我是李明。很高兴认识你。",  // 用户答案
  "timeSpentSeconds": 45,                    // 用时(秒)
  "exerciseType": "listening",               // 练习类型
  "segmentId": "1"                          // 可选：针对特定片段
}
```

**响应示例**
```json
{
  "success": true,
  "message": "答案提交成功",
  "data": {
    "attemptId": "123",
    "score": 85,
    "isCorrect": true,
    "feedback": "发音很好！注意'认识'的声调",
    "correctAnswer": "你好！我是李明。很高兴认识你。",
    "analysis": {
      "pronunciation": {
        "score": 88,
        "feedback": "整体发音准确"
      },
      "tone": {
        "score": 82,
        "feedback": "'认识'的第四声需要加强"
      },
      "fluency": {
        "score": 85,
        "feedback": "语速适中，表达流畅"
      }
    }
  }
}
```

### 3. 获取练习尝试历史 (需要认证)

**请求**
```
GET /api/exercises/:id/attempts
Authorization: Bearer <user-token>
```

**查询参数**
- `limit` (optional): 限制数量，默认10
- `offset` (optional): 偏移量，默认0

**响应示例**
```json
{
  "success": true,
  "data": [
    {
      "id": "123",
      "score": 85,
      "isCompleted": true,
      "timeSpentSeconds": 45,
      "submittedAnswer": "你好！我是李明。很高兴认识你。",
      "feedback": "发音很好！注意'认识'的声调",
      "createdAt": "2024-01-20T14:00:00Z"
    },
    {
      "id": "122",
      "score": 78,
      "isCompleted": true,
      "timeSpentSeconds": 52,
      "createdAt": "2024-01-20T13:45:00Z"
    }
  ],
  "pagination": {
    "total": 5,
    "hasMore": true
  }
}
```

## 练习片段接口

### 4. 获取练习片段列表 (管理员)

**请求**
```
GET /api/admin/exercises/:exerciseId/segments
Authorization: Bearer <admin-token>
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
      "createdAt": "2024-01-10T10:00:00Z"
    }
  ]
}
```

### 5. 创建练习片段 (管理员)

**请求**
```
POST /api/admin/exercise-segments
Authorization: Bearer <admin-token>
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
      "content": "早上好！很高兴见到你！",
      "segmentType": "combination",
      "segmentIndex": 2,
      "sourceSegments": [1, 2],
      "difficultyLevel": 2
    }
  ]
}
```

### 6. 生成组合片段 (管理员)

**请求**
```
POST /api/admin/exercises/:exerciseId/generate-combinations
Authorization: Bearer <admin-token>
```

**响应示例**
```json
{
  "success": true,
  "message": "组合片段生成成功",
  "data": {
    "generatedCount": 6,
    "segments": [
      {
        "content": "你好！我是李明。",
        "sourceSegments": [1, 2],
        "difficultyLevel": 2
      }
    ]
  }
}
```

### 7. 为片段生成音频 (管理员)

**请求**
```
POST /api/admin/segments/:segmentId/generate-audio
Authorization: Bearer <admin-token>
```

**响应示例**
```json
{
  "success": true,
  "message": "音频生成任务已启动",
  "data": {
    "taskId": "audio_gen_456"
  }
}
```

## 练习类型说明

### listening (听力练习)
- 用户听音频后跟读或选择正确答案
- 评分基于发音准确度和理解程度

### pronunciation (发音练习)  
- 用户跟读音频内容
- 评分基于发音、声调、流畅度

### translation (翻译练习)
- 用户将中文翻译成其他语言或反之
- 评分基于翻译准确性和语法

### comprehension (理解练习)
- 用户回答与内容相关的问题
- 评分基于理解程度和回答准确性

## AI处理状态

### 分段生成状态 (segmentGenerationStatus)
- `pending` - 等待分段生成
- `processing` - 正在生成分段
- `completed` - 分段生成完成
- `failed` - 分段生成失败

### 音频生成状态 (audioGenerationStatus)
- `pending` - 等待音频生成
- `processing` - 正在生成音频
- `completed` - 音频生成完成
- `failed` - 音频生成失败

## 错误代码

- `EXERCISE_NOT_FOUND` - 练习不存在
- `EXERCISE_NOT_ACCESSIBLE` - 练习不可访问
- `INVALID_ANSWER_FORMAT` - 答案格式错误
- `SUBMISSION_FAILED` - 提交失败
- `SEGMENT_NOT_FOUND` - 片段不存在
- `AUDIO_GENERATION_FAILED` - 音频生成失败

## 使用示例

### 前端加载练习

```javascript
async function loadExercise(exerciseId) {
  const response = await fetch(`/api/exercises/${exerciseId}`, {
    headers: {
      'Authorization': `Bearer ${userToken}`
    }
  });
  
  const result = await response.json();
  
  if (result.success) {
    const exercise = result.data;
    
    // 渲染练习内容
    renderExercise(exercise);
    
    // 如果有音频，准备播放器
    if (exercise.audioResource) {
      setupAudioPlayer(exercise.audioResource.audioUrl);
    }
    
    // 渲染练习片段
    renderSegments(exercise.exerciseSegments);
  }
}
```

### 前端提交答案

```javascript
async function submitAnswer(exerciseId, answer, timeSpent) {
  const response = await fetch(`/api/exercises/${exerciseId}/submit`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${userToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      answer: answer,
      timeSpentSeconds: timeSpent,
      exerciseType: 'listening'
    })
  });
  
  const result = await response.json();
  
  if (result.success) {
    const feedback = result.data;
    
    // 显示得分和反馈
    showFeedback(feedback.score, feedback.feedback);
    
    // 显示详细分析
    if (feedback.analysis) {
      showDetailedAnalysis(feedback.analysis);
    }
  }
}
```

### 前端播放片段音频

```javascript
async function playSegmentAudio(segmentId, audioResourceId) {
  try {
    // 获取音频资源详情
    const response = await fetch(`/api/audio-resources/${audioResourceId}`, {
      headers: {
        'Authorization': `Bearer ${userToken}`
      }
    });
    
    const result = await response.json();
    
    if (result.success && result.data.audioUrl) {
      // 播放音频
      const audio = new Audio(result.data.audioUrl);
      audio.play().catch(error => {
        console.error('音频播放失败:', error);
      });
    }
  } catch (error) {
    console.error('获取音频失败:', error);
  }
}
```