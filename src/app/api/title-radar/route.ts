import { NextResponse } from "next/server";
import { buildTitleRadarFallback } from "@/lib/model/fallback";

export const runtime = "nodejs";
import { normalizeTitleRadar } from "@/lib/model/validate";
import type { TitleRadarResult } from "@/lib/model/types";
import { chatJson, hasLlmConfig } from "@/lib/llm/client";
import {
  TITLE_RADAR_SYSTEM,
  buildTitleRadarUserPrompt,
} from "@/lib/prompts/title-radar";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { titles?: string[] | string; forceDemo?: boolean };
    const titles = normalizeTitles(body.titles);

    if (titles.length < 1) {
      return NextResponse.json({ error: "请至少提供 1 条标题" }, { status: 400 });
    }

    if (body.forceDemo || !hasLlmConfig()) {
      return NextResponse.json(buildTitleRadarFallback(titles));
    }

    try {
      const raw = await chatJson<Omit<TitleRadarResult, "mode" | "referenceTitles">>(
        TITLE_RADAR_SYSTEM,
        buildTitleRadarUserPrompt(titles)
      );
      return NextResponse.json(normalizeTitleRadar(raw, titles, "llm"));
    } catch (err) {
      const fallback = buildTitleRadarFallback(titles);
      return NextResponse.json({
        ...fallback,
        warning:
          err instanceof Error
            ? `LLM 失败，已降级规则估算：${err.message}`
            : "LLM 失败，已降级规则估算",
      });
    }
  } catch {
    return NextResponse.json({ error: "请求解析失败" }, { status: 400 });
  }
}

function normalizeTitles(input?: string[] | string): string[] {
  if (!input) return [];
  if (Array.isArray(input)) {
    return input.map((t) => t.trim()).filter(Boolean);
  }
  return input
    .split(/\r?\n/)
    .map((t) => t.trim())
    .filter(Boolean);
}
