const line4 = '查理芒格说："你必须看到这个世界真实的样子，而不是你以为的样子、或者你希望的样子，只有这样你才能做出正确的选择。';
const line5 = '" 费马帕斯卡系统就是认识真实世界的基本工具。';

console.log('Line 4:', line4);
console.log('Line 5:', line5);
console.log('Line 5 first char code:', line5.charCodeAt(0));
console.log('Line 5 starts with ":', line5[0] === '"');
console.log('Line 5 starts with ":', line5[0] === '"');
console.log('Regex test:', /^[""]/.test(line5));
console.log('Has left quote in line 4:', /["「『]/.test(line4));
console.log('Has right quote in line 4:', /["」』]/.test(line4));
