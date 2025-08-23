import { api } from './apiConfig';

/**
 * Segment API 接口 - 新版本
 */

// 开始练习（新接口）
export const startPractice = async (
  exerciseId: string, 
  segmentId: string, 
  practiceMode: 'listening' | 'speaking' | 'reading' | 'writing' = 'listening'
) => {
  try {
    const response = await api.post('/segments/start-practice', {
      exerciseId,
      segmentId,
      practiceMode
    });
    return response;
  } catch (error) {
    console.error('Failed to start practice:', error);
    throw error;
  }
};

// 完成练习（新接口）
export const completePractice = async (
  exerciseId: string, 
  segmentId: string, 
  practiceMode: 'listening' | 'speaking' | 'reading' | 'writing' = 'listening',
  timeSpentSeconds: number = 0
) => {
  try {
    const response = await api.post('/segments/complete-practice', {
      exerciseId,
      segmentId,
      practiceMode,
      timeSpentSeconds
    });
    return response;
  } catch (error) {
    console.error('Failed to complete practice:', error);
    throw error;
  }
};

// 获取练习进度（新接口）
export const getPracticeProgress = async (exerciseId: string) => {
  try {
    const response = await api.get(`/segments/progress/${exerciseId}`);
    return response;
  } catch (error) {
    console.error('Failed to get practice progress:', error);
    throw error;
  }
};

// 获取练习建议（新接口）
export const getPracticeSuggestion = async (exerciseId: string) => {
  try {
    const response = await api.get(`/segments/suggest-next/${exerciseId}`);
    return response;
  } catch (error) {
    console.error('Failed to get practice suggestion:', error);
    throw error;
  }
};

// 保留旧接口以兼容（可选）
export const enterSegment = startPractice;
export const completeSegment = completePractice;
export const getSegmentStatus = getPracticeProgress;
export const getCurrentSegment = getPracticeSuggestion;
