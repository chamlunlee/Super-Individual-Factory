import type { PlatformAdaptResult } from "@/lib/model/platform-adapt-types";
import type { TitleRadarResult, TripleLineResult } from "@/lib/model/types";
import type { PresetId } from "@/lib/project/presets";
import type { StoryboardProject } from "@/lib/project/storyboard-types";

export type ProjectStatus =
  | "ideation"
  | "titles"
  | "script"
  | "produce"
  | "published";

export type StudioPlatformId =
  | "douyin"
  | "xiaohongshu"
  | "shipinhao"
  | "bilibili"
  | "gongzhonghao";

export type WizardStep =
  | "ideation"
  | "titles"
  | "platforms"
  | "script"
  | "produce"
  | "publish";

export const WIZARD_STEPS: Array<{ id: WizardStep; label: string }> = [
  { id: "ideation", label: "选题" },
  { id: "titles", label: "标题" },
  { id: "platforms", label: "平台" },
  { id: "script", label: "口播" },
  { id: "produce", label: "成片" },
  { id: "publish", label: "发布" },
];

export interface BrandKit {
  name: string;
  watermark: string;
  accent: string;
  aspect: "9:16" | "16:9";
  styleId: "classic" | "animation";
  /** 片型预设：知识口播 / 金句冲击 / 清单三条 */
  presetId: PresetId;
  showSubtitles: true;
}

export interface SelectedTitle {
  title: string;
  platform: string;
  outline: string[];
}

export interface PublishMetrics {
  views?: number;
  likes?: number;
  comments?: number;
  dms?: number;
  leads?: number;
}

export interface PublishPackage {
  id: string;
  platform: StudioPlatformId | string;
  title: string;
  body: string;
  cta: string;
  status: "draft" | "assisted" | "uploaded";
  publishedAt?: string;
  metrics?: PublishMetrics;
  sourceTitle?: string;
}

export interface StudioProject {
  id: string;
  title: string;
  industryKeyword: string;
  platforms: StudioPlatformId[];
  brand: BrandKit;
  status: ProjectStatus;
  currentStep: WizardStep;
  tripleLine?: TripleLineResult;
  selectedQuestionIds: string[];
  titleRadar?: TitleRadarResult;
  selectedTitles: SelectedTitle[];
  platformCopies?: PlatformAdaptResult;
  scriptRaw?: string;
  koubo?: {
    mdPath?: string;
    linesPath?: string;
    qaPath?: string;
    markdown?: string;
    lines?: string[];
  };
  /** 成片前确认的分镜工程（来自 /api/storyboard） */
  storyboard?: {
    presetId: PresetId;
    mode?: "llm" | "rules";
    warning?: string;
    project: StoryboardProject;
  };
  produce?: {
    projectJsonPath?: string;
    mp4Path?: string;
    mp4Url?: string;
    audioPath?: string;
    showSubtitles: true;
    fileName?: string;
    presetId?: PresetId;
  };
  publish?: {
    packages: PublishPackage[];
  };
  createdAt: string;
  updatedAt: string;
}

export function defaultBrandKit(name = "未命名账号"): BrandKit {
  return {
    name,
    watermark: name,
    accent: "#FFD166",
    aspect: "9:16",
    styleId: "classic",
    presetId: "knowledge_classic",
    showSubtitles: true,
  };
}

export function createEmptyProject(input: {
  title?: string;
  industryKeyword: string;
  platforms?: StudioPlatformId[];
  brand?: Partial<BrandKit>;
}): StudioProject {
  const now = new Date().toISOString();
  const id = `p_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
  const brand = {
    ...defaultBrandKit(input.brand?.name || input.title || "未命名账号"),
    ...input.brand,
    presetId: input.brand?.presetId || "knowledge_classic",
    showSubtitles: true as const,
  };
  return {
    id,
    title: input.title?.trim() || `${input.industryKeyword}内容项目`,
    industryKeyword: input.industryKeyword.trim(),
    platforms: input.platforms?.length
      ? input.platforms
      : ["douyin", "xiaohongshu"],
    brand,
    status: "ideation",
    currentStep: "ideation",
    selectedQuestionIds: [],
    selectedTitles: [],
    createdAt: now,
    updatedAt: now,
  };
}
