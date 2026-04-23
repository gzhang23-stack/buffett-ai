import fs from 'fs'
import path from 'path'

export interface MungerDaoArticle {
  slug: string
  index: number
  part_zh: string
  title_zh: string
  year: number
  content: string
}

let _articles: MungerDaoArticle[] | null = null

function loadArticles(): MungerDaoArticle[] {
  if (_articles) return _articles
  const filePath = path.join(process.cwd(), 'data', 'munger_dao.json')
  const raw = fs.readFileSync(filePath, 'utf-8')
  _articles = JSON.parse(raw)
  return _articles!
}

export function getAllMungerDaoArticles(): MungerDaoArticle[] {
  return loadArticles()
}

export function getMungerDaoParts(): { part_zh: string; count: number }[] {
  const articles = loadArticles()
  const map = new Map<string, number>()
  for (const a of articles) {
    map.set(a.part_zh, (map.get(a.part_zh) ?? 0) + 1)
  }
  return Array.from(map.entries()).map(([part_zh, count]) => ({ part_zh, count }))
}

export function getMungerDaoBySlug(slug: string): MungerDaoArticle | null {
  return loadArticles().find(a => a.slug === slug) ?? null
}

export function searchMungerDao(query: string, topK = 8) {
  const keywords = query.toLowerCase().split(/\s+/).filter(w => w.length > 0)
  if (keywords.length === 0) return []

  const articles = loadArticles()
  const results: Array<{ article: MungerDaoArticle; score: number; excerpt: string }> = []

  for (const article of articles) {
    const fullText = [article.title_zh, article.part_zh, article.content].join(' ').toLowerCase()
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
