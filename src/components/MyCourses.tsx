import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Text,
  SimpleGrid,
  Center,
  VStack,
  HStack,
  Badge,
  IconButton,
} from '@chakra-ui/react';
import { BookOpen, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import { fetchUserRecentCourses, fetchUserPackageDetail } from '../utils/courseAPI';
import { UserCoursePackageCard } from './UserCoursePackageCard';

// 用户课程包接口（更新为使用真实的课程包进度）
interface UserCoursePackage {
  id: string;
  title: string;
  description?: string;
  coverImageUrl?: string;
  difficultyLevel?: string;
  courses: Array<{
    id: string;
    title: string;
    description?: string;
    orderIndex: number;
    coursePackageId: string;
    coursePackageTitle: string;
    lastAccessedAt: string;
    completionPercentage: number;
    completedExercises: number;
    totalExercises: number;
    isCompleted: boolean;
  }>;
  totalProgress: number; // 现在使用真实的课程包进度
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

      console.log('🔍 开始获取用户最近课程...');
      const response = await fetchUserRecentCourses(50); // 增加限制以获取更多课程
      console.log('📊 用户最近课程API响应:', response);

      if (!response || !response.courses) {
        console.error('❌ API响应格式不正确：缺少courses字段');
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
            totalProgress: 0, // 初始化为0，稍后通过API获取真实进度
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

      // 获取每个课程包的真实进度
      const packagesWithProgress = await Promise.all(
        Array.from(packagesMap.values()).map(async (pkg) => {
          try {
            // 调用fetchUserPackageDetail获取真实的课程包进度
            const packageDetail = await fetchUserPackageDetail(pkg.id);
            console.log(`📦 课程包 ${pkg.id} 的真实进度:`, packageDetail.overallProgress);
            
            return {
              ...pkg,
              totalProgress: packageDetail.overallProgress, // 使用API返回的真实进度
              description: packageDetail.description,
              coverImageUrl: packageDetail.coverImageUrl,
              difficultyLevel: packageDetail.difficultyLevel
            };
          } catch (err) {
            console.warn(`⚠️ 获取课程包 ${pkg.id} 进度失败:`, err);
            // 如果获取失败，回退到原来的计算方式
            const fallbackProgress = Math.round(
              pkg.courses.reduce((sum, course) => sum + course.completionPercentage, 0) / pkg.courses.length
            );
            return {
              ...pkg,
              totalProgress: fallbackProgress
            };
          }
        })
      );
      
      // 按最后访问时间排序
      packagesWithProgress.sort((a, b) => 
        new Date(b.lastAccessedAt).getTime() - new Date(a.lastAccessedAt).getTime()
      );
      
      setCoursePackages(packagesWithProgress);
      console.log('✅ 课程包数据加载完成:', packagesWithProgress);

    } catch (err) {
      console.error('❌ 获取用户课程失败:', err);
      setError('Failed to get course data, please try again later');
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
            <Text color="gray.400">Loading...</Text>
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
              Click to retry
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
                      History
                    </Text>
                    <Text color="gray.400" fontSize="sm">
                      Continue your unfinished learning journey
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
                    {coursePackages.length} course packages
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
                      Haven't started learning yet
                    </Text>
                    <Text color="gray.500" fontSize="md" maxW="400px" lineHeight="1.6">
                      Go to the course store to choose course packages that interest you!
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
                    Go to Course Store
                  </Box>
                </VStack>
              </Center>
            </motion.div>
          )}
        </Box>
      );
};