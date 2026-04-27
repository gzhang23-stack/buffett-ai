// 使用实际的中文引号
const merged = '查理芒格说："你必须看到这个世界真实的样子，而不是你以为的样子、或者你希望的样子，只有这样你才能做出正确的选择。" 费马帕斯卡系统就是认识真实世界的基本工具。';

console.log('Original merged line:');
console.log(merged);
console.log('\nChar codes around quote:');
for (let i = 50; i < 60; i++) {
  console.log(`  ${i}: "${merged[i]}" (${merged.charCodeAt(i)})`);
}

// Test regex 1
let text = merged;
console.log('\n=== Test regex 1 ===');
text = text.replace(/([。！？])([^"\n）」』\s])/g, '$1\n$2');
console.log('After regex 1:', text.includes('\n') ? 'SPLIT!' : 'OK');

// Test regex 2
console.log('\n=== Test regex 2 ===');
text = merged;
text = text.replace(/([。！？])(["\）」』])([^"\n）」』\s])/g, '$1$2\n$3');
console.log('After regex 2:', text.includes('\n') ? 'SPLIT!' : 'OK');
if (text.includes('\n')) {
  console.log('Result:', text);
}
