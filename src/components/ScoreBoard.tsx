import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Target, Zap, Share, RotateCcw } from 'lucide-react';

const ScoreBoardContainer = styled(motion.div)`
  margin: 40px 0;
  padding: 0;
  text-align: center;
  position: relative;
`;

const ResultHeader = styled(motion.div)<{ correct: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-bottom: 30px;
  font-size: 1.3rem;
  font-weight: 600;
  color: ${props => props.correct ? '#10b981' : '#ef4444'};
`;

const AnswerComparison = styled(motion.div)`
  margin: 30px 0;
  padding: 0;
`;

const AnswerRow = styled(motion.div)<{ correct?: boolean }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 12px 0;
  padding: 16px 0;
  border-bottom: 1px solid ${props => 
    props.correct === true ? 'rgba(16, 185, 129, 0.2)' : 
    props.correct === false ? 'rgba(239, 68, 68, 0.2)' : 
    'rgba(148, 163, 184, 0.3)'
  };
`;

const Label = styled.span`
  font-weight: 500;
  color: #64748b;
  font-size: 14px;
`;

const Answer = styled.span<{ correct?: boolean }>`
  font-weight: 600;
  font-size: 16px;
  color: ${props => 
    props.correct === true ? '#10b981' : 
    props.correct === false ? '#ef4444' : 
    '#1e293b'
  };
  font-family: 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'SimSun', sans-serif;
`;

const ScoreSection = styled(motion.div)`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin: 30px 0;
`;

const ScoreCard = styled(motion.div)`
  padding: 20px 16px;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 16px;
  text-align: center;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
`;

const ScoreIcon = styled.div`
  font-size: 20px;
  margin-bottom: 8px;
  color: #667eea;
`;

const ScoreLabel = styled.div`
  font-size: 12px;
  color: #64748b;
  margin-bottom: 4px;
  font-weight: 500;
`;

const ScoreValue = styled.div`
  font-size: 20px;
  font-weight: 700;
  color: #1e293b;
`;

const ButtonRow = styled(motion.div)`
  display: flex;
  gap: 16px;
  justify-content: center;
  margin-top: 32px;
`;

const ActionButton = styled(motion.button)<{ variant?: 'primary' | 'secondary' }>`
  padding: 14px 28px;
  border: none;
  border-radius: 24px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  min-width: 130px;
  justify-content: center;
  transition: all 0.3s ease;

  ${props => props.variant === 'secondary' ? `
    background: rgba(255, 255, 255, 0.9);
    color: #667eea;
    border: 1px solid rgba(102, 126, 234, 0.3);
    backdrop-filter: blur(10px);
    &:hover {
      background: rgba(255, 255, 255, 1);
      border-color: #667eea;
    }
  ` : `
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    box-shadow: 0 4px 20px rgba(102, 126, 234, 0.3);
    &:hover {
      box-shadow: 0 8px 30px rgba(102, 126, 234, 0.4);
      transform: translateY(-1px);
    }
  `}
`;

const PerfectScoreAnimation = styled(motion.div)`
  position: absolute;
  top: -20px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 3rem;
  pointer-events: none;
  z-index: 10;
`;

const CelebrationMessage = styled(motion.div)`
  margin-top: 24px;
  padding: 16px 20px;
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(6, 182, 212, 0.1) 100%);
  border: 1px solid rgba(16, 185, 129, 0.2);
  color: #0f766e;
  border-radius: 16px;
  font-weight: 600;
  font-size: 14px;
  backdrop-filter: blur(10px);
`;

interface ScoreBoardProps {
  correct: boolean;
  userAnswer: string;
  correctAnswer: string;
  score: number;
  accuracy: number;
  speed: number;
  onNextRound: () => void;
  onShare: () => void;
}

export const ScoreBoard: React.FC<ScoreBoardProps> = ({
  correct,
  userAnswer,
  correctAnswer,
  score,
  accuracy,
  speed,
  onNextRound,
  onShare,
}) => {
  const isPerfectScore = score === 100;

  const containerVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut" as const,
        staggerChildren: 0.1,
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" as const }
    }
  };

  const scoreCardVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { duration: 0.4, ease: "easeOut" as const }
    }
  };

  return (
    <ScoreBoardContainer
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {isPerfectScore && (
        <PerfectScoreAnimation
          initial={{ scale: 0, rotate: -180, opacity: 0 }}
          animate={{ 
            scale: [0, 1.3, 1], 
            rotate: [0, 360],
            opacity: 1 
          }}
          transition={{ 
            duration: 1.2, 
            ease: "easeOut" as const,
            times: [0, 0.6, 1]
          }}
        >
          🎉
        </PerfectScoreAnimation>
      )}

      <ResultHeader 
        correct={correct}
        variants={itemVariants}
      >
        {correct ? <CheckCircle size={28} /> : <XCircle size={28} />}
        {correct ? '答对了！' : '再试一次'}
      </ResultHeader>

      <AnswerComparison variants={itemVariants}>
        <AnswerRow 
          correct={correct}
          variants={itemVariants}
        >
          <Label>您的答案:</Label>
          <Answer correct={correct}>{userAnswer || '(未输入)'}</Answer>
        </AnswerRow>
        <AnswerRow variants={itemVariants}>
          <Label>正确答案:</Label>
          <Answer>{correctAnswer}</Answer>
        </AnswerRow>
      </AnswerComparison>

      <ScoreSection variants={itemVariants}>
        <ScoreCard 
          variants={scoreCardVariants}
          whileHover={{ scale: 1.05, y: -2 }}
          transition={{ duration: 0.2 }}
        >
          <ScoreIcon><Target /></ScoreIcon>
          <ScoreLabel>总分</ScoreLabel>
          <ScoreValue>{Math.round(score)}</ScoreValue>
        </ScoreCard>

        <ScoreCard 
          variants={scoreCardVariants}
          whileHover={{ scale: 1.05, y: -2 }}
          transition={{ duration: 0.2 }}
        >
          <ScoreIcon><CheckCircle /></ScoreIcon>
          <ScoreLabel>准确率</ScoreLabel>
          <ScoreValue>{Math.round(accuracy)}%</ScoreValue>
        </ScoreCard>

        <ScoreCard 
          variants={scoreCardVariants}
          whileHover={{ scale: 1.05, y: -2 }}
          transition={{ duration: 0.2 }}
        >
          <ScoreIcon><Zap /></ScoreIcon>
          <ScoreLabel>速度</ScoreLabel>
          <ScoreValue>{Math.round(speed)}</ScoreValue>
        </ScoreCard>
      </ScoreSection>

      <ButtonRow variants={itemVariants}>
        <ActionButton
          onClick={onNextRound}
          whileHover={{ scale: 1.05, y: -1 }}
          whileTap={{ scale: 0.95 }}
          transition={{ duration: 0.2 }}
        >
          <RotateCcw size={16} />
          下一题
        </ActionButton>

        {isPerfectScore && (
          <ActionButton
            variant="secondary"
            onClick={onShare}
            whileHover={{ scale: 1.05, y: -1 }}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <Share size={16} />
            分享成绩
          </ActionButton>
        )}
      </ButtonRow>

      {isPerfectScore && (
        <CelebrationMessage
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ 
            delay: 0.8, 
            duration: 0.6,
            ease: "easeOut" as const
          }}
        >
          🏆 完美表现！您已解锁分享特权！
        </CelebrationMessage>
      )}
    </ScoreBoardContainer>
  );
};