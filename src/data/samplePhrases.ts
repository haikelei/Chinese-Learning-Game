export interface Phrase {
  chinese: string;
  pinyin: string;
  translation: string;
  audioUrl: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export const samplePhrases: Phrase[] = [
  {
    chinese: '你好',
    pinyin: 'ni hao',
    translation: 'Hello',
    audioUrl: '/audio/phrase-001.mp3',
    difficulty: 'easy',
  },
  {
    chinese: '谢谢',
    pinyin: 'xie xie',
    translation: 'Thank you',
    audioUrl: '/audio/phrase-002.mp3',
    difficulty: 'easy',
  },
  {
    chinese: '再见',
    pinyin: 'zai jian',
    translation: 'Goodbye',
    audioUrl: '/audio/phrase-003.mp3',
    difficulty: 'easy',
  },
  {
    chinese: '我爱你',
    pinyin: 'wo ai ni',
    translation: 'I love you',
    audioUrl: '/audio/phrase-004.mp3',
    difficulty: 'easy',
  },
  {
    chinese: '对不起',
    pinyin: 'dui bu qi',
    translation: 'Sorry',
    audioUrl: '/audio/phrase-005.mp3',
    difficulty: 'medium',
  },
  {
    chinese: '今天天气很好',
    pinyin: 'jin tian tian qi hen hao',
    translation: 'The weather is very good today',
    audioUrl: '/audio/phrase-006.mp3',
    difficulty: 'medium',
  },
  {
    chinese: '我想学中文',
    pinyin: 'wo xiang xue zhong wen',
    translation: 'I want to learn Chinese',
    audioUrl: '/audio/phrase-007.mp3',
    difficulty: 'medium',
  },
  {
    chinese: '这个菜很好吃',
    pinyin: 'zhe ge cai hen hao chi',
    translation: 'This dish is delicious',
    audioUrl: '/audio/phrase-008.mp3',
    difficulty: 'hard',
  },
  {
    chinese: '中国有很长的历史',
    pinyin: 'zhong guo you hen chang de li shi',
    translation: 'China has a very long history',
    audioUrl: '/audio/phrase-009.mp3',
    difficulty: 'hard',
  },
  {
    chinese: '学习中文不容易',
    pinyin: 'xue xi zhong wen bu rong yi',
    translation: 'Learning Chinese is not easy',
    audioUrl: '/audio/phrase-010.mp3',
    difficulty: 'hard',
  },
];
