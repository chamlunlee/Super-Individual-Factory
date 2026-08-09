import { NextResponse } from "next/server";
import { adviseDispatchByRules } from "@/lib/model/dispatch-advisor";
import type { PresetId } from "@/lib/project/presets";

export const runtime = "nodejs";

const PRESETS: PresetId[] = [
  "knowledge_classic",
  "punch_animation",
  "list_classic",
];

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      title?: string;
      seedTitle?: string;
      presetId?: string;
    };
    const title = (body.title || body.seedTitle || "").trim();
    if (!title) {
      return NextResponse.json({ error: "请提供种子标题" }, { status: 400 });
    }
    const preferred = PRESETS.includes(body.presetId as PresetId)
      ? (body.presetId as PresetId)
      : null;
    const advice = adviseDispatchByRules(title, preferred);
    return NextResponse.json(advice);
  } catch {
    return NextResponse.json({ error: "请求解析失败" }, { status: 400 });
  }
}
