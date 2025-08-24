import React from 'react';
import { Card, Heading, Text, Badge, HStack, VStack, Button, Box } from '@chakra-ui/react';
import { Clock, BookOpen, Play } from 'lucide-react';
import { Course } from '../utils/courseAPI';

interface CourseCardProps {
  course: Course;
  onClick: (course: Course) => void;
}

export const CourseCard: React.FC<CourseCardProps> = ({ course, onClick }) => {
  const getStatusColor = (textAnalysisStatus?: string, exerciseGenerationStatus?: string) => {
    if (textAnalysisStatus === 'completed' && exerciseGenerationStatus === 'completed') {
      return 'green';
    } else if (textAnalysisStatus === 'processing' || exerciseGenerationStatus === 'processing') {
      return 'yellow';
    } else if (textAnalysisStatus === 'failed' || exerciseGenerationStatus === 'failed') {
      return 'red';
    }
    return 'gray';
  };

  const getStatusText = (textAnalysisStatus?: string, exerciseGenerationStatus?: string) => {
    if (textAnalysisStatus === 'completed' && exerciseGenerationStatus === 'completed') {
      return '已就绪';
    } else if (textAnalysisStatus === 'processing' || exerciseGenerationStatus === 'processing') {
      return '处理中';
    } else if (textAnalysisStatus === 'failed' || exerciseGenerationStatus === 'failed') {
      return '处理失败';
    }
    return '准备中';
  };

  const isReady = course.textAnalysisStatus === 'completed' && course.exerciseGenerationStatus === 'completed';

  return (
    <Card.Root
      bg="gray.800"
      borderColor="gray.700"
      borderWidth="1px"
      cursor={isReady ? "pointer" : "default"}
      opacity={isReady ? 1 : 0.7}
      transition="all 0.3s ease"
      borderRadius="xl"
      overflow="hidden"
      position="relative"
      _hover={isReady ? {
        borderColor: 'blue.400',
        transform: 'translateY(-4px)',
        shadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
        bg: 'gray.750'
      } : {}}
      onClick={() => isReady && onClick(course)}
      _before={{
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '2px',
        bg: isReady ? 'linear-gradient(90deg, #3B82F6, #8B5CF6)' : 'transparent',
        opacity: isReady ? 1 : 0,
        transition: 'opacity 0.3s ease'
      }}
    >
      <Card.Body p="0">
        {/* 内容区域 */}
        <Box p="6">
          {/* 课程标题和状态 */}
          <HStack justify="space-between" align="start" mb="5">
            <VStack align="start" gap="3" flex="1">
              <Heading size="md" color="white" lineClamp="2" fontWeight="600">
                {course.title}
              </Heading>
              {course.description && (
                <Text color="gray.300" fontSize="sm" lineClamp="2" lineHeight="1.6">
                  {course.description}
                </Text>
              )}
            </VStack>
            
            <Badge 
              colorPalette={getStatusColor(course.textAnalysisStatus, course.exerciseGenerationStatus)} 
              size="sm"
              px="3"
              py="1"
              borderRadius="full"
              fontWeight="600"
              textTransform="uppercase"
              letterSpacing="wide"
              shadow="sm"
            >
              {getStatusText(course.textAnalysisStatus, course.exerciseGenerationStatus)}
            </Badge>
          </HStack>

          {/* 课程统计信息 */}
          <HStack justify="space-between" fontSize="sm" color="gray.400" mb="8" px="1">
            {course.estimatedMinutes && (
              <HStack gap="2">
                <Box color="blue.400">
                  <Clock size={16} />
                </Box>
                <Text fontWeight="500">{course.estimatedMinutes} 分钟</Text>
              </HStack>
            )}
            
            <HStack gap="2">
              <Box color="purple.400">
                <BookOpen size={16} />
              </Box>
              <Text fontWeight="500">{course.exerciseCount || 0} 练习</Text>
            </HStack>
            
            <Text fontWeight="600" color="blue.400" fontSize="md">第 {course.orderIndex} 课</Text>
          </HStack>

          {/* 开始学习按钮 */}
          {isReady && (
            <Button
              size="md"
              colorScheme="blue"
              variant="solid"
              onClick={(e) => {
                e.stopPropagation();
                onClick(course);
              }}
              width="auto"
              minW="140px"
              borderRadius="lg"
              py="3"
              px="6"
              fontWeight="600"
              bg="linear-gradient(135deg, #3B82F6, #1D4ED8)"
              _hover={{
                transform: 'translateY(-1px)',
                shadow: 'lg',
                bg: 'linear-gradient(135deg, #2563EB, #1E40AF)'
              }}
              _active={{
                transform: 'translateY(0)'
              }}
              transition="all 0.2s ease"
            >
              <Play size={16} style={{ marginRight: '8px' }} />
              开始学习
            </Button>
          )}

          {!isReady && (
            <Button
              size="md"
              variant="ghost"
              disabled
              width="auto"
              minW="140px"
              borderRadius="lg"
              py="3"
              px="6"
              color="gray.500"
              bg="gray.700"
              _hover={{
                bg: 'gray.700'
              }}
            >
              {getStatusText(course.textAnalysisStatus, course.exerciseGenerationStatus)}
            </Button>
          )}
        </Box>
      </Card.Body>
    </Card.Root>
  );
};