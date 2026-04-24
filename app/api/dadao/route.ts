import { NextRequest, NextResponse } from 'next/server'
import { getAllDadaoArticles, getDadaoChapters, getDadaoBySlug, searchDadao } from '@/lib/dadao'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)

  // Get chapters list
  if (searchParams.get('chapters') === '1') {
    const chapters = getDadaoChapters()
    return NextResponse.json({ chapters })
  }

  // Get all articles metadata
  if (searchParams.get('articles') === '1') {
    const articles = getAllDadaoArticles().map(a => ({
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
    const results = searchDadao(q)
    return NextResponse.json({ results })
  }

  // Get single article by slug
  const slug = searchParams.get('slug')
  if (slug) {
    const article = getDadaoBySlug(slug)
    if (!article) {
      return NextResponse.json({ error: '文章未找到' }, { status: 404 })
    }
    return NextResponse.json({ article })
  }

  return NextResponse.json({ error: '无效请求' }, { status: 400 })
}
