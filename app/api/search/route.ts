import { NextRequest } from 'next/server'
import { getAllLetters, searchLetters, getLetterYears, getLetterByYear } from '@/lib/letters'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const q = searchParams.get('q')
  const year = searchParams.get('year')
  const yearsOnly = searchParams.get('years')

  // Return year list (only years with readable data)
  if (yearsOnly) {
    const years = getLetterYears()
    return Response.json({ years })
  }

  // Return full cleaned text for a specific year
  if (year) {
    const y = parseInt(year, 10)
    if (isNaN(y)) {
      return Response.json({ error: 'Invalid year' }, { status: 400 })
    }
    const text = getLetterByYear(y)
    if (!text) {
      return Response.json({
        year: y,
        text: '',
        error: `${y} 年信件数据损坏或无法读取，该年份文件可能为二进制格式。`,
      })
    }
    return Response.json({ year: y, text })
  }

  // Keyword search
  if (!q || q.trim().length === 0) {
    return Response.json({ error: 'q parameter required' }, { status: 400 })
  }

  const letters = getAllLetters()
  const results = searchLetters(q, letters, 10)

  return Response.json({
    query: q,
    results: results.map((r) => ({
      year: r.letter.year,
      title: r.letter.title,
      excerpt: r.excerpt,
      score: r.similarity,
    })),
  })
}
