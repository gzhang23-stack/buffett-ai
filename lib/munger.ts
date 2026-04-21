import fs from 'fs'
import path from 'path'

const MUNGER_DIR = path.join(process.cwd(), 'data', 'munger')

export interface MungerChapter {
  slug: string
  year?: number
  title: string
  type: 'intro' | 'wesco' | 'daily-journal' | 'index'
}

// 章节元数据
export const MUNGER_CHAPTERS: MungerChapter[] = [
  { slug: 'publisher-note', title: '出版说明', type: 'intro' },
  // 西科金融 (1987-2010)
  { slug: '1987-wesco', year: 1987, title: '1987年 西科金融股东会讲话', type: 'wesco' },
  { slug: '1988-wesco', year: 1988, title: '1988年 西科金融股东会讲话', type: 'wesco' },
  { slug: '1989-wesco', year: 1989, title: '1989年 西科金融股东会讲话', type: 'wesco' },
  { slug: '1990-wesco', year: 1990, title: '1990年 西科金融股东会讲话', type: 'wesco' },
  { slug: '1991-wesco', year: 1991, title: '1991年 西科金融股东会讲话', type: 'wesco' },
  { slug: '1992-wesco', year: 1992, title: '1992年 西科金融股东会讲话', type: 'wesco' },
  { slug: '1993-wesco', year: 1993, title: '1993年 西科金融股东会讲话', type: 'wesco' },
  { slug: '1994-wesco', year: 1994, title: '1994年 西科金融股东会讲话', type: 'wesco' },
  { slug: '1995-wesco', year: 1995, title: '1995年 西科金融股东会讲话', type: 'wesco' },
  { slug: '1997-wesco', year: 1997, title: '1997年 西科金融股东会讲话', type: 'wesco' },
  { slug: '1998-wesco', year: 1998, title: '1998年 西科金融股东会讲话', type: 'wesco' },
  { slug: '1999-wesco', year: 1999, title: '1999年 西科金融股东会讲话', type: 'wesco' },
  { slug: '2000-wesco', year: 2000, title: '2000年 西科金融股东会讲话', type: 'wesco' },
  { slug: '2003-wesco', year: 2003, title: '2003年 西科金融股东会讲话', type: 'wesco' },
  { slug: '2007-wesco', year: 2007, title: '2007年 西科金融股东会讲话', type: 'wesco' },
  { slug: '2010-wesco', year: 2010, title: '2010年 西科金融股东会讲话', type: 'wesco' },
  // 每日期刊 (2014-2022)
  { slug: '2014-daily-journal', year: 2014, title: '2014年 每日期刊股东会讲话', type: 'daily-journal' },
  { slug: '2015-daily-journal', year: 2015, title: '2015年 每日期刊股东会讲话', type: 'daily-journal' },
  { slug: '2016-daily-journal', year: 2016, title: '2016年 每日期刊股东会讲话', type: 'daily-journal' },
  { slug: '2017-daily-journal', year: 2017, title: '2017年 每日期刊股东会讲话', type: 'daily-journal' },
  { slug: '2018-daily-journal', year: 2018, title: '2018年 每日期刊股东会讲话', type: 'daily-journal' },
  { slug: '2019-daily-journal', year: 2019, title: '2019年 每日期刊股东会讲话', type: 'daily-journal' },
  { slug: '2020-daily-journal', year: 2020, title: '2020年 每日期刊股东会讲话', type: 'daily-journal' },
  { slug: '2021-daily-journal', year: 2021, title: '2021年 每日期刊股东会讲话', type: 'daily-journal' },
  { slug: '2022-daily-journal', year: 2022, title: '2022年 每日期刊股东会讲话', type: 'daily-journal' },
]

/** 获取所有章节元数据 */
export function getAllChapters(): MungerChapter[] {
  return MUNGER_CHAPTERS.filter(ch => {
    const filePath = path.join(MUNGER_DIR, `${ch.slug}.txt`)
    return fs.existsSync(filePath)
  })
}

/** 按 slug 读取章节内容 */
export function getChapterBySlug(slug: string): string | null {
  const filePath = path.join(MUNGER_DIR, `${slug}.txt`)
  if (!fs.existsSync(filePath)) return null
  try {
    return fs.readFileSync(filePath, 'utf8')
  } catch {
    return null
  }
}

/** 搜索章节内容 */
export function searchChapters(query: string, topK = 5): Array<{
  chapter: MungerChapter
  excerpt: string
  score: number
}> {
  const keywords = query.toLowerCase().split(/\s+/).filter(w => w.length > 1)
  if (keywords.length === 0) return []

  const results: Array<{ chapter: MungerChapter; score: number; excerpt: string }> = []

  for (const chapter of MUNGER_CHAPTERS) {
    const content = getChapterBySlug(chapter.slug)
    if (!content) continue

    const lowerContent = content.toLowerCase()
    let score = 0
    for (const kw of keywords) {
      const matches = lowerContent.match(new RegExp(kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'))
      score += matches ? matches.length : 0
    }

    if (score > 0) {
      const excerpt = content.slice(0, 300).replace(/\s+/g, ' ').trim() + '...'
      results.push({ chapter, score, excerpt })
    }
  }

  return results
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
}
