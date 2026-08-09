import { NextResponse } from "next/server";
import { buildTripleLineFallback } from "@/lib/model/fallback";

export const runtime = "nodejs";
import { normalizeTripleLine } from "@/lib/model/validate";
import type { TripleLineResult } from "@/lib/model/types";
import { chatJson, hasLlmConfig } from "@/lib/llm/client";
import {
  TRIPLE_LINE_SYSTEM,
  buildTripleLineUserPrompt,
} from "@/lib/prompts/triple-line";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { keyword?: string; count?: number; forceDemo?: boolean };
    const keyword = (body.keyword || "").trim();
    const count = Math.min(50, Math.max(10, Number(body.count) || 20));

    if (!keyword) {
      return NextResponse.json({ error: "请提供行业词 keyword" }, { status: 400 });
    }

    if (body.forceDemo || !hasLlmConfig()) {
      return NextResponse.json(buildTripleLineFallback(keyword, count));
    }

    try {
      const raw = await chatJson<TripleLineResult>(
        TRIPLE_LINE_SYSTEM,
        buildTripleLineUserPrompt(keyword, count)
      );
      return NextResponse.json(normalizeTripleLine(raw, "llm"));
    } catch (err) {
      const fallback = buildTripleLineFallback(keyword, count);
      return NextResponse.json({
        ...fallback,
        warning:
          err instanceof Error
            ? `LLM 失败，已降级示例/模板：${err.message}`
            : "LLM 失败，已降级示例/模板",
      });
    }
  } catch {
    return NextResponse.json({ error: "请求解析失败" }, { status: 400 });
  }
}
