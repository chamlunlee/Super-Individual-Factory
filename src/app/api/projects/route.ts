import { NextResponse } from "next/server";
import type { PresetId } from "@/lib/project/presets";
import { resolveStudioPreset } from "@/lib/project/presets";
import { createEmptyProject, type StudioPlatformId } from "@/lib/project/types";
import { listProjects, saveProject } from "@/lib/project/store";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({ projects: listProjects() });
}

export async function POST(req: Request) {
  const body = (await req.json()) as {
    title?: string;
    industryKeyword?: string;
    platforms?: StudioPlatformId[];
    brand?: {
      name?: string;
      watermark?: string;
      accent?: string;
      aspect?: "9:16" | "16:9";
      styleId?: "classic" | "animation";
      presetId?: PresetId;
    };
  };

  if (!body.industryKeyword?.trim()) {
    return NextResponse.json({ error: "industryKeyword 不能为空" }, { status: 400 });
  }

  const preset = resolveStudioPreset(body.brand?.presetId);
  const project = createEmptyProject({
    title: body.title,
    industryKeyword: body.industryKeyword,
    platforms: body.platforms,
    brand: {
      ...body.brand,
      presetId: preset.id,
      styleId: body.brand?.styleId || preset.styleId,
    },
  });
  saveProject(project);
  return NextResponse.json(project);
}
