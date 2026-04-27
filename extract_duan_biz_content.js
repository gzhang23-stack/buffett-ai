const fs = require('fs');

// 读取原始文本
const text = fs.readFileSync('duan_biz_raw.txt', 'utf-8');
const lines = text.split('\n');

// 定义章节标记（实际内容中的标记）
const contentMarkers = [
    { part: "前言", title: "买股票就是买公司", marker: "前言：买股票就是买公司", nextMarker: "第 1 节：伟大企业" },
    { part: "第1节：伟大企业", title: "什么样的企业是伟大的企业", marker: "一、什么样的企业是伟大的企业", nextMarker: "二、伟大公司管理层" },
    { part: "第1节：伟大企业", title: "伟大公司管理层(CEO)：造钟人", marker: "二、伟大公司管理层", nextMarker: "三、长长的坡" },
    { part: "第1节：伟大企业", title: "长长的坡，厚厚的雪：滚雪球", marker: "三、长长的坡", nextMarker: "第 2 节：商业模式" },
    { part: "第2节：商业模式", title: "商业模式最重要", marker: "一、商业模式最重要", nextMarker: "二、差异化是好商业模式的前提" },
    { part: "第2节：商业模式", title: "差异化是好商业模式的前提", marker: "二、差异化是好商业模式的前提", nextMarker: "三、护城河是商业模式最重要的部分" },
    { part: "第2节：商业模式", title: "护城河是商业模式最重要的部分", marker: "三、护城河是商业模式最重要的部分", nextMarker: "四、要有好的企业文化做支撑" },
    { part: "第2节：商业模式", title: "要有好的企业文化做支撑", marker: "四、要有好的企业文化做支撑", nextMarker: "五、30 个商业案例点评" },
    { part: "第2节：商业模式", title: "30个商业案例点评", marker: "五、30 个商业案例点评", nextMarker: "第 3 节：企业文化" },
    { part: "第3节：企业文化", title: "企业文化", marker: "一、企业文化", nextMarker: "二、核心价值观" },
    { part: "第3节：企业文化", title: "核心价值观", marker: "二、核心价值观", nextMarker: "三、本分和平常心" },
    { part: "第3节：企业文化", title: "本分和平常心", marker: "三、本分和平常心", nextMarker: "四、团队合作" },
    { part: "第3节：企业文化", title: "团队合作", marker: "四、团队合作", nextMarker: "五、消费者导向" },
    { part: "第3节：企业文化", title: "消费者导向", marker: "五、消费者导向", nextMarker: "六、基业长青" },
    { part: "第3节：企业文化", title: "基业长青", marker: "六、基业长青", nextMarker: "七、26 个企业文化案例点评" },
    { part: "第3节：企业文化", title: "26个企业文化案例点评", marker: "七、26 个企业文化案例点评", nextMarker: "第 4 节：产品、差异化与创新" },
    { part: "第4节：产品、差异化与创新", title: "好产品", marker: "一、好产品", nextMarker: "二、产品差异化" },
    { part: "第4节：产品、差异化与创新", title: "产品差异化", marker: "二、产品差异化", nextMarker: "三、创新" },
    { part: "第4节：产品、差异化与创新", title: "创新", marker: "三、创新", nextMarker: "第 5 节：品牌、营销与广告" },
    { part: "第5节：品牌、营销与广告", title: "品牌", marker: "一、品牌", nextMarker: "二、营销" },
    { part: "第5节：品牌、营销与广告", title: "营销", marker: "二、营销", nextMarker: "三、广告" },
    { part: "第5节：品牌、营销与广告", title: "广告", marker: "三、广告", nextMarker: "第 6 节：收购和多元化" },
    { part: "第6节：收购和多元化", title: "收购", marker: "一、收购", nextMarker: "二、多元化" },
    { part: "第6节：收购和多元化", title: "多元化", marker: "二、多元化", nextMarker: "第 7 节：Stop doing list" },
    { part: "第7节：Stop doing list（不为清单）", title: "Stop doing list（不为清单）", marker: "第 7 节：Stop doing list", nextMarker: "感谢" },
];

// 找到实际内容开始的位置（跳过目录）
let contentStart = 0;
for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim() === "前言：买股票就是买公司" && i > 150) {
        contentStart = i;
        break;
    }
}

console.log(`Content starts at line ${contentStart}`);

// 提取每个章节
const articles = [];

for (let i = 0; i < contentMarkers.length; i++) {
    const item = contentMarkers[i];

    // 找到起始位置
    let startLine = -1;
    for (let j = contentStart; j < lines.length; j++) {
        if (lines[j].includes(item.marker)) {
            startLine = j;
            break;
        }
    }

    // 找到结束位置
    let endLine = lines.length;
    if (item.nextMarker) {
        for (let j = startLine + 1; j < lines.length; j++) {
            if (lines[j].includes(item.nextMarker)) {
                endLine = j;
                break;
            }
        }
    }

    if (startLine >= 0) {
        // 提取内容
        const content = lines.slice(startLine, endLine).join('\n').trim();

        articles.push({
            slug: `duan-biz-${i}`,
            index: i,
            part_zh: item.part,
            title_zh: item.title,
            content: content
        });

        console.log(`Extracted: ${item.part} - ${item.title} (${content.length} chars)`);
    } else {
        console.log(`NOT FOUND: ${item.part} - ${item.title}`);
    }
}

// 保存
fs.writeFileSync('data/duan_biz.json', JSON.stringify(articles, null, 2), 'utf-8');
console.log(`\nSaved ${articles.length} articles to data/duan_biz.json`);
