const mammoth = require('mammoth')
const fs = require('fs')
const path = require('path')

const docPath = 'd:/AI编程/claude测试/VS code claude/data/other books/怎样选择成长股.docx'
const outputPath = path.join(__dirname, '../data/growth-stock.json')

async function parseDocument() {
  console.log('Reading document...')
  const result = await mammoth.extractRawText({ path: docPath })
  const text = result.value
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0)

  console.log(`Total lines: ${lines.length}`)

  // Define chapters manually based on the structure
  const chapters = [
    { title: '引言：我从家父的文章中学到什么', start: 3, section: '引言' },
    { title: '序', start: 69, section: '怎样选择成长股' },
    { title: '第一章 过去提供的线索', start: 88, section: '怎样选择成长股' },
    { title: '第二章 "闲聊"有妙处', start: 165, section: '怎样选择成长股' },
    { title: '第三章 买进哪支股票——寻找优良普通股的15个要点', start: 195, section: '怎样选择成长股' },
    { title: '第四章 要买什么——应用所学选取所需', start: 380, section: '怎样选择成长股' },
    { title: '第五章 何时买进', start: 420, section: '怎样选择成长股' },
    { title: '第六章 何时卖出——以及何时不要卖出', start: 465, section: '怎样选择成长股' },
    { title: '第七章 股利杂音', start: 520, section: '怎样选择成长股' },
    { title: '第八章 投资人"五不"原则', start: 555, section: '怎样选择成长股' },
    { title: '第九章 投资人"另五不"原则', start: 606, section: '怎样选择成长股' },
    { title: '第十章 如何找到成长股', start: 730, section: '怎样选择成长股' },
    { title: '第十一章 汇总与结论', start: 765, section: '怎样选择成长股' },
    { title: '引言', start: 785, section: '保守型投资人夜夜安枕' },
    { title: '第一章 保守型投资的第一个要素——生产、行销、研究和财务', start: 797, section: '保守型投资人夜夜安枕' },
    { title: '第二章 第二个要素——人的因素', start: 835, section: '保守型投资人夜夜安枕' },
    { title: '第三章 第三个要素——若干企业的投资特征', start: 870, section: '保守型投资人夜夜安枕' },
    { title: '第四章 第四个要素——保守型投资的价格', start: 920, section: '保守型投资人夜夜安枕' },
    { title: '第五章 再论第四个要素', start: 950, section: '保守型投资人夜夜安枕' },
    { title: '第六章 三论第四个要素', start: 975, section: '保守型投资人夜夜安枕' },
    { title: '第一章 哲学的起源', start: 1030, section: '发展投资哲学' },
    { title: '第二章 从经验中学习', start: 1095, section: '发展投资哲学' },
    { title: '第三章 哲学成熟', start: 1160, section: '发展投资哲学' },
    { title: '第四章 市场效率真的很高?', start: 1215, section: '发展投资哲学' },
  ]

  const results = []

  for (let i = 0; i < chapters.length; i++) {
    const chapter = chapters[i]
    const nextChapter = i < chapters.length - 1 ? chapters[i + 1] : null
    const endLine = nextChapter ? nextChapter.start : lines.length

    let contentLines = []
    for (let lineIdx = chapter.start; lineIdx < endLine; lineIdx++) {
      if (lineIdx >= lines.length) break
      const line = lines[lineIdx]

      // Skip very short lines, page numbers, headers, watermarks
      if (
        line.length < 10 ||
        line.match(/^\d+$/) ||
        line.match(/^第[一二三四五六七八九十]+章/) ||
        line.includes('怎样选择成长股') && line.length < 20 ||
        line.match(/^[①②③④⑤⑥⑦⑧⑨]/) ||
        line.match(/^序\s*$/) ||
        line.match(/^引\s*言\s*$/) ||
        line.match(/^目\s*录\s*$/)
      ) {
        continue
      }

      contentLines.push(line)
    }

    // Smart merge: combine lines that should be together
    let content = ''
    for (let i = 0; i < contentLines.length; i++) {
      const line = contentLines[i]
      const nextLine = i < contentLines.length - 1 ? contentLines[i + 1] : null

      // Check if current line ends with sentence-ending punctuation
      const endsWithPunctuation = /[。！？…」』"'）\)～]$/.test(line)

      // Check if next line starts with lowercase or continues mid-sentence
      const nextContinues = nextLine && /^[，、；：]/.test(nextLine)

      if (endsWithPunctuation && !nextContinues) {
        // This line is complete, add paragraph break
        content += line + '\n\n'
      } else if (nextContinues) {
        // Next line continues with punctuation, merge without space
        content += line
      } else {
        // Merge lines that were broken mid-sentence
        content += line
      }
    }

    content = content.trim()

    if (content.length > 200) {
      results.push({
        slug: `growth-stock-${results.length + 1}`,
        index: results.length + 1,
        title: chapter.title,
        section: chapter.section,
        content: content
      })

      console.log(`${results.length}. ${chapter.section} - ${chapter.title} (${content.length} chars)`)
    }
  }

  console.log(`\nTotal chapters: ${results.length}`)

  // Write to JSON
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2), 'utf-8')
  console.log(`Written to ${outputPath}`)
}

parseDocument().catch(console.error)
