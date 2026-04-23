import fs from 'fs'
import path from 'path'

export interface UnscriptedEntry {
  meeting: string | null
  lines: string[]
}

export interface UnscriptedArticle {
  slug: string
  index: number
  title_en: string
  title_zh: string
  part_en: string
  part_zh: string
  entries: UnscriptedEntry[]
}

let _articles: UnscriptedArticle[] | null = null

function loadArticles(): UnscriptedArticle[] {
  if (_articles) return _articles
  const filePath = path.join(process.cwd(), 'data', 'unscripted_zh.json')
  const raw = fs.readFileSync(filePath, 'utf-8')
  _articles = JSON.parse(raw)
  return _articles!
}

export function getAllUnscriptedArticles(): UnscriptedArticle[] {
  return loadArticles()
}

export function getUnscriptedParts(): { part_en: string; part_zh: string; count: number }[] {
  const articles = loadArticles()
  const map = new Map<string, { part_en: string; part_zh: string; count: number }>()
  for (const a of articles) {
    if (!map.has(a.part_en)) {
      map.set(a.part_en, { part_en: a.part_en, part_zh: a.part_zh, count: 0 })
    }
    map.get(a.part_en)!.count++
  }
  return Array.from(map.values())
}

export function getUnscriptedBySlug(slug: string): UnscriptedArticle | null {
  const articles = loadArticles()
  return articles.find(a => a.slug === slug) ?? null
}

export function searchUnscripted(query: string, topK = 8) {
  const keywords = query.toLowerCase().split(/\s+/).filter(w => w.length > 0)
  if (keywords.length === 0) return []

  const articles = loadArticles()
  const results: Array<{ article: UnscriptedArticle; score: number; excerpt: string }> = []

  for (const article of articles) {
    const fullText = [
      article.title_zh,
      article.title_en,
      ...article.entries.flatMap(e => e.lines),
    ].join(' ').toLowerCase()

    let score = 0
    for (const kw of keywords) {
      const escaped = kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      const matches = fullText.match(new RegExp(escaped, 'g'))
      score += matches ? matches.length : 0
    }

    if (score > 0) {
      const kwIdx = fullText.indexOf(keywords[0])
      const excerptStart = Math.max(0, kwIdx - 30)
      const excerpt = fullText.slice(excerptStart, excerptStart + 180).trim() + '...'
      results.push({ article, score, excerpt })
    }
  }

  return results.sort((a, b) => b.score - a.score).slice(0, topK)
}
