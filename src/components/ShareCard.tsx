import React, { useRef, useCallback } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { X, Download, Copy, Target, Zap, CheckCircle } from 'lucide-react';
import { Phrase } from '../data/samplePhrases';

const Overlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
`;

const ShareCardContainer = styled(motion.div)`
  background: white;
  border-radius: 20px;
  padding: 30px;
  max-width: 400px;
  width: 100%;
  position: relative;
  text-align: center;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 15px;
  right: 15px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 5px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
  
  &:hover {
    background: #f0f0f0;
  }
`;

const CardContent = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 30px;
  border-radius: 15px;
  margin: 20px 0;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E") repeat;
    opacity: 0.3;
  }
`;

const CardHeader = styled.div`
  position: relative;
  z-index: 1;
`;

const TrophyIcon = styled.div`
  font-size: 3rem;
  margin-bottom: 10px;
`;

const MainTitle = styled.h2`
  margin: 0 0 5px 0;
  font-size: 1.8rem;
  font-weight: bold;
`;

const Subtitle = styled.p`
  margin: 0 0 20px 0;
  opacity: 0.9;
  font-size: 1rem;
`;

const PhraseDisplay = styled.div`
  background: rgba(255, 255, 255, 0.2);
  padding: 15px;
  border-radius: 10px;
  margin: 20px 0;
  position: relative;
  z-index: 1;
`;

const ChineseText = styled.div`
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 5px;
`;

const PinyinText = styled.div`
  font-size: 1rem;
  opacity: 0.8;
  margin-bottom: 5px;
`;

const TranslationText = styled.div`
  font-size: 0.9rem;
  opacity: 0.7;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
  margin: 20px 0;
  position: relative;
  z-index: 1;
`;

const StatItem = styled.div`
  text-align: center;
`;

const StatIcon = styled.div`
  font-size: 1.2rem;
  margin-bottom: 5px;
`;

const StatValue = styled.div`
  font-size: 1.4rem;
  font-weight: bold;
  margin-bottom: 2px;
`;

const StatLabel = styled.div`
  font-size: 0.8rem;
  opacity: 0.8;
`;

const Watermark = styled.div`
  position: relative;
  z-index: 1;
  font-size: 0.8rem;
  opacity: 0.7;
  margin-top: 15px;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 15px;
  justify-content: center;
  margin-top: 25px;
`;

const ActionButton = styled.button`
  padding: 12px 20px;
  border: 2px solid #667eea;
  background: white;
  color: #667eea;
  border-radius: 25px;
  cursor: pointer;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  transition: all 0.3s ease;

  &:hover {
    background: #667eea;
    color: white;
  }
`;

interface ShareCardProps {
  score: number;
  accuracy: number;
  speed: number;
  phrase: Phrase;
  onClose: () => void;
}

export const ShareCard: React.FC<ShareCardProps> = ({
  score,
  accuracy,
  speed,
  phrase,
  onClose,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleDownload = useCallback(async () => {
    if (!cardRef.current) return;

    try {
      // 这里可以实现真实的下载功能，比如使用 html2canvas
      // 目前显示一个提示
      alert('下载功能需要集成 html2canvas 库来实现截图功能');
    } catch (error) {
      console.error('Download failed:', error);
    }
  }, []);

  const handleCopyLink = useCallback(() => {
    const shareText = `我在中文听力解码游戏中获得了 ${score} 分！正确理解了"${phrase.chinese}"(${phrase.pinyin}) - ${phrase.translation}。快来挑战你的中文听力吧！`;
    
    if (navigator.share) {
      navigator.share({
        title: '中文听力解码 - 我的成绩',
        text: shareText,
        url: window.location.href,
      });
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(shareText).then(() => {
        alert('分享文本已复制到剪贴板！');
      });
    } else {
      // 降级处理
      const textArea = document.createElement('textarea');
      textArea.value = shareText;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      alert('分享文本已复制到剪贴板！');
    }
  }, [score, phrase]);

  return (
    <Overlay
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <ShareCardContainer
        ref={cardRef}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
      >
        <CloseButton onClick={onClose}>
          <X size={20} />
        </CloseButton>

        <CardContent>
          <CardHeader>
            <TrophyIcon>🏆</TrophyIcon>
            <MainTitle>完美表现！</MainTitle>
            <Subtitle>中文听力解码挑战成功</Subtitle>
          </CardHeader>

          <PhraseDisplay>
            <ChineseText>{phrase.chinese}</ChineseText>
            <PinyinText>{phrase.pinyin}</PinyinText>
            <TranslationText>{phrase.translation}</TranslationText>
          </PhraseDisplay>

          <StatsGrid>
            <StatItem>
              <StatIcon><Target /></StatIcon>
              <StatValue>{Math.round(score)}</StatValue>
              <StatLabel>总分</StatLabel>
            </StatItem>
            <StatItem>
              <StatIcon><CheckCircle /></StatIcon>
              <StatValue>{Math.round(accuracy)}%</StatValue>
              <StatLabel>准确率</StatLabel>
            </StatItem>
            <StatItem>
              <StatIcon><Zap /></StatIcon>
              <StatValue>{Math.round(speed)}</StatValue>
              <StatLabel>速度</StatLabel>
            </StatItem>
          </StatsGrid>

          <Watermark>
            中文听力解码游戏 · 句乐部
          </Watermark>
        </CardContent>

        <ActionButtons>
          <ActionButton onClick={handleDownload}>
            <Download size={16} />
            保存图片
          </ActionButton>
          <ActionButton onClick={handleCopyLink}>
            <Copy size={16} />
            分享成绩
          </ActionButton>
        </ActionButtons>
      </ShareCardContainer>
    </Overlay>
  );
};