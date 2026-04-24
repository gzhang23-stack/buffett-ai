const fs = require('fs')
const path = require('path')

const inputPath = path.join(__dirname, '../data/lenyan.json')
const outputPath = path.join(__dirname, '../data/lenyan.json')

function cleanTitle(title) {
  // 移除 (第 X 篇)、(第X篇)、(完结篇) 等标注
  let cleaned = title
    .replace(/\s*\(第\s*\d+\s*篇\)/g, '')  // (第 1 篇) 或 (第1篇)
    .replace(/\s*\(完结篇\)/g, '')         // (完结篇)
    .replace(/\s*（第\s*\d+\s*篇）/g, '')  // 中文括号版本
    .replace(/\s*（完结篇）/g, '')         // 中文括号版本
    .trim()

  return cleaned
}

async function cleanTitles() {
  console.log('Reading lenyan.json...')
  const articles = JSON.parse(fs.readFileSync(inputPath, 'utf-8'))

  let cleanedCount = 0
  const cleanedArticles = articles.map(article => {
    const originalTitle = article.title
    const cleanedTitle = cleanTitle(originalTitle)

    if (originalTitle !== cleanedTitle) {
      console.log(`[${article.index}] ${originalTitle} → ${cleanedTitle}`)
      cleanedCount++
    }

    return {
      ...article,
      title: cleanedTitle
    }
  })

  fs.writeFileSync(outputPath, JSON.stringify(cleanedArticles, null, 2), 'utf-8')
  console.log(`\nCleaned ${cleanedCount} titles`)
  console.log(`Written to ${outputPath}`)
}

cleanTitles().catch(console.error)
