const mammoth = require('mammoth');
const fs = require('fs');
const path = require('path');

const docPath = path.join('d:', 'AI编程', 'claude测试', 'VS code claude', 'data', 'other books', '段永平投资问答录-商业逻辑篇.docx');

console.log('Reading Word document...');

mammoth.extractRawText({ path: docPath })
  .then(result => {
    const text = result.value;
    console.log('Document length:', text.length);
    console.log('\nFirst 2000 characters:');
    console.log(text.substring(0, 2000));

    // Save to file for inspection
    fs.writeFileSync('duan_biz_raw.txt', text, 'utf-8');
    console.log('\nSaved to duan_biz_raw.txt');
  })
  .catch(err => {
    console.error('Error:', err);
  });
