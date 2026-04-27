const mammoth = require('mammoth')
const fs = require('fs')
const path = require('path')

const docPath = 'd:/AI编程/claude测试/VS code claude/data/other books/巴菲特文章和访谈资料集.docx'
const outputPath = path.join(__dirname, '../data/buffett-articles.json')

async function parseDocument() {
  console.log('Reading document...')
  const result = await mammoth.extractRawText({ path: docPath })
  const text = result.value
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0)

  console.log(`Total lines: ${lines.length}`)

  // Step 1: Extract titles from table of contents (first 50 lines)
  const titles = []
  const tocPattern = /^(\d{4}\s*年.*?)[\t\s]+\d+$/  // Year + title + page number

  console.log('\nExtracting titles from table of contents...')
  for (let i = 0; i < Math.min(50, lines.length); i++) {
    const line = lines[i]
    const match = line.match(tocPattern)
    if (match) {
      const title = match[1].trim()
      titles.push(title)
      console.log(`TOC ${titles.length}: ${title}`)
    }
  }

  console.log(`\nFound ${titles.length} titles in table of contents`)

  // Step 2: Find each title in the document body and extract content
  const articles = []

  for (let titleIdx = 0; titleIdx < titles.length; titleIdx++) {
    const title = titles[titleIdx]
    const nextTitle = titleIdx < titles.length - 1 ? titles[titleIdx + 1] : null

    // Find where this title appears in the body
    let startIdx = -1
    for (let i = 50; i < lines.length; i++) {
      if (lines[i].includes(title) || lines[i] === title) {
        startIdx = i
        break
      }
    }

    if (startIdx === -1) {
      console.log(`Warning: Could not find title in body: ${title}`)
      continue
    }

    // Find where next title starts (or end of document)
    let endIdx = lines.length
    if (nextTitle) {
      for (let i = startIdx + 1; i < lines.length; i++) {
        if (lines[i].includes(nextTitle) || lines[i] === nextTitle) {
          endIdx = i
          break
        }
      }
    }

    // Extract content between startIdx and endIdx
    let content = ''
    for (let i = startIdx + 1; i < endIdx; i++) {
      const line = lines[i]

      // Skip common footers and page numbers
      if (line === '（完）' ||
          line.match(/^\d+$/) ||
          line.includes('www.') ||
          line.length < 10) {
        continue
      }

      content += line + '\n\n'
    }

    content = content.trim()

    if (content.length > 200) {
      articles.push({
        slug: `buffett-article-${articles.length + 1}`,
        index: articles.length + 1,
        title: title,
        content: content
      })

      console.log(`Article ${articles.length}: ${title} (${content.length} chars)`)
    } else {
      console.log(`Skipped (too short): ${title} (${content.length} chars)`)
    }
  }

  console.log(`\nTotal articles extracted: ${articles.length}`)

  // Write to JSON
  fs.writeFileSync(outputPath, JSON.stringify(articles, null, 2), 'utf-8')
  console.log(`Written to ${outputPath}`)

  // Print summary
  console.log('\nAll articles:')
  articles.forEach(a => {
    console.log(`${a.index}. ${a.title} (${a.content.length} chars)`)
  })
}

parseDocument().catch(console.error)
