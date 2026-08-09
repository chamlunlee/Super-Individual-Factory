import { NextResponse } from "next/server";
import { blackCardFetch, BlackCardError } from "@/lib/black-card/client";
import { resolveStudioPreset } from "@/lib/project/presets";
import {
  commitProject,
  resolveRequestProject,
  type ProjectBody,
} from "@/lib/project/resolve-request-project";
import { buildScriptRaw } from "@/lib/project/script";
import type { StoryboardProject } from "@/lib/project/storyboard-types";

export const runtime = "nodejs";
export const maxDuration = 600;

type Ctx = { params: Promise<{ id: string }> };

export async function POST(req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const body = (await req.json().catch(() => ({}))) as ProjectBody & {
    withTts?: boolean;
    voice?: string;
    /** 若未先预览分镜，允许自动生成后再渲染 */
    autoStoryboard?: boolean;
  };

  const resolved = resolveRequestProject(id, body);
  let project = resolved.project;
  const clientOwned = resolved.clientOwned;
  if (!project) {
    return NextResponse.json({ error: "项目不存在" }, { status: 404 });
  }

  const preset = resolveStudioPreset(project.brand.presetId);
  const script =
    project.koubo?.lines?.join("\n") ||
    project.koubo?.markdown ||
    project.scriptRaw ||
    buildScriptRaw(project);

  if (!script?.trim() && !project.storyboard?.project) {
    return NextResponse.json(
      { error: "渲染需要口播稿：请先完成口播步骤" },
      { status: 400 }
    );
  }

  try {
    const brandMeta = {
      name: project.brand.name,
      watermark: project.brand.watermark || project.brand.name,
    };

    let draft: StoryboardProject | undefined = project.storyboard?.project;

    if (!draft || body.autoStoryboard) {
      const board = await blackCardFetch<{
        presetId: string;
        project: StoryboardProject;
        mode: "llm" | "rules";
        warning?: string;
      }>("/api/storyboard", {
        method: "POST",
        body: JSON.stringify({
          script,
          presetId: preset.id,
          title: project.title,
          aspect: project.brand.aspect,
          accentColor: project.brand.accent,
          brand: brandMeta,
        }),
      });
      draft = board.project;
      project = commitProject(
        {
          ...project,
          brand: {
            ...project.brand,
            presetId: preset.id,
            styleId: preset.styleId,
            showSubtitles: true,
          },
          storyboard: {
            presetId: preset.id,
            mode: board.mode,
            warning: board.warning,
            project: board.project,
          },
        },
        clientOwned
      );
    }

    draft = {
      ...draft,
      meta: {
        ...draft.meta,
        title: project.title,
        aspect: project.brand.aspect,
        accentColor: project.brand.accent,
        styleId: preset.styleId,
        showSubtitles: true,
        showProgressBar: true,
        brand: brandMeta,
      },
    };

    let audioPath: string | undefined;
    if (body.withTts) {
      const ttsText =
        project.koubo?.lines?.join("\n") ||
        project.scriptRaw ||
        script ||
        draft.shots.map((s) => s.text).join("\n");
      const tts = await blackCardFetch<{
        path: string;
        url?: string;
        fileName: string;
      }>("/api/voice/tts", {
        method: "POST",
        body: JSON.stringify({
          text: ttsText,
          title: project.id,
          voice: body.voice || "zh-CN-YunyangNeural",
        }),
      });
      audioPath = tts.path;
      draft = {
        ...draft,
        audio: { src: tts.path },
      };
    }

    const exported = await blackCardFetch<{ path: string }>("/api/export", {
      method: "POST",
      body: JSON.stringify(draft),
    });

    const rendered = await blackCardFetch<{
      ok: boolean;
      fileName: string;
      path: string;
      url: string;
      message?: string;
    }>("/api/render", {
      method: "POST",
      body: JSON.stringify(draft),
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
        storyboard: project.storyboard || {
          presetId: preset.id,
          project: draft,
        },
        produce: {
          projectJsonPath: exported.path,
          mp4Path: rendered.path,
          mp4Url: rendered.url
            ? `http://127.0.0.1:3456${rendered.url}`
            : undefined,
          audioPath,
          showSubtitles: true,
          fileName: rendered.fileName,
          presetId: preset.id,
        },
        status: "produce",
        currentStep: "produce",
      },
      clientOwned
    );

    return NextResponse.json({
      project: next,
      render: rendered,
      message: rendered.message,
    });
  } catch (err) {
    if (err instanceof BlackCardError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "成片失败" },
      { status: 500 }
    );
  }
}
