const line4 = '查理芒格说："你必须看到这个世界真实的样子，而不是你以为的样子、或者你希望的样子，只有这样你才能做出正确的选择。';

console.log('Line 4:', line4);
console.log('Left quotes:', (line4.match(/["「『]/g) || []));
console.log('Right quotes:', (line4.match(/["」』]/g) || []));
console.log('Left count:', (line4.match(/["「『]/g) || []).length);
console.log('Right count:', (line4.match(/["」』]/g) || []).length);

// Check each character
for (let i = 0; i < line4.length; i++) {
  const char = line4[i];
  const code = char.charCodeAt(0);
  if (code === 8220 || code === 8221 || code === 34) {
    console.log(`Position ${i}: "${char}" (code: ${code})`);
  }
}
