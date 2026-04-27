const fs = require('fs');

// 读取原始文本
const text = fs.readFileSync('charlie_raw.txt', 'utf-8');
const lines = text.split('\n');

// 定义章节标记 - 使用简单的单行标记
const contentMarkers = [
    { part: "第一讲", title: "在哈佛学校毕业典礼上的演讲", startMarker: "第一讲", endMarker: "第二讲" },
    { part: "第二讲", title: "论基本的、普世的智慧，及其与投资管理和商业的关系", startMarker: "第二讲", endMarker: "第三讲" },
    { part: "第三讲", title: "论基本的、普世的智慧（修正稿）", startMarker: "第三讲", endMarker: "第四讲" },
    { part: "第四讲", title: "关于现实思维的现实思考？", startMarker: "第四讲", endMarker: "第五讲" },
    { part: "第五讲", title: "专业人士需要更多的跨学科技能", startMarker: "第五讲", endMarker: "第六讲" },
    { part: "第六讲", title: "一流慈善基金的投资实践", startMarker: "第六讲", endMarker: "第七讲" },
    { part: "第七讲", title: "在慈善圆桌会议早餐会上的讲话", startMarker: "第七讲", endMarker: "第八讲" },
    { part: "第八讲", title: "2003年的金融大丑闻", startMarker: "第八讲", endMarker: "第九讲" },
    { part: "第九讲", title: "论学院派经济学：考虑跨学科需求之后的优点和缺点", startMarker: "第九讲", endMarker: "第十讲" },
    { part: "第十讲", title: "在南加州大学GOULD法学院毕业典礼上的演讲", startMarker: "第十讲", endMarker: "第十一讲" },
    { part: "第十一讲", title: "人类误判心理学", startMarker: "第十一讲", endMarker: "感谢" },
];

// 找到实际内容开始的位置（从line 8355开始，实际讲座内容）
let contentStart = 8350;

console.log(`Starting extraction from line ${contentStart}`);

// 提取每个章节
const articles = [];

for (let i = 0; i < contentMarkers.length; i++) {
    const item = contentMarkers[i];

    // 找到起始位置 - 查找包含标记的行
    let startLine = -1;
    for (let j = contentStart; j < lines.length; j++) {
        const line = lines[j].trim();
        if (line === item.startMarker || line.startsWith(item.startMarker + ' ') || line.startsWith(item.startMarker + '\n')) {
            startLine = j;
            break;
        }
    }

    // 找到结束位置
    let endLine = lines.length;
    if (startLine >= 0) {
        for (let j = startLine + 1; j < lines.length; j++) {
            const line = lines[j].trim();
            if (line === item.endMarker || line.startsWith(item.endMarker + ' ') || line.startsWith(item.endMarker + '\n')) {
                endLine = j;
                break;
            }
        }
    }

    if (startLine >= 0) {
        // 提取内容
        const content = lines.slice(startLine, endLine).join('\n').trim();

        articles.push({
            slug: `charlie-${i}`,
            index: i,
            part_zh: item.part,
            title_zh: item.title,
            content: content
        });

        console.log(`Extracted: ${item.part} - ${item.title} (${content.length} chars, lines ${startLine}-${endLine})`);
    } else {
        console.log(`NOT FOUND: ${item.part} - ${item.title}`);
    }
}

// 保存
fs.writeFileSync('data/charlie.json', JSON.stringify(articles, null, 2), 'utf-8');
console.log(`\nSaved ${articles.length} articles to data/charlie.json`);
