import type { PlatformId } from "./platform-titles";
import type { PublishPack } from "./publish-pack";
import type { DispatchAdvice } from "./dispatch-advisor";

export type PlatformSelect = "all" | PlatformId; // includes gongzhonghao

export interface PlatformAdaptCopy {
  hook: string;
  body: string[];
  cta: string;
}

export interface PlatformAdaptRadarHints {
  subject: string;
  sentencePattern: string;
  userPerception: string;
  viewpoint: string;
}

export interface PlatformKeywordSuggestion {
  label: string;
  words: string[];
}

export interface PlatformAdaptItem {
  platform: PlatformId;
  platformName: string;
  elements: string[];
  keywordSuggestions: PlatformKeywordSuggestion[];
  adaptedTitles: string[];
  copy: PlatformAdaptCopy;
  radarHints: PlatformAdaptRadarHints;
  /** 可粘贴发物料：封面/标签/开评/片型/主指标 */
  publishPack?: PublishPack;
}

export interface PlatformAdaptResult {
  mode: "llm" | "demo";
  seedTitle: string;
  platform: PlatformSelect;
  items: PlatformAdaptItem[];
  warning?: string;
  /** 本条分发建议（主平台优先展示） */
  dispatch?: DispatchAdvice;
}
