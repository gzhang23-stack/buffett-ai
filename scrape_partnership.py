#!/usr/bin/env python3
"""
从 learnbuffett.com 抓取巴菲特致合伙人信，写入 data/zh/ 目录。
保留表格内容，转换为标记格式供前端渲染。
覆盖由 split_letters.py 生成的旧文件（旧文件无表格）。
"""
import os, re, time, urllib.parse, argparse
import requests

SESSION = requests.Session()
SESSION.trust_env = False

BASE = "https://learnbuffett.com"
DATA_DIR = os.path.join(os.path.dirname(__file__), "data", "zh")

HEADERS = {
    "User-Agent": "Mozilla/5.0 (compatible; research-bot/1.0)",
    "Accept": "text/html,application/xhtml+xml",
    "Accept-Language": "zh-CN,zh;q=0.9",
}

# 每个 slug 对应的 learnbuffett.com 路径（不含 BASE）
SLUG_URL_MAP = {
    # 单封年度信（1956-1960）
    "1956":       "/partnership/1956-巴菲特致合伙人信.html",
    "1957":       "/partnership/1957-巴菲特致合伙人信.html",
    "1958":       "/partnership/1958-巴菲特致合伙人信.html",
    "1959":       "/partnership/1959-巴菲特致合伙人信.html",
    "1960":       "/partnership/1960-巴菲特致合伙人信.html",
    # 1961
    "1961年中":   "/partnership/1961年中-巴菲特致合伙人信.html",
    "1961":       "/partnership/1961-巴菲特致合伙人信.html",
    # 1962
    "1962年中":   "/partnership/1962年中-巴菲特致合伙人信.html",
    "1962年11月": "/partnership/1962年11月-巴菲特致合伙人信.html",
    "1962年12月": "/partnership/1962年12月-巴菲特致合伙人信.html",
    "1962":       "/partnership/1962-巴菲特致合伙人信.html",
    # 1963
    "1963年中":   "/partnership/1963年中-巴菲特致合伙人信.html",
    "1963年11月": "/partnership/1963年11月-巴菲特致合伙人信.html",
    "1963年12月": "/partnership/1963年12月-巴菲特致合伙人信.html",
    "1963":       "/partnership/1963-巴菲特致合伙人信.html",
    # 1964
    "1964年中":   "/partnership/1964年中-巴菲特致合伙人信.html",
    "1964":       "/partnership/1964-巴菲特致合伙人信.html",
    # 1965（合伙年度信用 -partnership 后缀，避免与伯克希尔1965年报冲突）
    "1965年中":          "/partnership/1965年中-巴菲特致合伙人信.html",
    "1965年11月":        "/partnership/1965年11月-巴菲特致合伙人信.html",
    "1965-partnership":  "/partnership/1965-巴菲特致合伙人信.html",
    # 1966
    "1966年中":          "/partnership/1966年中-巴菲特致合伙人信.html",
    "1966年11月":        "/partnership/1966年11月-巴菲特致合伙人信.html",
    "1966-partnership":  "/partnership/1966-巴菲特致合伙人信.html",
    # 1967
    "1967年中":          "/partnership/1967年中-巴菲特致合伙人信.html",
    "1967年10月":        "/partnership/1967年10月-巴菲特致合伙人信.html",
    "1967年11月":        "/partnership/1967年11月-巴菲特致合伙人信.html",
    "1967-partnership":  "/partnership/1967-巴菲特致合伙人信.html",
    # 1968
    "1968年中":          "/partnership/1968年中-巴菲特致合伙人信.html",
    "1968年11月":        "/partnership/1968年11月-巴菲特致合伙人信.html",
    "1968-partnership":  "/partnership/1968-巴菲特致合伙人信.html",
    # 1969
    "1969年5月":         "/partnership/1969年5月-巴菲特致合伙人信.html",
    "1969年10月":        "/partnership/1969年10月-巴菲特致合伙人信.html",
    "1969年12月":        "/partnership/1969年12月-巴菲特致合伙人信.html",
    "1969年12月26日":    "/partnership/1969年12月26日-巴菲特致合伙人信.html",
    "1969-partnership":  "/partnership/1969-巴菲特致合伙人信.html",
    # 1970（合伙公司清盘信，独立文件名避免与伯克希尔1970年报冲突）
    "1970年2月":  "/partnership/1970年2月-巴菲特致合伙人信.html",
}


def fetch(url: str) -> str:
    resp = SESSION.get(url, headers=HEADERS, timeout=20)
    resp.raise_for_status()
    return resp.text


def table_to_text(table_html: str) -> str:
    """把 <table> HTML 转为管道符分隔的标记格式，供前端渲染为 HTML 表格。"""
    rows = re.findall(r'<tr[^>]*>(.*?)</tr>', table_html, re.DOTALL)
    parsed = []
    for row in rows:
        cells = re.findall(r'<t[hd][^>]*>(.*?)</t[hd]>', row, re.DOTALL)
        cells = [re.sub(r'<[^>]+>', '', c).strip() for c in cells]
        cells = [c.replace('&amp;', '&').replace('&nbsp;', ' ')
                  .replace('&lt;', '<').replace('&gt;', '>')
                  .replace('|', '｜') for c in cells]
        if any(c for c in cells):
            parsed.append(cells)
    if not parsed:
        return ''

    lines = ['<<<TABLE>>>']
    for row in parsed:
        lines.append('|'.join(row))
    lines.append('<<<ENDTABLE>>>')
    return '\n'.join(lines)


def extract_text(html: str) -> str:
    """从 <article class="article"> 提取文本，保留表格结构。"""
    m = re.search(r'<article[^>]*class="article"[^>]*>(.*?)</article>', html, re.DOTALL)
    if not m:
        return ""
    content = m.group(1)

    # 链接替换为纯文字
    content = re.sub(r'<a[^>]*>([^<]*)</a>', r'\1', content)

    # 先处理表格（在其他标签清理之前）
    def replace_table(tm):
        return '\n\n' + table_to_text(tm.group(0)) + '\n\n'
    content = re.sub(r'<table[\s\S]*?</table>', replace_table, content, flags=re.DOTALL)

    # 段落/标题换行
    content = re.sub(r'<h[1-6][^>]*>', '\n\n### ', content)
    content = re.sub(r'</h[1-6]>', '\n', content)
    content = re.sub(r'<br\s*/?>', '\n', content)
    content = re.sub(r'<p[^>]*>', '\n\n', content)
    content = re.sub(r'</p>', '', content)

    # 去掉所有剩余标签
    content = re.sub(r'<[^>]+>', '', content)

    # 解码 HTML 实体
    content = (content
               .replace('&amp;', '&').replace('&lt;', '<').replace('&gt;', '>')
               .replace('&quot;', '"').replace('&#39;', "'").replace('&nbsp;', ' ')
               .replace('&emsp;', '').replace('&ensp;', '').replace('&thinsp;', '')
               .replace('&ldquo;', '\u201c').replace('&rdquo;', '\u201d')
               .replace('&lsquo;', '\u2018').replace('&rsquo;', '\u2019')
               .replace('&mdash;', '\u2014').replace('&ndash;', '\u2013')
               .replace('&hellip;', '\u2026'))

    # 规范化空白（保留表格标记行不被压缩）
    content = re.sub(r'\r\n|\r', '\n', content)
    content = re.sub(r'[ \t]{2,}', ' ', content)
    content = re.sub(r'\n{4,}', '\n\n\n', content)
    content = re.sub(r'^\s+$', '', content, flags=re.MULTILINE)

    return content.strip()


def scrape_slug(slug: str, path: str, force: bool = False) -> bool:
    out_path = os.path.join(DATA_DIR, f"{slug}.txt")

    if os.path.exists(out_path) and not force:
        print(f"  {slug}: 已存在，跳过")
        return False

    url = BASE + urllib.parse.quote(path, safe='/')
    try:
        html = fetch(url)
    except Exception as e:
        print(f"  {slug}: 抓取失败 — {e}")
        return False

    if '404' in html[:2000] and '抱歉，这个页面不存在' in html:
        print(f"  {slug}: 页面不存在 (404)")
        return False

    text = extract_text(html)
    if len(text.replace(' ', '').replace('\n', '')) < 100:
        print(f"  {slug}: 提取文本过短，跳过")
        return False

    with open(out_path, "w", encoding="utf-8") as f:
        f.write(text)

    print(f"  {slug}: OK  ({len(text)} 字符)")
    return True


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--slugs", nargs="+", default=list(SLUG_URL_MAP.keys()),
                        help="指定要抓取的 slug（默认全部）")
    parser.add_argument("--force", action="store_true", help="强制重新抓取已有文件")
    parser.add_argument("--delay", type=float, default=1.5)
    args = parser.parse_args()

    os.makedirs(DATA_DIR, exist_ok=True)
    slugs_to_scrape = [s for s in args.slugs if s in SLUG_URL_MAP]
    print(f"目标: {DATA_DIR}  共 {len(slugs_to_scrape)} 封信\n")

    for slug in slugs_to_scrape:
        scrape_slug(slug, SLUG_URL_MAP[slug], force=args.force)
        time.sleep(args.delay)

    print("\n完成。")


if __name__ == "__main__":
    main()
