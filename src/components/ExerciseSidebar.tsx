import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

const SidebarContainer = styled.div`
  width: 300px;
  background: rgba(255, 255, 255, 0.05);
  border-right: 1px solid rgba(255, 255, 255, 0.1);
  padding: 20px;
  overflow-y: auto;
  height: 100vh;
  position: fixed;
  left: 0;
  top: 0;
`;

const SidebarHeader = styled.div`
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`;

const SidebarTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  color: #e4e4e7;
  margin: 0 0 8px 0;
`;

const SidebarSubtitle = styled.p`
  font-size: 0.9rem;
  color: #a1a1aa;
  margin: 0;
`;

const ExerciseList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const ExerciseItem = styled(motion.div)<{ isCurrent: boolean; isCompleted: boolean }>`
  background: ${props => props.isCurrent 
    ? 'rgba(14, 165, 233, 0.15)' 
    : props.isCompleted 
      ? 'rgba(34, 197, 94, 0.1)' 
      : 'rgba(255, 255, 255, 0.05)'
  };
  border: 1px solid ${props => props.isCurrent 
    ? 'rgba(14, 165, 233, 0.3)' 
    : props.isCompleted 
      ? 'rgba(34, 197, 94, 0.3)' 
      : 'rgba(255, 255, 255, 0.1)'
  };
  border-radius: 12px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  }
`;

const ExerciseHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
`;

const ExerciseTitle = styled.h3<{ isCompleted: boolean }>`
  font-size: 1rem;
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
  margin-bottom: 12px;
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 6px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
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
  margin-top: 8px;
  font-size: 0.8rem;
  color: #a1a1aa;
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

  return (
    <SidebarContainer>
      <SidebarHeader>
        <SidebarTitle>练习进度</SidebarTitle>
        <SidebarSubtitle>
          已完成 {completedExercises}/{totalExercises} 个练习
        </SidebarSubtitle>
        
        {/* 整体进度条 */}
        <ProgressContainer style={{ marginTop: '16px' }}>
          <ProgressBar>
            <ProgressFill 
              percentage={overallProgress} 
              isCompleted={overallProgress === 100}
              initial={{ width: 0 }}
              animate={{ width: overallProgress }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </ProgressBar>
          <ProgressText>
            <span>整体进度</span>
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
                练习 {exercise.orderIndex}
              </ExerciseTitle>
              <ExerciseStatus isCompleted={exercise.isCompleted} />
            </ExerciseHeader>
            
            <ProgressContainer>
              <ProgressBar>
                <ProgressFill 
                  percentage={exercise.progressPercentage} 
                  isCompleted={exercise.isCompleted}
                  initial={{ width: 0 }}
                  animate={{ width: exercise.progressPercentage }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                />
              </ProgressBar>
              <ProgressText>
                <SegmentCount>
                  {exercise.completedSegments}/{exercise.totalSegments} 片段
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
