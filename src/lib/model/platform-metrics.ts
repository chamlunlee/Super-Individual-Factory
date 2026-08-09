import type { PlatformId } from "./platform-titles";

/** 平台上的关键互动/关系指标（非精确阈值） */
export type MetricKind =
  | "like"
  | "save"
  | "follow"
  | "comment"
  | "share"
  | "coin"
  | "open"
  | "star"
  | "completion";

export interface MetricTouchpoint {
  metric: MetricKind;
  label: string;
  /** 用户心里在说什么 */
  userMind: string;
  /** 内容要碰到的点 */
  contentHit: string;
  /** 创作检查 */
  checklist: string;
}

export interface PlatformMetricGuide {
  id: PlatformId;
  name: string;
  /** 本平台主攻指标（一人工作室优先盯这个） */
  primaryMetric: string;
  /** 建议上升顺序 */
  riseOrder: string;
  /** 漏斗一句话 */
  funnelNote: string;
  touchpoints: MetricTouchpoint[];
}

export const METRIC_FUNNEL =
  "曝光 → 停留/完播 → 浅互动(赞/评) → 深互动(藏/转/投币) → 关系(关注/星标)";

export const PLATFORM_METRIC_GUIDES: PlatformMetricGuide[] = [
  {
    id: "xiaohongshu",
    name: "小红书",
    primaryMetric: "收藏",
    riseOrder: "藏 → 赞 → 关",
    funnelNote: "算法更吃搜+藏；空共鸣难涨，先让人觉得「以后用得上」。",
    touchpoints: [
      {
        metric: "save",
        label: "收藏",
        userMind: "以后用得上",
        contentHit: "清单/步骤/避坑表、可搜索实体词、结果前置",
        checklist: "去掉清单与关键词后是否还值得藏？",
      },
      {
        metric: "like",
        label: "赞",
        userMind: "说中我了",
        contentHit: "身份点名、情绪共鸣、对比反差",
        checklist: "有没有「我就是这类人」的瞬间？",
      },
      {
        metric: "follow",
        label: "关注",
        userMind: "这类答案她还会继续给",
        contentHit: "系列感、人设稳定、结尾预告下一题",
        checklist: "单条看完是否觉得「还缺下一篇」？",
      },
    ],
  },
  {
    id: "douyin",
    name: "抖音",
    primaryMetric: "完播/停留",
    riseOrder: "完播 → 赞/评 → 关",
    funnelNote: "没完播，赞关都难稳定涨；钩子必须在正文前半兑现。",
    touchpoints: [
      {
        metric: "completion",
        label: "完播",
        userMind: "还想看下去",
        contentHit: "前 3 秒冲突、单点打穿、节奏不注水",
        checklist: "中后段是否突然变慢或跑题？",
      },
      {
        metric: "like",
        label: "赞",
        userMind: "这一下爽到/说到了",
        contentHit: "冲突兑现、金句可截、情绪爽点",
        checklist: "钩子是否在正文前半兑现？",
      },
      {
        metric: "comment",
        label: "评",
        userMind: "我要站队/补充",
        contentHit: "二选一、反常识、可抬杠观点",
        checklist: "结尾有没有可回答的钩子？",
      },
      {
        metric: "save",
        label: "藏",
        userMind: "回头还要看",
        contentHit: "方法密度够（相对少见，别当主目标）",
        checklist: "是否真有可复看结构？",
      },
      {
        metric: "follow",
        label: "关注",
        userMind: "下一条还想刷到他",
        contentHit: "人设清晰、系列预告、损失感收尾",
        checklist: "关注理由是否比「这条不错」更强？",
      },
    ],
  },
  {
    id: "shipinhao",
    name: "视频号",
    primaryMetric: "转发/完播",
    riseOrder: "完播 → 转 → 关",
    funnelNote: "社交转发权重高，纯爽点赞不如「可转给适合的人」。",
    touchpoints: [
      {
        metric: "completion",
        label: "完播",
        userMind: "听得下去、不刺耳",
        contentHit: "稳妥节奏、信息不过载、生活场景开场",
        checklist: "语速与态度是否适合普通人转发场景？",
      },
      {
        metric: "like",
        label: "赞",
        userMind: "温和认同",
        contentHit: "稳妥提醒、不羞辱、家庭/同事可听",
        checklist: "转给长辈会不会尴尬？",
      },
      {
        metric: "share",
        label: "转发",
        userMind: "转给适合的人",
        contentHit: "一句可转述结论、生活收益明确",
        checklist: "标题/结尾能否当转发语？",
      },
      {
        metric: "follow",
        label: "关注",
        userMind: "这个号说话靠谱",
        contentHit: "连续价值、私域钩子轻、不硬广",
        checklist: "是否像「可长期听的提醒」？",
      },
    ],
  },
  {
    id: "bilibili",
    name: "B站",
    primaryMetric: "完播/投币",
    riseOrder: "完播 → 币/藏 → 关",
    funnelNote: "标题深、内容浅会杀关注；用密度与框架换币和藏。",
    touchpoints: [
      {
        metric: "completion",
        label: "完播",
        userMind: "值得把这期看完",
        contentHit: "结构完整、中段不注水、承诺兑现",
        checklist: "中段是否注水？",
      },
      {
        metric: "like",
        label: "赞",
        userMind: "讲清楚了",
        contentHit: "信息密度、论证清楚",
        checklist: "有没有一句能当结论带走？",
      },
      {
        metric: "coin",
        label: "投币",
        userMind: "值得支持",
        contentHit: "独家框架、认真拆解、观点站得住",
        checklist: "有没有「只有这里讲透」的一层？",
      },
      {
        metric: "save",
        label: "收藏",
        userMind: "当资料留着",
        contentHit: "方法论/对照表/可暂停笔记",
        checklist: "是否方便二刷做笔记？",
      },
      {
        metric: "follow",
        label: "关注",
        userMind: "追这个 UP",
        contentHit: "系列化、人设专业、片尾预告",
        checklist: "是否承诺得起下一期？",
      },
    ],
  },
  {
    id: "gongzhonghao",
    name: "公众号",
    primaryMetric: "打开/在看/转发",
    riseOrder: "打开 → 在看/转 → 星标",
    funnelNote: "订阅流先赢打开；再用可转述框架赢在看与星标。",
    touchpoints: [
      {
        metric: "open",
        label: "打开",
        userMind: "这题和我有关",
        contentHit: "议题清晰、观点承诺、非纯悬念",
        checklist: "订阅流 1 秒能否读懂收益？",
      },
      {
        metric: "share",
        label: "在看/转发",
        userMind: "适合发群/朋友圈",
        contentHit: "可转述框架、不网感过重",
        checklist: "同事群转是否得体？",
      },
      {
        metric: "star",
        label: "星标/关注",
        userMind: "当工具号留着",
        contentHit: "系列专栏、清单附录、私域承接",
        checklist: "读完是否留下「可复用物」？",
      },
    ],
  },
];

/**
 * 更好评论数据：跨平台共性 + 分平台方法
 * 「好评论」= 可讨论、可站队、可补充，而不是纯表情刷屏。
 */
export const COMMENT_COMMON_RULES: string[] = [
  "先给观点/冲突，再给方法：没有立场就没有评论燃料",
  "降低开口成本：二选一、填空、扣关键词，比开放题更好开评",
  "问「可回答的具体题」，别问「你们怎么看」这种空题",
  "评论区当第二战场：作者置顶、前排追评、点名补充，延长讨论",
  "完播/读完之后才问：问题太早会打断，太晚会被划走",
  "好评论可转化：把评论答成私信/下一篇钩子，而不是只刷数量",
];

export interface PlatformCommentPlaybook {
  id: PlatformId;
  name: string;
  /** 该平台评论的典型形态 */
  commentShape: string;
  /** 开评钩子（可直接套用） */
  hooks: string[];
  /** 结构手法 */
  tactics: string[];
  /** 避免 */
  avoid: string[];
  /** 作者运营动作 */
  authorMoves: string[];
}

export const PLATFORM_COMMENT_PLAYBOOKS: PlatformCommentPlaybook[] = [
  {
    id: "xiaohongshu",
    name: "小红书",
    commentShape: "求同款/求清单/补充踩坑/身份对号入座",
    hooks: [
      "评论区扣「清单」，发你可收藏的步骤卡",
      "你是学生党还是上班族？说下预算我帮你对号",
      "踩过坑的扣 1，我置顶常见雷区",
    ],
    tactics: [
      "正文给 80%，评论区留 20%（完整表/对照）逼评论领取",
      "用身份选择题开评（宝妈/学生党/预算党）",
      "首图或文末放「评论关键词」指令，指令要短",
    ],
    avoid: [
      "只写「有用吗」无具体领口令",
      "硬广式私信引导过早，评论还没热起来",
    ],
    authorMoves: [
      "置顶一条「标准答 + 追问」示范评论口吻",
      "对高赞评论二次回复，引导补预算/场景",
      "把重复问题收成下一篇选题",
    ],
  },
  {
    id: "douyin",
    name: "抖音",
    commentShape: "站队吵架、二选一、反驳金句、刷屏口令",
    hooks: [
      "你选 A 还是 B？错了真的很亏",
      "同意的扣「对」，不认同的说你的版本",
      "评论「方法」，置顶发可执行的那一步",
    ],
    tactics: [
      "片尾 2 秒只留一个问题，口播与字幕同步",
      "制造可抬杠的反常识，但正文必须兑现",
      "用短指令词（对/方法/1）降低输入成本",
    ],
    avoid: [
      "问题太长、一次问三件事",
      "钩子骗评不兑现，伤权重也伤信任",
    ],
    authorMoves: [
      "前 30 分钟高强度回评，带节奏",
      "把对立评论当素材，下一条正面打脸/拆解",
      "置顶「正确选项 + 一句理由」引导跟风",
    ],
  },
  {
    id: "shipinhao",
    name: "视频号",
    commentShape: "温和认同、经验补充、转给谁的备注",
    hooks: [
      "如果你也卡在这步，留言你的情况，我按场景回",
      "这句话最想转给谁？评论区打个称呼就行",
      "做过有效的，补充一条你的经验",
    ],
    tactics: [
      "语气稳妥，邀请「补充」而非「吵架」",
      "用生活场景提问（家人/同事/通勤）",
      "结尾给一句可转发语，方便评论复述",
    ],
    avoid: [
      "羞辱式抬杠、过度网感口令",
      "诱导刷屏却无实质可回",
    ],
    authorMoves: [
      "精选温和高质量评论，树立评论区气质",
      "对补充经验的评论公开致谢并追问细节",
      "把「可转发句」写进片尾字幕",
    ],
  },
  {
    id: "bilibili",
    name: "B站",
    commentShape: "弹幕梗 + 长评拆解 + 时间戳指路 + 观点站队",
    hooks: [
      "不同意这层机制的，留言你的变量，我下期对照",
      "觉得讲透的三连；觉得缺哪一块直接点时间戳",
      "弹幕可以打「框架」，评论区展开你的版本",
    ],
    tactics: [
      "片中埋「可辩论命题」，片尾回收成开放题",
      "鼓励长评：给框架空位让观众补案例",
      "用章节/时间戳方便评论引用某一段",
    ],
    avoid: [
      "只有口水站队没有信息增量",
      "标题党引发的无效骂战（难转化关注）",
    ],
    authorMoves: [
      "置顶高信息密度长评，立标准",
      "弹幕热词收进简介/下一期大纲",
      "对认真反对的评论做「对照更新」更涨信任",
    ],
  },
  {
    id: "gongzhonghao",
    name: "公众号",
    commentShape: "留言精选、追问框架、求附录/原文结构",
    hooks: [
      "留言你最卡的一步，下篇按高频问题拆",
      "需要完整清单的，留言「框架」",
      "你更想看案例还是模型？投个票我按票写",
    ],
    tactics: [
      "文末留「二选一选题」而不是空泛征集",
      "用精选留言制造「被看见」激励",
      "把评论承诺写成下一篇标题（闭环）",
    ],
    avoid: [
      "只说「欢迎留言」无具体题",
      "从不回复精选，评论动力衰减",
    ],
    authorMoves: [
      "每日精选 3–5 条并短评回应",
      "把高频留言变成系列目录",
      "私域承接写在留言回复模板里（轻、不硬广）",
    ],
  },
];

/** 片型 → 优先平台与本条主攻（一人工作室实操） */
export const PRESET_METRIC_FOCUS: Array<{
  presetId: string;
  presetLabel: string;
  platforms: string;
  focus: string;
}> = [
  {
    presetId: "knowledge_classic",
    presetLabel: "知识口播",
    platforms: "视频号 / 公众号 / B站",
    focus: "完播 + 转/币",
  },
  {
    presetId: "punch_animation",
    presetLabel: "金句冲击",
    platforms: "抖音",
    focus: "完播 + 赞评",
  },
  {
    presetId: "list_classic",
    presetLabel: "清单三条",
    platforms: "小红书",
    focus: "收藏",
  },
];

export function getPlatformMetricGuide(
  id: PlatformId
): PlatformMetricGuide | undefined {
  return PLATFORM_METRIC_GUIDES.find((g) => g.id === id);
}
