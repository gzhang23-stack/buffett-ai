const mammoth = require('mammoth')
const fs = require('fs')
const path = require('path')

const docPath = 'd:/AI编程/claude测试/VS code claude/data/other books/三十年股票投资心得.docx'
const outputPath = path.join(__dirname, '../data/30years-stock.json')

async function parseDocument() {
  console.log('Reading document...')
  const result = await mammoth.extractRawText({ path: docPath })
  const text = result.value
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0)

  console.log(`Total lines: ${lines.length}`)

  // First, let's examine the structure
  console.log('\nFirst 100 lines:')
  lines.slice(0, 100).forEach((line, idx) => {
    console.log(`${idx}: ${line.substring(0, 80)}`)
  })
}

parseDocument().catch(console.error)
