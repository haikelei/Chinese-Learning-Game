// Google Analytics 4 事件追踪工具

declare global {
  interface Window {
    gtag: (command: string, targetId: string, config?: any) => void;
  }
}

// 检查gtag是否可用
const isGtagAvailable = (): boolean => {
  return typeof window !== 'undefined' && typeof window.gtag === 'function';
};

// 基础事件追踪
export const trackEvent = (eventName: string, parameters?: Record<string, any>) => {
  if (!isGtagAvailable()) {
    console.log('Analytics not available, would track:', eventName, parameters);
    return;
  }

  window.gtag('event', eventName, {
    event_category: 'engagement',
    event_label: parameters?.label || '',
    value: parameters?.value || 0,
    ...parameters,
  });
};

// 页面浏览追踪
export const trackPageView = (pagePath: string, pageTitle?: string) => {
  if (!isGtagAvailable()) {
    console.log('Analytics not available, would track page view:', pagePath);
    return;
  }

  window.gtag('config', 'G-Z9HLBDP0KX', {
    page_path: pagePath,
    page_title: pageTitle,
  });
};

// 游戏相关事件
export const gameAnalytics = {
  // 游戏开始
  gameStart: (mode: 'pinyin' | 'chinese') => {
    trackEvent('game_start', {
      event_category: 'game',
      mode: mode,
      label: `${mode}_mode_started`,
    });
  },

  // 游戏完成
  gameComplete: (mode: 'pinyin' | 'chinese', isCorrect: boolean, timeSpent: number) => {
    trackEvent('game_complete', {
      event_category: 'game',
      mode: mode,
      success: isCorrect,
      time_spent: Math.round(timeSpent / 1000), // 转换为秒
      label: `${mode}_${isCorrect ? 'correct' : 'incorrect'}`,
    });
  },

  // 模式切换
  modeSwitch: (fromMode: string, toMode: string) => {
    trackEvent('mode_switch', {
      event_category: 'navigation',
      from_mode: fromMode,
      to_mode: toMode,
      label: `${fromMode}_to_${toMode}`,
    });
  },

  // 拼音提示使用
  pinyinHintToggle: (isShown: boolean) => {
    trackEvent('pinyin_hint_toggle', {
      event_category: 'feature',
      action: isShown ? 'show' : 'hide',
      label: `pinyin_hint_${isShown ? 'shown' : 'hidden'}`,
    });
  },

  // 音频播放
  audioPlay: (mode: string, phraseId?: string) => {
    trackEvent('audio_play', {
      event_category: 'interaction',
      mode: mode,
      phrase_id: phraseId,
      label: `audio_played_${mode}`,
    });
  },

  // 快捷键使用
  shortcutUsed: (shortcut: string, action: string) => {
    trackEvent('shortcut_used', {
      event_category: 'interaction',
      shortcut: shortcut,
      action: action,
      label: `${shortcut}_${action}`,
    });
  },

  // 输入错误
  inputError: (mode: string, errorType: string) => {
    trackEvent('input_error', {
      event_category: 'error',
      mode: mode,
      error_type: errorType,
      label: `${mode}_${errorType}`,
    });
  },
};

// 用户行为追踪
export const userAnalytics = {
  // 页面停留时间
  timeOnPage: (page: string, timeSpent: number) => {
    trackEvent('page_time', {
      event_category: 'engagement',
      page: page,
      time_spent: Math.round(timeSpent / 1000),
      label: `${page}_time_spent`,
    });
  },

  // 功能使用
  featureUsed: (feature: string, context?: string) => {
    trackEvent('feature_used', {
      event_category: 'feature',
      feature_name: feature,
      context: context,
      label: `${feature}_used`,
    });
  },
};

// 错误追踪
export const errorAnalytics = {
  // JavaScript错误
  jsError: (error: Error, context?: string) => {
    trackEvent('js_error', {
      event_category: 'error',
      error_message: error.message,
      error_stack: error.stack?.substring(0, 150), // 限制长度
      context: context,
      label: 'javascript_error',
    });
  },

  // 音频加载错误
  audioError: (audioUrl: string, errorType: string) => {
    trackEvent('audio_error', {
      event_category: 'error',
      audio_url: audioUrl,
      error_type: errorType,
      label: 'audio_load_error',
    });
  },
};

export default {
  trackEvent,
  trackPageView,
  gameAnalytics,
  userAnalytics,
  errorAnalytics,
};