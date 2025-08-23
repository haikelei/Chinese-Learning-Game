import React from 'react';
import { Card, Heading, Text, Badge, HStack, VStack, Button } from '@chakra-ui/react';
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
      transition="all 0.2s"
      _hover={isReady ? {
        borderColor: 'blue.500',
        transform: 'translateY(-2px)',
        shadow: 'lg',
      } : {}}
      onClick={() => isReady && onClick(course)}
    >
      <Card.Body gap="4">
        {/* 课程标题和状态 */}
        <HStack justify="space-between" align="start">
          <VStack align="start" gap="2" flex="1">
            <Heading size="sm" color="white" lineClamp="2">
              {course.title}
            </Heading>
            {course.description && (
              <Text color="gray.300" fontSize="sm" lineClamp="2">
                {course.description}
              </Text>
            )}
          </VStack>
          
          <Badge 
            colorPalette={getStatusColor(course.textAnalysisStatus, course.exerciseGenerationStatus)} 
            size="sm"
          >
            {getStatusText(course.textAnalysisStatus, course.exerciseGenerationStatus)}
          </Badge>
        </HStack>

        {/* 课程统计信息 */}
        <HStack justify="space-between" fontSize="sm" color="gray.400">
          {course.estimatedMinutes && (
            <HStack gap="1">
              <Clock size={14} />
              <Text>{course.estimatedMinutes} 分钟</Text>
            </HStack>
          )}
          
          <HStack gap="1">
            <BookOpen size={14} />
            <Text>{course.exerciseCount || 0} 练习</Text>
          </HStack>
          
          <Text>第 {course.orderIndex} 课</Text>
        </HStack>

        {/* 开始学习按钮 */}
        {isReady && (
          <Button
            size="sm"
            colorScheme="blue"
            variant="outline"
            onClick={(e) => {
              e.stopPropagation();
              onClick(course);
            }}
            width="full"
          >
            <Play size={14} style={{ marginRight: '8px' }} />
            开始学习
          </Button>
        )}

        {!isReady && (
          <Button
            size="sm"
            variant="ghost"
            disabled
            width="full"
          >
            {getStatusText(course.textAnalysisStatus, course.exerciseGenerationStatus)}
          </Button>
        )}
      </Card.Body>
    </Card.Root>
  );
};