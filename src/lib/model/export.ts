import { FORMULA_LABELS, RADAR_LABELS } from "./types";
import type { TitleRadarResult, TripleLineResult } from "./types";

export function tripleLineToMarkdown(result: TripleLineResult): string {
  const { graph, questions } = result;
  const lines: string[] = [
    `# 三点一线选题：${graph.keyword}`,
    "",
    `模式：${result.mode}`,
    `同义词：${graph.synonyms.join("、") || "—"}`,
    `上下游：${graph.upstreamDownstream.join("、") || "—"}`,
    "",
    "## 节点",
    `- L0：${graph.center.label}`,
    `- L1 物与服务：${graph.items.map((n) => n.label).join("、")}`,
    `- L2a 人群：${graph.audiences.map((n) => n.label).join("、")}`,
    `- L2b 场景动机：${graph.motives.map((n) => n.label).join("、")}`,
    "",
    "## 选题题目",
  ];

  questions.forEach((q, i) => {
    lines.push(
      "",
      `### ${i + 1}. ${q.question}`,
      `- 公式：${FORMULA_LABELS[q.formula]}`,
      `- 三点：${q.nodes.join(" → ")}`,
      `- 钩子强度：${q.hookStrength}`,
      `- 人群：${q.targetAudience}`,
      `- 形态：${q.contentFormat}`,
      `- CTA：${q.cta}`,
      ...q.options.map((opt, idx) => `- ${String.fromCharCode(65 + idx)}. ${opt}`)
    );
  });

  return lines.join("\n");
}

export function titleRadarToMarkdown(result: TitleRadarResult): string {
  const lines: string[] = [
    "# 爆款标题雷达分析",
    "",
    `模式：${result.mode}`,
    "",
    "## 四维得分",
    ...Object.entries(result.scores).map(
      ([k, v]) => `- ${RADAR_LABELS[k as keyof typeof RADAR_LABELS]}：${v}`
    ),
    "",
    "## 诊断",
    result.diagnosis,
    "",
    "## 参考标题",
    ...result.referenceTitles.map((t) => `- ${t}`),
    "",
    "## 题材与句式",
    ...result.patterns.map((p) => `- [${p.kind}] ${p.label} ×${p.count}`),
    "",
    "## 可采纳新标题与大纲",
  ];

  result.generated.forEach((g, i) => {
    lines.push(
      "",
      `### ${i + 1}. ${g.title}`,
      ...g.outline.map((o) => `- ${o}`),
      `- CTA：${g.cta}`
    );
  });

  return lines.join("\n");
}
