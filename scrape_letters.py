import requests
from bs4 import BeautifulSoup
import os
import time
import re
from urllib.parse import urljoin

def create_data_directory():
    """创建数据目录"""
    if not os.path.exists('data'):
        os.makedirs('data')
    if not os.path.exists('data/letters'):
        os.makedirs('data/letters')

def get_letter_urls():
    """获取致股东信的URL列表"""
    base_url = "https://www.berkshirehathaway.com"
    letters_page = "https://www.berkshirehathaway.com/letters/letters.html"

    try:
        response = requests.get(letters_page, timeout=10)
        response.raise_for_status()
        soup = BeautifulSoup(response.content, 'html.parser')

        # 查找2020-2023年的链接
        letter_urls = {}
        years = [2020, 2021, 2022, 2023]

        # 在页面中查找包含年份的链接
        for link in soup.find_all('a', href=True):
            href = link.get('href')
            text = link.get_text().strip()

            for year in years:
                if str(year) in text or str(year) in href:
                    if href.startswith('/'):
                        full_url = urljoin(base_url, href)
                    else:
                        full_url = href

                    letter_urls[year] = full_url
                    print(f"找到 {year} 年链接: {full_url}")
                    break

        return letter_urls

    except Exception as e:
        print(f"获取链接列表时出错: {e}")
        return {}

def clean_text(text):
    """清理文本内容"""
    # 移除多余的空白字符
    text = re.sub(r'\s+', ' ', text)
    # 移除特殊字符但保留基本标点
    text = re.sub(r'[^\w\s\.\,\!\?\;\:\-\(\)\[\]\"\'\/\%\$]', '', text)
    return text.strip()

def scrape_letter(url, year):
    """抓取单个年份的致股东信"""
    try:
        print(f"正在抓取 {year} 年的致股东信...")

        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }

        response = requests.get(url, headers=headers, timeout=15)
        response.raise_for_status()

        soup = BeautifulSoup(response.content, 'html.parser')

        # 移除脚本和样式标签
        for script in soup(["script", "style"]):
            script.decompose()

        # 尝试不同的内容提取策略
        content = ""

        # 策略1: 查找主要内容区域
        main_content = soup.find('div', class_=['content', 'main', 'body'])
        if main_content:
            content = main_content.get_text()
        else:
            # 策略2: 查找body标签内容
            body = soup.find('body')
            if body:
                content = body.get_text()
            else:
                # 策略3: 获取所有文本
                content = soup.get_text()

        # 清理文本
        content = clean_text(content)

        # 保存到文件
        filename = f"data/letters/buffett_letter_{year}.txt"
        with open(filename, 'w', encoding='utf-8') as f:
            f.write(f"Warren Buffett Letter to Shareholders - {year}\n")
            f.write("=" * 50 + "\n\n")
            f.write(content)

        print(f"✅ {year} 年致股东信已保存到 {filename}")
        print(f"   文件大小: {len(content)} 字符")

        return True

    except Exception as e:
        print(f"❌ 抓取 {year} 年致股东信时出错: {e}")
        return False

def main():
    """主函数"""
    print("开始抓取 Berkshire Hathaway 致股东信 (2020-2023)")
    print("=" * 60)

    # 创建目录
    create_data_directory()

    # 获取链接
    letter_urls = get_letter_urls()

    if not letter_urls:
        print("未找到任何致股东信链接，尝试使用已知的URL模式...")
        # 使用已知的URL模式作为备选
        base_url = "https://www.berkshirehathaway.com/letters"
        letter_urls = {
            2023: f"{base_url}/2023ltr.pdf",
            2022: f"{base_url}/2022ltr.pdf",
            2021: f"{base_url}/2021ltr.pdf",
            2020: f"{base_url}/2020ltr.pdf"
        }

    # 抓取每年的信件
    success_count = 0
    for year in [2020, 2021, 2022, 2023]:
        if year in letter_urls:
            if scrape_letter(letter_urls[year], year):
                success_count += 1

            # 添加延迟以避免过于频繁的请求
            time.sleep(2)
        else:
            print(f"⚠️  未找到 {year} 年的链接")

    print("\n" + "=" * 60)
    print(f"抓取完成! 成功获取 {success_count} 个文件")
    print("文件保存在 data/letters/ 目录下")

    # 显示文件列表
    if os.path.exists('data/letters'):
        files = os.listdir('data/letters')
        if files:
            print("\n已保存的文件:")
            for file in sorted(files):
                filepath = os.path.join('data/letters', file)
                size = os.path.getsize(filepath)
                print(f"  - {file} ({size} bytes)")

if __name__ == "__main__":
    main()