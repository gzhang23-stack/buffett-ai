const mammoth = require('mammoth')
const fs = require('fs')
const path = require('path')

const docPath = 'd:/AI编程/claude测试/VS code claude/data/other books/巴菲特大学演讲记录.docx'
const outputPath = path.join(__dirname, '../data/buffett-lectures.json')

async function parseDocument() {
  console.log('Reading document...')
  const result = await mammoth.extractRawText({ path: docPath })
  const text = result.value
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0)

  console.log(`Total lines: ${lines.length}`)

  // Find lecture titles - they start with Chinese numbers like "一 ："、"二 ："
  const lectures = []
  const titlePattern = /^[一二三四五六七八九十]+ ：(.+)/

  let currentLecture = null
  let skipUntilNextTitle = false

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    // Skip table of contents
    if (line === '目录' || (i < 20 && line.match(/\t/))) {
      continue
    }

    // Check if this is a lecture title
    const titleMatch = line.match(titlePattern)

    if (titleMatch) {
      // Save previous lecture
      if (currentLecture && currentLecture.content.trim().length > 200) {
        lectures.push(currentLecture)
      }

      const title = titleMatch[1].trim()
      const index = lectures.length + 1

      currentLecture = {
        slug: `buffett-lecture-${index}`,
        index: index,
        title: title,
        content: ''
      }

      console.log(`Found lecture ${index}: ${title}`)
      skipUntilNextTitle = false
    } else if (currentLecture && !skipUntilNextTitle) {
      // Skip common headers/footers
      if (line === '（完）' ||
          line.match(/^\d+$/) ||
          line.includes('www.')) {
        continue
      }

      // Add content
      currentLecture.content += line + '\n\n'
    }
  }

  // Save last lecture
  if (currentLecture && currentLecture.content.trim().length > 200) {
    lectures.push(currentLecture)
  }

  console.log(`\nTotal lectures found: ${lectures.length}`)

  // Clean up content
  const cleanedLectures = lectures.map(l => ({
    slug: l.slug,
    index: l.index,
    title: l.title,
    content: l.content.trim()
  }))

  // Write to JSON
  fs.writeFileSync(outputPath, JSON.stringify(cleanedLectures, null, 2), 'utf-8')
  console.log(`Written to ${outputPath}`)

  // Print summary
  console.log('\nAll lectures:')
  cleanedLectures.forEach(l => {
    console.log(`${l.index}. ${l.title} (${l.content.length} chars)`)
  })
}

parseDocument().catch(console.error)
