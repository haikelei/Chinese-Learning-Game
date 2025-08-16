import React, { useEffect } from 'react';
import { Tooltip } from '@chakra-ui/react';
import styled from 'styled-components';
import { motion } from 'framer-motion';


const BarContainer = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  background: rgba(39, 39, 42, 0.95);
  backdrop-filter: blur(10px);
  border-top: 1px solid rgba(82, 82, 91, 0.3);
  padding: 16px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 100;
`;

const ShortcutsContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 24px;
  flex: 1;
`;

const ShortcutButton = styled(motion.button)`
  background: linear-gradient(135deg, #3f3f46 0%, #52525b 100%);
  border: 1px solid #52525b;
  border-radius: 12px;
  padding: 12px 18px;
  font-size: 0.9rem;
  font-weight: 500;
  color: #d4d4d8;
  cursor: pointer;
  transition: all 0.3s ease;
  user-select: none;
  display: flex;
  align-items: center;
  gap: 8px;
  
  &:hover {
    background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%);
    color: white;
    border-color: #0ea5e9;
    box-shadow: 0 4px 12px rgba(14, 165, 233, 0.3);
  }
  
  &:active {
    transform: translateY(1px);
  }
`;

const SkipButton = styled(motion.button)`
  position: absolute;
  right: 120px;
  bottom: 16px;
  background: linear-gradient(135deg, #3f3f46 0%, #52525b 100%);
  border: 1px solid #52525b;
  border-radius: 50%;
  width: 48px;
  height: 48px;
  font-size: 1.2rem;
  color: #d4d4d8;
  cursor: pointer;
  transition: all 0.3s ease;
  user-select: none;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 101;
  
  &:hover {
    background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%);
    color: white;
    border-color: #0ea5e9;
    box-shadow: 0 4px 12px rgba(14, 165, 233, 0.3);
    cursor: pointer;
  }
  
  &:active {
    transform: translateY(1px);
  }
`;

const KeyboardKey = styled.span`
  font-family: 'Monaco', 'Consolas', 'Liberation Mono', 'Courier New', monospace;
  font-size: 0.8rem;
  font-weight: 600;
  opacity: 0.8;
`;

interface BottomShortcutBarProps {
  onPlayAudio: () => void;
  onMaster: () => void;
  onNewWord: () => void;
  onSubmit: () => void;
  onShowAnswer: () => void;
  onSkip: () => void;
  mode?: 'pinyin' | 'chinese';
  onTogglePinyinHint?: () => void;
}

export const BottomShortcutBar: React.FC<BottomShortcutBarProps> = ({
  onPlayAudio,
  onMaster,
  onNewWord,
  onSubmit,
  onShowAnswer,
  onSkip,
  mode = 'pinyin',
  onTogglePinyinHint,
}) => {
  const shortcuts = [
    {
      key: "Ctrl+'",
      action: 'Play Audio',
      onClick: onPlayAudio,
    },
    {
      key: 'Enter',
      action: 'Submit',
      onClick: onSubmit,
    },
    {
      key: 'Ctrl+S',
      action: 'Show Answer',
      onClick: onShowAnswer,
    },
    // 只在汉字模式显示拼音提示快捷键
    ...(mode === 'chinese' && onTogglePinyinHint ? [{
      key: 'Ctrl+P',
      action: 'Pinyin Hint',
      onClick: onTogglePinyinHint,
    }] : []),
  ];

  // Shift + → 触发下一题
  useEffect(() => {
    const handleKeydown = (event: KeyboardEvent) => {
      if (event.shiftKey && event.key === 'ArrowRight') {
        event.preventDefault();
        onSkip();
      }
    };
    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  }, [onSkip]);

  return (
    <BarContainer>
      <ShortcutsContainer>
        {shortcuts.map((shortcut, index) => (
          <ShortcutButton
            key={index}
            onClick={shortcut.onClick}
            whileHover={{ scale: 1.02, y: -1 }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.4 }}
          >
            <KeyboardKey>{shortcut.key}</KeyboardKey>
            <span>{shortcut.action}</span>
          </ShortcutButton>
        ))}
      </ShortcutsContainer>
      <Tooltip.Root openDelay={150} closeDelay={50} positioning={{ placement: 'top' }}>
        <Tooltip.Trigger>
          <SkipButton
            onClick={onSkip}
            whileHover={{ scale: 1.05, y: -1 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: shortcuts.length * 0.1, duration: 0.4 }}
            aria-label="Skip to next question"
          >
            →
          </SkipButton>
        </Tooltip.Trigger>
        <Tooltip.Positioner>
          <Tooltip.Content>
            Shift + →
            <Tooltip.Arrow />
          </Tooltip.Content>
        </Tooltip.Positioner>
      </Tooltip.Root>
    </BarContainer>
  );
};