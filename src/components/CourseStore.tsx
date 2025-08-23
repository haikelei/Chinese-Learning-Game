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
import { Search, Filter, ArrowLeft, Clock, BookOpen, Users } from 'lucide-react';
import { CoursePackage, Course, fetchCoursePackages, fetchCoursesByPackage, fetchCoursePackageDetail, fetchCourseExercises } from '../utils/courseAPI';
import { CoursePackageCard } from './CoursePackageCard';
import { CourseCard } from './CourseCard';
import { GameModeModal } from './GameModeModal';

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
  
  // 根据URL参数确定当前视图
  const view = packageId ? 'detail' : 'list';
  
  // 游戏模式弹窗状态
  const [showModeModal, setShowModeModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

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
      setError(`网络错误：${err instanceof Error ? err.message : '请稍后重试'}`);
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
      } else {
        // 如果没找到，可能是直接通过URL访问的，需要单独加载
        loadPackageById(packageId);
      }
    } else if (!packageId) {
      // 如果没有packageId，清除选中状态
      setSelectedPackage(null);
      setCourses([]);
    }
  }, [packageId, coursePackages]);

  // 加载课程包的课程列表
  const loadCoursesByPackage = async (coursePackage: CoursePackage) => {
    try {
      setCoursesLoading(true);
      const result = await fetchCoursesByPackage(coursePackage.id);
      setCourses(result);
    } catch (err) {
      console.error('Failed to load courses:', err);
      setError(`获取课程失败：${err instanceof Error ? err.message : '请稍后重试'}`);
    } finally {
      setCoursesLoading(false);
    }
  };

  // 根据ID加载单个课程包（用于直接URL访问）
  const loadPackageById = async (id: string) => {
    try {
      setLoading(true);
      const coursePackage = await fetchCoursePackageDetail(id);
      setSelectedPackage(coursePackage);
      await loadCoursesByPackage(coursePackage);
    } catch (err) {
      console.error('Failed to load package:', err);
      setError(`获取课程包失败：${err instanceof Error ? err.message : '请稍后重试'}`);
      // 如果加载失败，重定向回列表页
      navigate('/dashboard/store');
    } finally {
      setLoading(false);
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

  // 课程点击处理
  const handleCourseClick = (course: Course) => {
    console.log('Selected course:', course);
    setSelectedCourse(course);
    setShowModeModal(true);
  };

  // 模式选择处理
  const handleModeSelect = async (mode: 'pinyin' | 'chinese', course: Course) => {
    console.log('Selected mode:', mode, 'for course:', course);
    
    try {
      // 获取课程的练习数据
      const exercises = await fetchCourseExercises(course.id);
      
      // 使用React Router导航到练习页面，通过URL参数传递课程和练习数据
      const params = new URLSearchParams({
        courseId: course.id,
        courseTitle: course.title,
        packageId: course.coursePackageId,
        packageTitle: selectedPackage?.title || '',
        exercises: JSON.stringify(exercises), // 传递练习数据
      });
      
      if (mode === 'pinyin') {
        navigate(`/game/pinyin?${params.toString()}`);
      } else {
        navigate(`/game/chinese?${params.toString()}`);
      }
    } catch (error) {
      console.error('Failed to load exercises:', error);
      // 如果加载练习失败，仍然导航到游戏页面，但会使用默认数据
      const params = new URLSearchParams({
        courseId: course.id,
        courseTitle: course.title,
        packageId: course.coursePackageId,
        packageTitle: selectedPackage?.title || '',
      });
      
      if (mode === 'pinyin') {
        navigate(`/game/pinyin?${params.toString()}`);
      } else {
        navigate(`/game/chinese?${params.toString()}`);
      }
    }
  };

  // 关闭模式选择弹窗
  const handleCloseModeModal = () => {
    setShowModeModal(false);
    setSelectedCourse(null);
  };

  if (loading) {
    return (
      <Center minH="400px">
        <VStack gap="4">
          <Spinner size="xl" color="blue.400" />
          <Text color="gray.400">加载课程包中...</Text>
        </VStack>
      </Center>
    );
  }

  if (error) {
    return (
      <Box p="8">
        <Box bg="red.900" border="1px solid" borderColor="red.600" p="4" borderRadius="md">
          <VStack align="start" gap="2">
            <Text color="red.200" fontWeight="bold">加载失败</Text>
            <Text color="red.300">{error}</Text>
            <Button size="sm" colorScheme="red" variant="outline" onClick={loadCoursePackages}>
              重试
            </Button>
          </VStack>
        </Box>
      </Box>
    );
  }

  return (
    <Box p="8">
      {view === 'list' ? (
        // 课程包列表视图
        <>
          {/* 页面标题 */}
          <VStack align="start" gap="6" mb="8">
            <Heading size="lg" color="white">
              课程包商城
            </Heading>

            {/* 搜索框 */}
            <HStack gap="4" width="100%" maxW="600px">
              <Box flex="1" position="relative">
                <Input
                  placeholder="搜索课程包..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  bg="gray.800"
                  borderColor="gray.600"
                  color="white"
                  _placeholder={{ color: 'gray.400' }}
                  pr="12"
                />
                <Button
                  position="absolute"
                  right="2"
                  top="50%"
                  transform="translateY(-50%)"
                  size="sm"
                  colorScheme="blue"
                  onClick={handleSearch}
                >
                  <Search size={16} />
                </Button>
              </Box>
            </HStack>
          </VStack>

          {/* 课程包列表 */}
          {coursePackages.length === 0 ? (
            <Center minH="300px">
              <VStack gap="4">
                <Filter size={48} color="gray" />
                <Text color="gray.400" fontSize="lg">
                  没有找到匹配的课程包
                </Text>
                <Text color="gray.500" fontSize="sm">
                  尝试调整搜索关键词
                </Text>
              </VStack>
            </Center>
          ) : (
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap="6">
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
            <Box mt="8" pt="6" borderTop="1px" borderColor="gray.700">
              <Text color="gray.400" fontSize="sm" textAlign="center">
                共找到 {coursePackages.length} 个课程包
              </Text>
            </Box>
          )}
        </>
      ) : (
        // 课程包详情视图
        <>
          {/* 返回按钮和课程包信息 */}
          <VStack align="start" gap="6" mb="8">
            <HStack gap="4">
              <IconButton
                onClick={handleBackToList}
                variant="ghost"
                size="sm"
              >
                <ArrowLeft size={20} />
              </IconButton>
              <Heading size="lg" color="white">
                {selectedPackage?.title}
              </Heading>
            </HStack>

            {/* 课程包详细信息 */}
            {selectedPackage && (
              <Box bg="gray.800" p="6" borderRadius="lg" width="100%">
                <VStack align="start" gap="4">
                  <Text color="gray.300" fontSize="md">
                    {selectedPackage.description}
                  </Text>
                  
                  {/* 统计信息 */}
                  <HStack gap="8" fontSize="sm" color="gray.400">
                    <HStack gap="2">
                      <Clock size={16} />
                      <Text>{selectedPackage.estimatedHours} 小时</Text>
                    </HStack>
                    <HStack gap="2">
                      <BookOpen size={16} />
                      <Text>{selectedPackage.coursesCount || selectedPackage._count?.courses || 0} 课程</Text>
                    </HStack>
                    <HStack gap="2">
                      <Users size={16} />
                      <Text>练习</Text>
                    </HStack>
                  </HStack>

                  {/* 标签和分类 */}
                  <HStack gap="2" flexWrap="wrap">
                    <Badge colorPalette="purple" variant="subtle">
                      {selectedPackage.category}
                    </Badge>
                    {selectedPackage.tags?.map((tag, index) => (
                      <Badge key={index} colorPalette="gray" variant="outline" size="sm">
                        {tag}
                      </Badge>
                    ))}
                  </HStack>
                </VStack>
              </Box>
            )}
          </VStack>

          {/* 课程列表 */}
          {coursesLoading ? (
            <Center minH="300px">
              <VStack gap="4">
                <Spinner size="xl" color="blue.400" />
                <Text color="gray.400">加载课程中...</Text>
              </VStack>
            </Center>
          ) : courses.length === 0 ? (
            <Center minH="300px">
              <VStack gap="4">
                <BookOpen size={48} color="gray" />
                <Text color="gray.400" fontSize="lg">
                  暂无课程
                </Text>
                <Text color="gray.500" fontSize="sm">
                  该课程包还没有添加课程内容
                </Text>
              </VStack>
            </Center>
          ) : (
            <>
              <Heading size="md" color="white" mb="6">
                课程列表 ({courses.length})
              </Heading>
              <SimpleGrid columns={{ base: 1, md: 2 }} gap="4">
                {courses.map((course) => (
                  <CourseCard
                    key={course.id}
                    course={course}
                    onClick={handleCourseClick}
                  />
                ))}
              </SimpleGrid>
            </>
          )}
        </>
      )}
      
      {/* 游戏模式选择弹窗 */}
      <GameModeModal
        isOpen={showModeModal}
        onClose={handleCloseModeModal}
        course={selectedCourse}
        onSelectMode={handleModeSelect}
      />
    </Box>
  );
};