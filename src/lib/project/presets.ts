export type PresetId =
  | "knowledge_classic"
  | "punch_animation"
  | "list_classic";

export type StudioPreset = {
  id: PresetId;
  label: string;
  description: string;
  styleId: "classic" | "animation";
};

export const STUDIO_PRESETS: StudioPreset[] = [
  {
    id: "knowledge_classic",
    label: "知识口播",
    description: "日更知识向：黑底大字钩子 + 正文纯字 + 进度条",
    styleId: "classic",
  },
  {
    id: "punch_animation",
    label: "金句冲击",
    description: "抖音冲突向：字效短片，钩子/强调撞入，节奏更快",
    styleId: "animation",
  },
  {
    id: "list_classic",
    label: "清单三条",
    description: "要点清单：编号分点为主，多行可用叠化",
    styleId: "classic",
  },
];

export function resolveStudioPreset(id?: string | null): StudioPreset {
  return (
    STUDIO_PRESETS.find((p) => p.id === id) || STUDIO_PRESETS[0]
  );
}
