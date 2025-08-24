import React from 'react';
import { Card, Heading, Text, Badge, HStack, VStack, Image, Box } from '@chakra-ui/react';
import { Clock, BookOpen, Play } from 'lucide-react';
import { motion } from 'framer-motion';

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
  totalProgress: number;
  lastAccessedAt: string;
}

interface UserCoursePackageCardProps {
  coursePackage: UserCoursePackage;
  onClick: (coursePackage: UserCoursePackage) => void;
}

export const UserCoursePackageCard: React.FC<UserCoursePackageCardProps> = ({ 
  coursePackage, 
  onClick 
}) => {
  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'green';
      case 'intermediate': return 'blue';
      case 'advanced': return 'orange';
      case 'expert': return 'red';
      default: return 'gray';
    }
  };

  const getDifficultyText = (level: string) => {
    switch (level) {
      case 'beginner': return '入门';
      case 'intermediate': return '中级';
      case 'advanced': return '高级';
      case 'expert': return '专家';
      default: return '未知';
    }
  };

  const formatLastAccessed = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return '昨天';
    if (diffDays < 7) return `${diffDays}天前`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}周前`;
    return `${Math.floor(diffDays / 30)}个月前`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card.Root
        bg="gray.800"
        borderColor="gray.700"
        borderWidth="1px"
        cursor="pointer"
        transition="all 0.3s ease"
        borderRadius="xl"
        overflow="hidden"
        _hover={{
          borderColor: 'blue.400',
          transform: 'translateY(-4px)',
          shadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
          bg: 'gray.750'
        }}
        onClick={() => onClick(coursePackage)}
      >
        <Card.Body p="0">
          {/* 课程包图片 */}
          {coursePackage.coverImageUrl && (
            <Box position="relative">
              <Image
                src={coursePackage.coverImageUrl}
                alt={coursePackage.title}
                height="160px"
                width="100%"
                objectFit="cover"
              />
              {/* 难度标签覆盖在图片上 */}
              {coursePackage.difficultyLevel && (
                <Badge
                  position="absolute"
                  top="4"
                  right="4"
                  colorPalette={getDifficultyColor(coursePackage.difficultyLevel)}
                  size="sm"
                  borderRadius="full"
                  px="3"
                  py="1"
                  fontWeight="600"
                  textTransform="uppercase"
                  letterSpacing="wide"
                  shadow="lg"
                >
                  {getDifficultyText(coursePackage.difficultyLevel)}
                </Badge>
              )}
              {/* 进度标签覆盖在图片上 */}
              <Box
                position="absolute"
                bottom="4"
                left="4"
                bg="rgba(0, 0, 0, 0.8)"
                color="white"
                px="3"
                py="1"
                borderRadius="full"
                fontSize="sm"
                fontWeight="600"
                backdropFilter="blur(10px)"
              >
                {coursePackage.totalProgress}% 完成
              </Box>
            </Box>
          )}

          {/* 内容区域 */}
          <Box p="6">
            {/* 标题和描述 */}
            <VStack align="start" gap="3" mb="5">
              <Heading size="md" color="white" lineClamp="2" fontWeight="600">
                {coursePackage.title}
              </Heading>
              {coursePackage.description && (
                <Text color="gray.300" fontSize="sm" lineClamp="2" lineHeight="1.6">
                  {coursePackage.description}
                </Text>
              )}
            </VStack>

            {/* 学习进度条 */}
            <VStack gap="3" align="start" width="100%" mb="5">
              <HStack justify="space-between" width="100%">
                <Text color="gray.400" fontSize="sm" fontWeight="500">
                  学习进度
                </Text>
                <Text color="blue.400" fontSize="sm" fontWeight="600">
                  {coursePackage.totalProgress}%
                </Text>
              </HStack>
              
              <Box width="100%">
                <Box
                  height="8px"
                  borderRadius="full"
                  bg="gray.700"
                  overflow="hidden"
                >
                  <Box
                    height="100%"
                    borderRadius="full"
                    bg="linear-gradient(90deg, #3B82F6, #1D4ED8)"
                    width={`${coursePackage.totalProgress}%`}
                  />
                </Box>
              </Box>
            </VStack>

            {/* 统计信息和操作 */}
            <HStack justify="space-between" align="center" pt="4" borderTop="1px" borderColor="gray.700">
              <HStack gap="4" color="gray.400" fontSize="sm">
                <HStack gap="2">
                  <BookOpen size={16} />
                  <Text fontWeight="500">
                    {coursePackage.courses.length} 课程
                  </Text>
                </HStack>
                <HStack gap="2">
                  <Clock size={16} />
                  <Text fontWeight="500">
                    {formatLastAccessed(coursePackage.lastAccessedAt)}
                  </Text>
                </HStack>
              </HStack>
              
              {/* 继续学习按钮 */}
              <Box
                bg="blue.500"
                color="white"
                p="2"
                borderRadius="full"
                _hover={{
                  bg: 'blue.400',
                  transform: 'scale(1.1)'
                }}
                transition="all 0.2s ease"
              >
                <Play size={16} />
              </Box>
            </HStack>
          </Box>
        </Card.Body>
      </Card.Root>
    </motion.div>
  );
};
