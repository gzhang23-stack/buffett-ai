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

  // Find article titles - look for patterns like numbered titles or date patterns
  const articles = []

  // Try to identify title patterns by examining first 50 lines
  console.log('\nFirst 50 lines:')
  lines.slice(0, 50).forEach((line, i) => {
    console.log(`${i}: ${line.substring(0, 100)}`)
  })

  // Look for common patterns
  const patterns = [
    /^第[一二三四五六七八九十百]+[章节篇]/,  // 第X章/节/篇
    /^\d+[、\.]\s*(.+)/,  // 1. Title or 1、Title
    /^[一二三四五六七八九十]+[、\.]\s*(.+)/,  // 一、Title
    /^\d{4}年/,  // Year pattern
  ]

  console.log('\n\nSearching for title patterns...')

  let currentArticle = null
  let articleIndex = 0

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    // Skip table of contents
    if (line === '目录' || line.includes('目录')) {
      continue
    }

    // Check each pattern
    let isTitle = false
    let titleText = line

    for (const pattern of patterns) {
      const match = line.match(pattern)
      if (match) {
        isTitle = true
        titleText = match[1] || line
        break
      }
    }

    // Also check if line is short and followed by content (heuristic for titles)
    if (!isTitle && line.length < 80 && line.length > 5 && i < lines.length - 1) {
      const nextLine = lines[i + 1]
      if (nextLine.length > 50) {
        isTitle = true
        titleText = line
      }
    }

    if (isTitle) {
      // Save previous article
      if (currentArticle && currentArticle.content.trim().length > 200) {
        articles.push(currentArticle)
      }

      articleIndex++
      currentArticle = {
        slug: `buffett-article-${articleIndex}`,
        index: articleIndex,
        title: titleText.trim(),
        content: ''
      }

      console.log(`Found article ${articleIndex}: ${titleText.substring(0, 60)}`)
    } else if (currentArticle) {
      // Skip common footers
      if (line === '（完）' || line.match(/^\d+$/) || line.includes('www.')) {
        continue
      }

      currentArticle.content += line + '\n\n'
    }
  }

  // Save last article
  if (currentArticle && currentArticle.content.trim().length > 200) {
    articles.push(currentArticle)
  }

  console.log(`\nTotal articles found: ${articles.length}`)

  // Clean up content
  const cleanedArticles = articles.map(a => ({
    slug: a.slug,
    index: a.index,
    title: a.title,
    content: a.content.trim()
  }))

  // Write to JSON
  fs.writeFileSync(outputPath, JSON.stringify(cleanedArticles, null, 2), 'utf-8')
  console.log(`Written to ${outputPath}`)

  // Print summary
  console.log('\nAll articles:')
  cleanedArticles.forEach(a => {
    console.log(`${a.index}. ${a.title} (${a.content.length} chars)`)
  })
}

parseDocument().catch(console.error)
