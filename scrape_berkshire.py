#!/usr/bin/env python3
"""
从 learnbuffett.com 抓取伯克希尔致股东信，写入 data/zh/ 目录。
每封信作为独立文件，若文件已存在则跳过（除非 --force）。
"""
import os, re, time, urllib.parse, argparse
import requests

SESSION = requests.Session()
SESSION.trust_env = False  # 忽略系统代理（注册表/环境变量）

BASE = "https://learnbuffett.com"
DATA_DIR = os.path.join(os.path.dirname(__file__), "data", "zh")

# 需要抓取的年份（仅 berkshire 股东信）
DEFAULT_YEARS = list(range(1965, 2025))   # 1965-2024

HEADERS = {
    "User-Agent": "Mozilla/5.0 (compatible; research-bot/1.0)",
    "Accept": "text/html,application/xhtml+xml",
    "Accept-Language": "zh-CN,zh;q=0.9",
}


def fetch(url: str) -> str:
    resp = SESSION.get(url, headers=HEADERS, timeout=20)
    resp.raise_for_status()
    return resp.text


def extract_text(html: str) -> str:
    """从 <article class="article"> 提取纯文本。"""
    m = re.search(r'<article[^>]*class="article"[^>]*>(.*?)</article>', html, re.DOTALL)
    if not m:
        return ""
    content = m.group(1)

    # 把 wikilink / 普通链接标签替换为纯文字
    content = re.sub(r'<a[^>]*class="wikilink"[^>]*>([^<]+)</a>', r'\1', content)
    content = re.sub(r'<a[^>]*>([^<]*)</a>', r'\1', content)

    # 段落/标题换行
    content = re.sub(r'<h[1-6][^>]*>', '\n\n### ', content)
    content = re.sub(r'</h[1-6]>', '\n', content)
    content = re.sub(r'<br\s*/?>', '\n', content)
    content = re.sub(r'<p[^>]*>', '\n\n', content)
    content = re.sub(r'</p>', '', content)

    # 去掉所有剩余标签
    content = re.sub(r'<[^>]+>', '', content)

    # 解码 HTML 实体
    content = content.replace('&amp;', '&').replace('&lt;', '<').replace('&gt;', '>')
    content = content.replace('&quot;', '"').replace('&#39;', "'").replace('&nbsp;', ' ')
    content = content.replace('&ldquo;', '"').replace('&rdquo;', '"')
    content = content.replace('&lsquo;', ''').replace('&rsquo;', ''')
    content = content.replace('&mdash;', '—').replace('&ndash;', '–')

    # 规范化空白
    content = re.sub(r'\r\n|\r', '\n', content)
    content = re.sub(r'[ \t]{2,}', ' ', content)
    content = re.sub(r'\n{4,}', '\n\n\n', content)
    content = re.sub(r'^\s+$', '', content, flags=re.MULTILINE)

    return content.strip()


def url_for(year: int) -> str:
    path = f"/berkshire/{year}-巴菲特致股东信.html"
    encoded = "/berkshire/" + urllib.parse.quote(f"{year}-巴菲特致股东信.html")
    return BASE + encoded


def scrape_year(year: int, force: bool = False) -> bool:
    out_path = os.path.join(DATA_DIR, f"{year}.txt")

    if os.path.exists(out_path) and not force:
        print(f"  {year}: 已存在，跳过（--force 覆盖）")
        return False

    url = url_for(year)
    try:
        html = fetch(url)
    except Exception as e:
        print(f"  {year}: 抓取失败 — {e}")
        return False

    # 检测是否 404 页面
    if '404' in html[:2000] and '抱歉，这个页面不存在' in html:
        print(f"  {year}: 页面不存在 (404)")
        return False

    text = extract_text(html)
    if len(text.replace(' ', '').replace('\n', '')) < 200:
        print(f"  {year}: 提取文本过短，跳过（可能格式变化）")
        return False

    with open(out_path, "w", encoding="utf-8") as f:
        f.write(text)

    print(f"  {year}: OK  ({len(text)} 字符) → {out_path}")
    return True


def main():
    parser = argparse.ArgumentParser(description="抓取 learnbuffett.com 伯克希尔股东信")
    parser.add_argument("--years", nargs="+", type=int, default=DEFAULT_YEARS,
                        help="指定年份列表，默认 1965-2024")
    parser.add_argument("--force", action="store_true",
                        help="覆盖已存在文件")
    parser.add_argument("--delay", type=float, default=1.5,
                        help="每次请求间隔秒数（默认 1.5）")
    args = parser.parse_args()

    os.makedirs(DATA_DIR, exist_ok=True)
    print(f"目标目录: {DATA_DIR}")
    print(f"年份范围: {min(args.years)}–{max(args.years)}, 共 {len(args.years)} 年\n")

    ok, skip, fail = 0, 0, 0
    for year in sorted(args.years):
        result = scrape_year(year, force=args.force)
        if result is True:
            ok += 1
        elif result is False:
            # 区分跳过和失败已在函数内打印
            pass
        time.sleep(args.delay)

    print(f"\n完成。")


if __name__ == "__main__":
    main()
