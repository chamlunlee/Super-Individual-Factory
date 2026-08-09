import type { PlatformAdaptResult } from "@/lib/model/platform-adapt-types";
import type { SelectedTitle, StudioProject } from "./types";

/** 用选中标题 + 大纲 + 平台文案拼出口播原文（不强制再调 LLM） */
export function buildScriptRaw(project: StudioProject): string {
  const titles = project.selectedTitles;
  const copies = project.platformCopies?.items ?? [];
  const questions =
    project.tripleLine?.questions.filter((q) =>
      project.selectedQuestionIds.includes(q.id)
    ) ?? [];

  const parts: string[] = [];

  if (titles.length) {
    const primary = titles[0];
    parts.push(`【标题】${primary.title}`);
    if (primary.outline?.length) {
      parts.push("");
      parts.push("【大纲】");
      primary.outline.forEach((line, i) => parts.push(`${i + 1}. ${line}`));
    }
  } else if (questions.length) {
    parts.push(`【选题】${questions[0].question}`);
  }

  const copy =
    copies.find((c) =>
      titles.some((t) => t.platform === c.platform || t.platform === "all")
    ) || copies[0];

  if (copy) {
    parts.push("");
    parts.push("【开场钩子】");
    parts.push(copy.copy.hook);
    parts.push("");
    parts.push("【正文】");
    copy.copy.body.forEach((line) => parts.push(line));
    parts.push("");
    parts.push("【收尾 CTA】");
    parts.push(copy.copy.cta);
  } else if (titles[0]?.outline?.length) {
    parts.push("");
    parts.push("【正文要点】");
    titles[0].outline.forEach((line) => parts.push(line));
  }

  if (questions.length > 1) {
    parts.push("");
    parts.push("【相关选题参考】");
    questions.slice(1, 4).forEach((q) => parts.push(`- ${q.question}`));
  }

  return parts.join("\n").trim();
}

export function titlesFromRadar(
  titles: Array<{ title: string; outline: string[] }>,
  platform = "all"
): SelectedTitle[] {
  return titles.map((t) => ({
    title: t.title,
    platform,
    outline: t.outline ?? [],
  }));
}

export function summarizePlatformBodies(
  result: PlatformAdaptResult | undefined
): string {
  if (!result?.items?.length) return "";
  return result.items
    .map(
      (item) =>
        `## ${item.platformName}\n标题：${item.adaptedTitles[0] || result.seedTitle}\n钩子：${item.copy.hook}\n${item.copy.body.join("\n")}\nCTA：${item.copy.cta}`
    )
    .join("\n\n");
}
