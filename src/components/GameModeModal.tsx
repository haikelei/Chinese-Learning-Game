import React from 'react';
import {
  Box,
  Button,
  Text,
  VStack,
  HStack,
} from '@chakra-ui/react';
import { Gamepad2, X } from 'lucide-react';
import { Course } from '../utils/courseAPI';

interface GameModeModalProps {
  isOpen: boolean;
  onClose: () => void;
  course: Course | null;
  onSelectMode: (mode: 'pinyin' | 'chinese', course: Course) => void;
}

export const GameModeModal: React.FC<GameModeModalProps> = ({
  isOpen,
  onClose,
  course,
  onSelectMode,
}) => {
  if (!course || !isOpen) return null;

  const handleModeSelect = (mode: 'pinyin' | 'chinese') => {
    onSelectMode(mode, course);
    onClose();
  };

  return (
    <>
      {/* 背景遮罩 */}
      <Box
        position="fixed"
        top="0"
        left="0"
        right="0"
        bottom="0"
        bg="blackAlpha.800"
        zIndex="1400"
        onClick={onClose}
      />
      
      {/* 弹窗内容 */}
      <Box
        position="fixed"
        top="50%"
        left="50%"
        transform="translate(-50%, -50%)"
        bg="gray.800"
        color="white"
        maxW="lg"
        width="calc(100% - 2rem)"
        borderRadius="2xl"
        border="1px solid"
        borderColor="gray.700"
        shadow="2xl"
        overflow="hidden"
        zIndex="1401"
      >
        {/* 顶部装饰条 */}
        <Box
          position="absolute"
          top="0"
          left="0"
          right="0"
          height="4px"
          bg="linear-gradient(90deg, #3B82F6, #8B5CF6)"
          zIndex="1"
        />
        
        {/* 头部 */}
        <Box p="6" pb="4" position="relative">
          <HStack justify="space-between" width="100%">
            <Text fontSize="xl" fontWeight="700" color="white">
              Select Game Mode
            </Text>
            <Button
              variant="ghost"
              size="sm"
              color="gray.400"
              _hover={{
                bg: 'gray.700',
                color: 'white'
              }}
              borderRadius="full"
              p="2"
              onClick={onClose}
            >
              <X size={18} />
            </Button>
          </HStack>
        </Box>

        {/* 内容区域 */}
        <Box px="6" pb="6">
          <VStack gap="4" width="100%">
            {/* 拼音模式卡片 */}
            <Button
              size="lg"
              width="100%"
              height="auto"
              py="6"
              px="6"
              colorScheme="blue"
              variant="outline"
              onClick={() => handleModeSelect('pinyin')}
              borderRadius="xl"
              borderWidth="2px"
              borderColor="blue.500"
              bg="rgba(59, 130, 246, 0.1)"
              _hover={{
                bg: 'rgba(59, 130, 246, 0.2)',
                borderColor: 'blue.400',
                transform: 'translateY(-2px)',
                shadow: 'lg'
              }}
              _active={{
                transform: 'translateY(0)'
              }}
              transition="all 0.2s ease"
            >
              <HStack gap="4" width="100%" justify="center">
                <Box 
                  bg="blue.500" 
                  p="3" 
                  borderRadius="full"
                  color="white"
                  shadow="md"
                >
                  <Gamepad2 size={24} />
                </Box>
                <VStack align="start" gap="1">
                  <Text fontSize="lg" fontWeight="700" color="blue.400">
                    Pinyin Mode
                  </Text>
                  <Text fontSize="sm" color="gray.300">
                    Listen to audio and input pinyin
                  </Text>
                </VStack>
              </HStack>
            </Button>

            {/* 汉字模式卡片 */}
            <Button
              size="lg"
              width="100%"
              height="auto"
              py="6"
              px="6"
              colorScheme="green"
              variant="outline"
              onClick={() => handleModeSelect('chinese')}
              borderRadius="xl"
              borderWidth="2px"
              borderColor="green.500"
              bg="rgba(34, 197, 94, 0.1)"
              _hover={{
                bg: 'rgba(34, 197, 94, 0.2)',
                borderColor: 'green.400',
                transform: 'translateY(-2px)',
                shadow: 'lg'
              }}
              _active={{
                transform: 'translateY(0)'
              }}
              transition="all 0.2s ease"
            >
              <HStack gap="4" width="100%" justify="center">
                <Box 
                  bg="green.500" 
                  p="3" 
                  borderRadius="full"
                  color="white"
                  shadow="md"
                >
                  <Gamepad2 size={24} />
                </Box>
                <VStack align="start" gap="1">
                  <Text fontSize="lg" fontWeight="700" color="green.400">
                    Chinese Mode
                  </Text>
                  <Text fontSize="sm" color="gray.300">
                    Listen to audio and input Chinese characters
                  </Text>
                </VStack>
              </HStack>
            </Button>
          </VStack>
        </Box>
      </Box>
    </>
  );
};