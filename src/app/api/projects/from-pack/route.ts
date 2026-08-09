import { NextResponse } from "next/server";
import type { PlatformAdaptItem } from "@/lib/model/platform-adapt-types";
import type { PublishPack } from "@/lib/model/publish-pack";
import type { PresetId } from "@/lib/project/presets";
import { resolveStudioPreset } from "@/lib/project/presets";
import { createEmptyProject, type StudioPlatformId } from "@/lib/project/types";
import { saveProject } from "@/lib/project/store";

export const runtime = "nodejs";

/**
 * 从平台取向页的发物料包一键创建内容工作室项目，预填平台步与口播原文。
 */
export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      seedTitle?: string;
      industryKeyword?: string;
      brandName?: string;
      item?: PlatformAdaptItem;
      pack?: PublishPack;
    };

    const item = body.item;
    const pack = body.pack || item?.publishPack;
    if (!item || !pack) {
      return NextResponse.json(
        { error: "缺少平台结果 item / publishPack" },
        { status: 400 }
      );
    }

    const preset = resolveStudioPreset(pack.presetId as PresetId);
    const platform = item.platform as StudioPlatformId;
    const mainTitle =
      pack.mainTitle ||
      item.adaptedTitles[0] ||
      body.seedTitle?.trim() ||
      "未命名标题";

    const scriptRaw = [
      `【标题】${mainTitle}`,
      "",
      "【开场钩子】",
      item.copy.hook,
      "",
      "【正文】",
      ...item.copy.body.map((b, i) => `${i + 1}. ${b}`),
      "",
      "【收尾 CTA】",
      item.copy.cta,
      "",
      "【开评钩子】",
      pack.commentHook,
      "",
      `【标签】${pack.tags.map((t) => `#${t}`).join(" ")}`,
      `【封面】${pack.coverText}`,
      `【本条主指标】${pack.primaryMetric}（发布后盯：${pack.watchField}）`,
    ].join("\n");

    const project = createEmptyProject({
      title: mainTitle.slice(0, 40),
      industryKeyword: (body.industryKeyword || body.seedTitle || "内容").trim(),
      platforms: [platform],
      brand: {
        name: body.brandName || "未命名账号",
        watermark: body.brandName || "未命名账号",
        presetId: preset.id,
        styleId: preset.styleId,
      },
    });

    project.selectedTitles = [
      {
        title: mainTitle,
        platform: item.platform,
        outline: item.copy.body.slice(0, 5),
      },
    ];
    project.platformCopies = {
      mode: "demo",
      seedTitle: body.seedTitle || mainTitle,
      platform: item.platform,
      items: [{ ...item, publishPack: pack }],
    };
    project.scriptRaw = scriptRaw;
    project.status = "script";
    project.currentStep = "platforms";

    saveProject(project);
    return NextResponse.json({
      project,
      redirectTo: `/projects/${project.id}`,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "创建失败" },
      { status: 500 }
    );
  }
}
