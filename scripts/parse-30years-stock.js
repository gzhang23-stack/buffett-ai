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

  // Find table of contents section
  let tocStart = -1
  let tocEnd = -1

  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('目录') || lines[i] === '目录') {
      tocStart = i
    }
    if (tocStart > 0 && lines[i].includes('第一辑：股票与股市')) {
      // Show more lines to see the full TOC
      console.log('\nTable of Contents (next 150 lines):')
      for (let j = i; j < Math.min(i + 150, lines.length); j++) {
        console.log(`${j}: ${lines[j]}`)
      }
      break
    }
  }
}

parseDocument().catch(console.error)
