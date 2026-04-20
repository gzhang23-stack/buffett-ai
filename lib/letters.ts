import fs from 'fs'
import path from 'path'
import type { Letter, SearchResult } from '@/types'

// 中文数据目录（优先级最高）——先找项目内，再找项目外
const ZH_DATA_DIR = fs.existsSync(path.join(process.cwd(), 'data', 'zh'))
  ? path.join(process.cwd(), 'data', 'zh')
  : path.join(process.cwd(), '..', 'data', 'zh_txt')

// 英文数据目录（备用）
const DATA_DIRS = [
  path.join(process.cwd(), '..', 'data', 'texts'),
  path.join(process.cwd(), '..', 'data', 'letters'),
  path.join(process.cwd(), 'data', 'texts'),
  path.join(process.cwd(), 'data', 'letters'),
  path.join(process.cwd(), 'data'),
]

// ─── Text Cleaning ────────────────────────────────────────────────────────────

/** 判断 Buffer 是否是可读文本（ASCII比例 > 80%，或检测到有效 UTF-8 中文字符） */
function isReadableText(buf: Buffer): boolean {
  const sample = buf.slice(0, Math.min(buf.length, 512))
  let ascii = 0
  let validUtf8Multi = 0
  let invalidBytes = 0

  for (let i = 0; i < sample.length; ) {
    const b = sample[i]
    if ((b >= 0x09 && b <= 0x0d) || (b >= 0x20 && b <= 0x7e)) {
      ascii++
      i++
    } else if (b >= 0xc0 && b < 0xe0 && i + 1 < sample.length) {
      // 2-byte UTF-8
      validUtf8Multi += 2; i += 2
    } else if (b >= 0xe0 && b < 0xf0 && i + 2 < sample.length) {
      // 3-byte UTF-8 (CJK range)
      validUtf8Multi += 3; i += 3
    } else if (b >= 0xf0 && i + 3 < sample.length) {
      // 4-byte UTF-8
      validUtf8Multi += 4; i += 4
    } else {
      invalidBytes++; i++
    }
  }

  const total = sample.length
  // 纯 ASCII 文件 或 有效 UTF-8 多字节（中文等）占比合理
  if (ascii / total > 0.80) return true
  if (validUtf8Multi / total > 0.30 && invalidBytes / total < 0.10) return true
  return false
}

/** 修复常见的 Windows-1252 被误当 UTF-8 解码后产生的乱码（smart quotes 等），仅用于英文文件 */
function fixMojibake(text: string): string {
  return text
    .replace(/\u00e2\u0080\u0099/g, "'")   // â€™ → '
    .replace(/\u00e2\u0080\u009c/g, '"')   // â€œ → "
    .replace(/\u00e2\u0080\u009d/g, '"')   // â€ → "
    .replace(/\u00e2\u0080\u0093/g, '–')   // â€" → –
    .replace(/\u00e2\u0080\u0094/g, '—')   // â€" → —
    .replace(/\u00e2\u0080\u00a6/g, '…')   // â€¦ → …
    .replace(/\u00c2\u00a0/g, ' ')          // Â  → non-breaking space → space
    .replace(/\ufffd/g, '')                 // 替换 replacement char
}

/** 清洗从 HTML 源码中提取的文本（去掉 JS/CSS/标签） */
function stripHtml(text: string): string {
  // 移除 script 块
  text = text.replace(/<script[\s\S]*?<\/script>/gi, '')
  // 移除 style 块
  text = text.replace(/<style[\s\S]*?<\/style>/gi, '')
  // 移除 HTML 标签
  text = text.replace(/<[^>]+>/g, ' ')
  // 解码常见 HTML 实体
  text = text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&ldquo;/g, '"')
    .replace(/&rdquo;/g, '"')
    .replace(/&lsquo;/g, "'")
    .replace(/&rsquo;/g, "'")
    .replace(/&mdash;/g, '—')
    .replace(/&ndash;/g, '–')
    .replace(/&hellip;/g, '…')
  return text
}

/** 判断文本是否含有 HTML 结构 */
function looksLikeHtml(text: string): boolean {
  return /window\.dataLayer|<html|<!DOCTYPE|<head|<body|<script|<style/i.test(text.slice(0, 2000))
}

/** 清洗 PDF 提取文本（去掉数字表格头部，找正文起点） */
function cleanPdfText(text: string): string {
  const lines = text.split('\n')

  // 策略1：直接找 "To the Shareholders" 或 "BERKSHIRE HATHAWAY INC" 作为正文起点
  for (let i = 0; i < Math.min(lines.length, 120); i++) {
    const line = lines[i].trim()
    if (
      /^To the Shareholders/i.test(line) ||
      /^BERKSHIRE HATHAWAY INC/i.test(line) ||
      /^Dear Shareholders/i.test(line)
    ) {
      return lines.slice(i).join('\n')
    }
  }

  // 策略2：跳过看起来是数字表格/注释的前置内容，找第一个实质段落
  let startIdx = 0
  for (let i = 0; i < Math.min(lines.length, 120); i++) {
    const line = lines[i].trim()
    const isTableRow = /^[\d\s.,()%\-]+$/.test(line) || /\.{5,}/.test(line)
    const isHeader = /^(Note:|Year\s|Annual\s|Berkshire'?s\s(Corporate|Performance)|Per-Share|Book Value|S&P|Compounded|Overall Gain)/i.test(line)
    const isJunk = line.length < 4

    if (!isTableRow && !isHeader && !isJunk && line.length > 40 && /^[A-Z]/.test(line)) {
      // 确保这行后面还有更多正文（不是孤立标题）
      if (i + 1 < lines.length && lines[i + 1].trim().length > 20) {
        startIdx = i
        break
      }
    }
  }
  return lines.slice(startIdx).join('\n')
}

/** 全量清洗：读一个文件并返回干净文本，失败返回 null */
export function readAndCleanFile(filePath: string): string | null {
  let buf: Buffer
  try {
    buf = fs.readFileSync(filePath)
  } catch {
    return null
  }

  // 二进制文件：拒绝处理
  if (!isReadableText(buf)) return null

  let text = buf.toString('utf8')

  // HTML 源码：提取正文
  if (looksLikeHtml(text)) {
    text = stripHtml(text)
  }

  // 修复 Mojibake（仅英文文件需要，中文 utf8 文件跳过）
  const isZhFile = filePath.includes('zh_txt')
  if (!isZhFile) {
    text = fixMojibake(text)
  }

  // 清洗 PDF 提取文本（仅英文文件需要，中文文件跳过）
  if (!isZhFile) {
    text = cleanPdfText(text)
  }

  // 规范化空白
  text = text
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/\t/g, ' ')
    .replace(/[ \t]{3,}/g, '  ')       // 合并多余空格
    .replace(/\n{4,}/g, '\n\n\n')      // 最多三个连续换行
    .replace(/^\s+$/gm, '')            // 清除只含空白的行

  // 过滤掉太短的文本（清洗后剩余内容不足）
  const meaningful = text.replace(/\s/g, '').length
  if (meaningful < 100) return null

  return text.trim()
}

// ─── Year detection ───────────────────────────────────────────────────────────

function extractYear(filename: string): number | null {
  // 匹配 1950–2029 年（涵盖早期合伙人信，含1956）
  const match = filename.match(/\b(195[6-9]|19[6-9]\d|20[0-2]\d)\b/)
  return match ? parseInt(match[1], 10) : null
}

// ─── Find data dir ────────────────────────────────────────────────────────────

/** 返回中文 txt 目录（若存在且有文件） */
function findZhDir(): string | null {
  if (!fs.existsSync(ZH_DATA_DIR)) return null
  const files = fs.readdirSync(ZH_DATA_DIR).filter((f) => f.endsWith('.txt'))
  return files.length > 0 ? ZH_DATA_DIR : null
}

function findDataDir(): string | null {
  // 优先中文目录
  const zh = findZhDir()
  if (zh) return zh

  for (const dir of DATA_DIRS) {
    if (!fs.existsSync(dir)) continue
    const files = fs.readdirSync(dir).filter((f) => f.endsWith('.txt'))
    if (files.length > 0) return dir
  }
  return null
}

// ─── Chunking ─────────────────────────────────────────────────────────────────

function chunkText(text: string, year: number, chunkSize = 1000): Letter[] {
  const paragraphs = text.split(/\n\s*\n/).filter((p) => p.trim().length > 40)
  const chunks: Letter[] = []
  let buffer = ''
  let chunkIndex = 0

  const title = year <= 1969
    ? `${year} 年巴菲特合伙公司致合伙人信`
    : `${year} 年致伯克希尔股东信`

  for (const para of paragraphs) {
    if (buffer.length + para.length > chunkSize && buffer.length > 0) {
      chunks.push({
        id: `${year}-${chunkIndex++}`,
        year,
        title,
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
      title,
      content: buffer.trim(),
    })
  }

  return chunks
}

// ─── Public API ───────────────────────────────────────────────────────────────

/** 读取所有信件，返回 Letter 数组（每封信按段落切分） */
export function getAllLetters(): Letter[] {
  const dataDir = findDataDir()
  if (!dataDir) return []

  const letters: Letter[] = []
  const files = fs.readdirSync(dataDir).filter((f) => f.endsWith('.txt'))

  for (const file of files) {
    const year = extractYear(file)
    if (!year) continue

    const filePath = path.join(dataDir, file)
    const text = readAndCleanFile(filePath)
    if (!text) continue

    const chunks = chunkText(text, year)
    letters.push(...chunks)
  }

  return letters
}

/** 返���已有可读数据的年份列表（去重排序） */
export function getLetterYears(): number[] {
  const dataDir = findDataDir()
  if (!dataDir) return []

  const years: number[] = []
  const files = fs.readdirSync(dataDir).filter((f) => f.endsWith('.txt'))

  for (const file of files) {
    const year = extractYear(file)
    if (!year) continue
    const filePath = path.join(dataDir, file)
    const text = readAndCleanFile(filePath)
    if (text) years.push(year)
  }

  return years.sort((a, b) => a - b)
}

/** 读取某一年信件的完整清洗后文本（直接从文件读，不经过 chunk 系统） */
export function getLetterByYear(year: number): string {
  const dataDir = findDataDir()
  if (!dataDir) return ''

  // 找对应文件（支持多种命名格式）
  const files = fs.readdirSync(dataDir).filter((f) => f.endsWith('.txt'))
  for (const file of files) {
    const y = extractYear(file)
    if (y !== year) continue
    const text = readAndCleanFile(path.join(dataDir, file))
    return text ?? ''
  }
  return ''
}

/** 简单的关键词打分搜索：对每个 chunk 计算关键词命中次数 */
export function searchLetters(query: string, letters: Letter[], topK = 5): SearchResult[] {
  const keywords = query
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => w.length > 1)

  if (keywords.length === 0) return []

  const scored = letters.map((letter) => {
    const text = letter.content.toLowerCase()
    let score = 0
    for (const kw of keywords) {
      const count = (text.match(new RegExp(kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length
      score += count
    }
    return { letter, score }
  })

  const top = scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)

  return top.map(({ letter, score }) => {
    const excerpt = letter.content.slice(0, 300).replace(/\s+/g, ' ').trim() + '...'
    return { letter, similarity: score, excerpt }
  })
}

/** 把搜索结果拼接成给 AI 的 context 字符串 */
export function buildContext(results: SearchResult[]): string {
  if (results.length === 0) return 'No relevant passages found.'
  return results
    .map((r, i) => `[来源 ${i + 1}：${r.letter.year} 年致股东信]\n${r.letter.content}`)
    .join('\n\n---\n\n')
}

// ─── Sub-letter (slug) API ────────────────────────────────────────────────────

export interface LetterMeta {
  slug: string       // 文件名去掉 .txt，如 "1961年中" / "1965-berkshire" / "1977"
  year: number
  label: string      // 侧边栏显示名，如 "年中" / "11月" / "致股东信" / "年度信"
  type: 'partnership' | 'berkshire'
}

/** 从文件名提取元数据，仅处理 data/zh/ 目录下的 txt 文件 */
function metaFromFilename(filename: string): LetterMeta | null {
  const base = filename.replace(/\.txt$/, '')

  // 子信件：1961年中 / 1962年11月 / 1969年12月26日
  const subMatch = base.match(/^(\d{4})(年.+)$/)
  if (subMatch) {
    const year = parseInt(subMatch[1], 10)
    const suffix = subMatch[2]                 // "年中" / "年11月" / "年12月26日"
    return { slug: base, year, label: suffix, type: 'partnership' }
  }

  // 伯克希尔子信件：1965-berkshire
  const bkMatch = base.match(/^(\d{4})-berkshire$/)
  if (bkMatch) {
    const year = parseInt(bkMatch[1], 10)
    return { slug: base, year, label: '致股东信', type: 'berkshire' }
  }

  // 纯年份：1977 / 1960
  const yearMatch = base.match(/^(\d{4})$/)
  if (yearMatch) {
    const year = parseInt(yearMatch[1], 10)
    const type: 'partnership' | 'berkshire' = year <= 1969 ? 'partnership' : 'berkshire'
    return { slug: base, year, label: '年度信', type }
  }

  return null
}

/** 返回所有可读信件的元数据列表，按年份 + slug 排序 */
export function getAllLetterMetas(): LetterMeta[] {
  const dataDir = findDataDir()
  if (!dataDir) return []

  const files = fs.readdirSync(dataDir).filter((f) => f.endsWith('.txt'))
  const metas: LetterMeta[] = []

  for (const file of files) {
    const meta = metaFromFilename(file)
    if (!meta) continue
    const text = readAndCleanFile(path.join(dataDir, file))
    if (text) metas.push(meta)
  }

  return metas.sort((a, b) => {
    if (a.year !== b.year) return a.year - b.year
    return a.slug.localeCompare(b.slug)
  })
}

/** 按 slug 读取信件全文 */
export function getLetterBySlug(slug: string): string {
  const dataDir = findDataDir()
  if (!dataDir) return ''
  const filePath = path.join(dataDir, `${slug}.txt`)
  return readAndCleanFile(filePath) ?? ''
}
