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

  // Define chapters based on table of contents
  const chapters = [
    { title: '导言：本书的目的', start: 108 },
    { title: '第1章 投资与投机：聪明投资者的预期收益', start: 165 },
    { title: '第2章 投资者与通货膨胀', start: 261 },
    { title: '第3章 一个世纪的股市历史：1972年年初的股价水平', start: 448 },
    { title: '第4章 防御型投资者的投资组合策略', start: 877 },
    { title: '第5章 防御型投资者与普通股', start: 964 },
    { title: '第6章 积极型投资者的证券组合策略：被动的方法', start: 1028 },
    { title: '第7章 积极型投资者的证券组合策略：主动的方法', start: 1097 },
    { title: '第8章 投资者与市场波动', start: 1372 },
    { title: '第9章 基金投资', start: 1554 },
    { title: '第10章 投资者与投资顾问', start: 1934 },
    { title: '第11章 普通投资者证券分析的一般方法', start: 2022 },
    { title: '第12章 对每股利润的思考', start: 2485 },
    { title: '第13章 对四家上市公司的比较', start: 2587 },
    { title: '第14章 防御型投资者的股票选择', start: 2789 },
    { title: '第15章 积极型投资者的股票选择', start: 3829 },
    { title: '第16章 可转换证券及认股权证', start: 4078 },
    { title: '第17章 四个非常有启发的案例', start: 4300 },
    { title: '第18章 对八组公司的比较', start: 4466 },
    { title: '第19章 股东与管理层：股息政策', start: 5333 },
    { title: '第20章 作为投资中心思想的"安全边际"', start: 5375 },
  ]

  const results = []

  for (let i = 0; i < chapters.length; i++) {
    const chapter = chapters[i]
    const nextChapter = i < chapters.length - 1 ? chapters[i + 1] : null
    const endLine = nextChapter ? nextChapter.start : Math.min(chapter.start + 500, lines.length)

    let content = ''
    for (let lineIdx = chapter.start + 1; lineIdx < endLine; lineIdx++) {
      const line = lines[lineIdx]

      // Skip page headers/footers (chapter titles repeated)
      if (line.match(/^第\s*\d+\s*章/) ||
          line.match(/^导言：本书的目的/) ||
          line.match(/^\d+$/) ||
          line.length < 10) {
        continue
      }

      content += line + '\n\n'
    }

    content = content.trim()

    if (content.length > 200) {
      results.push({
        slug: `intelligent-investor-${results.length + 1}`,
        index: results.length + 1,
        title: chapter.title,
        content: content
      })

      console.log(`${results.length}. ${chapter.title} (${content.length} chars)`)
    }
  }

  console.log(`\nTotal chapters: ${results.length}`)

  // Write to JSON
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2), 'utf-8')
  console.log(`Written to ${outputPath}`)
}

parseDocument().catch(console.error)
