#!/usr/bin/env python3
"""
把 data/zh/196X.txt 按 【标题】 拆成独立子文件。
子文件命名：1961年中.txt / 1962年11月.txt / 1965-berkshire.txt 等
原文件保留不动（仍用于全年合并视图）。
"""
import os, re

DATA_DIR = os.path.join(os.path.dirname(__file__), "data", "zh")

# 需要拆分的年份（1961-1969合伙人信有多封；1956-1960每年只有一封不拆）
SPLIT_YEARS = list(range(1961, 1970))


def slug(title: str) -> str:
    """把【1961年中-巴菲特致合伙人信】 → 1961年中，把【伯克希尔·哈撒韦致股东信 1965】 → 1965-berkshire"""
    # 合伙人信
    m = re.match(r'【(\d{4}年[^】-]+)-巴菲特致合伙人信】', title)
    if m:
        return m.group(1)   # e.g. "1961年中"
    # 伯克希尔股东信
    m2 = re.match(r'【伯克希尔[^】]*致股东信\s*(\d{4})】', title)
    if m2:
        return f"{m2.group(1)}-berkshire"
    return None


def split_file(year: int):
    path = os.path.join(DATA_DIR, f"{year}.txt")
    text = open(path, encoding="utf-8").read()

    # 找所有分隔点
    pattern = re.compile(r'^(【[^】]+】)', re.MULTILINE)
    matches = list(pattern.finditer(text))

    if not matches:
        print(f"  {year}: 无分隔标记，跳过")
        return

    # 第一封信是标记之前的内容（年度信）
    sections = []
    first_end = matches[0].start()
    first_text = text[:first_end].strip()
    if len(first_text.replace(' ', '').replace('\n', '')) > 100:
        sections.append((f"{year}", first_text))

    # 其余各封信
    for i, m in enumerate(matches):
        title = m.group(1)
        start = m.end()
        end = matches[i+1].start() if i+1 < len(matches) else len(text)
        content = text[start:end].strip()
        name = slug(title)
        if name and len(content.replace(' ', '').replace('\n', '')) > 50:
            sections.append((name, content))

    print(f"  {year}: 拆出 {len(sections)} 封 → ", end="")
    for name, content in sections:
        out = os.path.join(DATA_DIR, f"{name}.txt")
        with open(out, "w", encoding="utf-8") as f:
            f.write(content)
        print(name, end="  ")
    print()


def main():
    print(f"数据目录: {DATA_DIR}\n")
    for year in SPLIT_YEARS:
        split_file(year)
    print("\n完成。")


if __name__ == "__main__":
    main()
