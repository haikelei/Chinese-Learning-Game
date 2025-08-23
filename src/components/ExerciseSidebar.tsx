import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

const SidebarContainer = styled.div`
  width: 240px;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(10px);
  border-right: 1px solid rgba(255, 255, 255, 0.08);
  padding: 16px;
  overflow-y: auto;
  height: calc(100vh - 160px); /* 减去顶部80px和底部80px的空间 */
  position: absolute;
  left: 0;
  top: 80px; /* Back按钮下方，留出足够空间 */
  z-index: 50;
  box-shadow: 2px 0 20px rgba(0, 0, 0, 0.3);
  display: none; /* 暂时隐藏侧边栏 */
`;

const SidebarHeader = styled.div`
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
`;



const SidebarSubtitle = styled.p`
  font-size: 0.75rem;
  color: #a1a1aa;
  margin: 0;
  opacity: 0.7;
`;

const ExerciseList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const ExerciseItem = styled(motion.div)<{ isCurrent: boolean; isCompleted: boolean }>`
  background: ${props => props.isCurrent 
    ? 'rgba(14, 165, 233, 0.12)' 
    : props.isCompleted 
      ? 'rgba(34, 197, 94, 0.08)' 
      : 'rgba(255, 255, 255, 0.03)'
  };
  border: 1px solid ${props => props.isCurrent 
    ? 'rgba(14, 165, 233, 0.25)' 
    : props.isCompleted 
      ? 'rgba(34, 197, 94, 0.2)' 
      : 'rgba(255, 255, 255, 0.06)'
  };
  border-radius: 8px;
  padding: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    background: ${props => props.isCurrent 
      ? 'rgba(14, 165, 233, 0.18)' 
      : props.isCompleted 
        ? 'rgba(34, 197, 94, 0.12)' 
        : 'rgba(255, 255, 255, 0.06)'
    };
  }
`;

const ExerciseHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
`;

const ExerciseTitle = styled.h3<{ isCompleted: boolean }>`
  font-size: 0.85rem;
  font-weight: 500;
  color: ${props => props.isCompleted ? '#22c55e' : '#e4e4e7'};
  margin: 0;
`;

const ExerciseStatus = styled.div<{ isCompleted: boolean }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${props => props.isCompleted ? '#22c55e' : '#71717a'};
`;

const ProgressContainer = styled.div`
  margin-bottom: 8px;
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 4px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 2px;
  overflow: hidden;
`;

const ProgressFill = styled(motion.div)<{ percentage: number; isCompleted: boolean }>`
  height: 100%;
  background: ${props => props.isCompleted 
    ? 'linear-gradient(90deg, #22c55e 0%, #16a34a 100%)' 
    : 'linear-gradient(90deg, #0ea5e9 0%, #0284c7 100%)'
  };
  width: ${props => props.percentage}%;
  transition: width 0.5s ease;
`;

const ProgressText = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 4px;
  font-size: 0.7rem;
  color: #a1a1aa;
  opacity: 0.7;
`;

const SegmentCount = styled.span`
  color: #d4d4d8;
`;

interface ExerciseListItem {
  id: string;
  title: string;
  orderIndex: number;
  progressPercentage: number;
  isCompleted: boolean;
  completedSegments: number;
  totalSegments: number;
  isCurrent: boolean;
}

interface ExerciseSidebarProps {
  exercises: ExerciseListItem[];
  currentExerciseId: string;
  onExerciseSelect: (exerciseId: string) => void;
}

export const ExerciseSidebar: React.FC<ExerciseSidebarProps> = ({
  exercises,
  currentExerciseId,
  onExerciseSelect,
}) => {
  const sortedExercises = [...exercises].sort((a, b) => a.orderIndex - b.orderIndex);
  
  const totalExercises = exercises.length;
  const completedExercises = exercises.filter(ex => ex.isCompleted).length;
  const overallProgress = totalExercises > 0 ? (completedExercises / totalExercises) * 100 : 0;

  // 添加调试信息
  console.log('📊 ExerciseSidebar 渲染数据:', {
    totalExercises,
    completedExercises,
    overallProgress,
    exercises: exercises.map(ex => ({
      id: ex.id,
      title: ex.title,
      progressPercentage: ex.progressPercentage,
      isCompleted: ex.isCompleted,
      completedSegments: ex.completedSegments,
      totalSegments: ex.totalSegments
    }))
  });

  return (
    <SidebarContainer>
      <SidebarHeader>
        <SidebarSubtitle>
          {completedExercises}/{totalExercises}
        </SidebarSubtitle>
        
        {/* 整体进度条 */}
        <ProgressContainer style={{ marginTop: '12px' }}>
          <ProgressBar>
            <ProgressFill 
              percentage={overallProgress} 
              isCompleted={overallProgress === 100}
              initial={{ width: '0%' }}
              animate={{ width: `${overallProgress}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </ProgressBar>
          <ProgressText>
            <span>{overallProgress.toFixed(1)}%</span>
          </ProgressText>
        </ProgressContainer>
      </SidebarHeader>

      <ExerciseList>
        {sortedExercises.map((exercise, index) => (
          <ExerciseItem
            key={exercise.id}
            isCurrent={exercise.isCurrent}
            isCompleted={exercise.isCompleted}
            onClick={() => onExerciseSelect(exercise.id)}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <ExerciseHeader>
              <ExerciseTitle isCompleted={exercise.isCompleted}>
                {exercise.orderIndex}
              </ExerciseTitle>
              <ExerciseStatus isCompleted={exercise.isCompleted} />
            </ExerciseHeader>
            
            <ProgressContainer>
              <ProgressBar>
                <ProgressFill 
                  percentage={exercise.progressPercentage} 
                  isCompleted={exercise.isCompleted}
                  initial={{ width: '0%' }}
                  animate={{ width: `${exercise.progressPercentage}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                />
              </ProgressBar>
              <ProgressText>
                <SegmentCount>
                  {exercise.completedSegments}/{exercise.totalSegments}
                </SegmentCount>
                <span>{exercise.progressPercentage.toFixed(0)}%</span>
              </ProgressText>
            </ProgressContainer>
          </ExerciseItem>
        ))}
      </ExerciseList>
    </SidebarContainer>
  );
};
