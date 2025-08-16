import React, { useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { gameAnalytics } from '../utils/analytics';

const HomeContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #18181b 0%, #27272a 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  position: relative;
  overflow: hidden;
`;

const BackgroundPattern = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle at 20% 50%, rgba(14, 165, 233, 0.03) 0%, transparent 50%),
              radial-gradient(circle at 80% 20%, rgba(34, 197, 94, 0.03) 0%, transparent 50%),
              radial-gradient(circle at 40% 80%, rgba(168, 85, 247, 0.02) 0%, transparent 50%);
  pointer-events: none;
`;

const ContentContainer = styled(motion.div)`
  max-width: 800px;
  width: 100%;
  text-align: center;
  z-index: 1;
  position: relative;
`;

const MainTitle = styled(motion.h1)`
  font-size: 4rem;
  font-weight: 700;
  color: #e4e4e7;
  margin-bottom: 20px;
  letter-spacing: -0.025em;
  background: linear-gradient(135deg, #e4e4e7 0%, #0ea5e9 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  
  @media (max-width: 768px) {
    font-size: 2.5rem;
  }
`;

const Subtitle = styled(motion.p)`
  font-size: 1.4rem;
  color: #a1a1aa;
  margin-bottom: 60px;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
  line-height: 1.6;
  
  @media (max-width: 768px) {
    font-size: 1.1rem;
    margin-bottom: 40px;
  }
`;

const ModesContainer = styled(motion.div)`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 30px;
  max-width: 700px;
  width: 100%;
  margin-bottom: 40px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 20px;
  }
`;

const ModeCard = styled(motion.div)`
  background: linear-gradient(135deg, #3f3f46 0%, #52525b 100%);
  border: 1px solid #52525b;
  border-radius: 20px;
  padding: 40px 30px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
    border-color: #0ea5e9;
  }
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, rgba(14, 165, 233, 0.1) 0%, transparent 100%);
    opacity: 0;
    transition: opacity 0.3s ease;
  }
  
  &:hover::before {
    opacity: 1;
  }
`;

const ModeIcon = styled.div`
  font-size: 3rem;
  margin-bottom: 20px;
  position: relative;
  z-index: 1;
`;

const ModeTitle = styled.h3`
  font-size: 1.5rem;
  font-weight: 600;
  color: #e4e4e7;
  margin-bottom: 12px;
  position: relative;
  z-index: 1;
`;

const ModeDescription = styled.p`
  font-size: 1rem;
  color: #a1a1aa;
  line-height: 1.5;
  position: relative;
  z-index: 1;
`;

const FeatureGrid = styled(motion.div)`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  max-width: 600px;
  width: 100%;
  margin-top: 60px;
`;

const FeatureItem = styled(motion.div)`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: rgba(63, 63, 70, 0.3);
  border-radius: 12px;
  border: 1px solid rgba(82, 82, 91, 0.3);
`;

const FeatureIcon = styled.div`
  font-size: 1.2rem;
  color: #0ea5e9;
`;

const FeatureText = styled.span`
  font-size: 0.9rem;
  color: #d4d4d8;
`;

export const HomePage: React.FC = () => {
  const navigate = useNavigate();

  // 追踪主页访问
  useEffect(() => {
    gameAnalytics.gameStart('homepage' as any);
  }, []);

  const handleModeSelect = (mode: 'pinyin' | 'chinese') => {
    // 追踪模式选择
    gameAnalytics.modeSwitch('homepage', mode);
    navigate(`/game/${mode}`);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.8,
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 }
    }
  };

  return (
    <HomeContainer>
      <BackgroundPattern />
      
      <ContentContainer
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <MainTitle variants={itemVariants}>
          Chinese Listening Game
        </MainTitle>
        
        <Subtitle variants={itemVariants}>
          Master Chinese through interactive listening exercises. 
          Choose your learning mode and start your journey.
        </Subtitle>
        
        <ModesContainer variants={itemVariants}>
          <ModeCard
            onClick={() => handleModeSelect('pinyin')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <ModeIcon>🔤</ModeIcon>
            <ModeTitle>Pinyin Mode</ModeTitle>
            <ModeDescription>
              Listen and type the pinyin pronunciation. 
              Perfect for beginners learning Chinese sounds.
            </ModeDescription>
          </ModeCard>
          
          <ModeCard
            onClick={() => handleModeSelect('chinese')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <ModeIcon>汉</ModeIcon>
            <ModeTitle>Chinese Characters</ModeTitle>
            <ModeDescription>
              Listen and write Chinese characters. 
              Advanced practice for character recognition.
            </ModeDescription>
          </ModeCard>
        </ModesContainer>
        
        <FeatureGrid variants={itemVariants}>
          <FeatureItem variants={itemVariants}>
            <FeatureIcon>🎧</FeatureIcon>
            <FeatureText>Audio-based Learning</FeatureText>
          </FeatureItem>
          
          <FeatureItem variants={itemVariants}>
            <FeatureIcon>⚡</FeatureIcon>
            <FeatureText>Real-time Feedback</FeatureText>
          </FeatureItem>
          
          <FeatureItem variants={itemVariants}>
            <FeatureIcon>🎯</FeatureIcon>
            <FeatureText>Progressive Difficulty</FeatureText>
          </FeatureItem>
          
          <FeatureItem variants={itemVariants}>
            <FeatureIcon>🚀</FeatureIcon>
            <FeatureText>Track Progress</FeatureText>
          </FeatureItem>
        </FeatureGrid>
      </ContentContainer>
    </HomeContainer>
  );
};