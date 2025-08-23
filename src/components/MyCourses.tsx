import React, { useState, useEffect, useCallback } from 'react';
import { 
  Box, 
  Heading, 
  Text, 
  VStack, 
  HStack, 
  SimpleGrid, 
  Spinner, 
  Center, 
  Badge
} from '@chakra-ui/react';
import { BookOpen, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { fetchUserRecentCourses, UserRecentCourse } from '../utils/courseAPI';
import { UserCoursePackageCard } from './UserCoursePackageCard';

interface UserCoursePackage {
  id: string;
  title: string;
  description?: string;
  coverImageUrl?: string;
  difficultyLevel?: string;
  courses: UserRecentCourse[];
  totalProgress: number;
  lastAccessedAt: string;
}

export const MyCourses: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [coursePackages, setCoursePackages] = useState<UserCoursePackage[]>([]);
  const [overallStats, setOverallStats] = useState({
    totalPackages: 0,
    totalCourses: 0,
    averageProgress: 0,
    totalStudyTime: 0
  });

  // 获取用户最近学习的课程
  const fetchUserCourses = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 开始获取用户最近课程数据...');
      
      const response = await fetchUserRecentCourses(50); // 获取更多数据用于统计
      
      console.log('📊 API响应数据:', response);
      console.log('📊 响应数据类型:', typeof response);
      console.log('📊 响应是否为null:', response === null);
      console.log('📊 响应是否为undefined:', response === undefined);
      
      // 检查响应数据结构
      if (!response) {
        console.error('❌ API响应为空:', response);
        throw new Error('API响应为空，请检查网络连接');
      }
      
      if (!response.courses) {
        console.error('❌ API响应中没有courses字段:', response);
        console.error('📝 响应的所有字段:', Object.keys(response));
        throw new Error('API响应格式不正确：缺少courses字段');
      }
      
      if (!Array.isArray(response.courses)) {
        console.error('❌ courses字段不是数组:', response.courses);
        throw new Error('API响应格式不正确：courses不是数组');
      }
      
      // 按课程包分组
      const packagesMap = new Map<string, UserCoursePackage>();
      
      response.courses.forEach(course => {
        if (!packagesMap.has(course.coursePackageId)) {
          packagesMap.set(course.coursePackageId, {
            id: course.coursePackageId,
            title: course.coursePackageTitle,
            courses: [],
            totalProgress: 0,
            lastAccessedAt: course.lastAccessedAt
          });
        }
        
        const pkg = packagesMap.get(course.coursePackageId)!;
        pkg.courses.push(course);
        
        // 更新最后访问时间
        if (new Date(course.lastAccessedAt) > new Date(pkg.lastAccessedAt)) {
          pkg.lastAccessedAt = course.lastAccessedAt;
        }
      });
      
      // 计算每个课程包的总进度
      const packages = Array.from(packagesMap.values()).map(pkg => {
        const totalProgress = pkg.courses.reduce((sum, course) => 
          sum + course.completionPercentage, 0
        ) / pkg.courses.length;
        
        return {
          ...pkg,
          totalProgress: Math.round(totalProgress)
        };
      });
      
      // 按最后访问时间排序
      packages.sort((a, b) => new Date(b.lastAccessedAt).getTime() - new Date(a.lastAccessedAt).getTime());
      
      setCoursePackages(packages);
      
      // 计算整体统计
      const totalCourses = response.courses.length;
      const averageProgress = totalCourses > 0 
        ? Math.round(response.courses.reduce((sum, course) => sum + course.completionPercentage, 0) / totalCourses)
        : 0;
      
      setOverallStats({
        totalPackages: packages.length,
        totalCourses,
        averageProgress,
        totalStudyTime: 0 // 暂时设为0，后续可以从API获取
      });
      
    } catch (err) {
      console.error('Failed to fetch user courses:', err);
      setError('获取课程数据失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUserCourses();
  }, [fetchUserCourses]);

  // 处理课程包点击
  const handlePackageClick = useCallback((coursePackage: UserCoursePackage) => {
    // 导航到课程包详情页面
    navigate(`/dashboard/store/${coursePackage.id}`);
  }, [navigate]);

  // 刷新数据
  const handleRefresh = useCallback(() => {
    fetchUserCourses();
  }, [fetchUserCourses]);

  if (loading) {
    return (
      <Box p="8">
        <Center minH="400px">
          <VStack gap="4">
            <Spinner size="xl" color="blue.400" />
            <Text color="gray.400">加载中...</Text>
          </VStack>
        </Center>
      </Box>
    );
  }

  if (error) {
    return (
      <Box p="8">
        <Center minH="400px">
          <VStack gap="4">
            <Text color="red.400" fontSize="lg">{error}</Text>
            <Text 
              color="blue.400" 
              cursor="pointer" 
              onClick={handleRefresh}
              _hover={{ textDecoration: 'underline' }}
            >
              点击重试
            </Text>
          </VStack>
        </Center>
      </Box>
    );
  }

  return (
    <Box p="8">
      {/* 页面标题 */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Heading size="lg" color="white" mb="6">
          我的课程包
        </Heading>
      </motion.div>

      {/* 学习统计 */}
      {coursePackages.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Box 
            bg="rgba(39, 39, 42, 0.6)" 
            borderRadius="16px" 
            p="6" 
            mb="8"
            border="1px solid rgba(82, 82, 91, 0.3)"
          >
            <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} gap="6">
              <VStack align="center" gap="2">
                <Text color="gray.400" fontSize="sm">课程包</Text>
                <Text color="white" fontSize="2xl" fontWeight="bold">{overallStats.totalPackages}</Text>
                <Text color="gray.500" fontSize="xs">正在学习</Text>
              </VStack>
              
              <VStack align="center" gap="2">
                <Text color="gray.400" fontSize="sm">总课程</Text>
                <Text color="white" fontSize="2xl" fontWeight="bold">{overallStats.totalCourses}</Text>
                <Text color="gray.500" fontSize="xs">包含练习</Text>
              </VStack>
              
              <VStack align="center" gap="2">
                <Text color="gray.400" fontSize="sm">平均进度</Text>
                <Text color="blue.400" fontSize="2xl" fontWeight="bold">{overallStats.averageProgress}%</Text>
                <Text color="gray.500" fontSize="xs">学习完成度</Text>
              </VStack>
              
              <VStack align="center" gap="2">
                <Text color="gray.400" fontSize="sm">学习状态</Text>
                <Text color="green.400" fontSize="2xl">
                  <TrendingUp size={20} />
                </Text>
                <Text color="gray.500" fontSize="xs">持续学习中</Text>
              </VStack>
            </SimpleGrid>
          </Box>
        </motion.div>
      )}

      {/* 课程包列表 */}
      {coursePackages.length > 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <VStack gap="6" align="start" width="100%">
            <HStack gap="3">
              <BookOpen size={20} color="#60A5FA" />
              <Text color="white" fontSize="lg" fontWeight="500">
                最近学习
              </Text>
              <Badge colorPalette="blue" variant="subtle">
                {coursePackages.length} 个课程包
              </Badge>
            </HStack>
            
            <SimpleGrid 
              columns={{ base: 1, md: 2, lg: 3 }} 
              gap="6" 
              width="100%"
            >
              {coursePackages.map((coursePackage, index) => (
                <motion.div
                  key={coursePackage.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 * index }}
                >
                  <UserCoursePackageCard
                    coursePackage={coursePackage}
                    onClick={handlePackageClick}
                  />
                </motion.div>
              ))}
            </SimpleGrid>
          </VStack>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Center minH="400px">
            <VStack gap="6" textAlign="center">
              <Box 
                bg="rgba(39, 39, 42, 0.6)" 
                borderRadius="50%" 
                p="8"
                border="1px solid rgba(82, 82, 91, 0.3)"
              >
                <BookOpen size={48} color="#6B7280" />
              </Box>
              
              <VStack gap="3">
                <Heading size="md" color="gray.400">
                  还没有开始学习
                </Heading>
                <Text color="gray.500" fontSize="sm">
                  去课程商店选择你感兴趣的课程包开始学习吧！
                </Text>
              </VStack>
              
              <Box
                as="button"
                bg="blue.500"
                color="white"
                px="6"
                py="3"
                borderRadius="8px"
                fontSize="sm"
                fontWeight="500"
                cursor="pointer"
                transition="all 0.2s"
                _hover={{
                  bg: 'blue.600',
                  transform: 'translateY(-1px)'
                }}
                onClick={() => navigate('/dashboard/store')}
              >
                浏览课程包
              </Box>
            </VStack>
          </Center>
        </motion.div>
      )}
    </Box>
  );
};