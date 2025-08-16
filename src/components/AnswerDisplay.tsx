import React from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';

const AnswerContainer = styled(motion.div)`
  position: fixed;
  top: 10%;
  left: 0;
  right: 0;
  margin: 0 auto;
  z-index: 1000;
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  border: 2px solid #0ea5e9;
  border-radius: 16px;
  padding: 20px 40px;
  box-shadow: 0 4px 20px rgba(14, 165, 233, 0.15);
  min-width: 600px;
  max-width: 800px;
  width: fit-content;
`;

const PinyinChineseWrapper = styled.div`
  position: relative;
  padding-left: 120px;
  margin-bottom: 16px;
`;

const TitleLabel = styled.span`
  position: absolute;
  left: 12px;
  font-weight: 600;
  color: #0c4a6e;
  width: 96px;
  text-align: right;
  font-size: 1.1rem;
  user-select: none;
  padding-right: 12px;
  white-space: nowrap;
`;

const PinyinTitle = styled(TitleLabel)`
  top: 6px;
`;

const ChineseTitle = styled(TitleLabel)`
  top: 46px;
`;

const PinyinChineseSection = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  justify-content: flex-start;
  align-items: center;
`;

const CharacterPair = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-width: 60px;
  gap: 4px;
`;

const PinyinText = styled.span`
  color: #64748b;
  font-family: 'Monaco', 'Consolas', 'Liberation Mono', 'Courier New', monospace;
  font-size: 1.6rem;
  text-align: center;
  min-height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ChineseText = styled.span`
  color: #1e293b;
  font-size: 1.4rem;
  font-weight: 500;
  text-align: center;
  min-height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const EnglishSection = styled.div`
  display: flex;
  align-items: center;
`;

const EnglishLabel = styled.span`
  font-weight: 600;
  color: #0c4a6e;
  width: 96px;
  text-align: right;
  flex-shrink: 0;
  margin-right: 12px;
  font-size: 1.1rem;
`;

const EnglishText = styled.span`
  color: #1e293b;
  font-family: 'Monaco', 'Consolas', 'Liberation Mono', 'Courier New', monospace;
  font-size: 1.05rem;
  flex: 1;
  text-align: left;
`;

interface AnswerDisplayProps {
  isVisible: boolean;
  phrase: {
    pinyin: string;
    chinese: string;
    translation: string;
  };
}

// 工具函数：解析拼音和汉字配对
const parsePinyinChinesePairs = (pinyin: string, chinese: string) => {
  // 分割拼音音节（按空格）
  const pinyinSyllables = pinyin.trim().split(/\s+/).filter(syllable => syllable.length > 0);
  
  // 分割汉字（按字符，过滤掉空格和标点）
  const chineseChars = chinese.split('').filter(char => char.trim() && !/[，。！？、；：""''（）]/.test(char));
  
  // 确保数组长度一致
  const maxLength = Math.max(pinyinSyllables.length, chineseChars.length);
  
  const pinyinArray: string[] = [];
  const chineseArray: string[] = [];
  
  for (let i = 0; i < maxLength; i++) {
    pinyinArray.push(pinyinSyllables[i] || '');
    chineseArray.push(chineseChars[i] || '');
  }
  
  return { pinyinArray, chineseArray };
};

export const AnswerDisplay: React.FC<AnswerDisplayProps> = ({
  isVisible,
  phrase,
}) => {
  const { pinyinArray, chineseArray } = parsePinyinChinesePairs(phrase.pinyin, phrase.chinese);

  return (
    <AnimatePresence>
      {isVisible && (
        <AnswerContainer
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          <PinyinChineseWrapper>
            <PinyinTitle>Pinyin:</PinyinTitle>
            <ChineseTitle>Chinese:</ChineseTitle>
            <PinyinChineseSection>
              {pinyinArray.map((syllable, index) => (
                <CharacterPair key={`pair-${index}`}>
                  <PinyinText>{syllable}</PinyinText>
                  <ChineseText>{chineseArray[index]}</ChineseText>
                </CharacterPair>
              ))}
            </PinyinChineseSection>
          </PinyinChineseWrapper>
          
          <EnglishSection>
            <EnglishLabel>English:</EnglishLabel>
            <EnglishText>{phrase.translation}</EnglishText>
          </EnglishSection>
        </AnswerContainer>
      )}
    </AnimatePresence>
  );
};