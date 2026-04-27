const line4 = '查理芒格说："你必须看到这个世界真实的样子，而不是你以为的样子、或者你希望的样子，只有这样你才能做出正确的选择。';

console.log('Line 4:', line4);
console.log('Char at pos 6:', line4[6], 'code:', line4.charCodeAt(6));

// Test different regex patterns
console.log('\nRegex tests:');
console.log('Test with Unicode escape:', /[“”]/.test(line4));
console.log('Test with literal:', line4.includes('"') || line4.includes('"'));

// Check if the character is actually in the string
const hasCode8220 = line4.split('').some(c => c.charCodeAt(0) === 8220);
console.log('\nHas char code 8220:', hasCode8220);

// Find all quote-like characters
console.log('\nAll quote-like characters:');
for (let i = 0; i < line4.length; i++) {
  const code = line4.charCodeAt(i);
  if (code === 34 || code === 8220 || code === 8221 || code === 12300 || code === 12301) {
    console.log(`  Position ${i}: "${line4[i]}" (code: ${code})`);
  }
}
