import buffettLecturesData from '@/data/buffett-lectures.json'

export interface BuffettLecture {
  slug: string
  index: number
  title: string
  content: string
}

const lectures = buffettLecturesData as BuffettLecture[]

export function getAllBuffettLectures(): BuffettLecture[] {
  return lectures
}

export function getBuffettLectureBySlug(slug: string): BuffettLecture | null {
  return lectures.find(l => l.slug === slug) || null
}

export function searchBuffettLectures(query: string, topK = 8) {
  const q = query.toLowerCase()
  const results = lectures
    .map(lecture => {
      let score = 0
      const titleLower = lecture.title.toLowerCase()
      const contentLower = lecture.content.toLowerCase()

      if (titleLower.includes(q)) score += 10
      if (contentLower.includes(q)) score += contentLower.split(q).length - 1

      const excerptStart = contentLower.indexOf(q)
      const excerpt = excerptStart >= 0
        ? lecture.content.substring(Math.max(0, excerptStart - 50), excerptStart + 150)
        : lecture.content.substring(0, 200)

      return { lecture, score, excerpt }
    })
    .filter(r => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)

  return results
}
