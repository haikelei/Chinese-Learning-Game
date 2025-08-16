// 简单的音频测试
// 在浏览器开发者工具中运行这段代码来测试音频

function testAudioData() {
  // 从samplePhrases中获取第一个音频URL
  const audioUrl = 'data:audio/mp3;base64,//PkxAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//PkxABTVDoFnsMfBADXqTkt2tRdO/QEo9WQVQXe8KGB1IIaW76D7/RSIQSmOoIoI6kTZ3A60EVFcM7YnPwGu9d4BxHjXvoQAgAABBEEACABy24b4m5L1Gr50+zthoGgQQliGHQW8etH+8BdqIuDPOrDvDVkvjHIjGst51oezn+Qcubmf49ajP9C92LYjHhdxxqs3yFuUGETsb4mZmDgQwnCoPwXNblJWLmoyVnm2jgex8JxUQDkUCjP8W881Qn2JUQFG2HIaDIfidIWvGW5RU+QchbmSMTMbgDoDcIQNwFIXkXNJBIzLnlV5Kxc0LjqRQXUgtg/KognBln+QcXM41ON8XNC1YaB0Kw/CcFwIIQghZc4y+JOSdEIQf4mCyW9VFsWFOzHQzz6J+ONnV68ynAT8y0wJoeCvXBoHWh7Oxmmo0+dcZD4x+EEFwRjYTgnAuZltT1nUh0KCVUCq/u/qYwNRM+bjE1I/P3MWPjNkoCA5vIAAEUzYjM/GTHBIyYuIhQAh4oBmHnZlAYCAMITwEQgURBx+EAxkIYogYaCggVrhnmkqIAGBSoCrJQC3YkgHLipRM0hPAT7sFUIxhC2UsGhw1AGmgo5QdB4EDNqpUIkExE6GXIoIwAEFSwsolmo';
  
  console.log('Testing audio data...');
  console.log('Audio URL length:', audioUrl.length);
  console.log('Audio URL prefix:', audioUrl.substring(0, 50));
  
  // 创建音频元素并尝试播放
  const audio = new Audio(audioUrl);
  
  audio.oncanplaythrough = () => {
    console.log('✅ Audio can play through');
    console.log('Duration:', audio.duration);
  };
  
  audio.onerror = (error) => {
    console.error('❌ Audio error:', error);
  };
  
  audio.onloadedmetadata = () => {
    console.log('✅ Audio metadata loaded');
    console.log('Duration:', audio.duration);
    console.log('Ready to play');
  };
  
  // 尝试播放
  audio.play().then(() => {
    console.log('✅ Audio started playing');
  }).catch(error => {
    console.error('❌ Play failed:', error);
  });
}

// 运行测试
testAudioData();