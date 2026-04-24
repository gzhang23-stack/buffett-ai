import { NextRequest, NextResponse } from 'next/server'
import { getAllDypArticles, getDypChapters, getDypBySlug, searchDyp } from '@/lib/dyp'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)

  // Get chapters list
  if (searchParams.get('chapters') === '1') {
    const chapters = getDypChapters()
    return NextResponse.json({ chapters })
  }

  // Get all articles metadata
  if (searchParams.get('articles') === '1') {
    const articles = getAllDypArticles().map(a => ({
      slug: a.slug,
      index: a.index,
      chapter: a.chapter,
      section: a.section,
    }))
    return NextResponse.json({ articles })
  }

  // Search
  const q = searchParams.get('q')
  if (q) {
    const results = searchDyp(q)
    return NextResponse.json({ results })
  }

  // Get single article by slug
  const slug = searchParams.get('slug')
  if (slug) {
    const article = getDypBySlug(slug)
    if (!article) {
      return NextResponse.json({ error: '文章未找到' }, { status: 404 })
    }
    return NextResponse.json({ article })
  }

  return NextResponse.json({ error: '无效请求' }, { status: 400 })
}
