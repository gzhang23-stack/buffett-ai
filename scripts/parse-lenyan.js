const mammoth = require('mammoth')
const fs = require('fs')
const path = require('path')

const docPath = path.join(__dirname, '../../data/other books/冷眼分享集.docx')
const outputPath = path.join(__dirname, '../data/lenyan.json')

async function parseDocument() {
  console.log('Reading document...')
  const result = await mammoth.extractRawText({ path: docPath })
  const text = result.value
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0)

  console.log(`Total lines: ${lines.length}`)

  // Find the start of actual content (after table of contents)
  let contentStart = 0
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('股票投资正道') && lines[i].includes('开场白') && i > 50) {
      contentStart = i
      console.log(`Content starts at line ${i}: ${lines[i]}`)
      break
    }
  }

  const articles = []
  let currentArticle = null
  let articleIndex = 0

  for (let i = contentStart; i < lines.length; i++) {
    const line = lines[i]
    const nextLine = i + 1 < lines.length ? lines[i + 1] : ''

    // Check if this is a title line (followed by a date or starts a new section)
    // Titles are usually followed by dates like "Thu, 07 Oct 2004"
    const isDateLine = /^(Mon|Tue|Wed|Thu|Fri|Sat|Sun),\s+\d{2}\s+\w+\s+\d{4}/.test(nextLine)

    // Or check if line looks like a title (not too long, has Chinese characters)
    const looksLikeTitle = line.length < 100 &&
                          line.length > 5 &&
                          /[一-龥]/.test(line) &&
                          !line.includes('www.') &&
                          !line.includes('http') &&
                          isDateLine

    if (looksLikeTitle) {
      // Save previous article
      if (currentArticle && currentArticle.content.trim().length > 200) {
        articles.push(currentArticle)
      }

      articleIndex++
      const title = line.trim()

      currentArticle = {
        slug: `lenyan-${articleIndex}`,
        index: articleIndex,
        title: title,
        content: '',
        date: nextLine
      }

      console.log(`Found article ${articleIndex}: ${title}`)
      i++ // Skip the date line
    } else if (currentArticle && line.length > 0) {
      // Skip lines that look like headers or footers
      if (line.includes('www.oomoney.com') ||
          line === '冷眼分享集' ||
          line === '（全）' ||
          line === '冷眼') {
        continue
      }

      // Add content to current article
      currentArticle.content += line + '\n\n'
    }
  }

  // Save last article
  if (currentArticle && currentArticle.content.trim().length > 200) {
    articles.push(currentArticle)
  }

  console.log(`\nTotal articles found: ${articles.length}`)

  // Clean up content and remove date field
  const cleanedArticles = articles.map(a => ({
    slug: a.slug,
    index: a.index,
    title: a.title,
    content: a.content.trim()
  }))

  // Write to JSON
  fs.writeFileSync(outputPath, JSON.stringify(cleanedArticles, null, 2), 'utf-8')
  console.log(`Written to ${outputPath}`)

  // Print first few articles for verification
  console.log('\nFirst 10 articles:')
  cleanedArticles.slice(0, 10).forEach(a => {
    console.log(`${a.index}. ${a.title} (${a.content.length} chars)`)
  })
}

parseDocument().catch(console.error)
