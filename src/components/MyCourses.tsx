import React from 'react';
import { Box, Heading, Text } from '@chakra-ui/react';

export const MyCourses: React.FC = () => {
  return (
    <Box p="8">
      <Heading size="lg" color="white" mb="6">
        我的课程包
      </Heading>
      
      <Text color="gray.400" fontSize="lg">
        功能开发中，敬请期待...
      </Text>
    </Box>
  );
};