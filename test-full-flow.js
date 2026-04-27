// 模拟完整的修复流程
const merged = '查理芒格说："你必须看到这个世界真实的样子，而不是你以为的样子、或者你希望的样子，只有这样你才能做出正确的选择。" 费马帕斯卡系统就是认识真实世界的基本工具。';

let text = merged;
console.log('Step 0 - Original:', text);
console.log('Has newline:', text.includes('\n'));

// Step 2
console.log('\n=== Step 2: 合并被错误断开的句子 ===');
text = text.replace(/([^。！？：\n，、；""」』])\n+([^①②③④⑤⑥⑦⑧⑨\d\-•—\n""「『一二三四五六七八九十在实巴芒查])/g, '$1$2');
console.log('After step 2:', text);
console.log('Has newline:', text.includes('\n'));

// Step 3a
console.log('\n=== Step 3a: 确保句子结束后有换行 ===');
text = text.replace(/([。！？])([^"\n）」』\s])/g, '$1\n$2');
console.log('After step 3a:', text);
console.log('Has newline:', text.includes('\n'));

// Step 3b
console.log('\n=== Step 3b: 修复引号后的换行 ===');
text = text.replace(/([。！？])(["\）」』])([^"\n）」』\s])/g, '$1$2\n$3');
console.log('After step 3b:', text);
console.log('Has newline:', text.includes('\n'));

if (text.includes('\n')) {
  const lines = text.split('\n');
  console.log('\n=== Final lines ===');
  lines.forEach((line, i) => console.log(`Line ${i}: ${line}`));
}
