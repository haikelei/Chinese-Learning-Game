// Course Package API functions
import { api } from './apiConfig';

// 用户最近学习的课程接口
export interface UserRecentCourse {
  id: string;
  title: string;
  description?: string;
  orderIndex: number;
  coursePackageId: string;
  coursePackageTitle: string;
  lastAccessedAt: string;
  completionPercentage: number;
  completedExercises: number;
  totalExercises: number;
  isCompleted: boolean;
}

// 用户最近学习课程响应
export interface UserRecentCoursesResponse {
  courses: UserRecentCourse[];
  totalCount: number;
  hasProgress: boolean;
}

// 课程包接口
export interface CoursePackage {
  id: string;
  title: string;
  description: string;
  coverImageUrl?: string | null;
  difficultyLevel: string;
  price: number;
  isFree: boolean;
  authorId?: string | null;
  category: string;
  tags: string[];
  estimatedHours: number;
  isPublished: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  courses?: Course[];
  _count?: {
    courses: number;
  };
  coursesCount?: number;
}

// 课程接口
export interface Course {
  id: string;
  title: string;
  description?: string;
  textContent?: string;
  orderIndex: number;
  estimatedMinutes?: number;
  coursePackageId: string;
  isLocked?: boolean;
  unlockCondition?: any;
  processingStatus?: string;
  textAnalysisStatus?: string;
  textAnalysisError?: string | null;
  textAnalysisRetries?: number;
  textAnalysisJobId?: string;
  exerciseGenerationStatus?: string;
  exerciseGenerationProgress?: {
    total: number;
    failed: number;
    completed: number;
    inProgress: number;
  };
  exerciseGenerationError?: string | null;
  exerciseGenerationRetries?: number;
  aiGenerationStatus?: string;
  aiGenerationRetries?: number;
  aiGenerationError?: string | null;
  aiGenerationJobId?: string | null;
  createdAt: string;
  updatedAt: string;
  userProgress?: any[];
  _count?: {
    exercises: number;
  };
  progress?: {
    percentage: number;
    isCompleted: boolean;
    totalTimeMinutes: number;
  };
  exercisesCount?: number;
  exercises?: Exercise[];
  coursePackage?: CoursePackage;
  exerciseCount?: number;
}

// 练习接口
export interface Exercise {
  id: string;
  content: string;
  exerciseType: 'listening' | 'pronunciation' | 'translation' | 'comprehension';
  difficultyLevel: number;
  orderIndex: number;
  explanation?: string;
  courseId: string;
  isLocked?: boolean;
  unlockCondition?: any;
  processingStatus?: string;
  textAnalysisStatus?: string;
  textAnalysisError?: string | null;
  textAnalysisRetries?: number;
  textAnalysisJobId?: string;
  exerciseGenerationStatus?: string;
  exerciseGenerationProgress?: {
    total: number;
    failed: number;
    completed: number;
    inProgress: number;
  };
  exerciseGenerationError?: string | null;
  exerciseGenerationRetries?: number;
  aiGenerationStatus?: string;
  aiGenerationRetries?: number;
  aiGenerationError?: string | null;
  aiGenerationJobId?: string | null;
  createdAt: string;
  updatedAt: string;
  userProgress?: any[];
  _count?: {
    exercises: number;
  };
  progress?: {
    percentage: number;
    isCompleted: boolean;
    totalTimeMinutes: number;
  };
  exercisesCount?: number;
  exercises?: Exercise[];
  coursePackage?: CoursePackage;
  exerciseCount?: number;
}

// 练习片段接口
export interface ExerciseSegment {
  id: string;
  segmentIndex: number;
  practiceOrder: number;
  segmentType: 'complete' | 'single' | 'combination';
  chineseText: string;
  pinyin: string[]; // 带声调的拼音
  pinyinWithoutTones: string[]; // 不带声调的拼音
  translation: string;
  difficultyLevel: number;
  audioUrl: string;
  durationSeconds: number;
  userProgress: {
    isCompleted: boolean;
    attemptCount: number;
    bestScore: number;
  };
  // 保留旧字段以兼容
  content?: string;
  exerciseId?: string;
  audioResourceId?: string;
  sourceSegments?: number[];
  createdAt?: string;
  audioGenerationStatus?: string;
  audioResource?: AudioResource;
}

// 音频资源接口
export interface AudioResource {
  id: string;
  chineseText: string;
  pinyin: string;
  translation?: string;
  audioUrl: string;
  durationSeconds: number;
}

// 这个接口现在不再需要，因为拦截器会自动处理响应格式
// 保留注释以便将来参考

// 获取课程包列表响应接口
interface CoursePackagesResponse {
  packages: CoursePackage[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  filters: any;
  sort: {
    sortBy: string;
    sortOrder: string;
  };
}

// 获取课程包列表
export const fetchCoursePackages = async (params: {
  page?: number;
  limit?: number;
  category?: string;
  level?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
} = {}): Promise<CoursePackagesResponse> => {
  const queryParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) {
      queryParams.append(key, value.toString());
    }
  });
  
  // 使用新的HTTP客户端，拦截器会自动处理响应格式
  return api.get(`/store/packages?${queryParams}`);
};

// 获取课程包详情
export const fetchCoursePackageDetail = async (id: string): Promise<CoursePackage> => {
  // 使用新的HTTP客户端，拦截器会自动处理响应格式
  return api.get(`/store/packages/${id}`);
};

// 获取课程包下的所有课程
export const fetchCoursesByPackage = async (packageId: string): Promise<Course[]> => {
  // 使用新的HTTP客户端，拦截器会自动处理响应格式
  return api.get(`/courses/package/${packageId}`);
};

// 获取课程详情
export const fetchCourseDetail = async (id: string): Promise<Course> => {
  // 使用新的HTTP客户端，拦截器会自动处理响应格式
  return api.get(`/courses/${id}`);
};

// 获取练习详情
export const fetchExerciseDetail = async (id: string): Promise<Exercise> => {
  // 使用新的HTTP客户端，拦截器会自动处理响应格式
  return api.get(`/exercises/${id}`);
};

// 获取练习的片段
export const fetchExerciseSegments = async (exerciseId: string): Promise<ExerciseSegment[]> => {
  // 使用新的HTTP客户端，拦截器会自动处理响应格式
  return api.get(`/exercises/${exerciseId}/segments`);
};

// 获取分类列表
export const fetchCategories = async (): Promise<Array<{
  name: string;
  count: number;
  description: string;
}>> => {
  // 使用新的HTTP客户端，拦截器会自动处理响应格式
  return api.get('/store/categories');
};

// 获取课程的所有练习
export const fetchCourseExercises = async (courseId: string): Promise<Exercise[]> => {
  // 使用新的HTTP客户端，拦截器会自动处理响应格式
  return api.get(`/courses/${courseId}/exercises`);
};

// 新增：获取课程下所有练习和片段（包括用户进度）
export const getAllSegmentsFromCourse = async (courseId: string): Promise<{
  course: Course;
  exercises: Array<{
    id: string;
    title: string;
    content: string;
    exerciseType: string;
    orderIndex: number;
    difficultyLevel: number;
    segments: Array<{
      id: string;
      segmentIndex: number;
      practiceOrder: number;
      segmentType: string;
      content: string;
      pinyinWithTones: string[];
      pinyinWithoutTones: string[];
      translation?: string;
      difficultyLevel: number;
      audioUrl: string;
      durationSeconds: number;
      userProgress: {
        isCompleted: boolean;
        attemptCount: number;
        timeSpentSeconds: number;
        practiceMode: string;
      };
    }>;
    userProgress: {
      isCompleted: boolean;
      attemptCount: number;
      bestScore: number;
    };
  }>;
}> => {
  // 使用新的HTTP客户端，拦截器会自动处理响应格式
  return api.get(`/courses/${courseId}/all-segments`);
};

// 转换API练习数据为游戏组件格式
export const convertExerciseToPhrase = (exercise: Exercise): any => {
  // 由于Exercise接口中没有exerciseSegments字段，直接返回练习本身的数据
  return [{
    chinese: exercise.content,
    pinyin: '', // 练习本身没有拼音数据
    pinyinWithoutTones: '', // 练习本身没有拼音数据
    translation: '',
    audioUrl: '',
    difficulty: exercise.difficultyLevel > 3 ? 'hard' : exercise.difficultyLevel > 1 ? 'medium' : 'easy',
  }];
};

// 获取用户最近学习的课程
export const fetchUserRecentCourses = async (limit: number = 10): Promise<UserRecentCoursesResponse> => {
  try {
    console.log('🔍 开始获取用户最近课程...');
    const result = await api.get(`/courses/user/recent?limit=${limit}`);
    console.log('📊 API返回结果:', result);
    return result;
  } catch (error) {
    console.error('❌ 获取用户最近课程失败:', error);
    throw error;
  }
};

// 用户课程包详情接口（包含进度信息）
export interface UserPackageDetail {
  id: string;
  title: string;
  description?: string;
  difficultyLevel: string;
  category?: string;
  coverImageUrl?: string;
  enrolledAt: string;
  overallProgress: number;
  courses: Array<{
    id: string;
    title: string;
    description?: string;
    estimatedMinutes?: number;
    orderIndex: number;
    progressPercentage: number;
    isCompleted: boolean;
    lastStudiedAt?: string;
    totalExercises: number;
    correctExercises: number;
  }>;
}

// 获取用户课程包详情（包含进度）
export const fetchUserPackageDetail = async (packageId: string): Promise<UserPackageDetail> => {
  return api.get(`/my/packages/${packageId}`);
};