import React from 'react';
import { Card, Heading, Text, Badge, HStack, VStack, Image, Box } from '@chakra-ui/react';
import { BookOpen } from 'lucide-react';
import { CoursePackage } from '../utils/courseAPI';

interface CoursePackageCardProps {
  coursePackage: CoursePackage;
  onClick: (coursePackage: CoursePackage) => void;
}

export const CoursePackageCard: React.FC<CoursePackageCardProps> = ({ coursePackage, onClick }) => {
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
      case 'beginner': return 'Beginner';
      case 'intermediate': return 'Intermediate';
      case 'advanced': return 'Advanced';
      case 'expert': return 'Expert';
      default: return 'Unknown';
    }
  };

  const formatPrice = (price: number | null | undefined) => {
    if (price === null || price === undefined) {
      return 'Free';
    }
    return price === 0 ? 'Free' : `¥${price}`;
  };

  return (
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
              height="200px"
              width="100%"
              objectFit="cover"
            />
            {/* 难度标签覆盖在图片上 */}
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
          </Box>
        )}

        {/* 内容区域 */}
        <Box p="6">
          {/* 标题和描述 */}
          <VStack align="start" gap="4" mb="6">
            <Heading size="md" color="white" lineClamp="2" fontWeight="600">
              {coursePackage.title}
            </Heading>

            <Text color="gray.300" fontSize="sm" lineClamp="3" lineHeight="1.6">
              {coursePackage.description}
            </Text>

            {/* 分类标签 */}
            <Badge 
              colorPalette="purple" 
              variant="subtle" 
              size="sm"
              px="3"
              py="1"
              borderRadius="full"
              fontWeight="500"
            >
              {coursePackage.category}
            </Badge>
          </VStack>

          {/* 课程数量信息 */}
          <HStack justify="space-between" align="center" pt="4" borderTop="1px" borderColor="gray.700">
            <HStack gap="2" color="gray.400" fontSize="sm">
              <BookOpen size={16} />
              <Text fontWeight="500">
                {coursePackage.coursesCount || coursePackage._count?.courses || 0} Courses
              </Text>
            </HStack>
            
            {/* 价格信息 */}
            <Text color="green.400" fontWeight="bold" fontSize="lg">
              {formatPrice(coursePackage.price)}
            </Text>
          </HStack>
        </Box>
      </Card.Body>
    </Card.Root>
  );
};