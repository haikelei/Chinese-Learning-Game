# 学习中心 API

## 概述

学习中心API为用户提供个人学习数据管理，包括已注册的课程包、学习进度、统计数据等功能。

## 数据模型

### UserPackageEnrollment

```typescript
interface UserPackageEnrollment {
  id: string;
  userId: string;
  coursePackageId: string;
  enrolledAt: string;             // 注册时间
  isCompleted: boolean;           // 是否完成整个课程包
  completedAt?: string;           // 完成时间
  lastAccessedAt: string;         // 最后访问时间
  progressPercentage: number;     // 总体进度百分比 (0-100)
  
  // 关联数据
  coursePackage?: CoursePackage;  // 课程包信息
  courseProgresses?: CourseProgress[]; // 课程进度列表
}
```

### LearningStatistics

```typescript
interface LearningStatistics {
  totalPackages: number;          // 已注册课程包数
  completedPackages: number;      // 已完成课程包数
  totalCourses: number;           // 总课程数
  completedCourses: number;       // 已完成课程数
  totalExercises: number;         // 总练习数
  completedExercises: number;     // 已完成练习数
  totalTimeSpentMinutes: number;  // 总学习时长(分钟)
  averageScore: number;           // 平均得分
  currentStreak: number;          // 连续学习天数
  lastStudyDate?: string;         // 最后学习日期
  studyHistory: StudyDayRecord[]; // 学习历史记录
}

interface StudyDayRecord {
  date: string;                   // 日期 (YYYY-MM-DD)
  minutesStudied: number;         // 当日学习时长
  exercisesCompleted: number;     // 当日完成练习数
  averageScore: number;           // 当日平均得分
}
```

## 用户学习中心接口 (需要认证)

### 1. 获取用户已注册的课程包

**请求**
```
GET /api/my/packages
Authorization: Bearer <user-token>
```

**查询参数**
- `status` (optional): 状态筛选 (completed|in_progress|all)，默认all
- `sortBy` (optional): 排序字段 (enrolledAt|lastAccessedAt|progressPercentage)，默认lastAccessedAt
- `sortOrder` (optional): 排序方向 (asc|desc)，默认desc

**响应示例**
```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "userId": "user123",
      "coursePackageId": "1",
      "enrolledAt": "2024-01-15T10:00:00Z",
      "isCompleted": false,
      "lastAccessedAt": "2024-01-20T14:30:00Z",
      "progressPercentage": 35,
      "coursePackage": {
        "id": "1",
        "title": "日常对话入门",
        "description": "学习基础的日常对话",
        "category": "日常交流",
        "level": 1,
        "estimatedHours": 10,
        "imageUrl": "https://example.com/image.jpg",
        "courseCount": 12,
        "totalExercises": 156
      },
      "courseProgresses": [
        {
          "courseId": "1",
          "courseTitle": "基本问候",
          "progressPercentage": 75,
          "isCompleted": false,
          "completedExercises": 6,
          "totalExercises": 8
        },
        {
          "courseId": "2",
          "courseTitle": "自我介绍",
          "progressPercentage": 0,
          "isCompleted": false,
          "completedExercises": 0,
          "totalExercises": 12
        }
      ]
    }
  ]
}
```

### 2. 获取课程包学习详情

**请求**
```
GET /api/my/packages/:id
Authorization: Bearer <user-token>
```

**路径参数**
- `id`: 课程包ID

**响应示例**
```json
{
  "success": true,
  "data": {
    "enrollment": {
      "id": "1",
      "enrolledAt": "2024-01-15T10:00:00Z",
      "isCompleted": false,
      "progressPercentage": 35,
      "lastAccessedAt": "2024-01-20T14:30:00Z"
    },
    "coursePackage": {
      "id": "1",
      "title": "日常对话入门",
      "description": "学习基础的日常对话",
      "level": 1,
      "estimatedHours": 10,
      "courseCount": 12,
      "totalExercises": 156
    },
    "courses": [
      {
        "id": "1",
        "title": "基本问候",
        "orderIndex": 1,
        "estimatedMinutes": 30,
        "exerciseCount": 8,
        "progress": {
          "progressPercentage": 75,
          "isCompleted": false,
          "completedExercises": 6,
          "timeSpentMinutes": 22,
          "lastAccessedAt": "2024-01-20T14:30:00Z"
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
          "completedExercises": 0,
          "timeSpentMinutes": 0
        }
      }
    ],
    "overallStats": {
      "totalCourses": 12,
      "completedCourses": 0,
      "totalExercises": 156,
      "completedExercises": 6,
      "totalTimeSpent": 22,
      "averageScore": 82
    }
  }
}
```

### 3. 自动注册免费课程包

**请求**
```
POST /api/my/auto-enroll
Authorization: Bearer <user-token>
```

**响应示例**
```json
{
  "success": true,
  "message": "成功注册 3 个免费课程包",
  "data": {
    "enrolledPackages": [
      {
        "id": "1",
        "title": "日常对话入门",
        "category": "日常交流",
        "level": 1
      },
      {
        "id": "2", 
        "title": "基础发音练习",
        "category": "发音基础",
        "level": 1
      }
    ],
    "enrolledCount": 2,
    "skippedCount": 1
  }
}
```

### 4. 获取学习统计数据

**请求**
```
GET /api/my/statistics
Authorization: Bearer <user-token>
```

**查询参数**
- `period` (optional): 统计周期 (7d|30d|90d|all)，默认30d
- `includeHistory` (optional): 是否包含学习历史 (true|false)，默认false

**响应示例**
```json
{
  "success": true,
  "data": {
    "totalPackages": 3,
    "completedPackages": 1,
    "totalCourses": 36,
    "completedCourses": 12,
    "totalExercises": 468,
    "completedExercises": 156,
    "totalTimeSpentMinutes": 1280,
    "averageScore": 84,
    "currentStreak": 7,
    "lastStudyDate": "2024-01-20",
    "thisWeek": {
      "minutesStudied": 145,
      "exercisesCompleted": 18,
      "averageScore": 86
    },
    "thisMonth": {
      "minutesStudied": 645,
      "exercisesCompleted": 78,
      "averageScore": 84
    },
    "studyHistory": [
      {
        "date": "2024-01-20",
        "minutesStudied": 25,
        "exercisesCompleted": 3,
        "averageScore": 88
      },
      {
        "date": "2024-01-19",
        "minutesStudied": 30,
        "exercisesCompleted": 4,
        "averageScore": 85
      }
    ],
    "levelDistribution": {
      "1": { "completed": 45, "total": 50 },
      "2": { "completed": 32, "total": 48 },
      "3": { "completed": 28, "total": 42 },
      "4": { "completed": 15, "total": 35 },
      "5": { "completed": 8, "total": 25 }
    },
    "categoryProgress": [
      {
        "category": "日常交流",
        "completedExercises": 89,
        "totalExercises": 120,
        "progressPercentage": 74
      },
      {
        "category": "发音基础",
        "completedExercises": 67,
        "totalExercises": 80,
        "progressPercentage": 84
      }
    ]
  }
}
```

### 5. 手动注册课程包

**请求**
```
POST /api/my/packages/:packageId/enroll
Authorization: Bearer <user-token>
```

**路径参数**
- `packageId`: 课程包ID

**响应示例**
```json
{
  "success": true,
  "message": "成功注册课程包",
  "data": {
    "enrollmentId": "123",
    "coursePackage": {
      "id": "5",
      "title": "商务中文进阶",
      "level": 3,
      "estimatedHours": 20
    },
    "enrolledAt": "2024-01-20T16:00:00Z"
  }
}
```

### 6. 取消注册课程包

**请求**
```
DELETE /api/my/packages/:packageId/enroll
Authorization: Bearer <user-token>
```

**响应示例**
```json
{
  "success": true,
  "message": "已取消注册课程包"
}
```

## 学习记录接口

### 7. 获取最近学习活动

**请求**
```
GET /api/my/recent-activities
Authorization: Bearer <user-token>
```

**查询参数**
- `limit` (optional): 限制数量，默认20，最大50
- `type` (optional): 活动类型筛选 (exercise_completed|course_completed|package_enrolled)

**响应示例**
```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "type": "exercise_completed",
      "title": "完成练习：你好！",
      "description": "在课程《基本问候》中完成了听力练习",
      "score": 88,
      "timeSpent": 45,
      "createdAt": "2024-01-20T14:30:00Z",
      "metadata": {
        "exerciseId": "1",
        "courseId": "1",
        "courseTitle": "基本问候",
        "packageTitle": "日常对话入门"
      }
    },
    {
      "id": "2",
      "type": "course_completed", 
      "title": "完成课程：基本问候",
      "description": "完成了《日常对话入门》课程包中的基本问候课程",
      "createdAt": "2024-01-19T16:45:00Z",
      "metadata": {
        "courseId": "1",
        "packageId": "1",
        "totalExercises": 8,
        "averageScore": 85
      }
    }
  ]
}
```

### 8. 设置学习目标

**请求**
```
POST /api/my/goals
Authorization: Bearer <user-token>
Content-Type: application/json
```

**请求体**
```json
{
  "dailyMinutes": 30,              // 每日学习目标(分钟)
  "weeklyExercises": 20,           // 每周练习目标(个数)
  "monthlyPackages": 1,            // 每月完成课程包目标
  "targetLevel": 3,                // 目标难度等级
  "reminderTime": "19:00"          // 学习提醒时间
}
```

**响应示例**
```json
{
  "success": true,
  "message": "学习目标设置成功",
  "data": {
    "dailyMinutes": 30,
    "weeklyExercises": 20,
    "monthlyPackages": 1,
    "targetLevel": 3,
    "reminderTime": "19:00",
    "createdAt": "2024-01-20T16:00:00Z"
  }
}
```

### 9. 获取学习目标进度

**请求**
```
GET /api/my/goals/progress
Authorization: Bearer <user-token>
```

**响应示例**
```json
{
  "success": true,
  "data": {
    "goals": {
      "dailyMinutes": 30,
      "weeklyExercises": 20,
      "monthlyPackages": 1
    },
    "progress": {
      "today": {
        "minutesStudied": 25,
        "targetMinutes": 30,
        "progressPercentage": 83,
        "isAchieved": false
      },
      "thisWeek": {
        "exercisesCompleted": 16,
        "targetExercises": 20,
        "progressPercentage": 80,
        "isAchieved": false
      },
      "thisMonth": {
        "packagesCompleted": 0,
        "targetPackages": 1,
        "progressPercentage": 0,
        "isAchieved": false
      }
    },
    "streakInfo": {
      "currentStreak": 7,
      "longestStreak": 12,
      "streakGoal": 30
    }
  }
}
```

## 错误代码

- `PACKAGE_NOT_ENROLLED` - 用户未注册该课程包
- `PACKAGE_ALREADY_ENROLLED` - 用户已注册该课程包
- `PACKAGE_NOT_FREE` - 课程包不免费，需要购买
- `ENROLLMENT_LIMIT_EXCEEDED` - 注册数量超限
- `INVALID_GOAL_VALUE` - 无效的目标值
- `STATISTICS_UNAVAILABLE` - 统计数据暂时不可用

## 使用示例

### 前端获取学习中心数据

```javascript
async function loadLearningCenter() {
  try {
    // 并行获取多个数据
    const [packagesResponse, statisticsResponse] = await Promise.all([
      fetch('/api/my/packages', {
        headers: { 'Authorization': `Bearer ${userToken}` }
      }),
      fetch('/api/my/statistics?period=30d&includeHistory=true', {
        headers: { 'Authorization': `Bearer ${userToken}` }
      })
    ]);
    
    const packages = await packagesResponse.json();
    const statistics = await statisticsResponse.json();
    
    if (packages.success && statistics.success) {
      // 渲染学习中心界面
      renderLearningDashboard(packages.data, statistics.data);
    }
  } catch (error) {
    console.error('加载学习中心失败:', error);
  }
}
```

### 前端自动注册免费课程

```javascript
async function autoEnrollFreePackages() {
  try {
    const response = await fetch('/api/my/auto-enroll', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${userToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    const result = await response.json();
    
    if (result.success) {
      const { enrolledPackages, enrolledCount } = result.data;
      
      if (enrolledCount > 0) {
        showNotification(`成功注册 ${enrolledCount} 个免费课程包！`);
        // 刷新课程包列表
        loadLearningCenter();
      } else {
        showNotification('没有新的免费课程包可注册');
      }
    }
  } catch (error) {
    console.error('自动注册失败:', error);
  }
}
```

### 前端设置学习目标

```javascript
async function setLearningGoals(goals) {
  try {
    const response = await fetch('/api/my/goals', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${userToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(goals)
    });
    
    const result = await response.json();
    
    if (result.success) {
      showNotification('学习目标设置成功！');
      // 更新目标显示
      updateGoalsDisplay(result.data);
    }
  } catch (error) {
    console.error('设置学习目标失败:', error);
  }
}

// 使用示例
setLearningGoals({
  dailyMinutes: 30,
  weeklyExercises: 20,
  monthlyPackages: 1,
  targetLevel: 3,
  reminderTime: '19:00'
});
```