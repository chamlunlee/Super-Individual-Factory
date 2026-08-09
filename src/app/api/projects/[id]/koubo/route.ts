import { NextResponse } from "next/server";
import { blackCardFetch, BlackCardError } from "@/lib/black-card/client";
import {
  commitProject,
  resolveRequestProject,
  type ProjectBody,
} from "@/lib/project/resolve-request-project";
import { buildScriptRaw } from "@/lib/project/script";

export const runtime = "nodejs";
export const maxDuration = 300;

type Ctx = { params: Promise<{ id: string }> };

export async function POST(req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const body = (await req.json().catch(() => ({}))) as ProjectBody & {
    script?: string;
    targetMinutes?: number;
    title?: string;
  };

  const { project, clientOwned } = resolveRequestProject(id, body);
  if (!project) {
    return NextResponse.json({ error: "项目不存在" }, { status: 404 });
  }

  const script = (body.script || project.scriptRaw || buildScriptRaw(project)).trim();
  if (!script) {
    return NextResponse.json(
      { error: "请先生成口播原文（选题/标题/平台文案）" },
      { status: 400 }
    );
  }

  try {
    const result = await blackCardFetch<{
      title: string;
      markdown: string;
      lines: string[];
      outputPath?: string;
      linesPath?: string;
      qaPath?: string;
    }>("/api/koubo/generate", {
      method: "POST",
      body: JSON.stringify({
        script,
        targetMinutes: body.targetMinutes || 4,
        title: body.title || project.title,
        writeFiles: true,
      }),
    });

    // 同步逐句到字幕库
    const fileName = `${result.title || project.title}-逐句.txt`.replace(
      /[\\/:*?"<>|]/g,
      "_"
    );
    await blackCardFetch("/api/subtitles/import", {
      method: "POST",
      body: JSON.stringify({
        fileName,
        content: (result.lines || []).join("\n"),
      }),
    }).catch(() => null);

    const next = commitProject(
      {
        ...project,
        scriptRaw: script,
        koubo: {
          mdPath: result.outputPath,
          linesPath: result.linesPath,
          qaPath: result.qaPath,
          markdown: result.markdown,
          lines: result.lines,
        },
        status: "script",
        currentStep: "script",
      },
      clientOwned
    );

    return NextResponse.json({ project: next, koubo: result, subtitleFile: fileName });
  } catch (err) {
    if (err instanceof BlackCardError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "洗稿失败" },
      { status: 500 }
    );
  }
}
