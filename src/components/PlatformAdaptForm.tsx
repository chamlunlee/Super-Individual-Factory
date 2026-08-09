"use client";

import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import { CopyButton } from "@/components/CopyButton";
import type { DispatchAdvice } from "@/lib/model/dispatch-advisor";
import type {
  PlatformAdaptItem,
  PlatformAdaptResult,
  PlatformSelect,
} from "@/lib/model/platform-adapt-types";
import { publishPackToMarkdown } from "@/lib/model/publish-pack";
import { STUDIO_PRESETS, type PresetId } from "@/lib/project/presets";

const PLATFORM_OPTIONS: { value: PlatformSelect; label: string }[] = [
  { value: "all", label: "全部平台" },
  { value: "xiaohongshu", label: "小红书" },
  { value: "shipinhao", label: "视频号" },
  { value: "bilibili", label: "B站" },
  { value: "douyin", label: "抖音" },
  { value: "gongzhonghao", label: "公众号" },
];

export function PlatformAdaptForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [platform, setPlatform] = useState<PlatformSelect>("all");
  const [presetHint, setPresetHint] = useState<"" | PresetId>("");
  const [loading, setLoading] = useState(false);
  const [creatingId, setCreatingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [warning, setWarning] = useState("");
  const [advice, setAdvice] = useState<DispatchAdvice | null>(null);
  const [result, setResult] = useState<PlatformAdaptResult | null>(null);

  async function runDispatchOnly() {
    if (!title.trim()) {
      setError("请先填写种子标题");
      return;
    }
    setLoading(true);
    setError("");
    setWarning("");
    try {
      const res = await fetch("/api/dispatch-advise", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          presetId: presetHint || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "分发建议失败");
      setAdvice(data as DispatchAdvice);
      setPlatform(data.primaryPlatform as PlatformSelect);
    } catch (err) {
      setError(err instanceof Error ? err.message : "分发建议失败");
    } finally {
      setLoading(false);
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setWarning("");
    try {
      const adviseRes = await fetch("/api/dispatch-advise", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          presetId: presetHint || undefined,
        }),
      });
      const adviseData = await adviseRes.json();
      if (adviseRes.ok) {
        setAdvice(adviseData as DispatchAdvice);
      }

      const targetPlatform =
        platform === "all" && adviseRes.ok
          ? (adviseData.primaryPlatform as PlatformSelect)
          : platform;

      const res = await fetch("/api/platform-adapt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, platform: targetPlatform }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "生成失败");
      if (data.warning) setWarning(data.warning);
      const next = data as PlatformAdaptResult;
      if (!next.dispatch && adviseRes.ok) {
        next.dispatch = adviseData as DispatchAdvice;
      }
      setResult(next);
      if (next.dispatch) setAdvice(next.dispatch);
    } catch (err) {
      setError(err instanceof Error ? err.message : "生成失败");
    } finally {
      setLoading(false);
    }
  }

  async function createProjectFromItem(item: PlatformAdaptItem) {
    if (!item.publishPack) {
      setError("缺少发物料包");
      return;
    }
    setCreatingId(item.platform);
    setError("");
    try {
      const res = await fetch("/api/projects/from-pack", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          seedTitle: result?.seedTitle || title,
          industryKeyword: title,
          item,
          pack: item.publishPack,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "创建项目失败");
      router.push(data.redirectTo || `/projects/${data.project.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "创建项目失败");
    } finally {
      setCreatingId(null);
    }
  }

  const sortedItems = result
    ? [...result.items].sort((a, b) => {
        const primary = advice?.primaryPlatform || result.dispatch?.primaryPlatform;
        if (a.platform === primary) return -1;
        if (b.platform === primary) return 1;
        if (a.platform === advice?.secondaryPlatform) return -1;
        if (b.platform === advice?.secondaryPlatform) return 1;
        return 0;
      })
    : [];

  return (
    <section className="mt-8">
      <form
        onSubmit={onSubmit}
        className="rounded-2xl border border-ink/10 bg-white/70 p-4 md:p-5"
      >
        <h2 className="font-display text-xl md:text-2xl">
          输入种子标题，开始本条分发
        </h2>
        <p className="mt-1 text-sm text-ink/55">
          先判主平台与主指标，再生成可粘贴发物料包；可一键送进内容工作室。
        </p>

        <div className="mt-4 grid gap-3 md:grid-cols-[1fr_140px_140px] md:items-end">
          <label className="block text-sm">
            <span className="mb-1 block text-ink/60">种子标题</span>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="例如：女追男最容易死在聊得很好却约不出来"
              className="w-full rounded-lg border border-ink/15 bg-paper px-3 py-2 outline-none ring-accent/30 focus:ring"
              required
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-ink/60">改写范围</span>
            <select
              value={platform}
              onChange={(e) => setPlatform(e.target.value as PlatformSelect)}
              className="w-full rounded-lg border border-ink/15 bg-paper px-3 py-2"
            >
              {PLATFORM_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-ink/60">片型偏好</span>
            <select
              value={presetHint}
              onChange={(e) =>
                setPresetHint(e.target.value as "" | PresetId)
              }
              className="w-full rounded-lg border border-ink/15 bg-paper px-3 py-2"
            >
              <option value="">自动判断</option>
              {STUDIO_PRESETS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            disabled={loading}
            onClick={() => void runDispatchOnly()}
            className="rounded-lg border border-ink/15 px-4 py-2.5 text-sm disabled:opacity-60"
          >
            只看分发建议
          </button>
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-ink px-5 py-2.5 text-sm text-white transition hover:bg-accent disabled:opacity-60"
          >
            {loading ? "生成中…" : "生成发物料包"}
          </button>
        </div>
      </form>

      {error && <p className="mt-3 text-sm text-red-700">{error}</p>}
      {warning && <p className="mt-3 text-sm text-amber-800">{warning}</p>}

      {advice && (
        <div className="mt-5 rounded-2xl border border-accent/30 bg-accent/10 p-5">
          <p className="text-xs tracking-widest text-accent">DISPATCH</p>
          <h3 className="mt-1 font-display text-2xl">本条分发顾问</h3>
          <div className="mt-3 grid gap-3 text-sm md:grid-cols-2">
            <p>
              <span className="text-ink/55">主平台：</span>
              <strong>{advice.primaryPlatformName}</strong>
            </p>
            <p>
              <span className="text-ink/55">备选：</span>
              {advice.secondaryPlatformName}
            </p>
            <p>
              <span className="text-ink/55">主指标：</span>
              {advice.primaryMetric}
            </p>
            <p>
              <span className="text-ink/55">建议片型：</span>
              {advice.presetLabel}
            </p>
            <p className="md:col-span-2">
              <span className="text-ink/55">发布后盯：</span>
              {advice.watchField}
            </p>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-ink/70">
            {advice.reason}
          </p>
        </div>
      )}

      {result && (
        <div className="mt-5 space-y-4">
          <p className="text-sm text-ink/55">
            模式：{result.mode === "llm" ? "大模型" : "模板降级"} · 种子：
            {result.seedTitle}
            {advice
              ? ` · 主平台结果已置顶`
              : ""}
          </p>
          <div className="grid gap-4">
            {sortedItems.map((item) => (
              <ResultCard
                key={item.platform}
                item={item}
                highlighted={
                  item.platform ===
                  (advice?.primaryPlatform || result.dispatch?.primaryPlatform)
                }
                creating={creatingId === item.platform}
                onCreateProject={() => void createProjectFromItem(item)}
              />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

function ResultCard({
  item,
  highlighted,
  creating,
  onCreateProject,
}: {
  item: PlatformAdaptItem;
  highlighted?: boolean;
  creating?: boolean;
  onCreateProject: () => void;
}) {
  const pack = item.publishPack;
  const packMd = pack
    ? publishPackToMarkdown(pack, item.platformName)
    : "";
  const fullText = [
    packMd,
    "",
    "## 爆款文案",
    `钩子：${item.copy.hook}`,
    ...item.copy.body.map((b) => `- ${b}`),
    `CTA：${item.copy.cta}`,
  ].join("\n");

  return (
    <article
      className={`rounded-2xl border p-4 md:p-5 ${
        highlighted
          ? "border-accent bg-accent/5"
          : "border-ink/10 bg-white/75"
      }`}
    >
      <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs tracking-widest text-accent">
            {item.platform}
            {highlighted ? " · 主推" : ""}
          </p>
          <h3 className="font-display text-2xl">{item.platformName}</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {pack && <CopyButton text={packMd} label="复制发物料" />}
          <CopyButton text={fullText} label="复制全文" />
          <button
            type="button"
            disabled={creating || !pack}
            onClick={onCreateProject}
            className="rounded-lg bg-moss px-3 py-1.5 text-sm text-white hover:opacity-90 disabled:opacity-50"
          >
            {creating ? "创建中…" : "用这条创建项目"}
          </button>
        </div>
      </div>

      {pack && (
        <div className="mb-4 rounded-xl border border-moss/25 bg-moss/5 p-4 text-sm">
          <h4 className="font-medium text-ink">发物料包</h4>
          <dl className="mt-2 grid gap-2 md:grid-cols-2">
            <div>
              <dt className="text-xs text-ink/45">主标题</dt>
              <dd>{pack.mainTitle}</dd>
            </div>
            <div>
              <dt className="text-xs text-ink/45">封面文案</dt>
              <dd className="font-medium text-moss">{pack.coverText}</dd>
            </div>
            <div>
              <dt className="text-xs text-ink/45">备选标题</dt>
              <dd className="text-ink/70">{pack.altTitles.join(" / ")}</dd>
            </div>
            <div>
              <dt className="text-xs text-ink/45">开评钩子</dt>
              <dd>{pack.commentHook}</dd>
            </div>
            <div className="md:col-span-2">
              <dt className="text-xs text-ink/45">标签</dt>
              <dd className="mt-1 flex flex-wrap gap-1.5">
                {pack.tags.map((t) => (
                  <span
                    key={t}
                    className="rounded-md bg-white px-2 py-0.5 text-xs ring-1 ring-ink/10"
                  >
                    #{t}
                  </span>
                ))}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-ink/45">片型</dt>
              <dd>
                {pack.presetLabel}（{pack.presetId}）
              </dd>
            </div>
            <div>
              <dt className="text-xs text-ink/45">主指标 / 盯什么</dt>
              <dd>
                {pack.primaryMetric} · {pack.watchField}
              </dd>
            </div>
          </dl>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <Block title="推荐标题">
          <ol className="list-decimal space-y-1.5 pl-4">
            {item.adaptedTitles.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ol>
        </Block>
        <Block title="爆款文案">
          <p className="text-ink/80">
            <span className="text-moss">钩子：</span>
            {item.copy.hook}
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-4">
            {item.copy.body.map((b) => (
              <li key={b}>{b}</li>
            ))}
          </ul>
          <p className="mt-2 text-xs text-moss">CTA：{item.copy.cta}</p>
        </Block>
      </div>
    </article>
  );
}

function Block({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-xl border border-ink/5 bg-paper/50 p-4 text-sm text-ink/70">
      <h4 className="mb-2 font-medium text-ink">{title}</h4>
      {children}
    </div>
  );
}
