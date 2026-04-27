import data from '@/data/30years-stock.json'

export interface ThirtyYearsStockArticle {
  slug: string
  index: number
  title: string
  content: string
}

const articles = data as ThirtyYearsStockArticle[]

export function getAllThirtyYearsStockArticles(): ThirtyYearsStockArticle[] {
  return articles
}

export function getThirtyYearsStockArticleBySlug(slug: string): ThirtyYearsStockArticle | null {
  return articles.find(a => a.slug === slug) || null
}

export function searchThirtyYearsStockArticles(query: string, topK = 8) {
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
