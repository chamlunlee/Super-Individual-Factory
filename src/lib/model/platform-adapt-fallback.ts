import {
  PLATFORM_TITLE_GUIDES,
  type PlatformId,
  type PlatformTitleGuide,
} from "./platform-titles";
import type {
  PlatformAdaptItem,
  PlatformAdaptResult,
  PlatformSelect,
} from "./platform-adapt-types";
import { resolvePlatforms } from "@/lib/prompts/platform-adapt";
import { adviseDispatchByRules } from "@/lib/model/dispatch-advisor";
import { buildPublishPack } from "@/lib/model/publish-pack";

export function buildPlatformAdaptFallback(
  title: string,
  platform: PlatformSelect
): PlatformAdaptResult {
  const seed = title.trim() || "未命名标题";
  const platforms = resolvePlatforms(platform);

  const items = platforms.map((id) => adaptOne(seed, id));
  return {
    mode: "demo",
    seedTitle: seed,
    platform,
    items,
    dispatch: adviseDispatchByRules(seed),
  };
}

function adaptOne(seed: string, id: PlatformId): PlatformAdaptItem {
  const guide = PLATFORM_TITLE_GUIDES.find((g) => g.id === id)!;
  const item: PlatformAdaptItem = {
    platform: id,
    platformName: guide.name,
    elements: buildElements(guide, seed),
    keywordSuggestions: guide.keywordRefs.groups.map((g) => ({
      label: g.label,
      words: g.words.slice(0, 8),
    })),
    adaptedTitles: buildTitles(guide, seed),
    copy: buildCopy(guide, seed),
    radarHints: {
      subject: guide.scoreBias.subject,
      sentencePattern: guide.scoreBias.sentencePattern,
      userPerception: guide.scoreBias.userPerception,
      viewpoint: guide.scoreBias.viewpoint,
    },
  };
  item.publishPack = buildPublishPack(item, seed);
  return item;
}

function buildElements(guide: PlatformTitleGuide, seed: string): string[] {
  return [
    `围绕种子题材「${truncate(seed, 18)}」保持同一核心矛盾`,
    ...guide.orientations.slice(0, 3),
    `标题工作：${guide.titleJob}`,
    `气质对齐：${guide.vibe}`,
  ].slice(0, 6);
}

function buildTitles(guide: PlatformTitleGuide, seed: string): string[] {
  const core = stripPunct(seed);
  switch (guide.id) {
    case "xiaohongshu":
      return [
        `${core}？我用这 3 步试完，收藏率明显高于空想`,
        `别只会硬上：关于「${truncate(core, 12)}」的亲历避坑清单`,
        `第一次面对这件事，先把结果做成可执行的 3 个细节`,
      ];
    case "shipinhao":
      return [
        `先别急着下结论：${truncate(core, 16)}，很多人忽略了节奏`,
        `如果你也卡在这里，先把这件事讲清楚再行动`,
        `一句能转给朋友的提醒：${truncate(core, 14)}`,
      ];
    case "bilibili":
      return [
        `为什么「${truncate(core, 14)}」总是反复失败？一次讲清底层节奏`,
        `拆解：从表面问题到真正卡点，关于「${truncate(core, 12)}」`,
        `别只学表面动作：把「${truncate(core, 12)}」讲明白`,
      ];
    case "gongzhonghao":
      return [
        `关于「${truncate(core, 14)}」，大多数人搞反了顺序`,
        `为什么你会卡在「${truncate(core, 12)}」：一个可复用的判断框架`,
        `别再用感觉决策：把「${truncate(core, 12)}」拆成三步`,
      ];
    case "douyin":
    default:
      return [
        `最亏的一步：${truncate(core, 16)}`,
        `别再拖了，真正要命的是这件事`,
        `${truncate(core, 12)}？选错方向真的很亏`,
      ];
  }
}

function buildCopy(guide: PlatformTitleGuide, seed: string) {
  const core = truncate(stripPunct(seed), 20);
  const bodies: Record<PlatformId, string[]> = {
    xiaohongshu: [
      `先承认真实卡点：围绕「${core}」你卡在哪一步`,
      "给出 3 个可马上照做的小步骤，而不是空理论",
      "补一个「我以为…其实…」的对比，增强可信",
      "用前后结果收束，方便收藏复看",
      "评论区预埋一个具体问题，引导互动",
    ],
    shipinhao: [
      `开场用生活场景点题：很多人在「${core}」上太着急`,
      "用温和提醒替代羞辱式钩子，方便转发",
      "讲清一个主方法，避免信息过载",
      "补一句给家人/同事也能听懂的结论",
      "结尾邀请收藏或转给需要的人",
    ],
    bilibili: [
      `先抛「为什么」：表面看是「${core}」，本质是节奏/预期错位`,
      "拆 2–3 层机制，给信息密度",
      "用一个案例对照：做对 vs 做错",
      "给出可复用框架，方便系列化",
      "结尾抛出可讨论的观点，方便弹幕站队",
    ],
    douyin: [
      `前 3 秒直接打冲突：围绕「${core}」的最痛一点`,
      "只打一个点，不铺太多背景",
      "用二选一或反差句逼评论",
      "中段给 1 个可执行动作兑现钩子",
      "结尾重复损失厌恶，推动关注/私信",
    ],
    gongzhonghao: [
      `开篇定义议题：我们真正要解决的是「${core}」哪一层`,
      "给出判断框架（三步或三层），方便读者复述",
      "用正反对照说明：常见误区 vs 可行路径",
      "落到可执行清单，服务收藏与转发",
      "结尾导向私域/下一篇，形成订阅闭环",
    ],
  };

  const hooks: Record<PlatformId, string> = {
    xiaohongshu: `真的别再空想了——关于「${core}」，我踩过最贵的坑是这个。`,
    shipinhao: `先别急着怪自己。很多人卡在「${core}」，其实只是顺序错了。`,
    bilibili: `你以为问题在技巧，其实「${core}」背后是一套可拆解的节奏模型。`,
    douyin: `停。还在硬撑「${core}」的，十有八九已经走错一步。`,
    gongzhonghao: `关于「${core}」，大多数人不是不努力，而是把顺序搞反了。`,
  };

  const ctas: Record<PlatformId, string> = {
    xiaohongshu: "评论区扣「清单」，发你可收藏的步骤卡",
    shipinhao: "转给正在纠结的朋友，或收藏后按步骤试一次",
    bilibili: "三连后去简介领完整框架，下期继续拆下一层",
    douyin: "想要对版动作，评论「方法」或关注下一条拆解",
    gongzhonghao: "点「在看」或转发给同事；回复「框架」领取完整清单",
  };

  return {
    hook: hooks[guide.id],
    body: bodies[guide.id],
    cta: ctas[guide.id],
  };
}

function stripPunct(s: string) {
  return s.replace(/[？?！!。．.～~]/g, "").trim();
}

function truncate(s: string, n: number) {
  return s.length > n ? `${s.slice(0, n)}…` : s;
}

export function normalizePlatformAdapt(
  raw: { items?: PlatformAdaptItem[] },
  seedTitle: string,
  platform: PlatformSelect,
  mode: "llm" | "demo"
): PlatformAdaptResult {
  const wanted = new Set(resolvePlatforms(platform));
  const items = (raw.items || [])
    .filter((item) => wanted.has(item.platform))
    .map((item) => {
      const guide = PLATFORM_TITLE_GUIDES.find((g) => g.id === item.platform);
      const normalized: PlatformAdaptItem = {
        platform: item.platform,
        platformName: item.platformName || guide?.name || item.platform,
        elements: (item.elements || []).slice(0, 8),
        keywordSuggestions:
          item.keywordSuggestions?.length
            ? item.keywordSuggestions.map((g) => ({
                label: g.label,
                words: (g.words || []).slice(0, 10),
              }))
            : guide?.keywordRefs.groups.map((g) => ({
                label: g.label,
                words: g.words.slice(0, 8),
              })) || [],
        adaptedTitles: (item.adaptedTitles || []).slice(0, 5),
        copy: {
          hook: item.copy?.hook || "",
          body: item.copy?.body?.length ? item.copy.body : ["补充正文要点"],
          cta: item.copy?.cta || "关注领取清单",
        },
        radarHints: {
          subject: item.radarHints?.subject || guide?.scoreBias.subject || "",
          sentencePattern:
            item.radarHints?.sentencePattern ||
            guide?.scoreBias.sentencePattern ||
            "",
          userPerception:
            item.radarHints?.userPerception ||
            guide?.scoreBias.userPerception ||
            "",
          viewpoint:
            item.radarHints?.viewpoint || guide?.scoreBias.viewpoint || "",
        },
      };
      normalized.publishPack = buildPublishPack(normalized, seedTitle);
      return normalized;
    });

  if (items.length === 0) {
    return buildPlatformAdaptFallback(seedTitle, platform);
  }

  return {
    mode,
    seedTitle,
    platform,
    items,
    dispatch: adviseDispatchByRules(seedTitle),
  };
}
