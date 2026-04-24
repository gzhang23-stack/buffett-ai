const mammoth = require('mammoth')
const path = require('path')

async function analyzeDocument(docPath, bookName) {
  console.log(`\n=== Analyzing ${bookName} ===\n`)

  const result = await mammoth.extractRawText({ path: docPath })
  const lines = result.value.split('\n').map(l => l.trim()).filter(l => l)

  console.log(`Total lines: ${lines.length}`)

  // Find where content starts (after TOC)
  console.log('\nFirst 100 lines:')
  lines.slice(0, 100).forEach((line, i) => {
    console.log(`${i}: ${line.substring(0, 80)}`)
  })

  // Look for patterns
  console.log('\n\nLooking for section patterns:')
  const sectionPatterns = []
  lines.forEach((line, i) => {
    if (line.match(/^第\d+节[：:]/)) {
      sectionPatterns.push({ index: i, line })
    }
    if (line.match(/^第[一二三四五六七八九十]+章/)) {
      sectionPatterns.push({ index: i, line })
    }
    if (line.match(/^[一二三四五六七八九十]+、/)) {
      sectionPatterns.push({ index: i, line })
    }
  })

  console.log('Found patterns:')
  sectionPatterns.slice(0, 30).forEach(p => {
    console.log(`  Line ${p.index}: ${p.line}`)
  })
}

async function main() {
  const bizPath = path.join(__dirname, '../../data/other books/段永平投资问答录-商业逻辑篇.docx')
  const investPath = path.join(__dirname, '../../data/other books/段永平投资问答录-投资逻辑篇.docx')

  await analyzeDocument(bizPath, 'Business Logic')
  await analyzeDocument(investPath, 'Investment Logic')
}

main()
