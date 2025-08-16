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

const HiddenInput = styled.input`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  background: transparent;
  border: none;
  outline: none;
  font-size: 16px;
  z-index: 10;
  cursor: text;
  color: transparent;
  
  /* 确保输入法能正常工作 */
  &:focus {
    opacity: 0;
  }
`;


const CharacterBoxes = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  justify-content: center;
  align-items: center;
  margin-bottom: 30px;
  row-gap: 40px;
`;

const CharacterBox = styled(motion.div)<{ isActive: boolean; isError: boolean; hasContent: boolean }>`
  width: 80px;
  height: 80px;
  border: 3px solid ${props => props.isError ? '#f59e0b' : props.isActive ? '#0ea5e9' : '#52525b'};
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  font-weight: 500;
  color: ${props => props.hasContent ? '#e4e4e7' : 'transparent'};
  background: ${props => props.isActive ? 'rgba(14, 165, 233, 0.1)' : 'rgba(63, 63, 70, 0.3)'};
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  font-family: 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'SimSun', sans-serif;
  
  &:hover {
    transform: scale(1.05);
    border-color: ${props => props.isError ? '#f59e0b' : '#0ea5e9'};
  }
`;

const PinyinLabel = styled(motion.div)<{ isVisible: boolean }>`
  position: absolute;
  top: -35px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 0.8rem;
  color: #0ea5e9;
  background: rgba(14, 165, 233, 0.1);
  border: 1px solid rgba(14, 165, 233, 0.2);
  border-radius: 6px;
  padding: 4px 8px;
  opacity: ${props => props.isVisible ? 1 : 0};
  pointer-events: none;
  transition: opacity 0.3s ease;
  white-space: nowrap;
  font-weight: 500;
`;

const Cursor = styled(motion.div)`
  position: absolute;
  width: 2px;
  height: 40px;
  background: #0ea5e9;
  border-radius: 1px;
`;

interface ChineseInputSystemProps {
  currentPhrase: {
    pinyin: string;
    chinese: string;
  };
  onSubmit: (input: string) => void;
  disabled: boolean;
  showPinyinHint: boolean;
}

export const ChineseInputSystem: React.FC<ChineseInputSystemProps> = ({
  currentPhrase,
  onSubmit,
  disabled,
  showPinyinHint,
}) => {
  const [userInput, setUserInput] = useState('');
  const [internalInputValue, setInternalInputValue] = useState(''); // 用于input元素，保持输入法工作
  const [currentCharIndex, setCurrentCharIndex] = useState(0);
  const [errorChars, setErrorChars] = useState<Set<number>>(new Set());
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isComposing, setIsComposing] = useState(false); // 处理输入法状态
  const hiddenInputRef = useRef<HTMLInputElement>(null);

  const chineseChars = currentPhrase.chinese.split('');
  const pinyinSyllables = currentPhrase.pinyin.split(' ');

  useEffect(() => {
    // 重置状态当题目变化时
    setUserInput('');
    setInternalInputValue('');
    setCurrentCharIndex(0);
    setErrorChars(new Set());
    
    if (hiddenInputRef.current) {
      hiddenInputRef.current.focus();
    }
  }, [currentPhrase.chinese]);

  // 监听全局键盘事件，处理弹窗状态下的回车键
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && showSuccessModal && !disabled) {
        e.preventDefault();
        setShowSuccessModal(false);
        onSubmit(userInput.trim());
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [showSuccessModal, disabled, userInput, onSubmit]);

  // 处理输入法开始事件
  const handleCompositionStart = useCallback(() => {
    setIsComposing(true);
  }, []);

  // 处理输入法结束事件
  const handleCompositionEnd = useCallback((e: React.CompositionEvent<HTMLInputElement>) => {
    setIsComposing(false);
    const value = e.currentTarget.value;
    
    // 同时更新两个状态：内部输入值和显示值
    setInternalInputValue(value);
    setUserInput(value);
    setCurrentCharIndex(Math.min(value.length, chineseChars.length - 1));
  }, [chineseChars.length]);

  // 处理普通输入变化
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    // 始终更新内部输入值（保持输入法工作）
    setInternalInputValue(value);
    
    // 如果不在输入法输入过程中，更新显示值
    if (!isComposing) {
      const previousValue = userInput;
      
      // 检测是否有新字符输入或删除
      if (value.length > previousValue.length) {
        typewriterSound.playKeystroke();
      } else if (value.length < previousValue.length) {
        typewriterSound.playBackspace();
      }
      
      setUserInput(value);
      setCurrentCharIndex(Math.min(value.length, chineseChars.length - 1));
    }
  }, [isComposing, userInput, chineseChars.length]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !disabled && !isComposing) {
      if (showSuccessModal) {
        // Success modal is showing, press enter to continue
        setShowSuccessModal(false);
        onSubmit(userInput.trim());
        return;
      }

      if (userInput.trim()) {
        typewriterSound.playEnter();
        
        const isCorrect = userInput.trim() === currentPhrase.chinese;
        
        if (isCorrect) {
          typewriterSound.playSuccess();
          setShowSuccessModal(true);
          setErrorChars(new Set());
        } else {
          typewriterSound.playError();
          
          const errorIndices = new Set<number>();
          const userChars = userInput.split('');
          
          userChars.forEach((char, index) => {
            if (index >= chineseChars.length || char !== chineseChars[index]) {
              errorIndices.add(index);
            }
          });
          
          // 标记所有缺失的字符为错误
          for (let i = userChars.length; i < chineseChars.length; i++) {
            errorIndices.add(i);
          }
          
          setErrorChars(errorIndices);
          
          setTimeout(() => {
            setErrorChars(new Set());
          }, 2000);
        }
      }
    }
  }, [userInput, currentPhrase.chinese, chineseChars, showSuccessModal, disabled, isComposing, onSubmit]);

  const handleBoxClick = useCallback((index: number) => {
    if (!disabled) {
      setCurrentCharIndex(index);
      if (hiddenInputRef.current) {
        hiddenInputRef.current.focus();
      }
    }
  }, [disabled]);

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
          value={internalInputValue}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          onCompositionStart={handleCompositionStart}
          onCompositionEnd={handleCompositionEnd}
          disabled={disabled}
          autoComplete="off"
          inputMode="text"
          lang="zh-CN"
        />

        <CharacterBoxes>
          {chineseChars.map((char, index) => {
            const isActive = index === currentCharIndex;
            const isError = errorChars.has(index);
            const hasContent = index < userInput.length;
            const userChar = userInput[index] || '';
            const pinyinForChar = pinyinSyllables[index] || '';

            return (
              <CharacterBox
                key={index}
                isActive={isActive}
                isError={isError}
                hasContent={hasContent}
                onClick={() => handleBoxClick(index)}
                whileHover={{ scale: 1.05 }}
                animate={isError ? {
                  x: [-5, 5, -5, 5, 0],
                } : {}}
                transition={isError ? {
                  duration: 0.4,
                  ease: "easeInOut"
                } : {}}
              >
                {/* 每个字符框上方的拼音提示 */}
                <PinyinLabel isVisible={showPinyinHint && !!pinyinForChar}>
                  {pinyinForChar}
                </PinyinLabel>
                
                {userChar}
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
              </CharacterBox>
            );
          })}
        </CharacterBoxes>
      </InputContainer>

      {/* Success Dialog */}
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
                🎉 Perfect!
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