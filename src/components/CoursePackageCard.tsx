import React from 'react';
import { Card, Heading, Text, Badge, HStack, VStack, Image } from '@chakra-ui/react';
import { Clock, BookOpen, Users } from 'lucide-react';
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
      case 'beginner': return '入门';
      case 'intermediate': return '中级';
      case 'advanced': return '高级';
      case 'expert': return '专家';
      default: return '未知';
    }
  };

  const formatPrice = (price: number) => {
    return price === 0 ? '免费' : `¥${price}`;
  };

  return (
    <Card.Root
      bg="gray.800"
      borderColor="gray.700"
      borderWidth="1px"
      cursor="pointer"
      transition="all 0.2s"
      _hover={{
        borderColor: 'blue.500',
        transform: 'translateY(-2px)',
        shadow: 'xl',
      }}
      onClick={() => onClick(coursePackage)}
    >
      <Card.Body gap="6">
        {/* 课程包图片 */}
        {coursePackage.coverImageUrl && (
          <Image
            src={coursePackage.coverImageUrl}
            alt={coursePackage.title}
            borderRadius="md"
            height="160px"
            width="100%"
            objectFit="cover"
          />
        )}

        {/* 标题和描述 */}
        <VStack align="start" gap="3">
          <HStack justify="space-between" width="100%">
            <Heading size="md" color="white" lineClamp="2">
              {coursePackage.title}
            </Heading>
            <Badge colorPalette={getDifficultyColor(coursePackage.difficultyLevel)} size="xs">
              {getDifficultyText(coursePackage.difficultyLevel)}
            </Badge>
          </HStack>

          <Text color="gray.300" fontSize="sm" lineClamp="2">
            {coursePackage.description}
          </Text>

          {/* 分类标签 */}
          <Badge colorPalette="purple" variant="subtle" size="xs">
            {coursePackage.category}
          </Badge>
        </VStack>

        {/* 统计信息 */}
        <VStack gap="2">
          <HStack justify="space-between" width="100%" fontSize="sm" color="gray.400">
            <HStack gap="1">
              <Clock size={16} />
              <Text>{coursePackage.estimatedHours} 小时</Text>
            </HStack>
            <HStack gap="1">
              <BookOpen size={16} />
              <Text>{coursePackage.coursesCount || coursePackage._count?.courses || 0} 课程</Text>
            </HStack>
            <HStack gap="1">
              <Users size={16} />
              <Text>练习</Text>
            </HStack>
          </HStack>
        </VStack>

        {/* 标签 */}
        {coursePackage.tags && coursePackage.tags.length > 0 && (
          <HStack gap="2" flexWrap="wrap">
            {coursePackage.tags.slice(0, 3).map((tag, index) => (
              <Badge key={index} colorPalette="gray" variant="outline" size="xs">
                {tag}
              </Badge>
            ))}
            {coursePackage.tags.length > 3 && (
              <Badge colorPalette="gray" variant="outline" size="xs">
                +{coursePackage.tags.length - 3}
              </Badge>
            )}
          </HStack>
        )}

        {/* 价格信息 */}
        <HStack justify="space-between" align="center">
          <VStack align="start" gap="0">
            <Text color="green.400" fontWeight="bold" fontSize="lg">
              {formatPrice(coursePackage.price)}
            </Text>
            {/* 暂时隐藏原价显示，因为新接口没有 originalPrice 字段 */}
          </VStack>
          
          {coursePackage.price === 0 && (
            <Badge colorPalette="green" variant="solid">
              免费体验
            </Badge>
          )}
        </HStack>
      </Card.Body>
    </Card.Root>
  );
};