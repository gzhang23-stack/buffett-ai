const mammoth = require('mammoth')
const fs = require('fs')
const path = require('path')

const docxPath = path.join(__dirname, '../../data/other books/段永平投资问答录-投资逻辑篇.docx')

mammoth.extractRawText({ path: docxPath })
  .then(result => {
    const text = result.value
    const lines = text.split('\n').map(line => line.trim()).filter(line => line)

    // 找到内容开始位置（第一章后面的实际内容）
    let contentStartIndex = -1
    for (let i = 0; i < lines.length; i++) {
      if (lines[i] === '第一章  投资理念' && i > 60) {
        contentStartIndex = i
        break
      }
    }

    if (contentStartIndex === -1) {
      console.error('找不到内容开始位置')
      return
    }

    const articles = []
    let currentChapter = null
    let currentSection = null
    let currentContent = []

    for (let i = contentStartIndex; i < lines.length; i++) {
      const line = lines[i]

      // 检测章节标题
      if (line.match(/^第[一二三四五六七八九十]+章\s+/)) {
        currentChapter = line
        continue
      }

      // 检测小节标题
      if (line.match(/^第\s*\d+\s*节\s+/)) {
        // 保存之前的section
        if (currentSection && currentContent.length > 0) {
          articles.push({
            chapter: currentChapter,
            section: currentSection,
            content: currentContent.join('\n\n')
          })
        }
        currentSection = line
        currentContent = []
        continue
      }

      // 检测案例标题
      if (line.match(/^案例\s*\d+[：:]/)) {
        if (currentSection && currentContent.length > 0) {
          articles.push({
            chapter: currentChapter,
            section: currentSection,
            content: currentContent.join('\n\n')
          })
        }
        currentSection = line
        currentContent = []
        continue
      }

      // 停止条件
      if (line === '结尾' || line === '附录') {
        break
      }

      // 收集内容
      if (currentSection && line.length > 0) {
        // 跳过章节引言（在第一个小节之前的内容）
        currentContent.push(line)
      }
    }

    // 保存最后一个section
    if (currentSection && currentContent.length > 0) {
      articles.push({
        chapter: currentChapter,
        section: currentSection,
        content: currentContent.join('\n\n')
      })
    }

    // 生成最终数据
    const finalArticles = articles.map((article, index) => ({
      slug: `dyp-${index + 1}`,
      index: index + 1,
      chapter: article.chapter,
      section: article.section,
      content: article.content
    }))

    // 保存到文件
    const outputPath = path.join(__dirname, '../data/dyp.json')
    fs.writeFileSync(outputPath, JSON.stringify(finalArticles, null, 2))

    console.log(`✓ 成功解析 ${finalArticles.length} 篇文章`)
    console.log('\n前3篇预览:')
    finalArticles.slice(0, 3).forEach(a => {
      console.log(`\n${a.chapter} > ${a.section}`)
      console.log(`内容长度: ${a.content.length} 字符`)
    })
  })
  .catch(err => {
    console.error('Error:', err)
  })
