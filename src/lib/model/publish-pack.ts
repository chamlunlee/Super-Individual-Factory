import {
  PLATFORM_COMMENT_PLAYBOOKS,
  getPlatformMetricGuide,
} from "@/lib/model/platform-metrics";
import type { PlatformId } from "@/lib/model/platform-titles";
import type { PresetId } from "@/lib/project/presets";
import type { PlatformAdaptItem } from "@/lib/model/platform-adapt-types";

export type PublishPack = {
  mainTitle: string;
  altTitles: string[];
  coverText: string;
  tags: string[];
  commentHook: string;
  presetId: PresetId;
  presetLabel: string;
  primaryMetric: string;
  watchField: string;
};

const PRESET_BY_PLATFORM: Record<PlatformId, PresetId> = {
  xiaohongshu: "list_classic",
  douyin: "punch_animation",
  shipinhao: "knowledge_classic",
  bilibili: "knowledge_classic",
  gongzhonghao: "knowledge_classic",
};

const PRESET_LABEL: Record<PresetId, string> = {
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

function clipCover(text: string): string {
  const clean = text.replace(/[？?！!。．.～~\s]/g, "");
  if (clean.length <= 12) return clean || "关键一句";
  return clean.slice(0, 12);
}

function tagsFromItem(item: PlatformAdaptItem): string[] {
  const words = item.keywordSuggestions.flatMap((g) => g.words);
  const uniq: string[] = [];
  for (const w of words) {
    const t = w.trim();
    if (!t || uniq.includes(t)) continue;
    uniq.push(t);
    if (uniq.length >= 5) break;
  }
  while (uniq.length < 5) {
    uniq.push(`${item.platformName}干货${uniq.length + 1}`);
  }
  return uniq.slice(0, 5);
}

export function buildPublishPack(
  item: PlatformAdaptItem,
  seedTitle: string
): PublishPack {
  const titles = item.adaptedTitles.filter(Boolean);
  const mainTitle = titles[0] || seedTitle;
  const altTitles = titles.slice(1, 3);
  while (altTitles.length < 2) {
    altTitles.push(mainTitle);
  }

  const playbook = PLATFORM_COMMENT_PLAYBOOKS.find(
    (p) => p.id === item.platform
  );
  const commentHook =
    playbook?.hooks[0] || item.copy.cta || "评论区留下你的情况";

  const presetId = PRESET_BY_PLATFORM[item.platform] || "knowledge_classic";
  const metric = getPlatformMetricGuide(item.platform)?.primaryMetric || "完播";

  return {
    mainTitle,
    altTitles: altTitles.slice(0, 2),
    coverText: clipCover(mainTitle),
    tags: tagsFromItem(item),
    commentHook,
    presetId,
    presetLabel: PRESET_LABEL[presetId],
    primaryMetric: metric,
    watchField: WATCH[item.platform],
  };
}

export function publishPackToMarkdown(pack: PublishPack, platformName: string) {
  return [
    `# ${platformName} · 发物料包`,
    "",
    `主标题：${pack.mainTitle}`,
    ...pack.altTitles.map((t, i) => `备选${i + 1}：${t}`),
    `封面文案：${pack.coverText}`,
    `标签：${pack.tags.map((t) => `#${t}`).join(" ")}`,
    `开评钩子：${pack.commentHook}`,
    `建议片型：${pack.presetLabel}（${pack.presetId}）`,
    `本条主指标：${pack.primaryMetric}`,
    `发布后盯：${pack.watchField}`,
  ].join("\n");
}
