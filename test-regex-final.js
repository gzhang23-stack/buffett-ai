const text = '查理芒格说："你必须看到这个世界真实的样子，而不是你以为的样子、或者你希望的样子，只有这样你才能做出正确的选择。" 费马帕斯卡系统就是认识真实世界的基本工具。';

console.log('Original:', text);
console.log('Char at 56:', text[56], 'code:', text.charCodeAt(56));

// Test the regex
const regex = /([。！？])([^""\n）」』\s])/g;
console.log('\nRegex:', regex);

const result = text.replace(regex, '$1\n$2');
console.log('\nAfter replace:', result);
console.log('Has newline:', result.includes('\n'));

// Check what the regex character class actually matches
console.log('\nChecking character class [^""\n）」』\s]:');
console.log('Matches " (8221):', !/[^""\n）」』\s]/.test('"'));
console.log('Matches space:', !/[^""\n）」』\s]/.test(' '));
console.log('Matches 费:', !/[^""\n）」』\s]/.test('费'));
