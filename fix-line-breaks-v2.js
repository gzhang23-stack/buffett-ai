const fs = require('fs');
const path = require('path');

const data = require('./data/munger-models.json');

// 修复断句问题
function fixLineBreaks(text) {
  // 1. 首先处理标题重复问题（如"费马帕斯卡系统费马—帕斯卡系统"）
  // 查找重复的标题模式
  text = text.replace(/^([^。]{2,20})(思维模型|理论|系统|模型|原理|法则)\1/g, '$1$2');

  // 2. 合并引号内被断开的句子
  // 如果一行以左引号开头但没有右引号，且下一行以右引号开头，则合并
  text = text.replace(/([""「『]([^""」』\n]+))\n+([^""」』\n]*[""」』])/g, '$1$3');

  // 3. 合并被错误断开的普通句子
  // 如果一行以非标点结尾，且下一行以普通字符开头（非序号、非标题），则合并
  text = text.replace(/([^。！？：\n，、；""」』])\n+([^①②③④⑤⑥⑦⑧⑨\d\-•—\n""「『一二三四五六七八九十在实])/g, '$1$2');

  // 4. 确保完整句子后有换行
  text = text.replace(/([。！？])([^"\n）」』])/g, '$1\n$2');

  // 5. 修复引号后的换行
  text = text.replace(/([。！？])(["\）」』])([^"\n）」』\s])/g, '$1$2\n$3');

  // 6. 确保"在价值投资中的应用"前后有双换行
  text = text.replace(/([^\n])(在价值投资中的应用[：:])/g, '$1\n\n$2');
  text = text.replace(/(在价值投资中的应用[：:])([^\n])/g, '$1\n\n$2');

  // 7. 确保"实践要点"、"实践建议"等前有双换行
  text = text.replace(/([^\n])(实践[要建议点]+[：:])/g, '$1\n\n$2');

  // 8. 确保序号前有换行
  text = text.replace(/([。！？])([①②③④⑤⑥⑦⑧⑨])/g, '$1\n$2');
  text = text.replace(/([^。！？\n])([①②③④⑤⑥⑦⑧⑨])/g, '$1\n$2');

  // 9. 确保bullet points前有换行
  text = text.replace(/([。！？])([•\-])/g, '$1\n$2');

  // 10. 移除多余的空行（3个以上连续换行改为2个）
  text = text.replace(/\n{3,}/g, '\n\n');

  // 11. 清理首尾空白
  text = text.trim();

  return text;
}

// 处理所有模型
const fixed = data.map(model => ({
  ...model,
  content: fixLineBreaks(model.content)
}));

// 保存
fs.writeFileSync(
  path.join(__dirname, 'data', 'munger-models.json'),
  JSON.stringify(fixed, null, 2),
  'utf-8'
);

console.log('✓ Fixed line breaks for', fixed.length, 'models');

// 显示修复示例
console.log('\n=== Sample: Model 79 (费马帕斯卡系统) ===');
const model79 = fixed[78];
console.log('First 10 lines:');
model79.content.split('\n').slice(0, 10).forEach((line, i) => {
  console.log(`${i+1}: ${line.substring(0, 80)}${line.length > 80 ? '...' : ''}`);
});
