import React, { useState, useEffect, useCallback } from 'react';
import { 
  Box, 
  Text, 
  VStack, 
  HStack, 
  SimpleGrid, 
  Spinner, 
  Center, 
  Badge
} from '@chakra-ui/react';
import { BookOpen } from 'lucide-react';
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
        <Box p="6" maxW="1400px" mx="auto">
          {/* 课程包列表 */}
          {coursePackages.length > 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <VStack gap="8" align="start" width="100%" mb="8">
                <HStack gap="4">
                  <Box 
                    bg="blue.500" 
                    p="3" 
                    borderRadius="full"
                    color="white"
                    shadow="lg"
                  >
                    <BookOpen size={24} />
                  </Box>
                  <VStack align="start" gap="1">
                    <Text color="white" fontSize="2xl" fontWeight="700">
                      历史记录
                    </Text>
                    <Text color="gray.400" fontSize="sm">
                      继续你未完成的学习之旅
                    </Text>
                  </VStack>
                  <Badge 
                    colorPalette="blue" 
                    variant="subtle"
                    size="lg"
                    px="4"
                    py="2"
                    borderRadius="full"
                    fontWeight="600"
                  >
                    {coursePackages.length} 个课程包
                  </Badge>
                </HStack>
                
                <SimpleGrid 
                  columns={{ base: 1, md: 2, lg: 3 }} 
                  gap="8" 
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
              <Center minH="500px">
                <VStack gap="8" textAlign="center">
                  <Box 
                    bg="rgba(39, 39, 42, 0.6)" 
                    borderRadius="50%" 
                    p="12"
                    border="1px solid rgba(82, 82, 91, 0.3)"
                    shadow="xl"
                  >
                    <BookOpen size={64} color="#6B7280" />
                  </Box>
                  
                  <VStack gap="4">
                    <Text color="gray.400" fontSize="xl" fontWeight="600">
                      还没有开始学习
                    </Text>
                    <Text color="gray.500" fontSize="md" maxW="400px" lineHeight="1.6">
                      去课程商店选择你感兴趣的课程包开始学习吧！
                    </Text>
                  </VStack>
                  
                  <Box
                    as="button"
                    bg="blue.500"
                    color="white"
                    px="8"
                    py="4"
                    borderRadius="xl"
                    fontSize="md"
                    fontWeight="600"
                    cursor="pointer"
                    transition="all 0.2s"
                    _hover={{
                      bg: 'blue.600',
                      transform: 'translateY(-2px)',
                      shadow: 'lg'
                    }}
                    _active={{
                      transform: 'translateY(0)'
                    }}
                    onClick={() => navigate('/dashboard/store')}
                  >
                    去课程商店
                  </Box>
                </VStack>
              </Center>
            </motion.div>
          )}
        </Box>
      );
};