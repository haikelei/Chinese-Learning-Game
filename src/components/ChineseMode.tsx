import React, { useState, useCallback, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ChineseInputSystem } from './ChineseInputSystem';
import { BottomShortcutBar } from './BottomShortcutBar';
import { AnswerDisplay } from './AnswerDisplay';
import { samplePhrases } from '../data/samplePhrases';
import { gameAnalytics, userAnalytics } from '../utils/analytics';

const GameContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #18181b 0%, #27272a 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  position: relative;
`;

const BackButton = styled(motion.button)`
  position: absolute;
  top: 30px;
  left: 30px;
  background: linear-gradient(135deg, #3f3f46 0%, #52525b 100%);
  border: 1px solid #52525b;
  border-radius: 12px;
  padding: 12px 18px;
  color: #d4d4d8;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
  
  &:hover {
    background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%);
    color: white;
    border-color: #0ea5e9;
    box-shadow: 0 4px 12px rgba(14, 165, 233, 0.3);
  }
`;


const ContentArea = styled(motion.div)`
  width: 100%;
  max-width: 800px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  position: relative;
`;

const StatusIndicator = styled(motion.div)<{ isActive: boolean }>`
  position: absolute;
  top: 30px;
  right: 30px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: ${props => props.isActive ? '#22c55e' : '#71717a'};
  box-shadow: 0 0 0 3px ${props => props.isActive ? 'rgba(34, 197, 94, 0.2)' : 'rgba(113, 113, 122, 0.2)'};
  transition: all 0.3s ease;
`;

const GameHint = styled(motion.div)`
  position: absolute;
  top: 30px;
  transform: translateX(-50%);
  font-size: 0.85rem;
  color: #a1a1aa;
  text-align: center;
  opacity: 0.8;
  z-index: 10;
`;

const StartScreen = styled(motion.div)`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  text-align: center;
  transform: translateY(-120px);
`;

const StartTitle = styled(motion.h1)`
  font-size: 3rem;
  font-weight: 600;
  color: #e4e4e7;
  margin-bottom: 20px;
  letter-spacing: -0.025em;
`;

const StartSubtitle = styled(motion.p)`
  font-size: 1.2rem;
  color: #a1a1aa;
  margin-bottom: 40px;
  max-width: 500px;
  line-height: 1.6;
`;

const KeyHint = styled(motion.div)`
  margin-top: 32px;
  font-size: 1.1rem;
  color: #d4d4d8;
  opacity: 1;
  font-weight: 500;
  background: linear-gradient(135deg, #3f3f46 0%, #52525b 100%);
  padding: 12px 24px;
  border-radius: 12px;
  border: 1px solid #52525b;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  transition: all 0.2s ease;
  margin-bottom: 160px;
  
  &:hover {
    background: linear-gradient(135deg, #52525b 0%, #71717a 100%);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
  }
`;

const PinyinToggle = styled(motion.button)`
  position: absolute;
  top: 90px;
  right: 30px;
  background: linear-gradient(135deg, #3f3f46 0%, #52525b 100%);
  border: 1px solid #52525b;
  border-radius: 12px;
  padding: 8px 16px;
  color: #d4d4d8;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
  font-size: 0.9rem;
  
  &:hover {
    background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%);
    color: white;
    border-color: #0ea5e9;
    box-shadow: 0 4px 12px rgba(14, 165, 233, 0.3);
  }
  
  &.active {
    background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%);
    color: white;
    border-color: #0ea5e9;
    box-shadow: 0 4px 12px rgba(14, 165, 233, 0.3);
  }
`;

export interface GameState {
  currentPhrase: typeof samplePhrases[0];
  userInput: string;
  score: number;
  accuracy: number;
  speed: number;
  isPlaying: boolean;
  showResult: boolean;
  startTime: number | null;
  attempts: number;
  correctAttempts: number;
  gameStarted: boolean;
  showAnswer: boolean;
  showPinyinHint: boolean;
}

export const ChineseMode: React.FC = () => {
  const navigate = useNavigate();
  const [gameState, setGameState] = useState<GameState>({
    currentPhrase: samplePhrases[Math.floor(Math.random() * samplePhrases.length)],
    userInput: '',
    score: 0,
    accuracy: 0,
    speed: 0,
    isPlaying: false,
    showResult: false,
    startTime: null,
    attempts: 0,
    correctAttempts: 0,
    gameStarted: false,
    showAnswer: false,
    showPinyinHint: false,
  });

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const secondAudioRef = useRef<HTMLAudioElement | null>(null);

  // 停止所有正在播放的音频
  const stopAllAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    if (secondAudioRef.current) {
      secondAudioRef.current.pause();
      secondAudioRef.current.currentTime = 0;
      secondAudioRef.current = null;
    }
    setGameState(prev => ({ ...prev, isPlaying: false }));
  }, []);

  const playAudioTwice = useCallback((audioUrl: string) => {
    // 先停止之前的音频
    stopAllAudio();
    
    // 创建新的音频对象并保存引用
    audioRef.current = new Audio(audioUrl);
    audioRef.current.volume = 0.7;
    
    setGameState(prev => ({ ...prev, isPlaying: true }));
    
    // 播放第一遍
    audioRef.current.play().then(() => {
      if (audioRef.current) {
        audioRef.current.onended = () => {
          // 第一遍结束，等待1秒后播放第二遍
          setTimeout(() => {
            secondAudioRef.current = new Audio(audioUrl);
            secondAudioRef.current.volume = 0.7;
            secondAudioRef.current.play();
            secondAudioRef.current.onended = () => {
              setGameState(prev => ({ ...prev, isPlaying: false }));
              secondAudioRef.current = null;
            };
          }, 1000);
          audioRef.current = null;
        };
      }
    }).catch(() => {
      // 播放失败时重置状态
      setGameState(prev => ({ ...prev, isPlaying: false }));
      audioRef.current = null;
    });
  }, [stopAllAudio]);

  const startGame = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      gameStarted: true,
    }));
    
    // 追踪游戏开始
    gameAnalytics.gameStart('chinese');
    
    // 延迟一下然后自动播放语音两遍
    setTimeout(() => {
      playAudioTwice(gameState.currentPhrase.audioUrl);
    }, 500);
  }, [playAudioTwice, gameState.currentPhrase.audioUrl]);

  // 快捷键处理函数
  const handlePlayAudio = useCallback(() => {
    if (!gameState.isPlaying) {
      playAudioTwice(gameState.currentPhrase.audioUrl);
    }
  }, [gameState.currentPhrase.audioUrl, gameState.isPlaying, playAudioTwice]);

  const handleMaster = useCallback(() => {
    console.log('Mark word as mastered');
  }, []);

  const handleNewWord = useCallback(() => {
    console.log('Mark as new word');
  }, []);

  const handleSkip = useCallback(() => {
    // 停止当前播放的音频
    stopAllAudio();
    
    // 跳过当前题目，直接进入下一题
    const newPhrase = samplePhrases[Math.floor(Math.random() * samplePhrases.length)];
    setGameState(prev => ({
      ...prev,
      currentPhrase: newPhrase,
      userInput: '',
      showResult: false,
      startTime: null,
      isPlaying: false,
      showAnswer: false,
    }));
    
    // 自动播放新题目的语音两遍
    setTimeout(() => {
      playAudioTwice(newPhrase.audioUrl);
    }, 500);
  }, [stopAllAudio, playAudioTwice]);

  const handleSubmitShortcut = useCallback(() => {
    console.log('Shortcut submit');
  }, []);

  const handleShowAnswer = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      showAnswer: !prev.showAnswer
    }));
  }, []);

  const togglePinyinHint = useCallback(() => {
    setGameState(prev => {
      const newShowHint = !prev.showPinyinHint;
      // 追踪拼音提示切换
      gameAnalytics.pinyinHintToggle(newShowHint);
      return {
        ...prev,
        showPinyinHint: newShowHint
      };
    });
  }, []);

  // 监听键盘事件来开始游戏
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!gameState.gameStarted && (e.code === 'Space' || e.code === 'Enter')) {
        e.preventDefault();
        startGame();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameState.gameStarted, startGame]);

  // 监听游戏内的快捷键
  useEffect(() => {
    const handleShortcutKeys = (e: KeyboardEvent) => {
      if (!gameState.gameStarted) return;

      // Ctrl + ' - 播放发音
      if (e.ctrlKey && e.key === "'" && !e.shiftKey && !e.altKey) {
        e.preventDefault();
        handlePlayAudio();
        return;
      }

      // Ctrl + M - 掌握
      if (e.ctrlKey && e.key === 'm' && !e.shiftKey && !e.altKey) {
        e.preventDefault();
        handleMaster();
        return;
      }

      // Ctrl + N - 生词
      if (e.ctrlKey && e.key === 'n' && !e.shiftKey && !e.altKey) {
        e.preventDefault();
        handleNewWord();
        return;
      }

      // Ctrl + S - 显示答案
      if (e.ctrlKey && e.key === 's' && !e.shiftKey && !e.altKey) {
        e.preventDefault();
        handleShowAnswer();
        return;
      }

      // Ctrl + P - 切换拼音提示
      if (e.ctrlKey && e.key === 'p' && !e.shiftKey && !e.altKey) {
        e.preventDefault();
        togglePinyinHint();
        return;
      }
    };

    window.addEventListener('keydown', handleShortcutKeys);
    return () => window.removeEventListener('keydown', handleShortcutKeys);
  }, [gameState.gameStarted, handlePlayAudio, handleMaster, handleNewWord, handleShowAnswer, togglePinyinHint]);

  const checkAnswer = useCallback(() => {
    // 停止当前播放的音频
    stopAllAudio();
    
    // 直接进入下一题，不显示分数统计
    const newPhrase = samplePhrases[Math.floor(Math.random() * samplePhrases.length)];
    setGameState(prev => ({
      ...prev,
      currentPhrase: newPhrase,
      userInput: '',
      showResult: false,
      startTime: null,
      isPlaying: false,
      showAnswer: false,
    }));
    
    // 自动播放新题目的语音两遍
    setTimeout(() => {
      playAudioTwice(newPhrase.audioUrl);
    }, 500);
  }, [stopAllAudio, playAudioTwice]);

  return (
    <GameContainer>
      <BackButton
        onClick={() => navigate('/')}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        ← Back
      </BackButton>

      {/* 隐藏模式指示器，界面更简洁
      <ModeIndicator
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3 }}
      >
        汉字模式
      </ModeIndicator>
      */}

      {gameState.gameStarted && (
        <PinyinToggle
          onClick={togglePinyinHint}
          className={gameState.showPinyinHint ? 'active' : ''}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          {gameState.showPinyinHint ? 'Hide Pinyin' : 'Show Pinyin'}
        </PinyinToggle>
      )}

      {!gameState.gameStarted ? (
        // Start screen
        <StartScreen
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <StartTitle
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            Ready to Start?
          </StartTitle>
          
          <StartSubtitle
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            Listen and write Chinese characters
          </StartSubtitle>
          
          <KeyHint
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.6 }}
          >
            Press Space or Enter to begin
          </KeyHint>
        </StartScreen>
      ) : (
        // Game screen
        <>
          <GameHint
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            You can type Chinese characters directly
          </GameHint>
          
          <StatusIndicator
            isActive={gameState.isPlaying}
            animate={{
              scale: gameState.isPlaying ? [1, 1.2, 1] : 1,
            }}
            transition={{
              duration: 1.5,
              repeat: gameState.isPlaying ? Infinity : 0,
            }}
          />
          
          <ContentArea
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              duration: 0.8, 
              ease: "easeOut"
            }}
          >
            {/* Answer display */}
            <AnswerDisplay
              isVisible={gameState.showAnswer}
              phrase={gameState.currentPhrase}
            />

            <ChineseInputSystem
              currentPhrase={gameState.currentPhrase}
              onSubmit={checkAnswer}
              disabled={false}
              showPinyinHint={gameState.showPinyinHint}
            />
            
            <AnimatePresence mode="wait">
              {/* Removed ScoreBoard display for simplified game experience */}
            </AnimatePresence>
          </ContentArea>
          
          {/* Bottom shortcut bar */}
          <BottomShortcutBar
            onPlayAudio={handlePlayAudio}
            onMaster={handleMaster}
            onNewWord={handleNewWord}
            onSubmit={handleSubmitShortcut}
            onShowAnswer={handleShowAnswer}
            onSkip={handleSkip}
            mode="chinese"
            onTogglePinyinHint={togglePinyinHint}
          />
        </>
      )}
    </GameContainer>
  );
};