import { NextRequest, NextResponse } from 'next/server'
import { getAllBuffettLectures, getBuffettLectureBySlug, searchBuffettLectures } from '@/lib/buffett-lectures'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)

  if (searchParams.has('lectures')) {
    const lectures = getAllBuffettLectures()
    return NextResponse.json({ lectures })
  }

  if (searchParams.has('slug')) {
    const slug = searchParams.get('slug')!
    const lecture = getBuffettLectureBySlug(slug)
    if (!lecture) return NextResponse.json({ error: 'Lecture not found' }, { status: 404 })
    return NextResponse.json({ lecture })
  }

  if (searchParams.has('q')) {
    const query = searchParams.get('q')!
    const results = searchBuffettLectures(query)
    return NextResponse.json({ results })
  }

  return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
}
