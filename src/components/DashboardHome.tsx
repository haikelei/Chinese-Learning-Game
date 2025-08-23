import React from 'react';
import { Box, Heading, Text, SimpleGrid } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';

export const DashboardHome: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Box p="8">
      <Heading size="lg" color="white" mb="6">
        欢迎回到 MandarinLoop
      </Heading>
      
      <Text color="gray.400" mb="8" fontSize="lg">
        继续你的中文学习之旅
      </Text>

      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap="6">
        {/* 游戏模式卡片 */}
        <Box
          bg="gray.800"
          p="6"
          borderRadius="xl"
          border="1px solid"
          borderColor="gray.700"
          _hover={{
            borderColor: 'blue.500',
            transform: 'translateY(-2px)',
          }}
          transition="all 0.2s ease"
          cursor="pointer"
          onClick={() => navigate('/game/pinyin')}
        >
          <Text fontSize="2xl" mb="4">🔤</Text>
          <Heading size="md" color="white" mb="2">
            拼音模式
          </Heading>
          <Text color="gray.400" fontSize="sm">
            听音频，输入拼音练习
          </Text>
        </Box>

        <Box
          bg="gray.800"
          p="6"
          borderRadius="xl"
          border="1px solid"
          borderColor="gray.700"
          _hover={{
            borderColor: 'blue.500',
            transform: 'translateY(-2px)',
          }}
          transition="all 0.2s ease"
          cursor="pointer"
          onClick={() => navigate('/game/chinese')}
        >
          <Text fontSize="2xl" mb="4">汉</Text>
          <Heading size="md" color="white" mb="2">
            汉字模式
          </Heading>
          <Text color="gray.400" fontSize="sm">
            听音频，输入汉字练习
          </Text>
        </Box>

        <Box
          bg="gray.800"
          p="6"
          borderRadius="xl"
          border="1px solid"
          borderColor="gray.700"
          opacity="0.6"
        >
          <Text fontSize="2xl" mb="4">📚</Text>
          <Heading size="md" color="white" mb="2">
            课程包
          </Heading>
          <Text color="gray.400" fontSize="sm">
            即将推出...
          </Text>
        </Box>
      </SimpleGrid>
    </Box>
  );
};