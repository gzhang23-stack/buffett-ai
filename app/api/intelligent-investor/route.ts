import { NextRequest, NextResponse } from 'next/server'
import { getAllIntelligentInvestorChapters, getIntelligentInvestorChapterBySlug, searchIntelligentInvestorChapters } from '@/lib/intelligent-investor'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)

  if (searchParams.has('chapters')) {
    const chapters = getAllIntelligentInvestorChapters()
    return NextResponse.json({ chapters })
  }

  if (searchParams.has('slug')) {
    const slug = searchParams.get('slug')!
    const chapter = getIntelligentInvestorChapterBySlug(slug)
    if (!chapter) return NextResponse.json({ error: 'Chapter not found' }, { status: 404 })
    return NextResponse.json({ chapter })
  }

  if (searchParams.has('q')) {
    const query = searchParams.get('q')!
    const results = searchIntelligentInvestorChapters(query)
    return NextResponse.json({ results })
  }

  return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
}
