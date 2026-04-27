const mammoth = require('mammoth');
const fs = require('fs');
const path = require('path');

const docPath = path.join('d:', 'AI编程', 'claude测试', 'VS code claude', 'data', 'other books', '穷查理宝典.docx');

console.log('Reading 穷查理宝典...');

mammoth.extractRawText({ path: docPath })
  .then(result => {
    const text = result.value;
    console.log('Document length:', text.length);
    console.log('\nFirst 3000 characters:');
    console.log(text.substring(0, 3000));

    // Save to file
    fs.writeFileSync('charlie_raw.txt', text, 'utf-8');
    console.log('\nSaved to charlie_raw.txt');

    // Find potential chapter markers
    console.log('\n=== Looking for chapter markers ===');
    const lines = text.split('\n').slice(0, 200);
    lines.forEach((line, i) => {
      const trimmed = line.trim();
      if (trimmed.length > 0 && trimmed.length < 100 &&
          (trimmed.includes('第') || trimmed.includes('章') || trimmed.includes('讲') ||
           trimmed.match(/^[一二三四五六七八九十]+[、．]/))) {
        console.log(`Line ${i}: ${trimmed}`);
      }
    });
  })
  .catch(err => {
    console.error('Error:', err);
  });
