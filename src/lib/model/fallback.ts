import type {
  ConnectionFormula,
  ContentFormat,
  HookCta,
  ModelNode,
  TitleRadarResult,
  TripleLineQuestion,
  TripleLineResult,
} from "./types";
import { DEMO_TITLE_RADAR, DEMO_TRIPLE_LINE } from "./demo-data";
import {
  optionTemplates,
  questionTemplates,
  resolveIndustryPack,
} from "./industry-packs";

function node(id: string, label: string, layer: ModelNode["layer"]): ModelNode {
  return { id, label, layer };
}

/** 无 API Key 时：二奢走完整 demo；其他词按行业语义包扩词，避免「入门款/XX上游」硬套 */
export function buildTripleLineFallback(
  keyword: string,
  count: number
): TripleLineResult {
  const trimmed = keyword.trim() || "二奢";
  if (trimmed === "二奢" || trimmed.toLowerCase() === "ershe") {
    return {
      ...DEMO_TRIPLE_LINE,
      mode: "demo",
      questions: DEMO_TRIPLE_LINE.questions.slice(0, Math.max(10, count)),
    };
  }

  const pack = resolveIndustryPack(trimmed);
  const items = pack.items.map((label, i) => node(`l1-${i}`, label, "L1"));
  const audiences = pack.audiences.map((label, i) =>
    node(`l2a-${i}`, label, "L2a")
  );
  const motives = pack.motives.map((label, i) => node(`l2b-${i}`, label, "L2b"));

  const formulas: ConnectionFormula[] = [
    "audience_item_motive",
    "audience_item_social",
    "audience_item_value",
    "pain_service_audience",
  ];

  const formats: ContentFormat[] = ["图文", "短视频", "投票"];
  const ctas: HookCta[] = pack.ctas || ["咨询", "社群", "私域", "课程"];
  const qTpl = questionTemplates(pack.kind);

  const questions: TripleLineQuestion[] = [];
  const target = Math.min(Math.max(count, 10), 50);

  for (let i = 0; i < target; i++) {
    const formula = formulas[i % formulas.length];
    const audience = audiences[i % audiences.length].label;
    const item = items[i % items.length].label;
    const motive = motives[i % motives.length].label;
    const nodes: [string, string, string] =
      formula === "pain_service_audience"
        ? [motive, item, audience]
        : [audience, item, motive];

    questions.push({
      id: `gen-${i + 1}`,
      formula,
      nodes,
      question: buildQuestion(formula, audience, item, motive, trimmed, qTpl),
      options: optionTemplates(pack.kind, item),
      hookStrength: 70 + ((i * 3) % 25),
      targetAudience: audience,
      contentFormat: formats[i % formats.length],
      cta: ctas[i % ctas.length],
    });
  }

  return {
    mode: "demo",
    graph: {
      keyword: trimmed,
      center: node("l0", trimmed, "L0"),
      synonyms: pack.synonyms,
      upstreamDownstream: pack.upstreamDownstream,
      items,
      audiences,
      motives,
    },
    questions,
  };
}

function buildQuestion(
  formula: ConnectionFormula,
  audience: string,
  item: string,
  motive: string,
  keyword: string,
  qTpl: ReturnType<typeof questionTemplates>
): string {
  switch (formula) {
    case "audience_item_social":
      return qTpl.audience_item_social(audience, item);
    case "audience_item_value":
      return qTpl.audience_item_value(audience, item, keyword);
    case "pain_service_audience":
      return qTpl.pain_service_audience(motive, item, audience);
    default:
      return qTpl.audience_item_motive(audience, item, motive);
  }
}

export function buildTitleRadarFallback(titles: string[]): TitleRadarResult {
  const cleaned = titles.map((t) => t.trim()).filter(Boolean);
  if (cleaned.length === 0) {
    return { ...DEMO_TITLE_RADAR, mode: "demo" };
  }

  const hasQuestion = cleaned.filter((t) => t.includes("？") || t.includes("?")).length;
  const hasIdentity = cleaned.filter((t) =>
    /学生|宝妈|上班|闺蜜|玩家|创业|博主|名媛|千金|社恐|暗恋|相亲/.test(t)
  ).length;

  const scores = {
    subject: clamp(60 + cleaned.length * 4, 55, 95),
    sentencePattern: clamp(55 + hasQuestion * 8 + hasIdentity * 4, 50, 96),
    userPerception: clamp(62 + hasIdentity * 5, 55, 94),
    viewpoint: clamp(50 + Math.round(cleaned.join("").length / 20), 45, 90),
  };

  return {
    mode: "demo",
    referenceTitles: cleaned,
    scores,
    diagnosis: `基于 ${cleaned.length} 条参考标题的规则估算：问句占比 ${Math.round(
      (hasQuestion / cleaned.length) * 100
    )}%，身份点名 ${hasIdentity} 条。建议保持「身份 + 场景痛点 + 决策动作」结构，并在观点上略加强站队感以提升点击。`,
    patterns: [
      { label: "决策/避坑", kind: "题材", count: Math.max(1, cleaned.length - 1) },
      { label: "身份场景", kind: "题材", count: Math.max(1, hasIdentity) },
      { label: "问句驱动", kind: "句式", count: Math.max(1, hasQuestion) },
      { label: "身份 + 场景 + 动作", kind: "句式", count: Math.max(1, hasIdentity) },
    ],
    generated: cleaned.slice(0, 10).map((t, i) => {
      const seed = t.replace(/[？?]/g, "");
      return {
        title: `${seed}——你选错的概率有多高？`.slice(0, 40),
        outline: [
          "用一个具体翻车/成功案例开场",
          "拆成 3 个可执行判断标准",
          "给出对比选项让读者站队",
          "收尾落到咨询/清单/社群 CTA",
        ],
        cta: i % 2 === 0 ? "评论区领取清单" : "私信获取对照表",
      };
    }),
  };
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}
