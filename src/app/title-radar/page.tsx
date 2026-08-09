"use client";

import { useMemo, useState } from "react";
import { TitleRadarChart } from "@/components/RadarChart";
import { CopyButton } from "@/components/CopyButton";
import { DEMO_TITLE_RADAR } from "@/lib/model/demo-data";
import { titleRadarToMarkdown } from "@/lib/model/export";
import { RADAR_LABELS } from "@/lib/model/types";
import type { TitleRadarResult } from "@/lib/model/types";

const DEFAULT_TITLES = DEMO_TITLE_RADAR.referenceTitles.join("\n");

export default function TitleRadarPage() {
  const [titlesText, setTitlesText] = useState(DEFAULT_TITLES);
  const [forceDemo, setForceDemo] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [warning, setWarning] = useState("");
  const [result, setResult] = useState<TitleRadarResult | null>(DEMO_TITLE_RADAR);

  const markdown = useMemo(
    () => (result ? titleRadarToMarkdown(result) : ""),
    [result]
  );

  async function onAnalyze(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setWarning("");
    try {
      const res = await fetch("/api/title-radar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ titles: titlesText, forceDemo }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "分析失败");
      }
      if (data.warning) setWarning(data.warning);
      setResult(data as TitleRadarResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : "分析失败");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="pt-6">
      <h1 className="font-display text-3xl md:text-4xl">爆款标题雷达</h1>
      <p className="mt-2 max-w-2xl text-ink/65">
        粘贴参考标题，从题材、句式、用户感知、观点表达四维打分，并生成同型可采纳标题与内容大纲。
      </p>

      <form
        onSubmit={onAnalyze}
        className="mt-6 rounded-2xl border border-ink/10 bg-white/70 p-4"
      >
        <label className="block text-sm">
          <span className="mb-1 block text-ink/60">参考标题（一行一条）</span>
          <textarea
            value={titlesText}
            onChange={(e) => setTitlesText(e.target.value)}
            rows={8}
            className="w-full rounded-lg border border-ink/15 bg-paper px-3 py-2 outline-none ring-accent/30 focus:ring"
          />
        </label>
        <div className="mt-3 flex flex-wrap items-center gap-4">
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-ink px-5 py-2.5 text-sm text-white transition hover:bg-accent disabled:opacity-60"
          >
            {loading ? "分析中…" : "开始分析"}
          </button>
          <label className="flex items-center gap-2 text-sm text-ink/60">
            <input
              type="checkbox"
              checked={forceDemo}
              onChange={(e) => setForceDemo(e.target.checked)}
            />
            强制示例/规则模式
          </label>
        </div>
      </form>

      {error && <p className="mt-3 text-sm text-red-700">{error}</p>}
      {warning && <p className="mt-3 text-sm text-amber-800">{warning}</p>}

      {result && (
        <div className="mt-8 space-y-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-ink/55">
              模式：{result.mode === "llm" ? "大模型" : "示例/规则"} · 参考{" "}
              {result.referenceTitles.length} 条
            </p>
            <CopyButton text={markdown} label="复制 Markdown" />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-ink/10 bg-white/70 p-4">
              <h2 className="font-display text-xl">四维雷达</h2>
              <TitleRadarChart scores={result.scores} />
              <ul className="mt-2 grid grid-cols-2 gap-2 text-sm">
                {(Object.keys(RADAR_LABELS) as (keyof typeof RADAR_LABELS)[]).map(
                  (key) => (
                    <li key={key} className="rounded-md bg-sand/70 px-2 py-1">
                      {RADAR_LABELS[key]}：{result.scores[key]}
                    </li>
                  )
                )}
              </ul>
            </div>
            <div className="rounded-2xl border border-ink/10 bg-white/70 p-4">
              <h2 className="font-display text-xl">诊断</h2>
              <p className="mt-3 text-sm leading-relaxed text-ink/70">
                {result.diagnosis}
              </p>
              <h3 className="mt-5 text-sm font-medium text-ink">题材与句式</h3>
              <div className="mt-2 flex flex-wrap gap-2">
                {result.patterns.map((p) => (
                  <span
                    key={`${p.kind}-${p.label}`}
                    className="rounded-md bg-moss/10 px-2 py-1 text-xs text-moss"
                  >
                    [{p.kind}] {p.label} ×{p.count}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div>
            <h2 className="font-display text-2xl">可采纳新标题</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {result.generated.map((g, i) => (
                <article
                  key={`${g.title}-${i}`}
                  className="rounded-xl border border-ink/10 bg-white/75 p-4 transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="mb-2 flex items-start justify-between gap-2">
                    <h3 className="font-display text-base leading-snug">
                      <span className="mr-2 text-accent">{i + 1}.</span>
                      {g.title}
                    </h3>
                    <CopyButton
                      text={[g.title, ...g.outline.map((o) => `- ${o}`), `CTA：${g.cta}`].join(
                        "\n"
                      )}
                      label="复制"
                    />
                  </div>
                  <ul className="mb-3 list-disc space-y-1 pl-5 text-sm text-ink/70">
                    {g.outline.map((o) => (
                      <li key={o}>{o}</li>
                    ))}
                  </ul>
                  <p className="text-xs text-moss">CTA：{g.cta}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
