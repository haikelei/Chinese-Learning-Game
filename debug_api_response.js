// 调试API响应格式
const testAPIResponse = () => {
  console.log('🧪 测试API响应格式...\n');
  
  // 模拟你提供的API响应
  const mockApiResponse = {
    "code": 0,
    "msg": "获取用户最近学习课程成功",
    "data": {
      "courses": [
        {
          "id": "55",
          "title": "第一课：问候语",
          "description": "学习基础问候语，包括你好、再见等",
          "orderIndex": 1,
          "coursePackageId": "33",
          "coursePackageTitle": "HSK1级别课程包",
          "lastAccessedAt": "",
          "completionPercentage": 0,
          "completedExercises": 0,
          "totalExercises": 0,
          "isCompleted": false
        }
      ],
      "totalCount": 3,
      "hasProgress": false
    }
  };
  
  console.log('📊 原始API响应:', JSON.stringify(mockApiResponse, null, 2));
  
  // 模拟HTTP客户端拦截器的处理逻辑
  const processedResponse = mockApiResponse.data;
  console.log('🔄 拦截器处理后:', JSON.stringify(processedResponse, null, 2));
  
  // 检查处理后的数据结构
  if (processedResponse && processedResponse.courses) {
    console.log('✅ 数据结构正确');
    console.log('📝 课程数量:', processedResponse.courses.length);
    console.log('📝 总数量:', processedResponse.totalCount);
    console.log('📝 是否有进度:', processedResponse.hasProgress);
  } else {
    console.log('❌ 数据结构不正确');
    console.log('📝 processedResponse:', processedResponse);
    console.log('📝 processedResponse.courses:', processedResponse?.courses);
  }
  
  console.log('\n🔍 测试完成！');
};

// 运行测试
testAPIResponse();
