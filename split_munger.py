#!/usr/bin/env python3
"""
将《芒格之道》全文按章节分割
"""
import os
import re

INPUT_FILE = os.path.join(os.path.dirname(__file__), 'data', 'munger', '_full_text.txt')
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), 'data', 'munger')

# 章节标记（用于分割文本）
CHAPTER_MARKERS = [
    ('intro', '引言'),
    ('publisher-note', '出版说明'),
    ('1987-wesco', '1987年 西科金融股东会讲话'),
    ('1988-wesco', '1988年 西科金融股东会讲话'),
    ('1989-wesco', '1989年 西科金融股东会讲话'),
    ('1990-wesco', '1990年 西科金融股东会讲话'),
    ('1991-wesco', '1991年 西科金融股东会讲话'),
    ('1992-wesco', '1992年 西科金融股东会讲话'),
    ('1993-wesco', '1993年 西科金融股东会讲话'),
    ('1994-wesco', '1994年 西科金融股东会讲话'),
    ('1995-wesco', '1995年 西科金融股东会讲话'),
    ('1997-wesco', '1997年 西科金融股东会讲话'),
    ('1998-wesco', '1998年 西科金融股东会讲话'),
    ('1999-wesco', '1999年 西科金融股东会讲话'),
    ('2000-wesco', '2000年 西科金融股东会讲话'),
    ('2003-wesco', '2003年 西科金融股东会讲话'),
    ('2007-wesco', '2007年 西科金融股东会讲话'),
    ('2010-wesco', '2010年 西科金融股东会讲话'),
    ('2014-daily-journal', '2014年 每日期刊股东会讲话'),
    ('2015-daily-journal', '2015年 每日期刊股东会讲话'),
    ('2016-daily-journal', '2016年 每日期刊股东会讲话'),
    ('2017-daily-journal', '2017年 每日期刊股东会讲话'),
    ('2018-daily-journal', '2018年 每日期刊股东会讲话'),
    ('2019-daily-journal', '2019年 每日期刊股东会讲话'),
    ('2020-daily-journal', '2020年 每日期刊股东会讲话'),
    ('2021-daily-journal', '2021年 每日期刊股东会讲话'),
    ('2022-daily-journal', '2022年 每日期刊股东会讲话'),
    ('index', '索引'),
]


def split_chapters():
    """按章节分割文本"""
    with open(INPUT_FILE, 'r', encoding='utf-8') as f:
        full_text = f.read()

    print(f"Loaded {len(full_text)} characters")

    # 找到每个章节的起始位置
    chapter_positions = []

    # 特殊处理：引言和出版说明
    for slug, title in [('intro', '引言'), ('publisher-note', '出版说明')]:
        pattern = r'^\s*' + re.escape(title) + r'\s*$'
        matches = list(re.finditer(pattern, full_text, re.MULTILINE))
        if matches:
            # 取第二个匹配（第一个在目录中）
            if len(matches) > 1:
                pos = matches[1].start()
                chapter_positions.append((slug, title, pos))
                print(f"Found: {title} at position {pos}")

    # 年份章节：格式是 "1987年\n\n西科金融股东会讲话" 或 "2014年\n\n每日期刊股东会讲话"
    for slug, title in CHAPTER_MARKERS[2:]:  # 跳过引言和出版说明
        if '年' in title:
            year = title.split('年')[0]
            # 查找 "YYYY年" 后面跟着章节类型
            if '西科金融' in title:
                pattern = r'^\s*' + re.escape(year + '年') + r'\s*\n\s*西科金融股东会讲话'
            elif '每日期刊' in title:
                pattern = r'^\s*' + re.escape(year + '年') + r'\s*\n\s*每日期刊股东会讲话'
            elif title == '索引':
                pattern = r'^\s*索引\s*$'
            else:
                continue

            matches = list(re.finditer(pattern, full_text, re.MULTILINE))
            if matches:
                pos = matches[0].start()
                chapter_positions.append((slug, title, pos))
                print(f"Found: {title} at position {pos}")
            else:
                print(f"WARNING: Could not find chapter: {title}")

    # 按位置排序
    chapter_positions.sort(key=lambda x: x[2])

    # 分割并保存每个章节
    for i, (slug, title, start_pos) in enumerate(chapter_positions):
        # 确定结束位置（下一章节的开始，或文件末尾）
        if i + 1 < len(chapter_positions):
            end_pos = chapter_positions[i + 1][2]
        else:
            end_pos = len(full_text)

        # 提取章节内容
        content = full_text[start_pos:end_pos].strip()

        # 保存到文件
        output_file = os.path.join(OUTPUT_DIR, f'{slug}.txt')
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write(content)

        print(f"Saved: {slug}.txt ({len(content)} chars)")

    print(f"\nTotal chapters saved: {len(chapter_positions)}")


if __name__ == '__main__':
    split_chapters()
