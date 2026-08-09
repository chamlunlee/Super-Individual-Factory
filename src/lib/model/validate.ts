import type { TitleRadarResult, TripleLineResult } from "./types";

export function normalizeTripleLine(
  data: TripleLineResult,
  mode: "llm" | "demo"
): TripleLineResult {
  return {
    mode,
    graph: data.graph,
    questions: (data.questions || []).map((q, i) => ({
      ...q,
      id: q.id || `q-${i + 1}`,
      options: ensureFour(q.options),
      hookStrength: clamp(Number(q.hookStrength) || 70, 0, 100),
      nodes: [q.nodes[0], q.nodes[1], q.nodes[2]] as [string, string, string],
    })),
  };
}

export function normalizeTitleRadar(
  data: Omit<TitleRadarResult, "mode" | "referenceTitles"> & {
    referenceTitles?: string[];
  },
  referenceTitles: string[],
  mode: "llm" | "demo"
): TitleRadarResult {
  const scores = data.scores;
  return {
    mode,
    referenceTitles,
    scores: {
      subject: clamp(Number(scores.subject) || 60, 0, 100),
      sentencePattern: clamp(Number(scores.sentencePattern) || 60, 0, 100),
      userPerception: clamp(Number(scores.userPerception) || 60, 0, 100),
      viewpoint: clamp(Number(scores.viewpoint) || 60, 0, 100),
    },
    diagnosis: data.diagnosis || "暂无诊断",
    patterns: data.patterns || [],
    generated: (data.generated || []).slice(0, 10).map((g) => ({
      title: g.title,
      outline: g.outline?.length ? g.outline : ["补充案例", "给标准", "给 CTA"],
      cta: g.cta || "关注领取清单",
    })),
  };
}

function ensureFour(options: string[]): [string, string, string, string] {
  const filled = [...(options || [])];
  while (filled.length < 4) filled.push(`选项 ${String.fromCharCode(65 + filled.length)}`);
  return [filled[0], filled[1], filled[2], filled[3]];
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}
