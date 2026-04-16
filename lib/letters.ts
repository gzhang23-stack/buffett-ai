import fs from 'fs'
import path from 'path'
import type { Letter, SearchResult } from '@/types'

// 支持多个数据目录，依次查找（相对于 buffett-ai/ 项目根）
const DATA_DIRS = [
  path.join(process.cwd(), '..', 'data', 'texts'),   // VS code claude/data/texts
  path.join(process.cwd(), '..', 'data', 'letters'),  // VS code claude/data/letters
  path.join(process.cwd(), 'data', 'texts'),
  path.join(process.cwd(), 'data', 'letters'),
  path.join(process.cwd(), 'data'),
]

/** 从文件名中提取年份，支持多种命名格式：
 *  2020.txt / buffett_letter_2020.txt / letter_2020.txt / 2020ltr.txt 等
 */
function extractYear(filename: string): number | null {
  const match = filename.match(/\b(19[6-9]\d|20[0-2]\d)\b/)
  return match ? parseInt(match[1], 10) : null
}

/** 把长文本按段落切分成若干 chunk，每个 chunk 约 800 字 */
function chunkText(text: string, year: number, chunkSize = 800): Letter[] {
  const paragraphs = text.split(/\n\s*\n/).filter((p) => p.trim().length > 50)
  const chunks: Letter[] = []
  let buffer = ''
  let chunkIndex = 0

  for (const para of paragraphs) {
    if (buffer.length + para.length > chunkSize && buffer.length > 0) {
      chunks.push({
        id: `${year}-${chunkIndex++}`,
        year,
        title: `${year} 年致股东信`,
        content: buffer.trim(),
      })
      buffer = ''
    }
    buffer += '\n\n' + para
  }

  if (buffer.trim().length > 0) {
    chunks.push({
      id: `${year}-${chunkIndex}`,
      year,
      title: `${year} 年致股东信`,
      content: buffer.trim(),
    })
  }

  return chunks
}

/** 读取所有信件，返回 Letter 数组（每封信按段落切分） */
export function getAllLetters(): Letter[] {
  const letters: Letter[] = []

  for (const dir of DATA_DIRS) {
    if (!fs.existsSync(dir)) continue

    const files = fs.readdirSync(dir).filter((f) => f.endsWith('.txt'))
    if (files.length === 0) continue

    for (const file of files) {
      const year = extractYear(file)
      if (!year) continue

      const filePath = path.join(dir, file)
      const text = fs.readFileSync(filePath, 'utf-8')
      const chunks = chunkText(text, year)
      letters.push(...chunks)
    }

    // 找到数据就停止
    if (letters.length > 0) break
  }

  return letters
}

/** 简单的关键词打分搜索：对每个 chunk 计算关键词命中次数 */
export function searchLetters(query: string, letters: Letter[], topK = 5): SearchResult[] {
  const keywords = query
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => w.length > 2)

  if (keywords.length === 0) return []

  const scored = letters.map((letter) => {
    const text = letter.content.toLowerCase()
    let score = 0
    for (const kw of keywords) {
      // 计算每个关键词出现次数
      const count = (text.match(new RegExp(kw, 'g')) || []).length
      score += count
    }
    return { letter, score }
  })

  // 按分数排序，取前 topK
  const top = scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)

  return top.map(({ letter, score }) => {
    // 生成摘录：取内容前 300 字
    const excerpt = letter.content.slice(0, 300).replace(/\s+/g, ' ').trim() + '...'
    return {
      letter,
      similarity: score,
      excerpt,
    }
  })
}

/** 把搜索结果拼接成给 Claude 的 context 字符串 */
export function buildContext(results: SearchResult[]): string {
  if (results.length === 0) return 'No relevant passages found.'

  return results
    .map(
      (r, i) =>
        `[来源 ${i + 1}：${r.letter.year} 年致股东信]\n${r.letter.content}`
    )
    .join('\n\n---\n\n')
}
