const fs = require('fs');
const path = require('path');

const data = require('./data/munger-models.json');

// 修复断句问题
function fixLineBreaks(text) {
  // 1. 首先处理明显的标题和段落标记
  // 确保"在价值投资中的应用"前后有双换行
  text = text.replace(/([^\n])(在价值投资中的应用[：:])/g, '$1\n\n$2');
  text = text.replace(/(在价值投资中的应用[：:])([^\n])/g, '$1\n\n$2');

  // 确保"实践要点"、"实践建议"等前有双换行
  text = text.replace(/([^\n])(实践[要建议点]+[：:])/g, '$1\n\n$2');

  // 2. 修复被错误断开的句子
  // 如果一行以非标点结尾，且下一行以普通中文字符开头（非序号、非特殊符号），则合并
  text = text.replace(/([^。！？：\n，、；])\n+([^①②③④⑤⑥⑦⑧⑨\d\-•—\n一二三四五六七八九十])/g, '$1$2');

  // 3. 确保完整句子后有换行
  text = text.replace(/([。！？])([^"\n）」』])/g, '$1\n$2');

  // 4. 修复引号内的句子
  text = text.replace(/([。！？])(["\）」』])([^"\n）」』])/g, '$1$2\n$3');

  // 5. 确保序号前有换行
  text = text.replace(/([。！？])([①②③④⑤⑥⑦⑧⑨])/g, '$1\n$2');
  text = text.replace(/([^。！？\n])([①②③④⑤⑥⑦⑧⑨])/g, '$1\n$2');

  // 6. 确保数字序号前有换行
  text = text.replace(/([。！？])(\d+[、．\.])/g, '$1\n$2');

  // 7. 确保bullet points前有换行
  text = text.replace(/([。！？])([•\-])/g, '$1\n$2');

  // 8. 移除多余的空行（3个以上连续换行改为2个）
  text = text.replace(/\n{3,}/g, '\n\n');

  // 9. 清理首尾空白
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
console.log('Title:', model79.title);
console.log('Content preview (first 400 chars):');
console.log(model79.content.substring(0, 400));
