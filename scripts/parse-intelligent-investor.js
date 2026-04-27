const mammoth = require('mammoth')
const fs = require('fs')
const path = require('path')

const docPath = 'd:/AI编程/claude测试/VS code claude/data/other books/聪明的投资者.docx'
const outputPath = path.join(__dirname, '../data/intelligent-investor.json')

async function parseDocument() {
  console.log('Reading document...')
  const result = await mammoth.extractRawText({ path: docPath })
  const text = result.value
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0)

  console.log(`Total lines: ${lines.length}`)

  // Print first 100 lines to understand structure
  console.log('\nFirst 100 lines:')
  for (let i = 0; i < Math.min(100, lines.length); i++) {
    console.log(`${i}: ${lines[i].substring(0, 100)}`)
  }
}

parseDocument().catch(console.error)
