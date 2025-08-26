import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Heading,
  Text,
  SimpleGrid,
  Spinner,
  Center,
  HStack,
  Input,
  Button,
  VStack,
  IconButton,
  Badge,
} from '@chakra-ui/react';
import { Search, Filter, ArrowLeft, BookOpen, Target, Clock } from 'lucide-react';
import { CoursePackage, Course, fetchCoursePackages, fetchCoursesByPackage, fetchCoursePackageDetail, fetchUserPackageDetail } from '../utils/courseAPI';
import { CoursePackageCard } from './CoursePackageCard';
import { CourseCard } from './CourseCard';

// 用户进度接口
interface UserPackageProgress {
  packageId: string;
  totalCourses: number;
  completedCourses: number;
  progressPercentage: number;
  lastAccessedAt?: string;
  totalTimeSpent?: number;
  courses?: Array<{
    id: string;
    title: string;
    description?: string;
    estimatedMinutes?: number;
    orderIndex: number;
    progressPercentage: number;
    isCompleted: boolean;
    lastStudiedAt?: string;
    totalExercises: number;
    correctExercises: number;
  }>;
}

export const CourseStore: React.FC = () => {
  const navigate = useNavigate();
  const { packageId } = useParams<{ packageId: string }>();
  const [coursePackages, setCoursePackages] = useState<CoursePackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // 详情页面状态
  const [selectedPackage, setSelectedPackage] = useState<CoursePackage | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [coursesLoading, setCoursesLoading] = useState(false);
  
  // 用户进度状态
  const [userProgress, setUserProgress] = useState<UserPackageProgress | null>(null);
  
  // 根据URL参数确定当前视图
  const view = packageId ? 'detail' : 'list';

  // 获取用户课程包进度
  const fetchUserPackageProgress = useCallback(async (packageId: string) => {
    try {
      const packageDetail = await fetchUserPackageDetail(packageId);
      
      // 转换数据格式
      const totalCourses = packageDetail.courses.length;
      const completedCourses = packageDetail.courses.filter(course => course.isCompleted).length;
      const lastAccessedAt = packageDetail.courses
        .filter(course => course.lastStudiedAt)
        .sort((a, b) => new Date(b.lastStudiedAt!).getTime() - new Date(a.lastStudiedAt!).getTime())[0]?.lastStudiedAt;
      
      const userProgressData: UserPackageProgress = {
        packageId,
        totalCourses,
        completedCourses,
        progressPercentage: packageDetail.overallProgress,
        lastAccessedAt,
        totalTimeSpent: undefined, // 这个字段在API中没有，暂时设为undefined
        courses: packageDetail.courses // 保存课程级别的进度信息
      };
      
      console.log('User package progress loaded:', userProgressData);
      console.log('API response:', packageDetail);
      console.log('API courses data:', packageDetail.courses);
      console.log('First course details:', packageDetail.courses[0]);
      

      setUserProgress(userProgressData);
    } catch (err) {
      console.error('Failed to fetch user progress:', err);
      setUserProgress(null);
    }
  }, []);

  // 加载课程包数据
  const loadCoursePackages = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params: any = {
        sortBy: 'createdAt',
        sortOrder: 'desc',
      };

      if (searchQuery.trim()) {
        params.search = searchQuery.trim();
      }

      console.log('Fetching course packages with params:', params);
      const response = await fetchCoursePackages(params);
      console.log('Course packages response:', response);
      
      // 新的API返回包含packages数组的响应对象
      setCoursePackages(response.packages);
    } catch (err) {
      console.error('Failed to load course packages:', err);
      setError(`Network error: ${err instanceof Error ? err.message : 'Please try again later'}`);
    } finally {
      setLoading(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    loadCoursePackages();
  }, [loadCoursePackages]);

  // 根据URL参数加载课程包详情
  useEffect(() => {
    if (packageId && coursePackages.length > 0) {
      // 从已加载的课程包中查找对应的课程包
      const foundPackage = coursePackages.find(pkg => pkg.id === packageId);
      if (foundPackage) {
        setSelectedPackage(foundPackage);
        loadCoursesByPackage(foundPackage);
        fetchUserPackageProgress(packageId);
      } else {
        // 如果没找到，可能是直接通过URL访问的，需要单独加载
        loadPackageById(packageId);
      }
    } else if (!packageId) {
      // 如果没有packageId，清除选中状态
      setSelectedPackage(null);
      setCourses([]);
      setUserProgress(null);
    }
  }, [packageId, coursePackages, fetchUserPackageProgress]);

  // 加载课程包的课程列表
  const loadCoursesByPackage = async (coursePackage: CoursePackage) => {
    try {
      setCoursesLoading(true);
      const result = await fetchCoursesByPackage(coursePackage.id);
      setCourses(result);
      

    } catch (err) {
      console.error('Failed to load courses:', err);
      setError(`Failed to get courses: ${err instanceof Error ? err.message : 'Please try again later'}`);
    } finally {
      setCoursesLoading(false);
    }
  };

  // 根据ID加载单个课程包（用于直接URL访问）
  const loadPackageById = async (id: string) => {
    try {
      const result = await fetchCoursePackageDetail(id);
      setSelectedPackage(result);
      loadCoursesByPackage(result);
      fetchUserPackageProgress(id);
    } catch (err) {
      console.error('Failed to load course package:', err);
      setError(`Failed to get course package: ${err instanceof Error ? err.message : 'Please try again later'}`);
      // 如果加载失败，重定向回列表页
      navigate('/dashboard/store');
    }
  };

  // 搜索处理
  const handleSearch = () => {
    loadCoursePackages();
  };

  // 课程包点击处理
  const handleCoursePackageClick = (coursePackage: CoursePackage) => {
    console.log('Selected course package:', coursePackage);
    // 导航到课程包详情页，URL会包含课程包ID
    navigate(`/dashboard/store/${coursePackage.id}`);
  };

  // 返回课程包列表
  const handleBackToList = () => {
    // 导航回课程包列表页
    navigate('/dashboard/store');
  };



  // 处理课程点击 - 直接进入拼音模式
  const handleCourseClick = useCallback((course: Course) => {
    if (packageId) {
      navigate(`/game/pinyin?courseId=${course.id}&packageId=${packageId}`);
    }
  }, [navigate, packageId]);

  if (loading) {
    return (
      <Box p="8">
        <Center minH="400px">
          <VStack gap="4">
            <Spinner size="xl" color="blue.400" />
            <Text color="gray.400">Loading course packages...</Text>
          </VStack>
        </Center>
      </Box>
    );
  }

  if (error) {
    return (
      <Box p="8">
        <Box bg="red.900" border="1px solid" borderColor="red.600" p="4" borderRadius="md">
          <VStack align="start" gap="2">
            <Text color="red.200" fontWeight="bold">Loading Failed</Text>
            <Text color="red.300">{error}</Text>
            <Button size="sm" colorScheme="red" variant="outline" onClick={loadCoursePackages}>
              Retry
            </Button>
          </VStack>
        </Box>
      </Box>
    );
  }

  return (
    <Box p="6" maxW="1400px" mx="auto">
      {view === 'list' ? (
        // 课程包列表视图
        <>
          {/* 页面标题 */}
          <VStack align="start" gap="8" mb="12">
            <Heading size="xl" color="white" fontWeight="700">
              Course Store
            </Heading>

            {/* 搜索框 */}
            <Box width="100%" maxW="500px">
              <Box position="relative">
                <Input
                  placeholder="Search course packages..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  bg="gray.800"
                  borderColor="gray.600"
                  color="white"
                  _placeholder={{ color: 'gray.400' }}
                  pr="12"
                  pl="12"
                  py="4"
                  fontSize="md"
                  borderRadius="xl"
                  borderWidth="2px"
                  _focus={{
                    borderColor: 'blue.400',
                    boxShadow: '0 0 0 1px var(--chakra-colors-blue-400)',
                    bg: 'gray.700'
                  }}
                  _hover={{
                    borderColor: 'gray.500',
                    bg: 'gray.700'
                  }}
                />
                {/* 左侧搜索图标提示 */}
                <Box
                  position="absolute"
                  left="4"
                  top="50%"
                  transform="translateY(-50%)"
                  color="gray.400"
                  pointerEvents="none"
                >
                  <Search size={18} />
                </Box>
                {/* 右侧可点击搜索按钮 */}
                <Box
                  position="absolute"
                  right="4"
                  top="50%"
                  transform="translateY(-50%)"
                  color="blue.400"
                  cursor="pointer"
                  onClick={handleSearch}
                  _hover={{
                    color: 'blue.300',
                    transform: 'translateY(-50%) scale(1.1)'
                  }}
                  transition="all 0.2s ease"
                >
                  <Search size={18} />
                </Box>
              </Box>
            </Box>
          </VStack>

          {/* 课程包列表 */}
          {coursePackages.length === 0 ? (
            <Center minH="400px">
              <VStack gap="6">
                <Box 
                  bg="rgba(39, 39, 42, 0.6)" 
                  borderRadius="50%" 
                  p="8"
                  border="1px solid rgba(82, 82, 91, 0.3)"
                >
                  <Filter size={48} color="#6B7280" />
                </Box>
                <Text color="gray.400" fontSize="lg" fontWeight="500">
                  No matching course packages found
                </Text>
                <Text color="gray.500" fontSize="sm">
                  Try adjusting your search keywords
                </Text>
              </VStack>
            </Center>
          ) : (
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap="8">
              {coursePackages.map((coursePackage) => (
                <CoursePackageCard
                  key={coursePackage.id}
                  coursePackage={coursePackage}
                  onClick={handleCoursePackageClick}
                />
              ))}
            </SimpleGrid>
          )}

          {/* 统计信息 */}
          {coursePackages.length > 0 && (
            <Box mt="12" pt="8" borderTop="1px" borderColor="gray.700">
              <Text color="gray.400" fontSize="sm" textAlign="center">
                Total {coursePackages.length} course packages found
              </Text>
            </Box>
          )}
        </>
      ) : (
        // 课程包详情视图
        <>
          {/* 返回按钮和课程包信息 */}
          <VStack align="start" gap="6" mb="8" maxW="1200px">
            <HStack gap="4">
              <IconButton
                onClick={handleBackToList}
                variant="ghost"
                size="lg"
                color="gray.400"
                _hover={{
                  bg: 'gray.800',
                  color: 'white'
                }}
                borderRadius="lg"
              >
                <ArrowLeft size={20} />
              </IconButton>
              <Heading size="xl" color="white" fontWeight="700">
                {selectedPackage?.title}
              </Heading>
            </HStack>





            {/* 课程包详细信息 */}
            {selectedPackage && (
              <Box bg="gray.800" p="6" borderRadius="xl" width="100%" border="1px" borderColor="gray.700">
                <VStack align="start" gap="4">
                  <Text color="gray.300" fontSize="md" lineHeight="1.6">
                    {selectedPackage.description}
                  </Text>
                  
                  {/* 课程数量和分类标签 - 紧凑布局 */}
                  <HStack gap="4" fontSize="sm" color="gray.400" flexWrap="wrap">
                    <HStack gap="2">
                      <BookOpen size={16} />
                      <Text fontWeight="500">
                        {selectedPackage.coursesCount || selectedPackage._count?.courses || 0} Courses
                      </Text>
                    </HStack>
                    
                    <Badge 
                      colorPalette="purple" 
                      variant="subtle" 
                      size="sm"
                      px="3"
                      py="1"
                      borderRadius="full"
                      fontWeight="500"
                    >
                      {selectedPackage.category}
                    </Badge>
                  </HStack>

                  {/* 简洁进度信息 */}
                  {userProgress && userProgress.totalCourses > 0 && (
                    <HStack gap="4" fontSize="sm" color="gray.400" pt="2">
                      <HStack gap="2">
                        <Target size={14} color="#3B82F6" />
                        <Text>{userProgress.progressPercentage}% Complete</Text>
                      </HStack>
                      {userProgress.lastAccessedAt && (
                        <HStack gap="1">
                          <Clock size={14} />
                          <Text>Last: {new Date(userProgress.lastAccessedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</Text>
                        </HStack>
                      )}
                    </HStack>
                  )}


                </VStack>
              </Box>
            )}
          </VStack>

          {/* 课程列表 */}
          {coursesLoading ? (
            <Center minH="300px">
              <VStack gap="4">
                <Spinner size="lg" color="blue.500" />
              </VStack>
            </Center>
          ) : courses.length > 0 ? (
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap="4">
              {courses.map((course) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  onClick={handleCourseClick}
                  userProgress={(() => {
                    if (!userProgress) return undefined;
                    
                    // 从API返回的课程包详情中查找当前课程的进度
                    const courseProgress = userProgress.courses?.find(c => c.id === course.id);
                    
                    // 调试信息
                    console.log('Course:', course.title, 'ID:', course.id);
                    console.log('Course progress from API:', courseProgress);
                    console.log('Course exerciseCount:', course.exerciseCount);
                    
                    if (courseProgress) {
                      const progressData = {
                        completedExercises: courseProgress.correctExercises || 0,
                        totalExercises: courseProgress.totalExercises || 0,
                        progressPercentage: courseProgress.progressPercentage || 0,
                        isCompleted: courseProgress.isCompleted || false
                      };
                      console.log('Final progress data:', progressData);
                      return progressData;
                    }
                    
                    // 如果没有找到具体课程进度，使用默认值
                    const defaultData = {
                      completedExercises: 0,
                      totalExercises: course.exerciseCount || 0,
                      progressPercentage: 0,
                      isCompleted: false
                    };
                    console.log('Using default data:', defaultData);
                    return defaultData;
                  })()}
                />
              ))}
            </SimpleGrid>
          ) : (
            <Center minH="200px">
              <Text color="gray.400">No courses available in this package</Text>
            </Center>
          )}
        </>
      )}
    </Box>
  );
};