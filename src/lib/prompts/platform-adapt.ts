import {
  PLATFORM_TITLE_GUIDES,
  type PlatformId,
} from "@/lib/model/platform-titles";
import type { PlatformSelect } from "@/lib/model/platform-adapt-types";

const RADAR_DIMENSIONS = `同时结合「标题雷达」四维来约束每个平台的改写（每项都要在 radarHints 里用一句话说明该平台应如何偏向）：
- subject（题材）：品类/矛盾/身份是否垂直、可迁移
- sentencePattern（标题句式）：问句/对比/数字/反常识/身份点名等
- userPerception（用户感知）：焦虑/优越/省钱/避坑/身份认同等情绪利益感
- viewpoint（观点表达）：立场鲜明度与可站队程度`;

export function buildPlatformAdaptSystem(platforms: PlatformId[]): string {
  const guides = PLATFORM_TITLE_GUIDES.filter((g) => platforms.includes(g.id))
    .map(
      (g) => {
        const kw = g.keywordRefs.groups
          .map((group) => `${group.label}：${group.words.join("、")}`)
          .join("；");
        return `### ${g.name}（${g.id}）
- 气质：${g.vibe}
- 用户心态：${g.userMindset}
- 标题工作：${g.titleJob}
- 取向：${g.orientations.join("；")}
- 公式：${g.formula.join("；")}
- 更合适：${g.doList.join("；")}
- 避免：${g.dontList.join("；")}
- 关键词填写提示：${g.keywordRefs.tip}
- 关键词参考：${kw}
- 四维偏向：题材=${g.scoreBias.subject}；句式=${g.scoreBias.sentencePattern}；感知=${g.scoreBias.userPerception}；观点=${g.scoreBias.viewpoint}`;
      }
    )
    .join("\n\n");

  return `你是多平台爆款标题与文案改写专家。根据用户给的种子标题，按指定平台取向改写，禁止四平台同一套文案照搬。

${RADAR_DIMENSIONS}

平台规则：
${guides}

输出必须是合法 JSON（不要 Markdown 围栏），结构：
{
  "items": [{
    "platform": "xiaohongshu" | "shipinhao" | "bilibili" | "douyin" | "gongzhonghao",
    "platformName": string,
    "elements": string[],
    "keywordSuggestions": [{ "label": string, "words": string[] }],
    "adaptedTitles": string[],
    "copy": {
      "hook": string,
      "body": string[],
      "cta": string
    },
    "radarHints": {
      "subject": string,
      "sentencePattern": string,
      "userPerception": string,
      "viewpoint": string
    }
  }]
}

要求：
- 只输出用户要求的平台；每个平台一张结果
- elements：该平台标题必须具备的 4–6 个要素（结合种子标题题材）
- keywordSuggestions：结合种子标题题材，给出该平台可填写的关键词分组（每组 4–8 个词），优先改写/迁移平台「关键词参考」，不要原样照抄无关词
- adaptedTitles：3 条适配该平台的推荐标题，标题中尽量自然嵌入关键词
- copy.body：4–6 条正文要点；hook 为开头钩子；cta 可执行
- 全程简体中文；语气严格贴合各平台（小红书亲历清单、视频号稳妥可转发、B站深度为什么、抖音短狠冲突、公众号议题框架）`;
}

export function buildPlatformAdaptUserPrompt(
  title: string,
  platform: PlatformSelect,
  platforms: PlatformId[]
): string {
  const target =
    platform === "all"
      ? "全部平台（小红书、视频号、B站、抖音、公众号）"
      : platforms.map((id) => PLATFORM_TITLE_GUIDES.find((g) => g.id === id)?.name || id).join("、");

  return `种子标题：${title}

请只为以下平台生成改写结果：${target}
只输出 JSON。`;
}

export function resolvePlatforms(platform: PlatformSelect): PlatformId[] {
  if (platform === "all") {
    return ["xiaohongshu", "shipinhao", "bilibili", "douyin", "gongzhonghao"];
  }
  return [platform];
}
