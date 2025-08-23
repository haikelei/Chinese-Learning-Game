import React from 'react';
import {
  Box,
  Button,
  Text,
  VStack,
  HStack,
  Dialog,
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
  if (!course) return null;

  const handleModeSelect = (mode: 'pinyin' | 'chinese') => {
    onSelectMode(mode, course);
    onClose();
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={() => onClose()}>
      <Dialog.Backdrop bg="blackAlpha.700" />
      <Dialog.Positioner>
        <Dialog.Content bg="gray.800" color="white" maxW="md">
          <Dialog.Header>
            <HStack justify="space-between" width="100%">
              <Dialog.Title>选择游戏模式</Dialog.Title>
              <Dialog.CloseTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                >
                  <X size={20} />
                </Button>
              </Dialog.CloseTrigger>
            </HStack>
          </Dialog.Header>

          <Dialog.Body>
            <VStack gap="6">
              {/* 课程信息 */}
              <Box textAlign="center">
                <Text fontSize="lg" fontWeight="semibold" mb="2">
                  {course.title}
                </Text>
                {course.description && (
                  <Text color="gray.300" fontSize="sm">
                    {course.description}
                  </Text>
                )}
              </Box>

              {/* 模式选择按钮 */}
              <VStack gap="4" width="100%">
                <Button
                  size="lg"
                  width="100%"
                  height="auto"
                  py="6"
                  colorScheme="blue"
                  variant="outline"
                  onClick={() => handleModeSelect('pinyin')}
                  _hover={{
                    bg: 'blue.600',
                    borderColor: 'blue.500',
                  }}
                >
                  <VStack gap="2">
                    <HStack gap="3">
                      <Gamepad2 size={24} />
                      <Text fontSize="xl" fontWeight="bold">
                        拼音模式
                      </Text>
                    </HStack>
                    <Text fontSize="sm" color="gray.300">
                      听音频后输入拼音
                    </Text>
                  </VStack>
                </Button>

                <Button
                  size="lg"
                  width="100%"
                  height="auto"
                  py="6"
                  colorScheme="green"
                  variant="outline"
                  onClick={() => handleModeSelect('chinese')}
                  _hover={{
                    bg: 'green.600',
                    borderColor: 'green.500',
                  }}
                >
                  <VStack gap="2">
                    <HStack gap="3">
                      <Gamepad2 size={24} />
                      <Text fontSize="xl" fontWeight="bold">
                        汉字模式
                      </Text>
                    </HStack>
                    <Text fontSize="sm" color="gray.300">
                      听音频后输入汉字
                    </Text>
                  </VStack>
                </Button>
              </VStack>

              {/* 提示信息 */}
              <Box
                bg="gray.700"
                p="4"
                borderRadius="md"
                width="100%"
                textAlign="center"
              >
                <Text fontSize="sm" color="gray.300">
                  💡 选择适合你当前水平的模式开始练习
                </Text>
              </Box>
            </VStack>
          </Dialog.Body>

          <Dialog.Footer>
            <Button variant="ghost" onClick={onClose} width="100%">
              取消
            </Button>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  );
};