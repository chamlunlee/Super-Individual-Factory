import { NextResponse } from "next/server";
import { blackCardFetch, BlackCardError } from "@/lib/black-card/client";
import { resolveStudioPreset } from "@/lib/project/presets";
import {
  commitProject,
  resolveRequestProject,
  type ProjectBody,
} from "@/lib/project/resolve-request-project";
import { buildScriptRaw } from "@/lib/project/script";
import type { StoryboardProject, StoryboardShotType } from "@/lib/project/storyboard-types";

export const runtime = "nodejs";
export const maxDuration = 300;

type Ctx = { params: Promise<{ id: string }> };

export async function POST(req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const body = (await req.json().catch(() => ({}))) as ProjectBody & {
    presetId?: string;
    forceRules?: boolean;
    script?: string;
  };

  const { project, clientOwned } = resolveRequestProject(id, body);
  if (!project) {
    return NextResponse.json({ error: "项目不存在" }, { status: 404 });
  }

  const preset = resolveStudioPreset(
    body.presetId || project.brand.presetId || "knowledge_classic"
  );
  const script =
    body.script ||
    project.koubo?.lines?.join("\n") ||
    project.koubo?.markdown ||
    project.scriptRaw ||
    buildScriptRaw(project);

  if (!script?.trim()) {
    return NextResponse.json(
      { error: "请先完成口播原文或洗稿" },
      { status: 400 }
    );
  }

  try {
    const result = await blackCardFetch<{
      presetId: string;
      project: StoryboardProject;
      mode: "llm" | "rules";
      provider?: string;
      warning?: string;
    }>("/api/storyboard", {
      method: "POST",
      body: JSON.stringify({
        script,
        presetId: preset.id,
        title: project.title,
        aspect: project.brand.aspect,
        accentColor: project.brand.accent,
        brand: {
          name: project.brand.name,
          watermark: project.brand.watermark || project.brand.name,
        },
        forceRules: Boolean(body.forceRules),
      }),
    });

    const next = commitProject(
      {
        ...project,
        scriptRaw: project.scriptRaw || script,
        brand: {
          ...project.brand,
          presetId: preset.id,
          styleId: preset.styleId,
          showSubtitles: true,
        },
        storyboard: {
          presetId: preset.id,
          mode: result.mode,
          warning: result.warning,
          project: result.project,
        },
        currentStep: "produce",
        status: "produce",
      },
      clientOwned
    );

    return NextResponse.json({
      project: next,
      mode: result.mode,
      provider: result.provider,
      warning: result.warning,
    });
  } catch (err) {
    if (err instanceof BlackCardError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "分镜失败" },
      { status: 500 }
    );
  }
}

/** 修改某一镜 ShotType */
export async function PATCH(req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const body = (await req.json()) as ProjectBody & {
    shotId?: string;
    type?: StoryboardShotType;
  };

  const { project, clientOwned } = resolveRequestProject(id, body);
  if (!project?.storyboard?.project) {
    return NextResponse.json({ error: "请先生成分镜表" }, { status: 400 });
  }

  if (!body.shotId || !body.type) {
    return NextResponse.json({ error: "shotId、type 必填" }, { status: 400 });
  }

  try {
    const result = await blackCardFetch<{ project: StoryboardProject }>(
      "/api/storyboard/shot-type",
      {
        method: "POST",
        body: JSON.stringify({
          project: project.storyboard.project,
          shotId: body.shotId,
          type: body.type,
          presetId: project.storyboard.presetId || project.brand.presetId,
        }),
      }
    );

    const next = commitProject(
      {
        ...project,
        storyboard: {
          ...project.storyboard,
          project: result.project,
        },
      },
      clientOwned
    );
    return NextResponse.json({ project: next });
  } catch (err) {
    if (err instanceof BlackCardError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "修改失败" },
      { status: 500 }
    );
  }
}
