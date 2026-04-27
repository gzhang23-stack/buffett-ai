const fs = require('fs');

// 读取原始文本
const text = fs.readFileSync('charlie_raw.txt', 'utf-8');
const lines = text.split('\n');

// 定义所有章节标记 - 使用实际内容位置
const contentMarkers = [
    // 前言部分 (从line 280开始)
    { part: "前言", title: "中文版序言：书中自有黄金屋", startLine: 280, endLine: 650 },
    { part: "前言", title: "鸣谢", startLine: 650, endLine: 750 },
    { part: "前言", title: "序言：巴菲特论芒格", startLine: 750, endLine: 850 },
    { part: "前言", title: "驳辞：芒格论巴菲特", startLine: 850, endLine: 950 },
    { part: "前言", title: "导读", startLine: 950, endLine: 1129 },

    // 第一章 (line 1129-3419)
    { part: "第一章", title: "查理·芒格传略", startLine: 1129, endLine: 2235 },
    { part: "第一章", title: "歌颂长者：芒格论晚年", startLine: 2235, endLine: 2781 },
    { part: "第一章", title: "忆念：晚辈谈芒格", startLine: 2781, endLine: 3189 },
    { part: "第一章", title: "朋友们如是说", startLine: 3189, endLine: 3419 },

    // 第二章 (line 3419-5065)
    { part: "第二章", title: "芒格的生活、学习和决策方法", startLine: 3419, endLine: 5065 },

    // 第三章 (line 5065-8153)
    { part: "第三章", title: "芒格主义：查理的即席谈话", startLine: 5065, endLine: 8153 },

    // 第四章 - 11个讲座 (line 8153-22855)
    { part: "第四章·第一讲", title: "在哈佛学校毕业典礼上的演讲", startLine: 8354, endLine: 9002 },
    { part: "第四章·第二讲", title: "论基本的、普世的智慧，及其与投资管理和商业的关系", startLine: 9002, endLine: 11348 },
    { part: "第四章·第三讲", title: "论基本的、普世的智慧（修正稿）", startLine: 11348, endLine: 14146 },
    { part: "第四章·第四讲", title: "关于现实思维的现实思考？", startLine: 14146, endLine: 15008 },
    { part: "第四章·第五讲", title: "专业人士需要更多的跨学科技能", startLine: 15008, endLine: 15910 },
    { part: "第四章·第六讲", title: "一流慈善基金的投资实践", startLine: 15910, endLine: 16538 },
    { part: "第四章·第七讲", title: "在慈善圆桌会议早餐会上的讲话", startLine: 16538, endLine: 17060 },
    { part: "第四章·第八讲", title: "2003年的金融大丑闻", startLine: 17060, endLine: 17738 },
    { part: "第四章·第九讲", title: "论学院派经济学：考虑跨学科需求之后的优点和缺点", startLine: 17738, endLine: 19762 },
    { part: "第四章·第十讲", title: "在南加州大学GOULD法学院毕业典礼上的演讲", startLine: 19762, endLine: 20620 },
    { part: "第四章·第十一讲", title: "人类误判心理学", startLine: 20620, endLine: 22855 },

    // 第五章 (line 22855-end)
    { part: "第五章", title: "文章、报道与评论", startLine: 22855, endLine: 25800 },
];

console.log(`Extracting ${contentMarkers.length} sections...`);

// 提取每个章节
const articles = [];

for (let i = 0; i < contentMarkers.length; i++) {
    const item = contentMarkers[i];

    // 提取内容
    const content = lines.slice(item.startLine, item.endLine).join('\n').trim();

    articles.push({
        slug: `charlie-${i}`,
        index: i,
        part_zh: item.part,
        title_zh: item.title,
        content: content
    });

    console.log(`Extracted: ${item.part} - ${item.title} (${content.length} chars, lines ${item.startLine}-${item.endLine})`);
}

// 保存
fs.writeFileSync('data/charlie.json', JSON.stringify(articles, null, 2), 'utf-8');
console.log(`\nSaved ${articles.length} articles to data/charlie.json`);
