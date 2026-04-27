const fs = require('fs');
const text = fs.readFileSync('charlie_raw.txt', 'utf-8');
const lines = text.split('\n');

const markers = [
    "如果说标准石油正在试图变得贪婪的话",
    "巴菲特的副手……",
    "互助储蓄与贷款联盟的请辞信",
    "反托拉斯法的滥用",
    "芒格科学中心接近完工",
    "不那么沉默的合伙人",
    "乐观主义在会计中没有容身之地",
    "贝西克兰兴衰记：关于一个国家如何陷入经济崩溃的寓言",
    '"贪无厌""高财技""黑心肠"和"脑残"国的悲剧',
    "查理·芒格的推荐书目",
    "查理·芒格年谱"
];

for (const marker of markers) {
    for (let i = 22800; i < lines.length; i++) {
        if (lines[i].includes(marker)) {
            console.log(`${marker}: line ${i}`);
            break;
        }
    }
}
