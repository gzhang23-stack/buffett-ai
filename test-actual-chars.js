// 使用实际的中文引号
const text = '查理芒格说："你必须看到这个世界真实的样子，而不是你以为的样子、或者你希望的样子，只有这样你才能做出正确的选择。" 费马帕斯卡系统就是认识真实世界的基本工具。';

console.log('Original:', text);
console.log('Char at 56:', text[56], 'code:', text.charCodeAt(56));
console.log('Char at 57:', text[57], 'code:', text.charCodeAt(57));

// Test the regex from the script
const regex = /([。！？])([^""\n）」』\s])/g;
console.log('\nRegex:', regex);

const result = text.replace(regex, '$1\n$2');
console.log('\nAfter replace:');
console.log(result);
console.log('\nHas newline:', result.includes('\n'));

if (result.includes('\n')) {
  const lines = result.split('\n');
  console.log('\nLines:');
  lines.forEach((line, i) => console.log(`${i}: ${line.substring(0, 60)}`));
}
