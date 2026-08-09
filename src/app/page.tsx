"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { NewProjectModal } from "@/components/project/NewProjectModal";
import { listProjectsClient } from "@/lib/project/client-api";
import type { StudioProject } from "@/lib/project/types";

export default function HomePage() {
  const [projects, setProjects] = useState<StudioProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    void listProjectsClient()
      .then(setProjects)
      .finally(() => setLoading(false));
  }, [open]);

  return (
    <section className="relative overflow-hidden pt-10 md:pt-14">
      <div className="pointer-events-none absolute -right-16 top-0 h-64 w-64 rounded-full bg-accent/10 blur-3xl" />
      <div className="pointer-events-none absolute -left-10 bottom-0 h-48 w-48 rounded-full bg-moss/10 blur-3xl" />

      <p className="mb-3 text-sm uppercase tracking-[0.2em] text-moss">
        Content Studio
      </p>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl leading-tight text-ink md:text-6xl">
            内容工作室
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-ink/70 md:text-lg">
            以项目贯穿：选题 → 标题 → 平台文案 → 口播 → 黑底成片 → 发布与效果。本地交付，无需登录。
          </p>
        </div>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="rounded-lg bg-ink px-5 py-2.5 text-sm text-white hover:bg-accent"
        >
          新建项目
        </button>
      </div>

      <div className="mt-10">
        <h2 className="font-display text-2xl">我的项目</h2>
        {loading ? (
          <p className="mt-4 text-sm text-ink/55">加载中…</p>
        ) : projects.length === 0 ? (
          <p className="mt-4 text-sm text-ink/55">
            还没有项目。创建一个，从行业词走到可交付成片。
          </p>
        ) : (
          <ul className="mt-4 grid gap-3 md:grid-cols-2">
            {projects.map((p) => (
              <li key={p.id}>
                <Link
                  href={`/projects/${p.id}`}
                  className="block rounded-2xl border border-ink/10 bg-white/70 p-5 transition hover:-translate-y-0.5 hover:border-accent/30 hover:shadow-md"
                >
                  <p className="font-display text-xl">{p.title}</p>
                  <p className="mt-1 text-sm text-ink/60">
                    {p.industryKeyword} · {p.brand.name} · {p.status}
                  </p>
                  <p className="mt-2 text-xs text-ink/45">
                    更新于 {new Date(p.updatedAt).toLocaleString("zh-CN")}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mt-12 grid gap-4 md:grid-cols-3">
        <ToolLink href="/triple-line" title="三点一线（快速试用）" />
        <ToolLink href="/title-radar" title="标题雷达（快速试用）" />
        <ToolLink href="/platform-titles" title="平台取向说明" />
      </div>

      <NewProjectModal open={open} onClose={() => setOpen(false)} />
    </section>
  );
}

function ToolLink({ href, title }: { href: string; title: string }) {
  return (
    <Link
      href={href}
      className="rounded-xl border border-dashed border-ink/15 px-4 py-3 text-sm text-ink/65 hover:border-moss hover:text-moss"
    >
      {title} →
    </Link>
  );
}
