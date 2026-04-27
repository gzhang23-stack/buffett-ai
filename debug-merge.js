const fs = require('fs');
const data = require('./data/munger-models.json');

const model79 = data[78];
const lines = model79.content.split('\n');

console.log('Processing model 79...\n');

let fixed = [];

for (let i = 0; i < lines.length; i++) {
  const line = lines[i].trim();
  let merged = false;

  if (i === 4) {
    console.log(`\n=== Processing line ${i} ===`);
    console.log('Current line:', line);
    console.log('First char:', line[0], 'code:', line.charCodeAt(0));
    console.log('Starts with quote:', /^["""']/.test(line));

    if (/^["""']/.test(line)) {
      console.log('Looking for previous non-empty line...');
      for (let j = fixed.length - 1; j >= 0; j--) {
        const prevLine = fixed[j];
        console.log(`  Checking fixed[${j}]:`, prevLine ? prevLine.substring(0, 50) + '...' : '(empty)');

        if (prevLine) {
          const hasQuote = /["""']/.test(prevLine);
          const endsWithQuote = /["""']$/.test(prevLine);
          console.log(`    Has quote: ${hasQuote}, Ends with quote: ${endsWithQuote}`);

          if (hasQuote && !endsWithQuote) {
            console.log('    -> SHOULD MERGE!');
            fixed[j] = prevLine + line;
            merged = true;
            console.log('    -> Merged result:', fixed[j].substring(0, 100) + '...');
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

console.log('\n=== Result ===');
console.log('Total lines:', fixed.length);
console.log('Line 3:', fixed[2]);
console.log('Line 4:', fixed[3]);
console.log('Line 5:', fixed[4] || '(not exists)');

