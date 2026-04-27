const fs = require('fs');
const path = require('path');

const data = require('./data/munger-models.json');

// 检查字符是否是引号
function isQuoteChar(code) {
  return code === 34 || code === 8220 || code === 8221 ||
         code === 12300 || code === 12301 ||
         code === 8216 || code === 8217;
}

// 修复内容
function fixContent(text) {
  // 1. 修复引号配对问题 - 合并跨行的引号内容
  let lines = text.split('\n');
  let fixed = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    let merged = false;

    if (line.length > 0) {
      const firstChar = line.charCodeAt(0);
      const isQuote = isQuoteChar(firstChar);

      if (isQuote) {
        for (let j = fixed.length - 1; j >= 0; j--) {
          const prevLine = fixed[j];
          if (prevLine) {
            let hasQuote = false;
            for (let k = 0; k < prevLine.length; k++) {
              if (isQuoteChar(prevLine.charCodeAt(k))) {
                hasQuote = true;
                break;
              }
            }

            const lastChar = prevLine.charCodeAt(prevLine.length - 1);
            const endsWithQuote = isQuoteChar(lastChar);

            if (hasQuote && !endsWithQuote) {
              fixed[j] = prevLine + line;
              merged = true;
            }
            break;
          }
        }
      }
    }

    if (!merged) {
      fixed.push(line);
    }
  }

  text = fixed.join('\n');

  // 2. 合并被错误断开的句子
  text = text.replace(/([^。！？：\n，、；])\n+([^①②③④⑤⑥⑦⑧⑨\d\-•—\n一二三四五六七八九十在实巴芒查])/g, (match, p1, p2) => {
    // 检查p1最后一个字符是否是引号
    if (p1.length > 0 && isQuoteChar(p1.charCodeAt(p1.length - 1))) {
      return match; // 保持原样
    }
    // 检查p2第一个字符是否是引号
    if (p2.length > 0 && isQuoteChar(p2.charCodeAt(0))) {
      return match; // 保持原样
    }
    return p1 + p2;
  });

  // 3. 确保句子结束后有换行，但不在引号后插入
  text = text.replace(/([。！？])(.)/g, (match, p1, p2) => {
    const code = p2.charCodeAt(0);
    // 如果下一个字符是引号、空格、换行或括号，保持原样
    if (isQuoteChar(code) || code === 32 || code === 10 || code === 65289 || code === 12289 || code === 12301) {
      return match;
    }
    return p1 + '\n' + p2;
  });

  // 4. 确保段落标题前后有适当换行
  text = text.replace(/([^\n])(在价值投资中的应用[：:])/g, '$1\n\n$2');
  text = text.replace(/(在价值投资中的应用[：:])([^\n])/g, '$1\n\n$2');
  text = text.replace(/([^\n])(实践[要建议点]+[：:])/g, '$1\n\n$2');

  // 5. 确保序号前有换行
  text = text.replace(/([。！？])([①②③④⑤⑥⑦⑧⑨])/g, '$1\n$2');
  text = text.replace(/([^。！？\n])([①②③④⑤⑥⑦⑧⑨])/g, '$1\n$2');

  // 6. 确保bullet points前有换行
  text = text.replace(/([。！？])([•])/g, '$1\n$2');

  // 7. 移除多余的空行
  text = text.replace(/\n{3,}/g, '\n\n');

  // 8. 清理首尾空白
  text = text.trim();

  return text;
}

// 处理所有模型
const fixed = data.map((model, idx) => {
  const fixedContent = fixContent(model.content);

  if (idx === 78) {
    console.log('=== Model 79 ===');
    console.log('Line 4:', fixedContent.split('\n')[3]);
    console.log('Includes 费马:', fixedContent.split('\n')[3].includes('费马'));
  }

  return {
    ...model,
    content: fixedContent
  };
});

// 保存
fs.writeFileSync(
  path.join(__dirname, 'data', 'munger-models.json'),
  JSON.stringify(fixed, null, 2),
  'utf-8'
);

console.log('\n✓ Fixed content for', fixed.length, 'models');
console.log('Saved to munger-models.json');
