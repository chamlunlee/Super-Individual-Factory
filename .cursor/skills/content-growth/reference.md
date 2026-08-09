# 同源规则参考（与 Web prompts 对齐）

Web 实现：

- `src/lib/prompts/triple-line.ts`
- `src/lib/prompts/title-radar.ts`
- `src/lib/model/types.ts`

## 三点一线 JSON 字段

```json
{
  "graph": {
    "keyword": "二奢",
    "center": { "id": "l0", "label": "二奢", "layer": "L0" },
    "synonyms": ["二手奢侈品"],
    "upstreamDownstream": ["腕表", "包袋"],
    "items": [{ "id": "l1-1", "label": "包包", "layer": "L1" }],
    "audiences": [{ "id": "l2a-1", "label": "学生党", "layer": "L2a" }],
    "motives": [{ "id": "l2b-1", "label": "识别真假", "layer": "L2b" }]
  },
  "questions": [{
    "id": "q1",
    "formula": "audience_item_motive",
    "nodes": ["学生党", "包包", "识别真假"],
    "question": "学生党买二奢怎么去识别真假？",
    "options": ["A路径", "B路径", "C路径", "D路径"],
    "hookStrength": 90,
    "targetAudience": "预算敏感学生党",
    "contentFormat": "短视频",
    "cta": "鉴定"
  }]
}
```

`formula` 枚举：

- `audience_item_motive`
- `audience_item_social`
- `audience_item_value`
- `pain_service_audience`

`contentFormat`：`图文` | `短视频` | `投票`

`cta`：`鉴定` | `估价` | `社群` | `私域` | `回收` | `置换` | `课程` | `咨询`

## 标题雷达 JSON 字段

```json
{
  "scores": {
    "subject": 86,
    "sentencePattern": 90,
    "userPerception": 88,
    "viewpoint": 72
  },
  "diagnosis": "...",
  "patterns": [{ "label": "身份 + 品类 + 问句", "kind": "句式", "count": 4 }],
  "generated": [{
    "title": "...",
    "outline": ["...", "...", "..."],
    "cta": "..."
  }]
}
```

## 示例三点一线（二奢）

- 买什么样的包包在聚会上能压过闺蜜一头？
- 上班通勤买什么样的包包最能搭配出高级感？
- 创业者想入手劳力士，买什么样的二手劳力士是最保值的？
- 学生党买二奢怎么去识别真假？

## 示例三点一线（女追男）

节点示例：
- L1：开场破冰、日常聊天、约会邀约、暧昧升温、表白时机、冷淡挽回…
- L2a：社恐女生、暗恋党、职场女生、大学生、相亲党…
- L2b：怕被当备胎、聊天天折、约会翻车、暧昧耗着、怕被拒绝…
- 上下游：形象管理、聊天话术、社交平台、约会规划、情绪价值、边界感

题目示例：
- 社恐女生聊天天折时，用什么样的开场破冰最不容易冷场？
- 暗恋党想确认心意，表白时机选早还是选晚？
- 面对被冷暴力，职场女生该如何用边界感做对第一步？
