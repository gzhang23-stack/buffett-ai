const data = require('./data/munger-models.json');

// 模拟fixContent的步骤1
const model79 = data[78];
let lines = model79.content.split('\n');
let fixed = [];

for (let i = 0; i < lines.length; i++) {
  const line = lines[i].trim();
  let merged = false;

  if (line.length > 0) {
    const firstChar = line.charCodeAt(0);
    const isQuote = firstChar === 34 || firstChar === 8220 || firstChar === 8221 ||
                    firstChar === 12300 || firstChar === 12301 ||
                    firstChar === 8216 || firstChar === 8217;

    if (isQuote) {
      for (let j = fixed.length - 1; j >= 0; j--) {
        const prevLine = fixed[j];
        if (prevLine) {
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

let text = fixed.join('\n');
console.log('=== After merge (step 1) ===');
const line4After1 = text.split('\n')[3];
console.log('Line 4:', line4After1);
console.log('Includes 费马:', line4After1.includes('费马'));

// Now apply step 3a
console.log('\n=== Applying step 3a ===');
const regex = /([。！？])([^""\n）」』\s])/g;
text = text.replace(regex, '$1\n$2');

const line4After3a = text.split('\n')[3];
console.log('Line 4:', line4After3a);
console.log('Includes 费马:', line4After3a.includes('费马'));

// Check what happened
if (!line4After3a.includes('费马') && line4After1.includes('费马')) {
  console.log('\n=== SPLIT DETECTED ===');
  console.log('Checking characters around 。in merged line:');
  const idx = line4After1.indexOf('。');
  for (let i = idx; i < Math.min(idx + 5, line4After1.length); i++) {
    const char = line4After1[i];
    const code = char.charCodeAt(0);
    const matchesClass = /[^""\n）」』\s]/.test(char);
    console.log(`  ${i}: "${char}" (${code}) - matches [^""\n）」』\s]: ${matchesClass}`);
  }
}
