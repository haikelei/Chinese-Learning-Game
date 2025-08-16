const fs = require('fs');
const path = require('path');

// 读取原始数据文件
function extractAudioFiles() {
  const samplePhrasesPath = path.join(__dirname, '../src/data/samplePhrases.ts');
  const audioDir = path.join(__dirname, '../public/audio');
  
  // 创建音频文件夹
  if (!fs.existsSync(audioDir)) {
    fs.mkdirSync(audioDir, { recursive: true });
  }
  
  // 读取文件内容
  const fileContent = fs.readFileSync(samplePhrasesPath, 'utf8');
  
  // 提取所有base64音频数据
  const base64Matches = fileContent.match(/audioUrl:\s*'data:audio\/mp3;base64,([^']+)'/g);
  
  if (!base64Matches) {
    console.log('没有找到base64音频数据');
    return;
  }
  
  const newPhrases = [];
  let updatedContent = fileContent;
  
  base64Matches.forEach((match, index) => {
    // 提取base64数据
    const base64Data = match.match(/base64,([^']+)/)[1];
    
    // 生成文件名
    const fileName = `phrase-${String(index + 1).padStart(3, '0')}.mp3`;
    const filePath = path.join(audioDir, fileName);
    
    // 将base64转换为Buffer并写入文件
    const audioBuffer = Buffer.from(base64Data, 'base64');
    fs.writeFileSync(filePath, audioBuffer);
    
    // 替换原文件中的base64为文件路径
    const originalMatch = match;
    const newMatch = `audioUrl: '/audio/${fileName}'`;
    updatedContent = updatedContent.replace(originalMatch, newMatch);
    
    console.log(`已创建: ${fileName}`);
  });
  
  // 写入更新后的文件
  const backupPath = samplePhrasesPath + '.backup';
  fs.writeFileSync(backupPath, fileContent); // 创建备份
  fs.writeFileSync(samplePhrasesPath, updatedContent);
  
  console.log(`\n提取完成！`);
  console.log(`- 共提取了 ${base64Matches.length} 个音频文件`);
  console.log(`- 音频文件保存在: ${audioDir}`);
  console.log(`- 原文件备份为: ${backupPath}`);
  console.log(`- 数据文件已更新为使用文件路径`);
}

extractAudioFiles();