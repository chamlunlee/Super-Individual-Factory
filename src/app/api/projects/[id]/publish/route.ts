import { NextResponse } from "next/server";
import {
  commitProject,
  resolveRequestProject,
  type ProjectBody,
} from "@/lib/project/resolve-request-project";
import type { PublishPackage, StudioPlatformId } from "@/lib/project/types";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> };

const PLATFORM_URLS: Record<string, string> = {
  douyin: "https://creator.douyin.com/",
  xiaohongshu: "https://creator.xiaohongshu.com/",
  shipinhao: "https://channels.weixin.qq.com/",
  bilibili: "https://member.bilibili.com/platform/upload/video/frame",
  gongzhonghao: "https://mp.weixin.qq.com/",
};

export async function POST(req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const body = (await req.json().catch(() => ({}))) as ProjectBody & {
    platforms?: StudioPlatformId[];
  };

  const { project, clientOwned } = resolveRequestProject(id, body);
  if (!project) {
    return NextResponse.json({ error: "项目不存在" }, { status: 404 });
  }

  const platforms =
    body.platforms?.length ? body.platforms : project.platforms;
  const copies = project.platformCopies?.items ?? [];
  const packages: PublishPackage[] = platforms.map((platform) => {
    const item = copies.find((c) => c.platform === platform);
    const selected =
      project.selectedTitles.find((t) => t.platform === platform) ||
      project.selectedTitles[0];
    const title =
      item?.adaptedTitles?.[0] || selected?.title || project.title;
    const bodyText = item
      ? [item.copy.hook, ...item.copy.body].join("\n")
      : selected?.outline?.join("\n") || "";
    const cta = item?.copy.cta || "私信了解更多";
    return {
      id: `pub_${platform}_${Date.now().toString(36)}`,
      platform,
      title,
      body: bodyText,
      cta,
      status: "draft" as const,
      sourceTitle: selected?.title,
    };
  });

  const next = commitProject(
    {
      ...project,
      publish: { packages },
      status: "published",
      currentStep: "publish",
    },
    clientOwned
  );

  return NextResponse.json({
    project: next,
    assistUrls: PLATFORM_URLS,
  });
}

export async function PATCH(req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const body = (await req.json()) as ProjectBody & {
    packageId: string;
    status?: PublishPackage["status"];
    metrics?: PublishPackage["metrics"];
    publishedAt?: string;
  };

  const { project, clientOwned } = resolveRequestProject(id, body);
  if (!project) {
    return NextResponse.json({ error: "项目不存在" }, { status: 404 });
  }

  if (!body.packageId) {
    return NextResponse.json({ error: "packageId 不能为空" }, { status: 400 });
  }

  const packages = (project.publish?.packages || []).map((pkg) => {
    if (pkg.id !== body.packageId) return pkg;
    return {
      ...pkg,
      status: body.status ?? pkg.status,
      metrics: body.metrics ? { ...pkg.metrics, ...body.metrics } : pkg.metrics,
      publishedAt:
        body.publishedAt ??
        (body.status === "assisted" || body.status === "uploaded"
          ? new Date().toISOString()
          : pkg.publishedAt),
    };
  });

  const next = commitProject(
    {
      ...project,
      publish: { packages },
      currentStep: "publish",
    },
    clientOwned
  );

  return NextResponse.json(next);
}
