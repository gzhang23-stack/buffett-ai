#!/usr/bin/env python3
"""
从 learnbuffett.com 抓取伯克希尔致股东信，写入 data/zh/ 目录。
保留表格内容，转换为 ASCII 文本表格。
"""
import os, re, time, urllib.parse, argparse
import requests

SESSION = requests.Session()
SESSION.trust_env = False

BASE = "https://learnbuffett.com"
DATA_DIR = os.path.join(os.path.dirname(__file__), "data", "zh")
DEFAULT_YEARS = list(range(1965, 2025))

HEADERS = {
    "User-Agent": "Mozilla/5.0 (compatible; research-bot/1.0)",
    "Accept": "text/html,application/xhtml+xml",
    "Accept-Language": "zh-CN,zh;q=0.9",
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
                  .replace('|', '｜') for c in cells]  # 转义管道符
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

    # 规范化空白
    content = re.sub(r'\r\n|\r', '\n', content)
    content = re.sub(r'[ \t]{2,}', ' ', content)
    content = re.sub(r'\n{4,}', '\n\n\n', content)
    content = re.sub(r'^\s+$', '', content, flags=re.MULTILINE)

    return content.strip()


def url_for(year: int) -> str:
    encoded = "/berkshire/" + urllib.parse.quote(f"{year}-巴菲特致股东信.html")
    return BASE + encoded


def scrape_year(year: int, force: bool = False) -> bool:
    out_path = os.path.join(DATA_DIR, f"{year}.txt")

    if os.path.exists(out_path) and not force:
        print(f"  {year}: 已存在，跳过")
        return False

    url = url_for(year)
    try:
        html = fetch(url)
    except Exception as e:
        print(f"  {year}: 抓取失败 — {e}")
        return False

    if '404' in html[:2000] and '抱歉，这个页面不存在' in html:
        print(f"  {year}: 页面不存在 (404)")
        return False

    text = extract_text(html)
    if len(text.replace(' ', '').replace('\n', '')) < 200:
        print(f"  {year}: 提取文本过短，跳过")
        return False

    with open(out_path, "w", encoding="utf-8") as f:
        f.write(text)

    print(f"  {year}: OK  ({len(text)} 字符)")
    return True


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--years", nargs="+", type=int, default=DEFAULT_YEARS)
    parser.add_argument("--force", action="store_true")
    parser.add_argument("--delay", type=float, default=1.5)
    args = parser.parse_args()

    os.makedirs(DATA_DIR, exist_ok=True)
    print(f"目标: {DATA_DIR}  年份: {min(args.years)}–{max(args.years)}\n")

    for year in sorted(args.years):
        scrape_year(year, force=args.force)
        time.sleep(args.delay)

    print("\n完成。")


if __name__ == "__main__":
    main()
