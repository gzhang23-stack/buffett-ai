const fs = require('fs');

// 读取原始文本
const text = fs.readFileSync('duan_biz_raw.txt', 'utf-8');
const lines = text.split('\n');

// 定义目录结构
const structure = [
    { part: "前言", title: "买股票就是买公司", startMarker: "前言：买股票就是买公司" },
    { part: "第1节：伟大企业", title: "什么样的企业是伟大的企业", startMarker: "一、什么样的企业是伟大的企业" },
    { part: "第1节：伟大企业", title: "伟大公司管理层(CEO)：造钟人", startMarker: "二、伟大公司管理层(CEO)：造钟人" },
    { part: "第1节：伟大企业", title: "长长的坡，厚厚的雪：滚雪球", startMarker: "三、长长的坡，厚厚的雪" },
    { part: "第2节：商业模式", title: "商业模式最重要", startMarker: "一、商业模式最重要" },
    { part: "第2节：商业模式", title: "差异化是好商业模式的前提", startMarker: "二、差异化是好商业模式的前提" },
    { part: "第2节：商业模式", title: "护城河是商业模式最重要的部分", startMarker: "三、护城河是商业模式最重要的部分" },
    { part: "第2节：商业模式", title: "要有好的企业文化做支撑", startMarker: "四、要有好的企业文化做支撑" },
    { part: "第2节：商业模式", title: "30个商业案例点评", startMarker: "五、30 个商业案例点评" },
    { part: "第3节：企业文化", title: "企业文化", startMarker: "一、企业文化" },
    { part: "第3节：企业文化", title: "核心价值观", startMarker: "二、核心价值观" },
    { part: "第3节：企业文化", title: "本分和平常心", startMarker: "三、本分和平常心" },
    { part: "第3节：企业文化", title: "团队合作", startMarker: "四、团队合作" },
    { part: "第3节：企业文化", title: "消费者导向", startMarker: "五、消费者导向" },
    { part: "第3节：企业文化", title: "基业长青", startMarker: "六、基业长青" },
    { part: "第3节：企业文化", title: "26个企业文化案例点评", startMarker: "七、26 个企业文化案例点评" },
    { part: "第4节：产品、差异化与创新", title: "好产品", startMarker: "一、好产品" },
    { part: "第4节：产品、差异化与创新", title: "产品差异化", startMarker: "二、产品差异化" },
    { part: "第4节：产品、差异化与创新", title: "创新", startMarker: "三、创新" },
    { part: "第5节：品牌、营销与广告", title: "品牌", startMarker: "一、品牌" },
    { part: "第5节：品牌、营销与广告", title: "营销", startMarker: "二、营销" },
    { part: "第5节：品牌、营销与广告", title: "广告", startMarker: "三、广告" },
    { part: "第6节：收购和多元化", title: "收购", startMarker: "一、收购" },
    { part: "第6节：收购和多元化", title: "多元化", startMarker: "二、多元化" },
    { part: "第7节：Stop doing list（不为清单）", title: "Stop doing list（不为清单）", startMarker: "第 7 节：Stop doing list" },
];

// 找到每个章节的起始位置
console.log('Finding section positions...');
const positions = [];

for (let i = 0; i < structure.length; i++) {
    const item = structure[i];
    let found = false;

    for (let j = 0; j < lines.length; j++) {
        const line = lines[j].trim();
        if (line.includes(item.startMarker) || line.startsWith(item.startMarker)) {
            positions.push({ ...item, lineIndex: j });
            console.log(`Found: ${item.part} - ${item.title} at line ${j}`);
            found = true;
            break;
        }
    }

    if (!found) {
        console.log(`NOT FOUND: ${item.part} - ${item.title} (marker: ${item.startMarker})`);
    }
}

console.log(`\nFound ${positions.length} out of ${structure.length} sections`);

// 保存位置信息
fs.writeFileSync('duan_biz_positions.json', JSON.stringify(positions, null, 2), 'utf-8');
console.log('Saved positions to duan_biz_positions.json');
