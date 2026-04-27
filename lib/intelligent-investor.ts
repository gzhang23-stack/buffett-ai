import intelligentInvestorData from '@/data/intelligent-investor.json'

export interface IntelligentInvestorChapter {
  slug: string
  index: number
  title: string
  content: string
}

const chapters = intelligentInvestorData as IntelligentInvestorChapter[]

export function getAllIntelligentInvestorChapters(): IntelligentInvestorChapter[] {
  return chapters
}

export function getIntelligentInvestorChapterBySlug(slug: string): IntelligentInvestorChapter | null {
  return chapters.find(c => c.slug === slug) || null
}

export function searchIntelligentInvestorChapters(query: string, topK = 8) {
  const q = query.toLowerCase()
  const results = chapters
    .map(chapter => {
      let score = 0
      const titleLower = chapter.title.toLowerCase()
      const contentLower = chapter.content.toLowerCase()

      if (titleLower.includes(q)) score += 10
      if (contentLower.includes(q)) score += contentLower.split(q).length - 1

      const excerptStart = contentLower.indexOf(q)
      const excerpt = excerptStart >= 0
        ? chapter.content.substring(Math.max(0, excerptStart - 50), excerptStart + 150)
        : chapter.content.substring(0, 200)

      return { chapter, score, excerpt }
    })
    .filter(r => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)

  return results
}
