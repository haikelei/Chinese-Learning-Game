import React, { useState, useCallback, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ChineseInputSystem } from './ChineseInputSystem';
import { BottomShortcutBar } from './BottomShortcutBar';
import { AnswerDisplay } from './AnswerDisplay';
import { gameAnalytics } from '../utils/analytics';
import { getAllSegmentsFromCourse, ExerciseSegment } from '../utils/courseAPI';
import { removeTrailingPunctuation } from '../utils/textProcessing';
import { startPractice, completePractice } from '../utils/segmentAPI';

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
`;

const KeyHint = styled(motion.div)`
  font-size: 1rem;
  color: #71717a;
  padding: 12px 24px;
  background: rgba(113, 113, 122, 0.1);
  border-radius: 8px;
  border: 1px solid rgba(113, 113, 122, 0.2);
`;

const PinyinToggle = styled(motion.button)`
  position: absolute;
  top: 30px;
  right: 30px;
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
  
  &.active {
    background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%);
    color: white;
    border-color: #0ea5e9;
  }
`;

// 新增：练习进度接口
export interface ExerciseProgress {
  exercise: {
    id: string;
    title?: string; // 改为可选，因为Exercise接口可能没有title字段
    content: string;
    exerciseType?: string; // 改为可选
    difficultyLevel: number;
    orderIndex: number;
  };
  segments: ExerciseSegment[];
  userProgress: {
    isCompleted: boolean;
    completedSegments: number;
    totalSegments: number;
    progressPercentage: number;
  };
}

// 新增：课程完整数据接口
export interface CourseCompleteData {
  course: {
    id: string;
    title: string;
    description?: string;
    orderIndex: number;
  };
  exercises: ExerciseProgress[];
}

// 扩展ExerciseSegment接口，添加exercise相关信息
interface ExtendedExerciseSegment extends ExerciseSegment {
  exerciseId: string; // 添加exercise ID引用
  exerciseIndex: number; // 添加exercise索引引用
}

export interface GameState {
  currentPhrase: {
    content: string;
    pinyin?: string | string[];
    pinyinWithoutTones?: string[]; // 添加不带声调的拼音字段
    translation?: string;
    id?: string;
    difficultyLevel?: number;
    audioUrl?: string; // 添加音频URL字段
  } | null;
  userInput: string;
  isPlaying: boolean;
  showAnswer: boolean;
  showPinyinHint: boolean;
  gameStarted: boolean;
  currentIndex: number;
  score: number;
  totalAttempts: number;
  correctAttempts: number;
  inputMode: 'chinese';
  // 添加segment相关字段
  currentExerciseId?: string; // 当前练习ID
  currentSegmentId?: string;  // 当前segment ID
  segmentStartTime?: number;  // segment开始时间
  practiceMode: 'listening' | 'speaking' | 'reading' | 'writing'; // 练习模式
  // 新增：exercise相关字段
  currentExerciseIndex?: number; // 当前exercise索引
  
  // 新增：课程完成相关字段
  showCourseCompletion?: boolean; // 是否显示课程完成提示
  courseCompleted?: boolean; // 课程是否已完成
}

export const ChineseMode: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // 状态管理
  const [allSegments, setAllSegments] = useState<ExtendedExerciseSegment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasInitialized, setHasInitialized] = useState(false);
  
  const [gameState, setGameState] = useState<GameState>({
    currentPhrase: null,
    userInput: '',
    isPlaying: false,
    showAnswer: false,
    showPinyinHint: false,
    gameStarted: false,
    currentIndex: 0,
    score: 0,
    totalAttempts: 0,
    correctAttempts: 0,
    inputMode: 'chinese',
    practiceMode: 'listening', // 默认为听力练习模式
    currentExerciseIndex: 0, // 当前exercise索引
  });

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const secondAudioRef = useRef<HTMLAudioElement | null>(null);

  // 获取练习数据（使用统一的接口获取所有数据）
  useEffect(() => {
    // 只在组件初始化时获取一次数据，避免无限循环
    if (hasInitialized) return;
    
    const courseId = searchParams.get('courseId');
    if (!courseId) return;
    
    setHasInitialized(true);
    setLoading(true);
    setError(null);
    
    const fetchCourseData = async () => {
      try {
        // 使用统一的接口获取所有数据，避免多个segments请求
        const response = await getAllSegmentsFromCourse(courseId);
        
        // 处理所有segments，去掉句末标点
        const processedSegments: ExtendedExerciseSegment[] = [];
        
        for (const exercise of response.exercises) {
          const segments = exercise.segments;
          
          // 将片段数据转换为游戏需要的格式
          const gameSegments = segments.map((segment: any) => {
            // 去掉句末标点
            const cleanContent = removeTrailingPunctuation(segment.content || '');
            
            // 过滤掉拼音数组中的标点符号
            const filterPunctuation = (pinyinArray: string[]) => {
              return pinyinArray.filter(syllable => 
                syllable && !/[，。！？、；：""''（）《》【】—…·～]/.test(syllable)
              );
            };
            
            // 获取拼音数组，确保长度与清理后的文本匹配
            let cleanPinyin = filterPunctuation(segment.pinyinWithTones || []);
            let cleanPinyinWithoutTones = filterPunctuation(segment.pinyinWithoutTones || []);
            
            // 如果拼音数组长度与清理后文本不匹配，进行调整
            if (cleanPinyin.length > cleanContent.length) {
              cleanPinyin = cleanPinyin.slice(0, cleanContent.length);
              cleanPinyinWithoutTones = cleanPinyinWithoutTones.slice(0, cleanContent.length);
            }
            
            return {
              ...segment, // 保留原始segment的所有字段
              content: cleanContent, // 使用去掉句末标点的内容
              pinyin: cleanPinyin, // 调整后的带声调拼音
              pinyinWithoutTones: cleanPinyinWithoutTones, // 调整后的不带声调拼音
              exerciseId: exercise.id, // 使用正确的exercise ID
              exerciseIndex: exercise.orderIndex - 1, // 使用orderIndex作为exercise索引
            };
          });
          
          processedSegments.push(...gameSegments);
          
          // 调试信息：显示每个exercise的segments
          console.log(`📚 Exercise ${exercise.id} (orderIndex ${exercise.orderIndex}): 添加了 ${gameSegments.length} 个segments`);
          gameSegments.forEach((seg: any) => {
            console.log(`   - Segment ${seg.id}: exerciseId=${seg.exerciseId}, exerciseIndex=${seg.exerciseIndex}`);
          });
        }
        
        setAllSegments(processedSegments);
        
        // 设置第一个片段为当前短语
        if (processedSegments.length > 0) {
          const firstSegment = processedSegments[0];
          setGameState(prev => ({
            ...prev,
            currentPhrase: {
              content: firstSegment.content || '',
              pinyin: firstSegment.pinyin,
              pinyinWithoutTones: firstSegment.pinyinWithoutTones,
              translation: firstSegment.translation || '',
              id: firstSegment.id,
              difficultyLevel: firstSegment.difficultyLevel,
              audioUrl: firstSegment.audioUrl || '',
            },
            currentExerciseId: firstSegment.exerciseId,
            currentSegmentId: firstSegment.id,
            segmentStartTime: Date.now(),
            currentExerciseIndex: firstSegment.exerciseIndex,
          }));
        }
      } catch (err) {
        console.error('Failed to fetch course data:', err);
        setError('获取课程数据失败');
      } finally {
        setLoading(false);
      }
    };
    
    fetchCourseData();
  }, [searchParams, hasInitialized]);

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

  const startGame = useCallback(async () => {
    // 确保有练习数据才能开始游戏
    if (allSegments.length === 0) {
      console.warn('No exercises available to start game');
      return;
    }
    
    setGameState(prev => ({
      ...prev,
      gameStarted: true,
    }));
    
    // 追踪游戏开始
    gameAnalytics.gameStart('chinese');
    
    // 记录进入segment
    if (gameState.currentExerciseId && gameState.currentSegmentId) {
      try {
        await startPractice(
          gameState.currentExerciseId, 
          gameState.currentSegmentId, 
          gameState.practiceMode
        );
        console.log('Successfully started practice:', gameState.currentSegmentId);
      } catch (error) {
        console.error('Failed to start practice:', error);
        // 不影响游戏进行，只记录错误
      }
    }
  }, [allSegments.length, gameState.currentExerciseId, gameState.currentSegmentId, gameState.practiceMode]);

  // 快捷键处理函数
  const handlePlayAudio = useCallback(() => {
    if (!gameState.isPlaying && gameState.currentPhrase?.audioUrl) {
      playAudioTwice(gameState.currentPhrase.audioUrl);
    }
  }, [gameState.currentPhrase, gameState.isPlaying, playAudioTwice]);

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
    if (allSegments.length > 0) {
      const currentIndex = allSegments.findIndex(ex => ex.id === gameState.currentPhrase?.id);
      const nextIndex = (currentIndex + 1) % allSegments.length;
      const newPhrase = allSegments[nextIndex];
      
      setGameState(prev => ({
        ...prev,
        currentPhrase: {
          content: newPhrase.content || newPhrase.chineseText || '',
          pinyin: newPhrase.pinyin,
          pinyinWithoutTones: newPhrase.pinyinWithoutTones,
          translation: newPhrase.translation || '',
          id: newPhrase.id,
          difficultyLevel: newPhrase.difficultyLevel,
          audioUrl: newPhrase.audioUrl || '',
        },
        userInput: '',
        showResult: false,
        startTime: null,
        isPlaying: false,
        showAnswer: false,
        // 更新segment和exercise信息
        currentExerciseId: newPhrase.exerciseId,
        currentSegmentId: newPhrase.id,
        segmentStartTime: Date.now(),
        currentExerciseIndex: newPhrase.exerciseIndex,
      }));
      
      // 自动播放新题目的语音两遍
      if (newPhrase.audioUrl) {
        setTimeout(() => {
          playAudioTwice(newPhrase.audioUrl!);
        }, 500);
      }
    }
  }, [stopAllAudio, playAudioTwice, allSegments, gameState.currentPhrase?.id]);

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
      if (!gameState.gameStarted && allSegments.length > 0 && (e.code === 'Space' || e.code === 'Enter')) {
        e.preventDefault();
        startGame();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameState.gameStarted, startGame, allSegments.length]);

  // 监听游戏内的快捷键和ESC键
  useEffect(() => {
    const handleShortcutKeys = (e: KeyboardEvent) => {
      // ESC键 - 返回课程包页面
      if (e.code === 'Escape') {
        e.preventDefault();
        navigate(-1);
        return;
      }

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
  }, [gameState.gameStarted, handlePlayAudio, handleMaster, handleNewWord, handleShowAnswer, togglePinyinHint, navigate]);

  // 页面离开时清理音频
  useEffect(() => {
    return () => {
      // 组件卸载时停止所有音频
      stopAllAudio();
    };
  }, [stopAllAudio]);

  const checkAnswer = useCallback(async () => {
    // 停止当前播放的音频
    stopAllAudio();
    
    // 记录完成segment
    if (gameState.currentExerciseId && gameState.currentSegmentId && gameState.segmentStartTime) {
      try {
        const timeSpentSeconds = Math.floor((Date.now() - gameState.segmentStartTime) / 1000);
        await completePractice(
          gameState.currentExerciseId, 
          gameState.currentSegmentId, 
          gameState.practiceMode,
          timeSpentSeconds
        );
        console.log('Successfully completed practice:', gameState.currentSegmentId, 'Time spent:', timeSpentSeconds, 'seconds');
      } catch (error) {
        console.error('Failed to complete practice:', error);
        // 不影响游戏进行，只记录错误
      }
    }
    
    // 检查是否完成当前课程的所有练习
    if (allSegments.length > 0) {
      const currentIndex = allSegments.findIndex(ex => ex.id === gameState.currentPhrase?.id);
      const nextIndex = (currentIndex + 1) % allSegments.length;
      
      // 检查是否完成所有练习
      const isLastSegment = nextIndex === 0; // 如果下一个索引是0，说明已经完成所有练习
      
      if (isLastSegment) {
        // 课程完成！显示完成提示
        setGameState(prev => ({
          ...prev,
          showCourseCompletion: true,
          courseCompleted: true,
          isPlaying: false
        }));
        return; // 不继续执行，等待用户操作
      }
      
      const newPhrase = allSegments[nextIndex];
      
      setGameState(prev => ({
        ...prev,
        currentPhrase: {
          content: newPhrase.content || newPhrase.chineseText || '',
          pinyin: newPhrase.pinyin,
          pinyinWithoutTones: newPhrase.pinyinWithoutTones,
          translation: newPhrase.translation || '',
          id: newPhrase.id,
          difficultyLevel: newPhrase.difficultyLevel,
          audioUrl: newPhrase.audioUrl || '',
        },
        userInput: '',
        showResult: false,
        startTime: null,
        isPlaying: false,
        showAnswer: false,
        // 更新segment和exercise信息
        currentExerciseId: newPhrase.exerciseId,
        currentSegmentId: newPhrase.id,
        segmentStartTime: Date.now(),
        currentExerciseIndex: newPhrase.exerciseIndex,
      }));
      
      // 自动播放新题目的语音两遍
      if (newPhrase.audioUrl) {
        setTimeout(() => {
          playAudioTwice(newPhrase.audioUrl!);
        }, 500);
      }
      
      // 记录进入新的segment
      if (newPhrase.exerciseId && newPhrase.id) {
        try {
          await startPractice(
            newPhrase.exerciseId,  // ✅ 使用新的 exerciseId
            newPhrase.id,          // ✅ 使用新的 segmentId
            gameState.practiceMode
          );
          console.log('Successfully started new practice:', newPhrase.id);
        } catch (error) {
          console.error('Failed to start new practice:', error);
        }
      }
    }
  }, [stopAllAudio, playAudioTwice, allSegments, gameState.currentPhrase?.id, gameState.currentExerciseId, gameState.currentSegmentId, gameState.segmentStartTime, gameState.practiceMode]);

  return (
    <GameContainer>
      <BackButton
        onClick={() => navigate(-1)}
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

      {/* 加载状态 */}
      {loading && (
        <ContentArea
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            style={{
              textAlign: 'center',
              color: '#a1a1aa',
              fontSize: '1.1rem'
            }}
          >
            正在加载练习数据...
          </motion.div>
        </ContentArea>
      )}

      {/* 错误状态 */}
      {error && !loading && (
        <ContentArea
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            style={{
              textAlign: 'center',
              color: '#ef4444',
              fontSize: '1.1rem',
              padding: '20px',
              background: 'rgba(239, 68, 68, 0.1)',
              borderRadius: '12px',
              border: '1px solid rgba(239, 68, 68, 0.3)'
            }}
          >
            {error}
            <br />
            <button
              onClick={() => window.location.reload()}
              style={{
                marginTop: '10px',
                padding: '8px 16px',
                background: '#ef4444',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              重试
            </button>
          </motion.div>
        </ContentArea>
      )}

      {/* 游戏开始界面 */}
      {!gameState.gameStarted && !loading && !error && allSegments.length > 0 ? (
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
      ) : null}

      {/* 课程完成提示界面 */}
      {gameState.showCourseCompletion && gameState.courseCompleted && (
        <StartScreen
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <StartTitle
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            style={{ color: '#22C55E' }}
          >
            🎉 Course Completed!
          </StartTitle>
          
          <StartSubtitle
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            Congratulations! You have successfully completed all exercises in this course.
          </StartSubtitle>
          
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            onClick={() => navigate(-1)}
            style={{
              background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)',
              border: 'none',
              borderRadius: '12px',
              padding: '16px 32px',
              color: 'white',
              fontSize: '1.1rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              marginTop: '20px'
            }}
            whileHover={{ 
              scale: 1.05,
              boxShadow: '0 8px 25px rgba(59, 130, 246, 0.4)'
            }}
            whileTap={{ scale: 0.95 }}
          >
            ← Back to Course Package
          </motion.button>
        </StartScreen>
      )}

      {/* 游戏界面 */}
      {gameState.gameStarted && !loading && !error && allSegments.length > 0 && (
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
              inputMode="chinese"
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