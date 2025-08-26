import React from 'react';
import { Card, Heading, Text, HStack, Box } from '@chakra-ui/react';
import { CheckCircle, Play } from 'lucide-react';
import { Course } from '../utils/courseAPI';

interface CourseCardProps {
  course: Course;
  onClick?: (course: Course) => void;
  userProgress?: {
    completedExercises: number;
    totalExercises: number;
    progressPercentage: number;
    isCompleted: boolean;
  };
}

export const CourseCard: React.FC<CourseCardProps> = ({ course, onClick, userProgress }) => {
  const isCompleted = userProgress?.isCompleted || false;
  const progressPercentage = userProgress?.progressPercentage || 0;
  const hasProgress = userProgress && userProgress.totalExercises > 0;

  return (
    <Card.Root
      bg="gray.800"
      borderColor={isCompleted ? "green.500" : "gray.700"}
      borderWidth="1px"
      cursor={onClick ? "pointer" : "default"}
      transition="all 0.3s ease"
      borderRadius="xl"
      overflow="hidden"
      position="relative"
      onClick={onClick ? () => onClick(course) : undefined}
      _hover={onClick ? {
        borderColor: isCompleted ? "green.400" : "blue.500",
        transform: 'translateY(-2px)',
        shadow: '0 8px 25px rgba(0, 0, 0, 0.3)',
        bg: 'gray.750'
      } : {}}
      _before={{
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '3px',
        bg: isCompleted 
          ? 'linear-gradient(90deg, #22C55E, #16A34A)' 
          : 'linear-gradient(90deg, #3B82F6, #8B5CF6)',
        opacity: 0.8,
        transition: 'opacity 0.3s ease'
      }}
    >
      <Card.Body p="0">
        {/* 内容区域 */}
        <Box p="5">
          {/* 课程标题和完成状态 */}
          <HStack justify="space-between" width="100%" mb="3">
            <Heading size="sm" color="white" lineClamp="2" fontWeight="600" flex="1">
              {course.title}
            </Heading>
            {isCompleted && (
              <Box flexShrink="0">
                <CheckCircle size={18} color="#22C55E" />
              </Box>
            )}
          </HStack>

          {/* 课程描述 */}
          {course.description && (
            <Text color="gray.300" fontSize="sm" lineClamp="2" lineHeight="1.4" mb="4">
              {course.description}
            </Text>
          )}

          {/* 进度条 */}
          {hasProgress && (
            <Box mb="4">
              <HStack justify="space-between" mb="2">
                <Text fontSize="sm" color="gray.400" fontWeight="500">
                  {progressPercentage}% Complete
                </Text>
                <Text fontSize="sm" color="gray.400">
                  {userProgress.completedExercises}/{userProgress.totalExercises}
                </Text>
              </HStack>
              <Box 
                bg="gray.700" 
                borderRadius="full" 
                h="8px" 
                overflow="hidden"
              >
                <Box
                  bg={isCompleted ? "green.500" : "blue.500"}
                  h="100%"
                  borderRadius="full"
                  transition="width 0.3s ease"
                  width={`${progressPercentage}%`}
                />
              </Box>
            </Box>
          )}

          {/* 开始学习按钮 */}
          {onClick && (
            <HStack 
              gap="2" 
              color={isCompleted ? "green.400" : "blue.400"}
              fontSize="sm"
              fontWeight="500"
              justify="center"
              pt="2"
              borderTop="1px solid"
              borderColor="gray.700"
            >
              <Play size={14} />
              <Text>
                {isCompleted ? "Review Course" : "Start Learning"}
              </Text>
            </HStack>
          )}
        </Box>
      </Card.Body>
    </Card.Root>
  );
};