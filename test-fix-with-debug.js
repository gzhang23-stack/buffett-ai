const fs = require('fs');
const path = require('path');

const data = require('./data/munger-models.json');

// 修复内容
function fixContent(text, debug = false) {
  // 1. 修复引号配对问题 - 合并跨行的引号内容
  let lines = text.split('\n');
  let fixed = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    let merged = false;

    // 如果当前行以引号开头（检查第一个字符的Unicode码点）
    if (line.length > 0) {
      const firstChar = line.charCodeAt(0);
      // 34: ", 8220: ", 8221: ", 12300: 「, 12301: 」, 8216: ', 8217: '
      const isQuote = firstChar === 34 || firstChar === 8220 || firstChar === 8221 ||
                      firstChar === 12300 || firstChar === 12301 ||
                      firstChar === 8216 || firstChar === 8217;

      if (debug && i === 4) {
        console.log(`\n=== Line ${i} ===`);
        console.log('Content:', line);
        console.log('First char code:', firstChar);
        console.log('Is quote:', isQuote);
      }

      if (isQuote) {
        // 向后查找最近的非空行
        for (let j = fixed.length - 1; j >= 0; j--) {
          const prevLine = fixed[j];
          if (prevLine) {
            // 检查这个非空行是否包含引号但不以引号结尾
            // 使用charCode检测而不是正则
            let hasQuote = false;
            for (let k = 0; k < prevLine.length; k++) {
              const code = prevLine.charCodeAt(k);
              if (code === 34 || code === 8220 || code === 8221 ||
                  code === 12300 || code === 12301 ||
                  code === 8216 || code === 8217) {
                hasQuote = true;
                break;
              }
            }

            const lastChar = prevLine.charCodeAt(prevLine.length - 1);
            const endsWithQuote = lastChar === 34 || lastChar === 8220 || lastChar === 8221 ||
                                  lastChar === 12300 || lastChar === 12301 ||
                                  lastChar === 8216 || lastChar === 8217;

            if (debug && i === 4) {
              console.log(`Checking fixed[${j}]:`, prevLine.substring(0, 50) + '...');
              console.log('Has quote:', hasQuote);
              console.log('Last char code:', lastChar);
              console.log('Ends with quote:', endsWithQuote);
              console.log('Should merge:', hasQuote && !endsWithQuote);
            }

            if (hasQuote && !endsWithQuote) {
              // 合并到这个非空行
              fixed[j] = prevLine + line;
              merged = true;
              if (debug && i === 4) {
                console.log('MERGED!');
              }
            }
            // 找到第一个非空行后就停止
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

  // 2. 合并被错误断开的句子（非引号、非标点结尾的行）
  text = text.replace(/([^。！？：\n，、；""」』])\n+([^①②③④⑤⑥⑦⑧⑨\d\-•—\n""「『一二三四五六七八九十在实巴芒查])/g, '$1$2');

  // 3. 确保句子结束后有换行
  text = text.replace(/([。！？])([^"\n）」』\s])/g, '$1\n$2');
  text = text.replace(/([。！？])(["\）」』])([^"\n）」』\s])/g, '$1$2\n$3');

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

// Test with model 79
const model79 = data[78];
console.log('Testing model 79 with debug...');
const fixed = fixContent(model79.content, true);

console.log('\n=== Result ===');
const lines = fixed.split('\n');
console.log('Line 3:', lines[2]);
console.log('Line 4:', lines[3]);
console.log('Line 5:', lines[4] || '(merged)');
