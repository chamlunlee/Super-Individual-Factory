import type { PresetId } from "@/lib/project/presets";
import { getPlatformMetricGuide } from "@/lib/model/platform-metrics";
import type { PlatformId } from "@/lib/model/platform-titles";

export type DispatchAdvice = {
  primaryPlatform: PlatformId;
  primaryPlatformName: string;
  secondaryPlatform: PlatformId;
  secondaryPlatformName: string;
  primaryMetric: string;
  presetId: PresetId;
  presetLabel: string;
  reason: string;
  watchField: string;
  mode: "rules" | "llm";
};

const NAMES: Record<PlatformId, string> = {
  xiaohongshu: "小红书",
  douyin: "抖音",
  shipinhao: "视频号",
  bilibili: "B站",
  gongzhonghao: "公众号",
};

const PRESET_LABELS: Record<PresetId, string> = {
  knowledge_classic: "知识口播",
  punch_animation: "金句冲击",
  list_classic: "清单三条",
};

const WATCH: Record<PlatformId, string> = {
  xiaohongshu: "收藏 + 线索",
  douyin: "播放/完播 + 赞评",
  shipinhao: "是否转发",
  bilibili: "完播 + 投币/收藏",
  gongzhonghao: "打开 + 在看/转发",
};

/**
 * 规则分发顾问：根据标题信号推荐主平台 / 主指标 / 片型。
 * 不依赖 LLM，保证本条 3 秒内可决策。
 */
export function adviseDispatchByRules(
  seedTitle: string,
  preferredPreset?: PresetId | null
): DispatchAdvice {
  const t = seedTitle.trim();
  const scores: Record<PlatformId, number> = {
    xiaohongshu: 1,
    douyin: 1,
    shipinhao: 1,
    bilibili: 1,
    gongzhonghao: 1,
  };

  const bump = (id: PlatformId, n: number) => {
    scores[id] += n;
  };

  if (/[0-9０-９几两三四五六七八九十]+ ?[个招步条点项招式]|清单|避坑|怎么选|如何选/.test(t)) {
    bump("xiaohongshu", 4);
  }
  if (/学生党|宝妈|上班族|社恐|敏感肌|预算|同款|收藏/.test(t)) {
    bump("xiaohongshu", 2);
  }
  if (/最亏|别再|停|致命|选.?还是|你以为|其实|真的很/.test(t)) {
    bump("douyin", 4);
  }
  if (/短|秒懂|一眼|别拖/.test(t)) {
    bump("douyin", 1);
  }
  if (/提醒|先别|转给|家人|同事|温和|很多人/.test(t)) {
    bump("shipinhao", 3);
  }
  if (/为什么|一次讲清|底层|机制|拆解|框架|本质|复盘/.test(t)) {
    bump("bilibili", 4);
    bump("gongzhonghao", 2);
  }
  if (/铁律|搞反了|专栏|长文|可复用/.test(t)) {
    bump("gongzhonghao", 3);
  }
  if (t.length <= 18) bump("douyin", 1);
  if (t.length >= 28) {
    bump("bilibili", 1);
    bump("gongzhonghao", 1);
  }

  if (preferredPreset === "list_classic") bump("xiaohongshu", 3);
  if (preferredPreset === "punch_animation") bump("douyin", 3);
  if (preferredPreset === "knowledge_classic") {
    bump("shipinhao", 2);
    bump("bilibili", 2);
    bump("gongzhonghao", 1);
  }

  const ranked = (Object.keys(scores) as PlatformId[]).sort(
    (a, b) => scores[b] - scores[a]
  );
  const primary = ranked[0];
  const secondary = ranked[1];

  let presetId: PresetId = "knowledge_classic";
  if (preferredPreset) {
    presetId = preferredPreset;
  } else if (primary === "xiaohongshu") {
    presetId = "list_classic";
  } else if (primary === "douyin") {
    presetId = "punch_animation";
  } else {
    presetId = "knowledge_classic";
  }

  const metricGuide = getPlatformMetricGuide(primary);
  const primaryMetric = metricGuide?.primaryMetric || "完播";

  const reasonParts = [
    `标题信号更贴近${NAMES[primary]}的用户动机（${metricGuide?.funnelNote || "主指标优先"}）`,
    `建议片型「${PRESET_LABELS[presetId]}」，本条主攻「${primaryMetric}」`,
    `备选 ${NAMES[secondary]} 做差异化二发，避免五平台同文`,
  ];

  return {
    primaryPlatform: primary,
    primaryPlatformName: NAMES[primary],
    secondaryPlatform: secondary,
    secondaryPlatformName: NAMES[secondary],
    primaryMetric,
    presetId,
    presetLabel: PRESET_LABELS[presetId],
    reason: reasonParts.join("。") + "。",
    watchField: WATCH[primary],
    mode: "rules",
  };
}
