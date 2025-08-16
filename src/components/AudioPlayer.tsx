import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

const PlayerContainer = styled.div`
  margin: 60px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const PromptText = styled(motion.div)<{ isPlaying: boolean }>`
  font-size: 1.8rem;
  color: ${props => props.isPlaying ? '#667eea' : '#333'};
  text-align: center;
  padding: 40px 20px;
  border-radius: 20px;
  transition: all 0.3s ease;
  user-select: none;
  font-weight: 500;
  line-height: 1.4;
`;

interface AudioPlayerProps {
  // No props needed for pure display mode
}

export const AudioPlayer: React.FC<AudioPlayerProps> = () => {
  const getPromptText = () => {
    return "Listen to Chinese Audio";
  };

  return (
    <PlayerContainer>
      <PromptText isPlaying={false}>
        {getPromptText()}
      </PromptText>
    </PlayerContainer>
  );
};