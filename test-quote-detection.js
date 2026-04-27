const line4 = '查理芒格说："你必须看到这个世界真实的样子，而不是你以为的样子、或者你希望的样子，只有这样你才能做出正确的选择。';
const line5 = '" 费马帕斯卡系统就是认识真实世界的基本工具。';

console.log('Line 4:', line4);
console.log('Line 5:', line5);

// Check line 5
const firstChar = line5.charCodeAt(0);
console.log('\nLine 5 first char code:', firstChar);
const isQuote = firstChar === 34 || firstChar === 8220 || firstChar === 8221 ||
                firstChar === 12300 || firstChar === 12301 ||
                firstChar === 8216 || firstChar === 8217;
console.log('Line 5 starts with quote:', isQuote);

// Check line 4
const hasQuote = /[""""「」'']/.test(line4);
console.log('\nLine 4 has quote (regex):', hasQuote);

const lastChar = line4.charCodeAt(line4.length - 1);
console.log('Line 4 last char:', line4[line4.length - 1], 'code:', lastChar);
const endsWithQuote = lastChar === 34 || lastChar === 8220 || lastChar === 8221 ||
                      lastChar === 12300 || lastChar === 12301 ||
                      lastChar === 8216 || lastChar === 8217;
console.log('Line 4 ends with quote:', endsWithQuote);

console.log('\nShould merge:', isQuote && hasQuote && !endsWithQuote);
