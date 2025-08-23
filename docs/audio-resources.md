# 音频资源 API

## 概述

音频资源系统管理平台中所有的TTS生成音频，包括练习音频、片段音频等。音频通过火山引擎TTS服务生成，存储在AWS S3中。

## 数据模型

### AudioResource

```typescript
interface AudioResource {
  id: string;                     // 音频资源ID
  chineseText: string;            // 中文文本
  pinyin: string;                 // 拼音 (JSON字符串或纯文本)
  translation?: string;           // 翻译 (可选)
  s3Url: string;                  // S3存储URL
  contentHash: string;            // 内容哈希 (用于去重)
  durationSeconds?: number;       // 音频时长(秒)
  difficultyScore?: number;       // 难度评分 (1-10)
  createdAt: string;              // 创建时间
  updatedAt: string;              // 更新时间
}
```

## 公开接口

### 1. 获取音频资源详情

**请求**
```
GET /api/audio-resources/:id
```

**路径参数**
- `id`: 音频资源ID

**响应示例**
```json
{
  "success": true,
  "data": {
    "id": "59",
    "chineseText": "你好！",
    "pinyin": "nǐ hǎo ！",
    "translation": "Hello!",
    "audioUrl": "https://mandarin-loop-bucket.s3.us-east-1.amazonaws.com/audio/2025/08/21/1755762692256-8edfbd00.mp3",
    "audioResourceId": "59",
    "durationSeconds": 1
  }
}
```

### 2. 获取音频资源列表

**请求**
```
GET /api/audio-resources
```

**查询参数**
- `page` (optional): 页码，默认1
- `limit` (optional): 每页数量，默认20，最大100
- `search` (optional): 搜索中文文本或翻译
- `difficultyLevel` (optional): 难度等级筛选 (1-10)
- `hasTranslation` (optional): 是否有翻译 (true|false)
- `sortBy` (optional): 排序字段 (createdAt|updatedAt|difficultyScore|durationSeconds)，默认createdAt
- `sortOrder` (optional): 排序方向 (asc|desc)，默认desc

**响应示例**
```json
{
  "success": true,
  "data": [
    {
      "id": "59",
      "chineseText": "你好！",
      "pinyin": "nǐ hǎo ！",
      "translation": "Hello!",
      "audioUrl": "https://mandarin-loop-bucket.s3.us-east-1.amazonaws.com/audio/2025/08/21/1755762692256-8edfbd00.mp3",
      "durationSeconds": 1,
      "difficultyScore": 1,
      "createdAt": "2024-01-20T12:30:00Z",
      "updatedAt": "2024-01-20T12:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 145,
    "totalPages": 8,
    "hasNext": true,
    "hasPrev": false
  }
}
```

### 3. 获取音频使用统计

**请求**
```
GET /api/audio-resources/stats
```

**响应示例**
```json
{
  "success": true,
  "data": {
    "total": 145,
    "totalDurationSeconds": 1250,
    "averageDurationSeconds": 9,
    "recentCount": 23,
    "difficultyDistribution": [
      { "level": 1, "count": 45 },
      { "level": 2, "count": 38 },
      { "level": 3, "count": 32 },
      { "level": 4, "count": 20 },
      { "level": 5, "count": 10 }
    ],
    "generatedAt": "2024-01-20T15:30:00Z"
  }
}
```

## 管理接口 (需要认证)

### 4. 创建音频资源

**请求**
```
POST /api/audio-resources
Authorization: Bearer <user-token>
Content-Type: application/json
```

**请求体**
```json
{
  "chineseText": "早上好！",
  "translation": "Good morning!",
  "difficultyScore": 2
}
```

**响应示例**
```json
{
  "success": true,
  "message": "音频资源创建成功",
  "data": {
    "chineseText": "早上好！",
    "pinyin": "zǎo shàng hǎo ！",
    "translation": "Good morning!",
    "audioUrl": "https://mandarin-loop-bucket.s3.us-east-1.amazonaws.com/audio/xxx.mp3",
    "audioResourceId": "146",
    "durationSeconds": 2
  }
}
```

### 5. 更新音频资源

**请求**
```
PUT /api/audio-resources/:id
Authorization: Bearer <user-token>
Content-Type: application/json
```

**请求体**
```json
{
  "translation": "Good morning! (updated)",
  "difficultyScore": 3
}
```

**响应示例**
```json
{
  "success": true,
  "message": "音频资源更新成功",
  "data": {
    "id": "146",
    "chineseText": "早上好！",
    "pinyin": "zǎo shàng hǎo ！",
    "translation": "Good morning! (updated)",
    "audioUrl": "https://mandarin-loop-bucket.s3.us-east-1.amazonaws.com/audio/xxx.mp3",
    "durationSeconds": 2,
    "difficultyScore": 3,
    "updatedAt": "2024-01-20T16:00:00Z"
  }
}
```

### 6. 删除音频资源

**请求**
```
DELETE /api/audio-resources/:id
Authorization: Bearer <user-token>
```

**响应示例**
```json
{
  "success": true,
  "message": "音频资源删除成功"
}
```

### 7. 批量删除音频资源

**请求**
```
DELETE /api/audio-resources
Authorization: Bearer <user-token>
Content-Type: application/json
```

**请求体**
```json
{
  "ids": ["146", "147", "148"]
}
```

**响应示例**
```json
{
  "success": true,
  "message": "成功删除 3 个音频资源",
  "data": {
    "deletedCount": 3,
    "requestedCount": 3
  }
}
```

## 中文转音频接口

### 8. 基础中文转拼音

**请求**
```
POST /api/chinese/convert
Content-Type: application/json
```

**请求体**
```json
{
  "text": "你好世界！",
  "includeTranslation": false
}
```

**响应示例**
```json
{
  "success": true,
  "data": {
    "chineseText": "你好世界！",
    "pinyin": "nǐ hǎo shì jiè ！"
  }
}
```

### 9. 中文转拼音+音频生成

**请求**
```
POST /api/chinese/convert-with-audio
Content-Type: application/json
```

**请求体**
```json
{
  "text": "你好世界！",
  "translation": "Hello world!",
  "generateAudio": true
}
```

**响应示例**
```json
{
  "success": true,
  "data": {
    "chineseText": "你好世界！",
    "pinyin": "nǐ hǎo shì jiè ！",
    "translation": "Hello world!",
    "audioUrl": "https://mandarin-loop-bucket.s3.us-east-1.amazonaws.com/audio/xxx.mp3",
    "audioResourceId": "149",
    "durationSeconds": 2
  }
}
```

### 10. 批量转换

**请求**
```
POST /api/chinese/batch-convert
Content-Type: application/json
```

**请求体**
```json
{
  "texts": [
    { "text": "早上好", "translation": "Good morning" },
    { "text": "晚安", "translation": "Good night" }
  ],
  "generateAudio": true
}
```

**响应示例**
```json
{
  "success": true,
  "data": [
    {
      "chineseText": "早上好",
      "pinyin": "zǎo shàng hǎo",
      "translation": "Good morning",
      "audioUrl": "https://mandarin-loop-bucket.s3.us-east-1.amazonaws.com/audio/xxx.mp3",
      "audioResourceId": "150",
      "durationSeconds": 2
    },
    {
      "chineseText": "晚安",
      "pinyin": "wǎn ān",
      "translation": "Good night",
      "audioUrl": "https://mandarin-loop-bucket.s3.us-east-1.amazonaws.com/audio/yyy.mp3",
      "audioResourceId": "151",
      "durationSeconds": 1
    }
  ]
}
```

## 音频处理说明

### TTS服务配置
- **服务商**: 火山引擎 (Volcengine)
- **音色**: `BV001_streaming` (标准中文女声)
- **采样率**: 16kHz
- **格式**: MP3
- **并发限制**: 2个请求/秒 (豆包API限制)

### 音频存储
- **存储位置**: AWS S3 (mandarin-loop-bucket)
- **路径结构**: `audio/YYYY/MM/DD/timestamp-random.mp3`
- **访问方式**: 公开读取，通过HTTPS访问
- **CDN**: 通过CloudFront加速 (如果配置)

### 内容去重
- 系统使用`contentHash`字段进行内容去重
- 相同的中文文本+拼音组合会复用已存在的音频资源
- 哈希算法: MD5(中文文本 + "|" + 拼音JSON)

## 错误代码

- `AUDIO_NOT_FOUND` - 音频资源不存在
- `INVALID_TEXT_FORMAT` - 无效的文本格式
- `TTS_SERVICE_ERROR` - TTS服务错误
- `S3_UPLOAD_FAILED` - S3上传失败
- `CONTENT_TOO_LONG` - 文本内容过长 (最大500字符)
- `BATCH_SIZE_EXCEEDED` - 批量请求数量超限 (最大50个)

## 使用示例

### 前端播放音频

```javascript
async function playAudio(audioResourceId) {
  try {
    // 获取音频资源详情
    const response = await fetch(`/api/audio-resources/${audioResourceId}`);
    const result = await response.json();
    
    if (result.success && result.data.audioUrl) {
      // 创建并播放音频
      const audio = new Audio(result.data.audioUrl);
      audio.play().catch(error => {
        console.error('音频播放失败:', error);
      });
      
      // 显示音频信息
      displayAudioInfo(result.data);
    }
  } catch (error) {
    console.error('获取音频失败:', error);
  }
}

function displayAudioInfo(audioData) {
  const info = `
    中文: ${audioData.chineseText}
    拼音: ${audioData.pinyin}
    翻译: ${audioData.translation || '无'}
    时长: ${audioData.durationSeconds}秒
  `;
  console.log(info);
}
```

### 前端生成音频

```javascript
async function generateAudio(text, translation) {
  try {
    const response = await fetch('/api/chinese/convert-with-audio', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        text: text,
        translation: translation,
        generateAudio: true
      })
    });
    
    const result = await response.json();
    
    if (result.success) {
      const audioData = result.data;
      
      // 显示生成结果
      console.log(`音频生成成功: ${audioData.audioResourceId}`);
      
      // 自动播放生成的音频
      playAudio(audioData.audioResourceId);
    }
  } catch (error) {
    console.error('音频生成失败:', error);
  }
}
```

### 前端搜索音频资源

```javascript
async function searchAudioResources(searchTerm, page = 1) {
  const params = new URLSearchParams({
    search: searchTerm,
    page: page.toString(),
    limit: '10',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });
  
  try {
    const response = await fetch(`/api/audio-resources?${params}`);
    const result = await response.json();
    
    if (result.success) {
      const audioList = result.data;
      const pagination = result.pagination;
      
      // 渲染音频资源列表
      renderAudioList(audioList);
      
      // 渲染分页
      renderPagination(pagination);
    }
  } catch (error) {
    console.error('搜索音频资源失败:', error);
  }
}
```