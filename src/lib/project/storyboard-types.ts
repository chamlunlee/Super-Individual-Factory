export type StoryboardShotType =
  | "hook"
  | "point"
  | "emphasis"
  | "body"
  | "outro";

export type StoryboardShot = {
  id: string;
  type: StoryboardShotType;
  text: string;
  durationSec: number;
  subText?: string;
  emphasis?: string[];
  style?: { template?: string; align?: string };
  transition?: string;
};

export type StoryboardProject = {
  meta: {
    title: string;
    aspect: "9:16" | "16:9";
    styleId?: "classic" | "animation";
    accentColor?: string;
    showSubtitles?: boolean;
    brand?: { name?: string; watermark?: string };
    [key: string]: unknown;
  };
  audio?: { src?: string };
  shots: StoryboardShot[];
};

export const SHOT_TYPE_OPTIONS: Array<{
  id: StoryboardShotType;
  label: string;
}> = [
  { id: "hook", label: "钩子" },
  { id: "point", label: "分点" },
  { id: "emphasis", label: "强调" },
  { id: "body", label: "正文" },
  { id: "outro", label: "收尾" },
];
