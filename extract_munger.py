#!/usr/bin/env python3
"""
从《芒格之道》PDF提取文本并按章节分割
"""
import os
import re
from pdfminer.high_level import extract_text_to_fp
from pdfminer.layout import LAParams
from io import StringIO

PDF_PATH = os.path.join(os.path.dirname(__file__), '..', 'data', 'zh', '芒格之道：查理·芒格股东会讲话-1987—2022.pdf')
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), 'data', 'munger')

# 章节定义（基于目录）
CHAPTERS = [
    {'slug': 'intro', 'title': '引言', 'type': 'intro'},
    {'slug': 'publisher-note', 'title': '出版说明', 'type': 'intro'},
    # 上编：西科金融
    {'slug': '1987-wesco', 'title': '1987年 西科金融股东会讲话', 'year': 1987, 'type': 'wesco'},
    {'slug': '1988-wesco', 'title': '1988年 西科金融股东会讲话', 'year': 1988, 'type': 'wesco'},
    {'slug': '1989-wesco', 'title': '1989年 西科金融股东会讲话', 'year': 1989, 'type': 'wesco'},
    {'slug': '1990-wesco', 'title': '1990年 西科金融股东会讲话', 'year': 1990, 'type': 'wesco'},
    {'slug': '1991-wesco', 'title': '1991年 西科金融股东会讲话', 'year': 1991, 'type': 'wesco'},
    {'slug': '1992-wesco', 'title': '1992年 西科金融股东会讲话', 'year': 1992, 'type': 'wesco'},
    {'slug': '1993-wesco', 'title': '1993年 西科金融股东会讲话', 'year': 1993, 'type': 'wesco'},
    {'slug': '1994-wesco', 'title': '1994年 西科金融股东会讲话', 'year': 1994, 'type': 'wesco'},
    {'slug': '1995-wesco', 'title': '1995年 西科金融股东会讲话', 'year': 1995, 'type': 'wesco'},
    {'slug': '1997-wesco', 'title': '1997年 西科金融股东会讲话', 'year': 1997, 'type': 'wesco'},
    {'slug': '1998-wesco', 'title': '1998年 西科金融股东会讲话', 'year': 1998, 'type': 'wesco'},
    {'slug': '1999-wesco', 'title': '1999年 西科金融股东会讲话', 'year': 1999, 'type': 'wesco'},
    {'slug': '2000-wesco', 'title': '2000年 西科金融股东会讲话', 'year': 2000, 'type': 'wesco'},
    {'slug': '2003-wesco', 'title': '2003年 西科金融股东会讲话', 'year': 2003, 'type': 'wesco'},
    {'slug': '2007-wesco', 'title': '2007年 西科金融股东会讲话', 'year': 2007, 'type': 'wesco'},
    {'slug': '2010-wesco', 'title': '2010年 西科金融股东会讲话', 'year': 2010, 'type': 'wesco'},
    # 下编：每日期刊
    {'slug': '2014-daily-journal', 'title': '2014年 每日期刊股东会讲话', 'year': 2014, 'type': 'daily-journal'},
    {'slug': '2015-daily-journal', 'title': '2015年 每日期刊股东会讲话', 'year': 2015, 'type': 'daily-journal'},
    {'slug': '2016-daily-journal', 'title': '2016年 每日期刊股东会讲话', 'year': 2016, 'type': 'daily-journal'},
    {'slug': '2017-daily-journal', 'title': '2017年 每日期刊股东会讲话', 'year': 2017, 'type': 'daily-journal'},
    {'slug': '2018-daily-journal', 'title': '2018年 每日期刊股东会讲话', 'year': 2018, 'type': 'daily-journal'},
    {'slug': '2019-daily-journal', 'title': '2019年 每日期刊股东会讲话', 'year': 2019, 'type': 'daily-journal'},
    {'slug': '2020-daily-journal', 'title': '2020年 每日期刊股东会讲话', 'year': 2020, 'type': 'daily-journal'},
    {'slug': '2021-daily-journal', 'title': '2021年 每日期刊股东会讲话', 'year': 2021, 'type': 'daily-journal'},
    {'slug': '2022-daily-journal', 'title': '2022年 每日期刊股东会讲话', 'year': 2022, 'type': 'daily-journal'},
    {'slug': 'index', 'title': '索引', 'type': 'index'},
]


def extract_full_text():
    """提取完整PDF文本"""
    print(f"Extracting text from: {PDF_PATH}")
    output = StringIO()
    with open(PDF_PATH, 'rb') as f:
        extract_text_to_fp(f, output, laparams=LAParams(), output_type='text', codec='utf-8')
    text = output.getvalue()
    print(f"Extracted {len(text)} characters")
    return text


def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    # 提取全文
    full_text = extract_full_text()

    # 保存全文用于调试
    with open(os.path.join(OUTPUT_DIR, '_full_text.txt'), 'w', encoding='utf-8') as f:
        f.write(full_text)

    print(f"\nFull text saved to {OUTPUT_DIR}/_full_text.txt")
    print("Please manually split the text into chapters based on the structure.")
    print("\nChapter structure:")
    for ch in CHAPTERS:
        print(f"  {ch['slug']}: {ch['title']}")


if __name__ == '__main__':
    main()
