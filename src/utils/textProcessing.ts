/**
 * 文本处理工具函数
 */

/**
 * 去掉句末标点符号
 * 支持的标点符号：。！？、；：""''（）【】《》〈〉
 * @param text 原始文本
 * @returns 去掉句末标点后的文本
 */
export const removeTrailingPunctuation = (text: string): string => {
  if (!text || typeof text !== 'string') return text;
  
  // 定义句末标点符号
  const trailingPunctuation = /[。！？、；：""''（）【】《》〈〉]+$/;
  
  // 去掉句末标点
  return text.replace(trailingPunctuation, '');
};

/**
 * 去掉所有标点符号（包括句中和句末）
 * @param text 原始文本
 * @returns 去掉所有标点后的文本
 */
export const removeAllPunctuation = (text: string): string => {
  if (!text || typeof text !== 'string') return text;
  
  // 定义所有标点符号
  const allPunctuation = /[，。！？、；：""''（）【】《》〈〉]/g;
  
  // 去掉所有标点
  return text.replace(allPunctuation, '');
};

/**
 * 检查字符是否为标点符号
 * @param char 单个字符
 * @returns 是否为标点符号
 */
export const isPunctuation = (char: string): boolean => {
  if (!char || char.length !== 1) return false;
  
  const punctuationRegex = /[，。！？、；：""''（）【】《》〈〉]/;
  return punctuationRegex.test(char);
};
