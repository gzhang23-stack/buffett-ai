import json
from docx import Document

# 读取Word文档
doc = Document(r'd:\AI编程\claude测试\VS code claude\data\other books\段永平投资问答录-商业逻辑篇.docx')

# 定义目录结构
structure = [
    ("前言", "买股票就是买公司"),
    ("第1节：伟大企业", "什么样的企业是伟大的企业"),
    ("第1节：伟大企业", "伟大公司管理层(CEO)：造钟人"),
    ("第1节：伟大企业", "长长的坡，厚厚的雪：滚雪球"),
    ("第2节：商业模式", "商业模式最重要"),
    ("第2节：商业模式", "差异化是好商业模式的前提"),
    ("第2节：商业模式", "护城河是商业模式最重要的部分"),
    ("第2节：商业模式", "要有好的企业文化做支撑"),
    ("第2节：商业模式", "30个商业案例点评"),
    ("第3节：企业文化", "企业文化"),
    ("第3节：企业文化", "核心价值观"),
    ("第3节：企业文化", "本分和平常心"),
    ("第3节：企业文化", "团队合作"),
    ("第3节：企业文化", "消费者导向"),
    ("第3节：企业文化", "基业长青"),
    ("第3节：企业文化", "26个企业文化案例点评"),
    ("第4节：产品、差异化与创新", "好产品"),
    ("第4节：产品、差异化与创新", "产品差异化"),
    ("第4节：产品、差异化与创新", "创新"),
    ("第5节：品牌、营销与广告", "品牌"),
    ("第5节：品牌、营销与广告", "营销"),
    ("第5节：品牌、营销与广告", "广告"),
    ("第6节：收购和多元化", "收购"),
    ("第6节：收购和多元化", "多元化"),
    ("第7节：Stop doing list（不为清单）", "Stop doing list（不为清单）"),
]

# 提取所有段落文本
all_text = []
for para in doc.paragraphs:
    text = para.text.strip()
    if text:
        all_text.append(text)

print(f"Total paragraphs: {len(all_text)}")
print("\nFirst 20 paragraphs:")
for i, text in enumerate(all_text[:20]):
    print(f"{i}: {text[:80]}")

# 保存到临时文件供检查
with open(r'd:\AI编程\claude测试\VS code claude\buffett-ai\duan_biz_paragraphs.txt', 'w', encoding='utf-8') as f:
    for i, text in enumerate(all_text):
        f.write(f"{i}: {text}\n\n")

print("\nSaved paragraphs to duan_biz_paragraphs.txt")
