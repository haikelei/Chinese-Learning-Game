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
    pinyin?: string | string[];
    pinyinWithoutTones?: string[]; // 添加不带声调的拼音字段
    content: string;
    translation?: string;
    id?: string;
    difficultyLevel?: number;
  } | null;
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

// 工具函数：判断是否为标点符号
const isPunctuation = (char: string): boolean => {
  return /[，。！？、；：""''（）《》【】—…·～]/.test(char);
};

// 解析拼音音节
const parsePinyinSyllables = (pinyin: string | string[]): string[] => {
  if (Array.isArray(pinyin)) {
    return pinyin.filter(syllable => syllable && syllable.length > 0);
  }
  return pinyin.trim().split(/\s+/).filter(syllable => syllable.length > 0);
};

// 结合汉字和拼音，创建显示元素数组
const createDisplayElements = (content: string, pinyin: string | string[]): Array<{
  type: 'syllable' | 'punctuation';
  content: string;
  index: number;
}> => {
  const chineseChars = content.split('');
  const syllables = parsePinyinSyllables(pinyin || '');
  const elements: Array<{ type: 'syllable' | 'punctuation'; content: string; index: number }> = [];
  
  let syllableIndex = 0;
  
  chineseChars.forEach((char, charIndex) => {
    if (isPunctuation(char)) {
      // 标点符号直接添加
      elements.push({
        type: 'punctuation',
        content: char,
        index: charIndex
      });
    } else {
      // 汉字对应的拼音音节
      const syllable = syllables[syllableIndex] || '';
      elements.push({
        type: 'syllable',
        content: syllable,
        index: syllableIndex
      });
      syllableIndex++;
    }
  });
  
  return elements;
};

export const InputSystem: React.FC<InputSystemProps> = ({
  currentPhrase,
  userInput,
  onSubmit,
  disabled,
}) => {
  const [currentInput, setCurrentInput] = useState('');
  const [syllableInputs, setSyllableInputs] = useState<string[]>([]);
  const [errorSyllables, setErrorSyllables] = useState<Set<number>>(new Set());
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [currentSyllableIndex, setCurrentSyllableIndex] = useState(0); // 添加当前音节索引状态
  const hiddenInputRef = useRef<HTMLInputElement>(null);
  
  // 创建显示元素（拼音音节 + 标点符号）
  // 优先使用不带声调的拼音进行校验，使用带声调的拼音进行显示
  const displayPinyin = currentPhrase?.pinyin || '';
  const validationPinyin = currentPhrase?.pinyinWithoutTones || currentPhrase?.pinyin || '';
  
  const displayElements = currentPhrase ? createDisplayElements(currentPhrase.content, displayPinyin) : [];
  
  // 只获取拼音音节（不包括标点符号）
  const syllablesOnly = displayElements.filter(element => element.type === 'syllable');
  const syllables = syllablesOnly.map(element => element.content);
  
  // 用于校验的拼音（不带声调）
  const validationSyllables = Array.isArray(validationPinyin) 
    ? validationPinyin.filter(syllable => syllable && syllable.length > 0)
    : validationPinyin.trim().split(/\s+/).filter(syllable => syllable.length > 0);

  useEffect(() => {
    // 初始化音节输入数组 - 只在题目变化时重置
    setSyllableInputs(new Array(syllables.length).fill(''));
    setCurrentInput('');
    setCurrentSyllableIndex(0); // 重置当前音节索引
    
    // 自动聚焦到输入框，确保用户可以直接输入
    if (hiddenInputRef.current) {
      setTimeout(() => {
        hiddenInputRef.current?.focus();
      }, 100);
    }
  }, [currentPhrase?.pinyin, syllables.length]);

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
        // 输入空格后，移动到下一个音节
        setCurrentSyllableIndex(prev => Math.min(prev + 1, syllables.length - 1));
      } else {
        typewriterSound.playKeystroke();
      }
    } else if (value.length < previousValue.length) {
      // 删除字符 - 播放删除音效
      typewriterSound.playBackspace();
      // 删除字符时，可能需要回退到前一个音节
      const inputSyllables = value.split(' ');
      setCurrentSyllableIndex(Math.min(inputSyllables.length - 1, syllables.length - 1));
    }
    
    setCurrentInput(value);
    
    // 更新音节输入显示
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
        const correctSyllables = validationSyllables.map(s => s.toLowerCase());
        
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
  }, [currentInput, disabled, validationSyllables, onSubmit, showSuccessModal]);

  const handleFocus = useCallback(() => {
    // 保持焦点，确保用户可以继续输入
  }, []);

  const handleBlur = useCallback(() => {
    // 失去焦点时自动重新聚焦，确保用户始终可以输入
    setTimeout(() => {
      if (hiddenInputRef.current) {
        hiddenInputRef.current.focus();
      }
    }, 100);
  }, []);

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
          {displayElements.map((element, elementIndex) => {
            if (element.type === 'punctuation') {
              // 标点符号直接显示
              return (
                <div
                  key={`punct-${elementIndex}`}
                  style={{
                    fontSize: '1.4rem',
                    fontWeight: '500',
                    color: '#d4d4d8',
                    display: 'flex',
                    alignItems: 'flex-end',
                    justifyContent: 'center',
                    fontFamily: "'Monaco', 'Consolas', 'Liberation Mono', 'Courier New', monospace",
                    minWidth: '20px',
                    height: '1.4rem',
                    marginBottom: '8px',
                  }}
                >
                  {element.content}
                </div>
              );
            }
            
            // 拼音音节输入框 - 保持横线样式但不需要点击
            const syllableIndex = element.index;
            const width = calculateWidth(element.content);
            const isError = errorSyllables.has(syllableIndex);
            const currentSyllableInput = syllableInputs[syllableIndex] || '';
            const isActive = syllableIndex === currentSyllableIndex; // 判断当前横线是否活跃
            
            return (
              <LineContainer key={`syllable-${elementIndex}`}>
                <InputText isActive={isActive}>
                  {currentSyllableInput}
                </InputText>
                <InputLine
                  width={width}
                  isActive={isActive}
                  isError={isError}
                  animate={isError ? {
                    x: [-5, 5, -5, 5, 0],
                  } : {}}
                  transition={isError ? {
                    duration: 0.4,
                    ease: "easeInOut"
                  } : {}}
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