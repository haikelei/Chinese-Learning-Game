// 真实打字机音效播放器
export class TypewriterSound {
  private audioContext: AudioContext | null = null;
  private audioBuffer: AudioBuffer | null = null;
  private dingBuffer: AudioBuffer | null = null;
  private alertBuffer: AudioBuffer | null = null;
  private isLoaded: boolean = false;

  constructor() {
    // 初始化音频上下文
    if (typeof window !== 'undefined') {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.loadAudioFiles();
    }
  }

  // 加载所有音效文件
  private async loadAudioFiles() {
    if (!this.audioContext) return;

    try {
      // 加载打字机音效
      const typewriterResponse = await fetch('/typewriter-clip.mp3');
      const typewriterBuffer = await typewriterResponse.arrayBuffer();
      this.audioBuffer = await this.audioContext.decodeAudioData(typewriterBuffer);
      
      // 加载成功音效
      const dingResponse = await fetch('/ding-clip.mp3');
      const dingArrayBuffer = await dingResponse.arrayBuffer();
      this.dingBuffer = await this.audioContext.decodeAudioData(dingArrayBuffer);
      
      // 加载错误音效
      const alertResponse = await fetch('/alert.mp3');
      const alertArrayBuffer = await alertResponse.arrayBuffer();
      this.alertBuffer = await this.audioContext.decodeAudioData(alertArrayBuffer);
      
      this.isLoaded = true;
      console.log('所有音效加载成功');
      console.log('- 打字机音效时长:', this.audioBuffer.duration, '秒');
      console.log('- 成功音效时长:', this.dingBuffer.duration, '秒');
      console.log('- 错误音效时长:', this.alertBuffer.duration, '秒');
    } catch (error) {
      console.error('音效加载失败:', error);
      this.isLoaded = false;
    }
  }

  // 播放打字机音效
  private playFullAudio() {
    if (!this.audioContext || !this.audioBuffer || !this.isLoaded) {
      this.playGeneratedKeystroke();
      return;
    }

    const source = this.audioContext.createBufferSource();
    const gainNode = this.audioContext.createGain();
    
    source.buffer = this.audioBuffer;
    source.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    gainNode.gain.setValueAtTime(1.3, this.audioContext.currentTime);
    source.start(this.audioContext.currentTime);
  }

  // 播放成功音效
  playSuccess() {
    if (!this.audioContext || !this.dingBuffer || !this.isLoaded) {
      console.warn('成功音效未加载');
      return;
    }

    const source = this.audioContext.createBufferSource();
    const gainNode = this.audioContext.createGain();
    
    source.buffer = this.dingBuffer;
    source.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    gainNode.gain.setValueAtTime(0.8, this.audioContext.currentTime);
    source.start(this.audioContext.currentTime);
  }

  // 播放错误音效
  playError() {
    if (!this.audioContext || !this.alertBuffer || !this.isLoaded) {
      console.warn('错误音效未加载');
      return;
    }

    const source = this.audioContext.createBufferSource();
    const gainNode = this.audioContext.createGain();
    
    source.buffer = this.alertBuffer;
    source.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    gainNode.gain.setValueAtTime(0.7, this.audioContext.currentTime);
    source.start(this.audioContext.currentTime);
  }

  // 播放按键音效（输入字符时）
  playKeystroke() {
    this.playFullAudio();
  }

  // 播放空格键音效
  playSpacebar() {
    this.playFullAudio();
  }

  // 播放回车键音效
  playEnter() {
    this.playFullAudio();
  }

  // 播放删除键音效
  playBackspace() {
    this.playFullAudio();
  }

  // 回退的生成音效（如果文件加载失败）
  private playGeneratedKeystroke() {
    if (!this.audioContext) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.frequency.setValueAtTime(1800 + Math.random() * 400, this.audioContext.currentTime);
    oscillator.type = 'square';

    gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.15, this.audioContext.currentTime + 0.002);
    gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.05);

    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + 0.05);
  }
}

// 导出单例实例
export const typewriterSound = new TypewriterSound();