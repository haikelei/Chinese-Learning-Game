// 测试用户最近课程API接口
const testUserRecentCoursesAPI = async () => {
  console.log('🧪 测试用户最近课程API接口...\n');
  
  try {
    // 1. 测试获取用户最近学习的课程
    console.log('📚 测试获取用户最近学习的课程...');
    
    const response = await fetch('http://localhost:3000/api/courses/user/recent?limit=10', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // 注意：这里需要真实的用户token，暂时跳过认证测试
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ API调用成功！');
      console.log('📊 响应数据:', JSON.stringify(data, null, 2));
    } else {
      console.log('❌ API调用失败:', response.status, response.statusText);
      const errorText = await response.text();
      console.log('错误详情:', errorText);
    }
    
  } catch (error) {
    console.log('❌ 测试过程中发生错误:', error.message);
  }
  
  console.log('\n🔍 测试完成！');
  console.log('\n📝 注意事项:');
  console.log('1. 需要用户登录并获取有效的JWT token');
  console.log('2. 在Authorization头中添加: Bearer <your_token>');
  console.log('3. 确保后端API服务已启动');
};

// 运行测试
testUserRecentCoursesAPI();
