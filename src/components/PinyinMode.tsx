import React, { useState, useCallback, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { InputSystem } from './InputSystem';
import { AnswerDisplay } from './AnswerDisplay';
import { BottomShortcutBar } from './BottomShortcutBar';
import { ShareCard } from './ShareCard';
import { ExerciseSidebar } from './ExerciseSidebar';
import { getAllSegmentsFromCourse, fetchExerciseSegments } from '../utils/courseAPI';
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
  margin-left: 300px; /* 为左侧sidebar留出空间 */
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

// 定义新的数据结构接口
interface ExtendedExerciseSegment {
  id: string;
  content: string;
  pinyin: string[];
  pinyinWithoutTones: string[];
  translation?: string;
  audioUrl?: string;
  difficultyLevel: number;
  exerciseId: string; // 添加exercise ID引用
  exerciseIndex: number; // 添加exercise索引引用
  // 其他可能需要的字段
  segmentIndex?: number;
  practiceOrder?: number;
  segmentType?: string;
  durationSeconds?: number;
  userProgress?: any;
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
  inputMode: 'pinyin';
  // 添加其他缺失的字段
  accuracy: number;
  speed: number;
  attempts: number;
  showResult: boolean;
  startTime: number | null;
  showShareCard: boolean;
  // 添加segment相关字段
  currentExerciseId?: string; // 当前练习ID
  currentSegmentId?: string;  // 当前segment ID
  segmentStartTime?: number;  // segment开始时间
  practiceMode: 'listening' | 'speaking' | 'reading' | 'writing'; // 练习模式
}

export const PinyinMode: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // 状态管理
  const [allSegments, setAllSegments] = useState<ExtendedExerciseSegment[]>([]);
  const [exerciseList, setExerciseList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasInitialized, setHasInitialized] = useState(false);
  
  const [gameState, setGameState] = useState<GameState>({
    currentPhrase: null,
    userInput: '',
    inputMode: 'pinyin',
    score: 0,
    accuracy: 0,
    speed: 0,
    isPlaying: false,
    showResult: false,
    startTime: null,
    attempts: 0,
    correctAttempts: 0,
    showShareCard: false,
    gameStarted: false,
    showAnswer: false,
    showPinyinHint: false,
    currentIndex: 0,
    totalAttempts: 0,
    practiceMode: 'listening', // 默认为听力练习模式
  });

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const secondAudioRef = useRef<HTMLAudioElement | null>(null);

  // 计算exercise进度的函数
  const calculateExerciseProgress = useCallback((exercise: any) => {
    const segments = exercise.segments || [];
    const totalSegments = segments.length;
    const completedSegments = segments.filter((s: any) => s.userProgress?.isCompleted).length;
    const progressPercentage = totalSegments > 0 ? (completedSegments / totalSegments) * 100 : 0;
    
    // 添加调试信息
    console.log(`🔍 计算Exercise ${exercise.id} 进度:`, {
      exerciseTitle: exercise.title,
      totalSegments,
      completedSegments,
      progressPercentage,
      isCompleted: completedSegments === totalSegments,
      segments: segments.map((s: any) => ({
        id: s.id,
        isCompleted: s.userProgress?.isCompleted
      }))
    });
    
    return {
      progressPercentage,
      isCompleted: completedSegments === totalSegments,
      completedSegments,
      totalSegments
    };
  }, []);

  // 更新exercise进度的函数
  const updateExerciseProgress = useCallback((exerciseId: string, newProgress: any) => {
    setExerciseList(prev => prev.map(ex => 
      ex.id === exerciseId 
        ? { ...ex, ...newProgress }
        : ex
    ));
  }, []);

  // 更新segment状态的函数
  const updateSegmentStatus = useCallback((exerciseId: string, segmentId: string, isCompleted: boolean) => {
    setExerciseList(prev => prev.map(ex => {
      if (ex.id === exerciseId) {
        const updatedSegments = ex.segments.map((seg: any) => 
          seg.id === segmentId 
            ? { ...seg, userProgress: { ...seg.userProgress, isCompleted } }
            : seg
        );
        
        const newProgress = calculateExerciseProgress({ ...ex, segments: updatedSegments });
        return { ...ex, segments: updatedSegments, ...newProgress };
      }
      return ex;
    }));
  }, [calculateExerciseProgress]);

      // 获取练习数据（支持两种URL参数）
  useEffect(() => {
    if (hasInitialized) return;
    
    // 优先使用 courseId，如果没有则尝试使用 exercises
    const courseId = searchParams.get('courseId');
    const exercisesParam = searchParams.get('exercises');
    
    if (!courseId && !exercisesParam) {
      setError('缺少必要的参数：courseId 或 exercises');
      return;
    }
    
    setHasInitialized(true);
    setLoading(true);
    setError(null);
    
    // 清空之前的数据，避免重复
    setExerciseList([]);
    setAllSegments([]);
    
    const fetchData = async () => {
      try {
        let processedSegments: ExtendedExerciseSegment[] = [];
        
                 if (courseId) {
           // 使用统一的接口
           console.log('🔍 使用统一接口获取数据，courseId:', courseId);
           const response = await getAllSegmentsFromCourse(courseId);
           
           console.log('📋 API响应数据结构:', response);
           
           // 先收集所有的exercises和segments，然后一次性设置
           const exercisesWithProgress: any[] = [];
           
           for (const exercise of response.exercises) {
             console.log('🔍 处理exercise:', exercise);
             
             if (!exercise || !exercise.id) {
               console.error('❌ Exercise数据异常:', exercise);
               continue;
             }
             
             const segments = exercise.segments || [];
             
             const gameSegments = segments.map((segment: any) => {
               // 过滤掉拼音数组中的标点符号
               const filterPunctuation = (pinyinArray: string[]) => {
                 return pinyinArray.filter(syllable => 
                   syllable && !/[，。！？、；：""''（）《》【】—…·～]/.test(syllable)
                 );
               };
               
               return {
                 id: segment.id,
                 content: removeTrailingPunctuation(segment.content || ''),
                 pinyin: filterPunctuation(segment.pinyinWithTones || []),
                 pinyinWithoutTones: filterPunctuation(segment.pinyinWithoutTones || []),
                 translation: segment.translation,
                 audioUrl: segment.audioUrl,
                 difficultyLevel: segment.difficultyLevel,
                 exerciseId: exercise.id,
                 exerciseIndex: (exercise.orderIndex || 1) - 1,
                 segmentIndex: segment.segmentIndex,
                 practiceOrder: segment.practiceOrder,
                 segmentType: segment.segmentType,
                 durationSeconds: segment.durationSeconds,
                 userProgress: segment.userProgress,
               };
             });
             
             processedSegments.push(...gameSegments);
             console.log(`📚 Exercise ${exercise.id}: 添加了 ${gameSegments.length} 个segments`);
             
             // 计算exercise进度并添加到临时数组
             const exerciseProgress = calculateExerciseProgress(exercise);
             const exerciseWithProgress = {
               ...exercise,
               ...exerciseProgress,
               isCurrent: false // 稍后设置当前exercise
             };
             exercisesWithProgress.push(exerciseWithProgress);
           }
           
           // 一次性设置所有exercises，避免重复添加
           setExerciseList(exercisesWithProgress);
        } else if (exercisesParam) {
          // 兼容旧的接口（临时方案）
          console.log('🔍 使用兼容接口获取数据，exercises:', exercisesParam);
          const rawExercises = JSON.parse(exercisesParam);
          
          for (const exercise of rawExercises) {
            try {
              const segments = await fetchExerciseSegments(exercise.id);
              if (segments && segments.length > 0) {
                const gameSegments = segments.map((segment: any) => ({
                  ...segment,
                  content: removeTrailingPunctuation(segment.chineseText || segment.content || ''),
                  exerciseId: exercise.id,
                  exerciseIndex: exercise.orderIndex - 1,
                }));
                processedSegments.push(...gameSegments);
              }
            } catch (err) {
              console.error(`Failed to fetch segments for exercise ${exercise.id}:`, err);
            }
          }
        }
        
        setAllSegments(processedSegments);
        
        if (processedSegments.length > 0) {
          const firstSegment = processedSegments[0];
          
          // 设置当前exercise状态
          setExerciseList(prev => prev.map(ex => ({
            ...ex,
            isCurrent: ex.id === firstSegment.exerciseId
          })));
          
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
          }));
        } else {
          setError('没有找到可用的练习数据');
        }
      } catch (err) {
        console.error('Failed to fetch data:', err);
        setError('获取数据失败');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
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
    
    // 延迟一下然后自动播放语音两遍
    setTimeout(() => {
      if (gameState.currentPhrase?.audioUrl) {
        playAudioTwice(gameState.currentPhrase.audioUrl);
      }
    }, 500);
  }, [playAudioTwice, gameState.currentPhrase?.audioUrl, allSegments.length, gameState.currentExerciseId, gameState.currentSegmentId, gameState.practiceMode]);

  // 快捷键处理函数
  const handlePlayAudio = useCallback(() => {
    if (!gameState.isPlaying && gameState.currentPhrase?.audioUrl) {
      playAudioTwice(gameState.currentPhrase.audioUrl);
    }
  }, [gameState.currentPhrase?.audioUrl, gameState.isPlaying, playAudioTwice]);

  const handleMaster = useCallback(() => {
    // TODO: Implement master functionality
    console.log('Mark word as mastered');
  }, []);

  const handleNewWord = useCallback(() => {
    // TODO: Implement new word functionality
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
          content: newPhrase.content || '',
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
    // TODO: Implement submit functionality
    console.log('Shortcut submit');
  }, []);

  const handleShowAnswer = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      showAnswer: !prev.showAnswer
    }));
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
    };

    window.addEventListener('keydown', handleShortcutKeys);
    return () => window.removeEventListener('keydown', handleShortcutKeys);
  }, [gameState.gameStarted, handlePlayAudio, handleMaster, handleNewWord, handleShowAnswer]);

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
        
        // 更新segment状态和exercise进度
        updateSegmentStatus(gameState.currentExerciseId, gameState.currentSegmentId, true);
      } catch (error) {
        console.error('Failed to complete practice:', error);
        // 不影响游戏进行，只记录错误
      }
    }
    
    // 直接进入下一题，不显示分数统计
    if (allSegments.length > 0) {
      const currentIndex = allSegments.findIndex(ex => ex.id === gameState.currentPhrase?.id);
      const nextIndex = (currentIndex + 1) % allSegments.length;
      const newPhrase = allSegments[nextIndex];
      
      setGameState(prev => ({
        ...prev,
        currentPhrase: {
          content: newPhrase.content || '',
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
        showAnswer: false, // Hide answer when starting new question
        // 更新segment和exercise信息
        currentExerciseId: newPhrase.exerciseId,
        currentSegmentId: newPhrase.id,
        segmentStartTime: Date.now(),
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
            newPhrase.exerciseId, 
            newPhrase.id, 
            gameState.practiceMode
          );
          console.log('Successfully entered new segment:', newPhrase.id);
        } catch (error) {
          console.error('Failed to enter new segment:', error);
        }
      }
    }
  }, [stopAllAudio, playAudioTwice, allSegments, gameState.currentPhrase?.id, gameState.currentExerciseId, gameState.currentSegmentId, gameState.segmentStartTime, gameState.practiceMode]);

  const closeShareCard = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      showShareCard: false,
    }));
  }, []);

  // 处理exercise选择
  const handleExerciseSelect = useCallback((exerciseId: string) => {
    // 找到选中的exercise
    const selectedExercise = exerciseList.find(ex => ex.id === exerciseId);
    if (!selectedExercise) return;
    
    // 找到该exercise的第一个segment
    const firstSegment = allSegments.find(seg => seg.exerciseId === exerciseId);
    if (!firstSegment) return;
    
    // 更新当前exercise状态
    setExerciseList(prev => prev.map(ex => ({
      ...ex,
      isCurrent: ex.id === exerciseId
    })));
    
    // 更新游戏状态
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
      userInput: '',
      showResult: false,
      startTime: null,
      isPlaying: false,
      showAnswer: false,
    }));
    
    // 自动播放新题目的语音
    if (firstSegment.audioUrl) {
      setTimeout(() => {
        playAudioTwice(firstSegment.audioUrl!);
      }, 500);
    }
    
    // 记录进入新的segment
    if (firstSegment.exerciseId && firstSegment.id) {
      startPractice(firstSegment.exerciseId, firstSegment.id, gameState.practiceMode)
        .then(() => console.log('Successfully entered new segment:', firstSegment.id))
        .catch(error => console.error('Failed to enter new segment:', error));
    }
  }, [exerciseList, allSegments, playAudioTwice, gameState.practiceMode]);

  return (
    <>
      {/* 左侧Exercise列表 */}
      {exerciseList.length > 0 && (
        <ExerciseSidebar
          exercises={exerciseList}
          currentExerciseId={gameState.currentExerciseId || ''}
          onExerciseSelect={handleExerciseSelect}
        />
      )}
      
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
        拼音模式
      </ModeIndicator>
      */}

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
            Make learning Chinese fun and interactive
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

      {/* 游戏界面 */}
      {gameState.gameStarted && !loading && !error && allSegments.length > 0 && (
        <>
          <GameHint
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            Type in pinyin
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
              ease: "easeOut" as const
            }}
          >
            {/* Answer display */}
            <AnswerDisplay
              isVisible={gameState.showAnswer}
              phrase={gameState.currentPhrase ? {
                content: gameState.currentPhrase.content,
                pinyin: gameState.currentPhrase.pinyin,
                translation: gameState.currentPhrase.translation
              } : null}
            />

            <InputSystem
              currentPhrase={gameState.currentPhrase}
              userInput={gameState.userInput}
              onSubmit={checkAnswer}
              disabled={false}
            />
            
            <AnimatePresence mode="wait">
              {/* Removed ScoreBoard display for simplified game experience */}
            </AnimatePresence>
          </ContentArea>
          
          <AnimatePresence>
            {gameState.showShareCard && (
              <ShareCard
                score={gameState.score}
                accuracy={gameState.accuracy}
                speed={gameState.speed}
                phrase={gameState.currentPhrase ? {
                  id: gameState.currentPhrase.id || '',
                  content: gameState.currentPhrase.content,
                  pinyin: gameState.currentPhrase.pinyin,
                  pinyinWithoutTones: gameState.currentPhrase.pinyinWithoutTones,
                  translation: gameState.currentPhrase.translation,
                  audioUrl: gameState.currentPhrase.audioUrl,
                  difficultyLevel: gameState.currentPhrase.difficultyLevel
                } : null}
                onClose={closeShareCard}
              />
            )}
          </AnimatePresence>
          
          {/* Bottom shortcut bar */}
          <BottomShortcutBar
            onPlayAudio={handlePlayAudio}
            onMaster={handleMaster}
            onNewWord={handleNewWord}
            onSubmit={handleSubmitShortcut}
            onShowAnswer={handleShowAnswer}
            onSkip={handleSkip}
            mode="pinyin"
          />
        </>
      )}
      </GameContainer>
    </>
  );
};