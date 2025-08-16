import React, { useState, useCallback, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import {
  DialogContent,
  DialogHeader,
  DialogBody,
  DialogBackdrop,
  DialogPositioner,
  Text,
  DialogRoot,
  Portal
} from '@chakra-ui/react';
import { typewriterSound } from '../utils/typewriterSound';

const InputContainer = styled.div`
  margin: 80px 0 40px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  max-width: 600px;
  position: relative;
`;

const TypewriterLines = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  justify-content: center;
  align-items: flex-end;
  margin-bottom: 30px;
  row-gap: 50px;
`;

const LineContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
`;

const InputLine = styled(motion.div)<{ width: number; isActive: boolean; isError: boolean }>`
  width: ${props => props.width}px;
  height: 3px;
  background: ${props => props.isError ? '#f59e0b' : props.isActive ? '#0ea5e9' : '#52525b'};
  border-radius: 2px;
  transition: all 0.3s ease;
  position: relative;
`;

const InputText = styled(motion.div)<{ isActive: boolean }>`
  position: absolute;
  bottom: 8px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 1.4rem;
  font-weight: 500;
  color: ${props => props.isActive ? '#0ea5e9' : '#d4d4d8'};
  min-height: 1.4rem;
  display: flex;
  align-items: center;
  font-family: 'Monaco', 'Consolas', 'Liberation Mono', 'Courier New', monospace;
`;

const Cursor = styled(motion.div)`
  width: 2px;
  height: 1.4rem;
  background: #0ea5e9;
  margin-left: 2px;
  border-radius: 1px;
`;

const HiddenInput = styled.input`
  position: absolute;
  left: -9999px;
  opacity: 0;
`;

interface InputSystemProps {
  currentPhrase: {
    pinyin: string;
    chinese: string;
  };
  userInput: string;
  onSubmit: (input: string) => void;
  disabled: boolean;
}

// 计算拼音音节的显示宽度
const calculateWidth = (syllable: string): number => {
  const baseWidth = 16; // 每个字符的基础宽度
  const minWidth = 50;  // 最小宽度
  const maxWidth = 120; // 最大宽度
  
  const width = Math.max(minWidth, Math.min(maxWidth, syllable.length * baseWidth + 30));
  return width;
};

// 解析拼音音节
const parsePinyinSyllables = (pinyin: string): string[] => {
  return pinyin.trim().split(/\s+/).filter(syllable => syllable.length > 0);
};

export const InputSystem: React.FC<InputSystemProps> = ({
  currentPhrase,
  userInput,
  onSubmit,
  disabled,
}) => {
  const [currentInput, setCurrentInput] = useState('');
  const [currentSyllableIndex, setCurrentSyllableIndex] = useState(0);
  const [syllableInputs, setSyllableInputs] = useState<string[]>([]);
  const [isFocused, setIsFocused] = useState(false);
  const [errorSyllables, setErrorSyllables] = useState<Set<number>>(new Set());
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const hiddenInputRef = useRef<HTMLInputElement>(null);
  
  const syllables = parsePinyinSyllables(currentPhrase.pinyin);

  useEffect(() => {
    // 初始化音节输入数组 - 只在题目变化时重置
    setSyllableInputs(new Array(syllables.length).fill(''));
    setCurrentSyllableIndex(0);
    setCurrentInput('');
    
    // 自动聚焦到输入框
    if (hiddenInputRef.current) {
      setTimeout(() => {
        hiddenInputRef.current?.focus();
        setIsFocused(true);
      }, 100);
    }
  }, [currentPhrase.pinyin, syllables.length]);

  // 监听全局键盘事件，处理弹窗状态下的回车键
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && showSuccessModal && !disabled) {
        e.preventDefault();
        setShowSuccessModal(false);
        onSubmit(currentInput.trim());
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [showSuccessModal, disabled, currentInput, onSubmit]);

  useEffect(() => {
    if (userInput) {
      setCurrentInput(userInput);
    }
  }, [userInput]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const previousValue = currentInput;
    
    // 检测是否有新字符输入或删除
    if (value.length > previousValue.length) {
      // 输入新字符
      const newChar = value[value.length - 1];
      if (newChar === ' ') {
        typewriterSound.playSpacebar();
      } else {
        typewriterSound.playKeystroke();
      }
    } else if (value.length < previousValue.length) {
      // 删除字符 - 播放删除音效
      typewriterSound.playBackspace();
    }
    
    setCurrentInput(value);
    
    // 只有当用户输入空格时才分割音节
    const inputSyllables = value.split(' ');
    const newSyllableInputs = [...syllableInputs];
    
    // 更新音节输入 - 只分配已经用空格分开的音节
    inputSyllables.forEach((syllable, index) => {
      if (index < newSyllableInputs.length) {
        newSyllableInputs[index] = syllable;
      }
    });
    
    // 如果输入的音节数少于总音节数，清空后面的音节
    for (let i = inputSyllables.length; i < newSyllableInputs.length; i++) {
      newSyllableInputs[i] = '';
    }
    
    setSyllableInputs(newSyllableInputs);
    
    // 当前活跃的横线是最后一个有输入的音节，或者第一个空的音节
    const lastFilledIndex = inputSyllables.length - 1;
    setCurrentSyllableIndex(Math.max(0, Math.min(lastFilledIndex, syllables.length - 1)));
  }, [currentInput, syllableInputs, syllables.length]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !disabled) {
      if (showSuccessModal) {
        // Success modal is showing, press enter to continue
        setShowSuccessModal(false);
        onSubmit(currentInput.trim());
        return;
      }
      
      if (currentInput.trim()) {
        // 先播放回车音效
        typewriterSound.playEnter();
        
        // 验证输入
        const userSyllables = currentInput.trim().toLowerCase().split(' ');
        const correctSyllables = syllables.map(s => s.toLowerCase());
        
        // 检查是否完全正确
        const isCorrect = userSyllables.length === correctSyllables.length && 
                         userSyllables.every((syllable, index) => syllable === correctSyllables[index]);
        
        if (isCorrect) {
          // 正确 - 播放成功音效并显示弹窗
          typewriterSound.playSuccess();
          setShowSuccessModal(true);
          setErrorSyllables(new Set());
        } else {
          // 错误 - 播放错误音效并标记错误音节
          typewriterSound.playError();
          
          const errorIndices = new Set<number>();
          userSyllables.forEach((syllable, index) => {
            if (index >= correctSyllables.length || syllable !== correctSyllables[index]) {
              errorIndices.add(index);
            }
          });
          
          // 如果用户输入不足，标记所有缺失的音节为错误
          for (let i = userSyllables.length; i < correctSyllables.length; i++) {
            errorIndices.add(i);
          }
          
          setErrorSyllables(errorIndices);
          
          // 2秒后清除错误状态
          setTimeout(() => {
            setErrorSyllables(new Set());
          }, 2000);
        }
      }
    }
  }, [currentInput, disabled, syllables, onSubmit, showSuccessModal]);

  const handleLineClick = useCallback((index: number) => {
    if (!disabled && hiddenInputRef.current) {
      setCurrentSyllableIndex(index);
      hiddenInputRef.current.focus();
      setIsFocused(true);
    }
  }, [disabled]);

  const handleFocus = useCallback(() => {
    setIsFocused(true);
  }, []);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
  }, []);

  const cursorVariants = {
    blink: {
      opacity: [1, 0, 1],
    }
  };

  return (
    <>
      <InputContainer>
        <HiddenInput
          ref={hiddenInputRef}
          value={currentInput}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          onFocus={handleFocus}
          onBlur={handleBlur}
          disabled={disabled}
          autoComplete="off"
        />
        
        <TypewriterLines>
          {syllables.map((syllable, index) => {
            const width = calculateWidth(syllable);
            const isActive = index === currentSyllableIndex && isFocused;
            const isError = errorSyllables.has(index);
            const currentSyllableInput = syllableInputs[index] || '';
            
            return (
              <LineContainer key={index} onClick={() => handleLineClick(index)}>
                <InputText isActive={isActive}>
                  {currentSyllableInput}
                  {isActive && !disabled && (
                    <Cursor
                      variants={cursorVariants}
                      animate="blink"
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    />
                  )}
                </InputText>
                <InputLine
                  width={width}
                  isActive={isActive}
                  isError={isError}
                  whileHover={{ scale: 1.02 }}
                  animate={isError ? {
                    x: [-5, 5, -5, 5, 0],
                  } : {}}
                  transition={isError ? {
                    duration: 0.4,
                    ease: "easeInOut"
                  } : {}}
                  style={{ cursor: disabled ? 'default' : 'pointer' }}
                />
              </LineContainer>
            );
          })}
        </TypewriterLines>
      </InputContainer>

      {/* Chakra UI Success Dialog */}
      <DialogRoot open={showSuccessModal} onOpenChange={(e: { open: boolean }) => setShowSuccessModal(e.open)} placement="center">
        <Portal>
          <DialogBackdrop />
          <DialogPositioner>
            <DialogContent
              bg="linear-gradient(135deg, #10b981 0%, #059669 100%)"
              color="white"
              borderRadius="20px"
              boxShadow="0 20px 40px rgba(16, 185, 129, 0.3)"
              maxW="460px"
              display="flex"
              flexDirection="column"
              alignItems="center"
              justifyContent="center"
              marginBottom="300px"
              px={8}
              py={8}
              gap={2}
            >
              <DialogHeader textAlign="center" fontSize="2xl" fontWeight="600" pb={0}>
                🎉 Excellent!
              </DialogHeader>
              <DialogBody textAlign="center" pb={0}>
                <Text fontSize="lg" opacity={0.9}>
                  Press Enter for next question
                </Text>
              </DialogBody>
            </DialogContent>
          </DialogPositioner>
        </Portal>
      </DialogRoot>
    </>
  );
};