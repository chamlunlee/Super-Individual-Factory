import { NextResponse } from "next/server";
import { chatJson, hasLlmConfig } from "@/lib/llm/client";
import { adviseDispatchByRules } from "@/lib/model/dispatch-advisor";
import {
  buildPlatformAdaptFallback,
  normalizePlatformAdapt,
} from "@/lib/model/platform-adapt-fallback";
import type {
  PlatformAdaptResult,
  PlatformSelect,
} from "@/lib/model/platform-adapt-types";
import {
  buildPlatformAdaptSystem,
  buildPlatformAdaptUserPrompt,
  resolvePlatforms,
} from "@/lib/prompts/platform-adapt";

export const runtime = "nodejs";

const VALID: PlatformSelect[] = [
  "all",
  "xiaohongshu",
  "shipinhao",
  "bilibili",
  "douyin",
  "gongzhonghao",
];

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      title?: string;
      seedTitle?: string;
      platform?: PlatformSelect;
      forceDemo?: boolean;
    };

    const title = (body.title || body.seedTitle || "").trim();
    const platform: PlatformSelect = VALID.includes(body.platform as PlatformSelect)
      ? (body.platform as PlatformSelect)
      : "all";

    if (!title) {
      return NextResponse.json({ error: "请提供种子标题" }, { status: 400 });
    }

    const platforms = resolvePlatforms(platform);

    if (body.forceDemo || !hasLlmConfig()) {
      return NextResponse.json(buildPlatformAdaptFallback(title, platform));
    }

    try {
      const raw = await chatJson<{ items: PlatformAdaptResult["items"] }>(
        buildPlatformAdaptSystem(platforms),
        buildPlatformAdaptUserPrompt(title, platform, platforms)
      );
      const normalized = normalizePlatformAdapt(raw, title, platform, "llm");
      return NextResponse.json({
        ...normalized,
        dispatch: normalized.dispatch || adviseDispatchByRules(title),
      });
    } catch (err) {
      const fallback = buildPlatformAdaptFallback(title, platform);
      return NextResponse.json({
        ...fallback,
        warning:
          err instanceof Error
            ? `LLM 失败，已降级模板：${err.message}`
            : "LLM 失败，已降级模板",
      });
    }
  } catch {
    return NextResponse.json({ error: "请求解析失败" }, { status: 400 });
  }
}
