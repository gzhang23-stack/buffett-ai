#!/usr/bin/env python3
"""
把 data/zh/ 中现有的 ASCII 框线表格（┌┬┐│├┤└┴┘─┼）
转换为 <<<TABLE>>> ... <<<ENDTABLE>>> 标记格式。
只处理已有文件，不重新抓取网络。
"""
import os, re

DATA_DIR = os.path.join(os.path.dirname(__file__), "data", "zh")

# 匹配完整的 ASCII 框线表格块
TABLE_BLOCK_RE = re.compile(
    r'┌[─┬]+┐\n'         # 顶部边框行
    r'(?:│[^\n]*\n)+'    # 数据行（含 ├┼┤ 分隔行）
    r'└[─┴]+┘',
    re.MULTILINE
)


def parse_ascii_table(block: str) -> list[list[str]]:
    """从 ASCII 框线表格中提取行/列数据。"""
    rows = []
    for line in block.splitlines():
        # 只处理以 │ 开头和结尾的内容行（跳过 ┌┬┐ ├┼┤ └┴┘）
        if line.startswith('│') and line.endswith('│'):
            # 按 │ 分割，去掉首尾空元素，strip 每个单元格
            cells = [c.strip() for c in line.split('│')[1:-1]]
            rows.append(cells)
    return rows


def rows_to_marker(rows: list[list[str]]) -> str:
    lines = ['<<<TABLE>>>']
    for row in rows:
        lines.append('|'.join(row))
    lines.append('<<<ENDTABLE>>>')
    return '\n'.join(lines)


def convert_file(path: str) -> bool:
    text = open(path, encoding='utf-8').read()
    matches = list(TABLE_BLOCK_RE.finditer(text))
    if not matches:
        return False

    # 从后往前替换，保持偏移正确
    result = text
    for m in reversed(matches):
        rows = parse_ascii_table(m.group(0))
        if not rows:
            continue
        marker = rows_to_marker(rows)
        result = result[:m.start()] + marker + result[m.end():]

    if result != text:
        open(path, 'w', encoding='utf-8').write(result)
        return True
    return False


def main():
    print(f"数据目录: {DATA_DIR}\n")
    converted = 0
    for fname in sorted(os.listdir(DATA_DIR)):
        if not fname.endswith('.txt'):
            continue
        path = os.path.join(DATA_DIR, fname)
        if convert_file(path):
            print(f"  {fname}: 已转换")
            converted += 1
        else:
            print(f"  {fname}: 无 ASCII 表格，跳过")
    print(f"\n完成，共转换 {converted} 个文件。")


if __name__ == "__main__":
    main()
