/** 三点一线 & 标题雷达共享类型 */

export type NodeLayer = "L0" | "L1" | "L2a" | "L2b";

export type ConnectionFormula =
  | "audience_item_motive"
  | "audience_item_social"
  | "audience_item_value"
  | "pain_service_audience";

export type ContentFormat = "图文" | "短视频" | "投票";

export type HookCta =
  | "鉴定"
  | "估价"
  | "社群"
  | "私域"
  | "回收"
  | "置换"
  | "课程"
  | "咨询";

export interface ModelNode {
  id: string;
  label: string;
  layer: NodeLayer;
}

export interface TripleLineGraph {
  keyword: string;
  center: ModelNode;
  synonyms: string[];
  upstreamDownstream: string[];
  items: ModelNode[];
  audiences: ModelNode[];
  motives: ModelNode[];
}

export interface TripleLineQuestion {
  id: string;
  formula: ConnectionFormula;
  nodes: [string, string, string];
  question: string;
  options: [string, string, string, string];
  hookStrength: number;
  targetAudience: string;
  contentFormat: ContentFormat;
  cta: HookCta;
}

export interface TripleLineResult {
  mode: "llm" | "demo";
  graph: TripleLineGraph;
  questions: TripleLineQuestion[];
}

export interface RadarScores {
  subject: number;
  sentencePattern: number;
  userPerception: number;
  viewpoint: number;
}

export interface TitlePattern {
  label: string;
  kind: "题材" | "句式";
  count: number;
}

export interface GeneratedTitle {
  title: string;
  outline: string[];
  cta: string;
}

export interface TitleRadarResult {
  mode: "llm" | "demo";
  referenceTitles: string[];
  scores: RadarScores;
  diagnosis: string;
  patterns: TitlePattern[];
  generated: GeneratedTitle[];
}

export const FORMULA_LABELS: Record<ConnectionFormula, string> = {
  audience_item_motive: "人群 × 物 × 场景动机",
  audience_item_social: "人群 × 物 × 社交比较",
  audience_item_value: "人群 × 物 × 价值决策",
  pain_service_audience: "场景痛点 × 服务 × 人群",
};

export const RADAR_LABELS: Record<keyof RadarScores, string> = {
  subject: "题材",
  sentencePattern: "标题句式",
  userPerception: "用户感知",
  viewpoint: "观点表达",
};
