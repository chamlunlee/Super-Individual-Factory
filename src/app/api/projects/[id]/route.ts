import { NextResponse } from "next/server";
import { deleteProject, getProject, saveProject } from "@/lib/project/store";
import type { StudioProject } from "@/lib/project/types";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const project = getProject(id);
  if (!project) {
    return NextResponse.json({ error: "项目不存在" }, { status: 404 });
  }
  if (!project.brand.presetId) {
    project.brand.presetId = "knowledge_classic";
  }
  return NextResponse.json(project);
}

export async function PATCH(req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const existing = getProject(id);
  if (!existing) {
    return NextResponse.json({ error: "项目不存在" }, { status: 404 });
  }

  const patch = (await req.json()) as Partial<StudioProject>;
  const next: StudioProject = {
    ...existing,
    ...patch,
    id: existing.id,
    createdAt: existing.createdAt,
    brand: {
      ...existing.brand,
      ...(patch.brand || {}),
      presetId:
        patch.brand?.presetId ||
        existing.brand.presetId ||
        "knowledge_classic",
      showSubtitles: true,
    },
    selectedQuestionIds:
      patch.selectedQuestionIds ?? existing.selectedQuestionIds,
    selectedTitles: patch.selectedTitles ?? existing.selectedTitles,
  };
  return NextResponse.json(saveProject(next));
}

export async function DELETE(_req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  if (!deleteProject(id)) {
    return NextResponse.json({ error: "项目不存在" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
