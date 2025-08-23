import React from 'react';
import { Card, Heading, Text, Badge, HStack, VStack, Image, Box } from '@chakra-ui/react';
import { Clock, BookOpen, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import styled from 'styled-components';

const StyledCard = styled(Card.Root)`
  background: rgba(39, 39, 42, 0.8);
  border: 1px solid rgba(82, 82, 91, 0.3);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: rgba(14, 165, 233, 0.5);
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
  }
`;

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
      <StyledCard onClick={() => onClick(coursePackage)}>
        <Card.Body gap="4">
          {/* 课程包图片 */}
          {coursePackage.coverImageUrl && (
            <Image
              src={coursePackage.coverImageUrl}
              alt={coursePackage.title}
              borderRadius="md"
              height="140px"
              width="100%"
              objectFit="cover"
            />
          )}

          {/* 标题和难度 */}
          <VStack align="start" gap="2">
            <HStack justify="space-between" width="100%">
              <Heading size="md" color="white" lineClamp="2" fontSize="lg">
                {coursePackage.title}
              </Heading>
              {coursePackage.difficultyLevel && (
                <Badge colorPalette={getDifficultyColor(coursePackage.difficultyLevel)} size="xs">
                  {getDifficultyText(coursePackage.difficultyLevel)}
                </Badge>
              )}
            </HStack>

            {coursePackage.description && (
              <Text color="gray.300" fontSize="sm" lineClamp="2">
                {coursePackage.description}
              </Text>
            )}
          </VStack>

          {/* 学习进度 */}
          <VStack gap="3" align="start" width="100%">
            <HStack justify="space-between" width="100%">
              <Text color="gray.300" fontSize="sm" fontWeight="500">
                学习进度
              </Text>
              <Text color="blue.400" fontSize="sm" fontWeight="600">
                {coursePackage.totalProgress}%
              </Text>
            </HStack>
            
            <Box
              width="100%"
              height="6px"
              borderRadius="3px"
              bg="rgba(255, 255, 255, 0.1)"
              overflow="hidden"
            >
              <Box
                width={`${coursePackage.totalProgress}%`}
                height="100%"
                bg="blue.400"
                borderRadius="3px"
                transition="width 0.3s ease"
              />
            </Box>
          </VStack>

          {/* 统计信息 */}
          <VStack gap="2" width="100%">
            <HStack justify="space-between" width="100%" fontSize="sm" color="gray.400">
              <HStack gap="1">
                <BookOpen size={14} />
                <Text>{coursePackage.courses.length} 课程</Text>
              </HStack>
              <HStack gap="1">
                <Clock size={14} />
                <Text>{formatLastAccessed(coursePackage.lastAccessedAt)}</Text>
              </HStack>
            </HStack>
            
            <HStack gap="1" color="green.400" fontSize="xs">
              <TrendingUp size={12} />
              <Text>继续学习</Text>
            </HStack>
          </VStack>
        </Card.Body>
      </StyledCard>
    </motion.div>
  );
};
