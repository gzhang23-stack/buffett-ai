#!/usr/bin/env python3
"""
把 data/zh/ 中现有的 ASCII 框线表格转换为 <<<TABLE>>> ... <<<ENDTABLE>>> 标记格式。
同时修复 &emsp; &thinsp; 等未解码的 HTML 实体。
"""
import os, re

DATA_DIR = os.path.join(os.path.dirname(__file__), "data", "zh")

# ── HTML 实体修复 ──────────────────────────────────────────────────────────────

ENTITY_MAP = {
    '&emsp;':   '\u2003',   # em space → 正常空格（显示时会被 trim）
    '&ensp;':   '\u2002',
    '&thinsp;': '\u2009',
    '&amp;':    '&',
    '&lt;':     '<',
    '&gt;':     '>',
    '&quot;':   '"',
    '&#39;':    "'",
    '&nbsp;':   ' ',
    '&ldquo;':  '\u201c',
    '&rdquo;':  '\u201d',
    '&lsquo;':  '\u2018',
    '&rsquo;':  '\u2019',
    '&mdash;':  '\u2014',
    '&ndash;':  '\u2013',
    '&hellip;': '\u2026',
}


def fix_entities(text: str) -> str:
    for entity, replacement in ENTITY_MAP.items():
        text = text.replace(entity, replacement)
    # 清理多余 em/en space（缩进 → 普通空格后，连续多个压缩为一个）
    text = re.sub(r'[\u2002\u2003\u2009]+', ' ', text)
    return text


# ── ASCII 表格解析 ──────────────────────────────────────────────────────────────

# 识别表格起始行：以 ┌ 开头
TABLE_START_RE = re.compile(r'^┌')
# 识别表格结束行：以 └ 开头
TABLE_END_RE   = re.compile(r'^└')
# 数据行：以 │ 开头且以 │ 结尾
DATA_ROW_RE    = re.compile(r'^│(.+)│$')
# 分隔行：以 ├ 开头（跳过）
SEP_ROW_RE     = re.compile(r'^[├┣]')


def parse_ascii_table_lines(lines: list[str]) -> list[list[str]]:
    """从 ASCII 框线表格的行列表中提取数据行。"""
    rows = []
    for line in lines:
        if DATA_ROW_RE.match(line):
            # 按 │ 分割，去掉首尾空元素，strip 每格
            cells = [c.strip() for c in line.split('│')[1:-1]]
            rows.append(cells)
    return rows


def rows_to_marker(rows: list[list[str]]) -> str:
    lines = ['<<<TABLE>>>']
    for row in rows:
        # 把单元格内的 | 替换为全角，防止和分隔符冲突
        cells = [c.replace('|', '｜') for c in row]
        lines.append('|'.join(cells))
    lines.append('<<<ENDTABLE>>>')
    return '\n'.join(lines)


def convert_tables(text: str) -> str:
    """扫描文本，把所有 ASCII 框线表格替换为标记格式。"""
    result_lines = []
    lines = text.splitlines()
    i = 0
    while i < len(lines):
        line = lines[i]
        if TABLE_START_RE.match(line):
            # 收集整个表格块直到 └ 行
            table_lines = [line]
            i += 1
            while i < len(lines):
                table_lines.append(lines[i])
                if TABLE_END_RE.match(lines[i]):
                    i += 1
                    break
                i += 1
            rows = parse_ascii_table_lines(table_lines)
            if rows:
                result_lines.append(rows_to_marker(rows))
            # 丢弃没有有效数据的空表格
        else:
            result_lines.append(line)
            i += 1
    return '\n'.join(result_lines)


# ── 主流程 ─────────────────────────────────────────────────────────────────────

def convert_file(path: str) -> tuple[bool, bool]:
    """返回 (has_tables, has_entities)。"""
    text = open(path, encoding='utf-8').read()

    # 先检查是否已经是新格式
    already_converted = '<<<TABLE>>>' in text
    has_old_tables = TABLE_START_RE.search(text) is not None
    has_entities = any(e in text for e in ENTITY_MAP)

    if not has_old_tables and not has_entities and already_converted:
        return False, False
    if not has_old_tables and not has_entities:
        return False, False

    new_text = text
    if has_old_tables:
        new_text = convert_tables(new_text)
    if has_entities:
        new_text = fix_entities(new_text)

    if new_text != text:
        open(path, 'w', encoding='utf-8').write(new_text)
        return has_old_tables, has_entities
    return False, False


def main():
    print(f"数据目录: {DATA_DIR}\n")
    total_tables = 0
    total_entities = 0
    for fname in sorted(os.listdir(DATA_DIR)):
        if not fname.endswith('.txt'):
            continue
        path = os.path.join(DATA_DIR, fname)
        had_tables, had_entities = convert_file(path)
        if had_tables or had_entities:
            note = []
            if had_tables:   note.append('转换表格')
            if had_entities: note.append('修复实体')
            print(f"  {fname}: {' + '.join(note)}")
            if had_tables:   total_tables += 1
            if had_entities: total_entities += 1
        else:
            print(f"  {fname}: 无需修改")
    print(f"\n完成：{total_tables} 个文件含表格，{total_entities} 个文件含 HTML 实体。")


if __name__ == "__main__":
    main()
