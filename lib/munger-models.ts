import mungerModelsData from '@/data/munger-models.json'

export interface MungerModel {
  slug: string
  index: number
  title: string
  content: string
}

const models = mungerModelsData as MungerModel[]

export function getAllMungerModels(): MungerModel[] {
  return models
}

export function getMungerModelBySlug(slug: string): MungerModel | null {
  return models.find(m => m.slug === slug) || null
}

export function searchMungerModels(query: string, topK = 8) {
  const q = query.toLowerCase()
  const results = models
    .map(model => {
      let score = 0
      const titleLower = model.title.toLowerCase()
      const contentLower = model.content.toLowerCase()

      if (titleLower.includes(q)) score += 10
      if (contentLower.includes(q)) score += contentLower.split(q).length - 1

      const excerptStart = contentLower.indexOf(q)
      const excerpt = excerptStart >= 0
        ? model.content.substring(Math.max(0, excerptStart - 50), excerptStart + 150)
        : model.content.substring(0, 200)

      return { model, score, excerpt }
    })
    .filter(r => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)

  return results
}
