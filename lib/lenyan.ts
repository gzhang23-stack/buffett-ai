import lenyanData from '@/data/lenyan.json'

export interface LenyanArticle {
  slug: string
  index: number
  title: string
  content: string
}

const articles = lenyanData as LenyanArticle[]

export function getAllLenyanArticles(): LenyanArticle[] {
  return articles
}

export function getLenyanBySlug(slug: string): LenyanArticle | null {
  return articles.find(a => a.slug === slug) || null
}

export function searchLenyan(query: string, topK = 8) {
  const q = query.toLowerCase()
  const results = articles
    .map(article => {
      let score = 0
      const titleLower = article.title.toLowerCase()
      const contentLower = article.content.toLowerCase()

      if (titleLower.includes(q)) score += 10
      if (contentLower.includes(q)) score += contentLower.split(q).length - 1

      const excerptStart = contentLower.indexOf(q)
      const excerpt = excerptStart >= 0
        ? article.content.substring(Math.max(0, excerptStart - 50), excerptStart + 150)
        : article.content.substring(0, 200)

      return { article, score, excerpt }
    })
    .filter(r => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)

  return results
}

