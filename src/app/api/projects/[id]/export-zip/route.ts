import { existsSync, readFileSync } from "node:fs";
import { NextResponse } from "next/server";
import JSZip from "jszip";
import {
  resolveRequestProject,
  type ProjectBody,
} from "@/lib/project/resolve-request-project";
import { summarizePlatformBodies } from "@/lib/project/script";
import type { StudioProject } from "@/lib/project/types";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> };

async function buildZip(project: StudioProject) {
  const zip = new JSZip();
  zip.file("project.json", JSON.stringify(project, null, 2));

  if (project.koubo?.markdown) {
    zip.file("口播成稿.md", project.koubo.markdown);
  } else if (project.scriptRaw) {
    zip.file("口播原文.txt", project.scriptRaw);
  }

  const platformMd = summarizePlatformBodies(project.platformCopies);
  if (platformMd) {
    zip.file("平台文案.md", platformMd);
  }

  const pkgs = project.publish?.packages || [];
  const csvLines = [
    "platform,title,status,views,likes,comments,dms,leads,sourceTitle",
    ...pkgs.map((p) =>
      [
        p.platform,
        csvEscape(p.title),
        p.status,
        p.metrics?.views ?? "",
        p.metrics?.likes ?? "",
        p.metrics?.comments ?? "",
        p.metrics?.dms ?? "",
        p.metrics?.leads ?? "",
        csvEscape(p.sourceTitle || ""),
      ].join(",")
    ),
  ];
  zip.file("效果表.csv", csvLines.join("\n"));

  if (project.produce?.mp4Path && existsSync(project.produce.mp4Path)) {
    zip.file(
      project.produce.fileName || "成片.mp4",
      readFileSync(project.produce.mp4Path)
    );
  }

  if (project.produce?.audioPath && existsSync(project.produce.audioPath)) {
    zip.file("配音.mp3", readFileSync(project.produce.audioPath));
  }

  const buffer = await zip.generateAsync({ type: "nodebuffer" });
  const fileName = `${project.title.replace(/[\\/:*?"<>|]/g, "_")}-交付包.zip`;

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(fileName)}`,
    },
  });
}

export async function GET(_req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const { project } = resolveRequestProject(id, null);
  if (!project) {
    return NextResponse.json({ error: "项目不存在" }, { status: 404 });
  }
  return buildZip(project);
}

/** 生产模式：项目在浏览器缓存，POST 携带快照再打包 */
export async function POST(req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const body = (await req.json().catch(() => ({}))) as ProjectBody;
  const { project } = resolveRequestProject(id, body);
  if (!project) {
    return NextResponse.json({ error: "项目不存在" }, { status: 404 });
  }
  return buildZip(project);
}

function csvEscape(value: string) {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}
