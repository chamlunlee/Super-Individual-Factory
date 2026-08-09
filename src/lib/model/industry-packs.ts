/** 按行业语义提供的节点包（用于无 LLM / 降级时，避免「入门款」「XX上游」硬套） */

export type IndustryKind =
  | "relationship"
  | "skill"
  | "local_service"
  | "content"
  | "product";

export interface IndustryPack {
  kind: IndustryKind;
  synonyms: string[];
  upstreamDownstream: string[];
  items: string[];
  audiences: string[];
  motives: string[];
  ctas?: Array<"鉴定" | "估价" | "社群" | "私域" | "回收" | "置换" | "课程" | "咨询">;
}

const RELATIONSHIP_PACK: IndustryPack = {
  kind: "relationship",
  synonyms: ["追男生", "暧昧经营", "恋爱主动", "脱单策略"],
  upstreamDownstream: [
    "形象管理",
    "聊天话术",
    "社交平台",
    "约会规划",
    "情绪价值",
    "边界感",
  ],
  items: [
    "开场破冰",
    "日常聊天",
    "约会邀约",
    "朋友圈经营",
    "暧昧升温",
    "表白时机",
    "冷淡挽回",
    "边界感把握",
    "形象提升",
    "情绪价值",
    "社交破圈",
    "长期关系维护",
  ],
  audiences: [
    "社恐女生",
    "主动型女生",
    "暗恋党",
    "分手想复合",
    "职场女生",
    "大学生",
    "大龄未恋",
    "相亲党",
    "备胎逆袭",
    "闺蜜军师",
  ],
  motives: [
    "怕被当备胎",
    "不敢主动",
    "聊天天折",
    "约会翻车",
    "暧昧耗着",
    "被冷暴力",
    "朋友圈装看不见",
    "想确认心意",
    "怕被拒绝",
    "想稳进关系",
  ],
  ctas: ["课程", "社群", "私域", "咨询"],
};

const SKILL_PACK: IndustryPack = {
  kind: "skill",
  synonyms: [],
  upstreamDownstream: ["认知基础", "实操训练", "陪跑社群", "作品反馈", "变现路径"],
  items: [
    "入门路径",
    "方法论",
    "实操练习",
    "避坑清单",
    "案例拆解",
    "工具模板",
    "陪跑答疑",
    "作品点评",
    "阶段测评",
    "进阶课",
  ],
  audiences: [
    "零基础新手",
    "自学卡住党",
    "上班族转行",
    "学生党",
    "宝妈斜杠",
    "自由职业",
    "团队负责人",
    "内容创作者",
    "想快速出结果",
    "预算有限党",
  ],
  motives: [
    "快速上手",
    "少走弯路",
    "做出作品",
    "通过面试",
    "副业变现",
    "时间不够",
    "坚持不下去",
    "不知道学什么",
    "对比选课",
    "怕交智商税",
  ],
  ctas: ["课程", "社群", "私域", "咨询"],
};

const LOCAL_SERVICE_PACK: IndustryPack = {
  kind: "local_service",
  synonyms: [],
  upstreamDownstream: ["到店体验", "预约排期", "售后回访", "口碑转介", "耗材/方案"],
  items: [
    "到店项目",
    "套餐对比",
    "效果保障",
    "售后维权",
    "价格透明",
    "预约排期",
    "新手体验",
    "会员福利",
    "案例前后对比",
    "注意事项",
  ],
  audiences: [
    "第一次尝鲜",
    "追求效果党",
    "价格敏感",
    "上班族",
    "学生党",
    "宝妈",
    "婚礼筹备",
    "节日送礼",
    "怕踩坑的人",
    "老客复购",
  ],
  motives: [
    "怕踩坑",
    "要效果",
    "比价纠结",
    "时间紧张",
    "社交场合",
    "售后担忧",
    "敏感肌/特殊情况",
    "想省心打包",
    "看口碑下单",
    "犹豫要不要办卡",
  ],
  ctas: ["咨询", "私域", "社群", "估价"],
};

const CONTENT_PACK: IndustryPack = {
  kind: "content",
  synonyms: [],
  upstreamDownstream: ["选题策划", "脚本结构", "拍摄剪辑", "账号定位", "变现转化"],
  items: [
    "选题库",
    "标题公式",
    "脚本结构",
    "开头钩子",
    "人设表达",
    "拍摄技巧",
    "剪辑节奏",
    "评论区互动",
    "引流话术",
    "变现路径",
  ],
  audiences: [
    "新手博主",
    "垂直领域创作者",
    "兼职运营",
    "商家老板",
    "矩阵号操盘手",
    "学生党",
    "宝妈博主",
    "职场IP",
    "想涨粉",
    "想变现",
  ],
  motives: [
    "没灵感",
    "完播低",
    "涨粉慢",
    "不会转化",
    "怕违规",
    "同质化严重",
    "镜头社恐",
    "更新坚持不住",
    "想做出爆款",
    "想接到商单",
  ],
  ctas: ["课程", "社群", "私域", "咨询"],
};

const PRODUCT_PACK: IndustryPack = {
  kind: "product",
  synonyms: [],
  upstreamDownstream: ["选品对比", "渠道购买", "售后保障", "保养维护", "转卖残值"],
  items: [
    "热门款",
    "性价比款",
    "对比测评",
    "避坑指南",
    "真假鉴别",
    "价格行情",
    "保养护理",
    "售后服务",
    "回收置换",
    "新手清单",
  ],
  audiences: [
    "新手小白",
    "进阶玩家",
    "预算党",
    "上班族",
    "学生党",
    "宝妈",
    "送礼党",
    "内容博主",
    "收藏向玩家",
    "圈层朋友",
  ],
  motives: [
    "省钱捡漏",
    "避坑防骗",
    "社交体面",
    "保值投资",
    "通勤实用",
    "聚会出片",
    "售后保障",
    "真假难辨",
    "决策焦虑",
    "跟风种草",
  ],
  ctas: ["鉴定", "估价", "社群", "私域", "咨询"],
};

/** 精确/模糊匹配的行业包 */
const NAMED_PACKS: Array<{ test: RegExp; pack: IndustryPack }> = [
  {
    test: /女追男|追男|追男生|撩男|拿下男生|暧昧|脱单|恋爱|相亲|挽回|复合/,
    pack: {
      ...RELATIONSHIP_PACK,
      synonyms: ["追男生", "暧昧经营", "主动追爱", "脱单攻略"],
    },
  },
  {
    test: /男追女|追女|撩妹|追女生/,
    pack: {
      ...RELATIONSHIP_PACK,
      synonyms: ["追女生", "撩妹技巧", "主动追求", "脱单攻略"],
      audiences: [
        "社恐男生",
        "木讷理工男",
        "暗恋党",
        "分手想复合",
        "职场男生",
        "大学生",
        "大龄未婚",
        "相亲党",
        "备胎逆袭",
        "兄弟参谋",
      ],
      items: [
        "开场破冰",
        "日常聊天",
        "邀约约会",
        "朋友圈人设",
        "暧昧升温",
        "表白时机",
        "被冷淡应对",
        "边界感",
        "形象提升",
        "情绪价值",
        "送礼分寸",
        "长期经营",
      ],
    },
  },
];

export function detectIndustryKind(keyword: string): IndustryKind {
  const k = keyword.trim();
  if (/女追男|男追女|追男|追女|撩|暧昧|脱单|恋爱|相亲|挽回|复合|恋爱脑/.test(k)) {
    return "relationship";
  }
  if (/短视频|直播|公众号|小红书|选题|账号|涨粉|爆款|口播|剪辑/.test(k)) {
    return "content";
  }
  if (/美甲|理发|美容|家政|装修|驾校|牙科|医美|瑜伽|健身私教|月子|摄影跟拍/.test(k)) {
    return "local_service";
  }
  if (/学习|考试|考证|编程|英语|考研|公考|职场技能|副业|训练营|陪跑/.test(k)) {
    return "skill";
  }
  if (/二奢|手表|包|数码|手机|球鞋|酒|茶|家具|车|房|收藏|潮玩/.test(k)) {
    return "product";
  }
  // 默认按「方法论/内容议题」处理，避免再套商品「入门款」
  if (/追|恋|爱|婚|社交|人际|沟通|情绪|心理/.test(k)) {
    return "relationship";
  }
  return "skill";
}

export function resolveIndustryPack(keyword: string): IndustryPack {
  const trimmed = keyword.trim();
  for (const { test, pack } of NAMED_PACKS) {
    if (test.test(trimmed)) {
      return pack;
    }
  }

  const kind = detectIndustryKind(trimmed);
  const base =
    kind === "relationship"
      ? RELATIONSHIP_PACK
      : kind === "content"
        ? CONTENT_PACK
        : kind === "local_service"
          ? LOCAL_SERVICE_PACK
          : kind === "product"
            ? PRODUCT_PACK
            : SKILL_PACK;

  return {
    ...base,
    synonyms:
      base.synonyms.length > 0
        ? base.synonyms
        : [`${trimmed}攻略`, `${trimmed}方法`, `${trimmed}避坑`],
    upstreamDownstream: base.upstreamDownstream.map((s) =>
      s.includes(trimmed) ? s : s
    ),
  };
}

export function questionTemplates(kind: IndustryKind) {
  return {
    audience_item_motive: (audience: string, item: string, motive: string) =>
      kind === "relationship"
        ? `${audience}在「${motive}」时，用什么样的「${item}」最不容易翻车？`
        : kind === "product"
          ? `${audience}出于「${motive}」，选什么样的「${item}」最不容易踩坑？`
          : `${audience}因为「${motive}」，该先抓哪一类「${item}」？`,
    audience_item_social: (audience: string, item: string) =>
      kind === "relationship"
        ? `${audience}想在同龄人里不显得慌，怎样的「${item}」最能稳住场面？`
        : `${audience}在社交场合，怎样的「${item}」最能压过同场的人一头？`,
    audience_item_value: (audience: string, item: string, keyword: string) =>
      kind === "relationship"
        ? `${audience}想把「${keyword}」做成长期结果，在「${item}」上最值得投入什么？`
        : kind === "product"
          ? `${audience}想在${keyword}赛道入手「${item}」，怎样选择最保值？`
          : `${audience}学/做「${keyword}」时，在「${item}」上怎样投入最值？`,
    pain_service_audience: (motive: string, item: string, audience: string) =>
      `面对「${motive}」，${audience}该如何用「${item}」做对第一步？`,
  };
}

export function optionTemplates(
  kind: IndustryKind,
  item: string
): [string, string, string, string] {
  if (kind === "relationship") {
    return [
      `先稳住节奏，把「${item}」做轻做稳`,
      `直接加码推进，赌对方有感觉`,
      `先观察信号，再决定要不要「${item}」`,
      `先找军师复盘，再动手做「${item}」`,
    ];
  }
  if (kind === "product") {
    return [
      `优先选更稳妥的${item}`,
      `赌高辨识度的${item}`,
      `先做功课再出手${item}`,
      `先咨询再决策${item}`,
    ];
  }
  return [
    `先打底，把「${item}」做成最小闭环`,
    `直接上高强度「${item}」冲结果`,
    `先对照案例再选「${item}」路径`,
    `先咨询/社群问清楚再开始`,
  ];
}
