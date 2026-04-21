import { NextRequest, NextResponse } from 'next/server'
import { getAllChapters, getChapterBySlug, searchChapters } from '@/lib/munger'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)

  // 获取所有章节元数据
  if (searchParams.has('chapters')) {
    const chapters = getAllChapters()
    return NextResponse.json({ chapters })
  }

  // 按 slug 获取章节内容
  if (searchParams.has('slug')) {
    const slug = searchParams.get('slug')!
    const content = getChapterBySlug(slug)
    if (!content) {
      return NextResponse.json({ error: 'Chapter not found' }, { status: 404 })
    }
    return NextResponse.json({ content })
  }

  // 搜索章节
  if (searchParams.has('q')) {
    const query = searchParams.get('q')!
    const results = searchChapters(query)
    return NextResponse.json({ results })
  }

  return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
}
