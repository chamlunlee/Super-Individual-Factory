"use client";

import { useMemo, useState } from "react";
import { RingModel } from "@/components/RingModel";
import { QuestionCard } from "@/components/QuestionCard";
import { CopyButton } from "@/components/CopyButton";
import { DEMO_TRIPLE_LINE } from "@/lib/model/demo-data";
import { tripleLineToMarkdown } from "@/lib/model/export";
import type { TripleLineResult } from "@/lib/model/types";

export default function TripleLinePage() {
  const [keyword, setKeyword] = useState("二奢");
  const [count, setCount] = useState(20);
  const [forceDemo, setForceDemo] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [warning, setWarning] = useState("");
  const [result, setResult] = useState<TripleLineResult | null>(DEMO_TRIPLE_LINE);

  const markdown = useMemo(
    () => (result ? tripleLineToMarkdown(result) : ""),
    [result]
  );

  async function onGenerate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setWarning("");
    try {
      const res = await fetch("/api/triple-line", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keyword, count, forceDemo }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "生成失败");
      }
      if (data.warning) setWarning(data.warning);
      setResult(data as TripleLineResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : "生成失败");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="pt-6">
      <h1 className="font-display text-3xl md:text-4xl">三点一线出题</h1>
      <p className="mt-2 max-w-2xl text-ink/65">
        输入行业词，扩展 L1 物与服务、L2 人群与场景，再按四种连线公式批量出选择题式选题。
      </p>

      <form
        onSubmit={onGenerate}
        className="mt-6 grid gap-3 rounded-2xl border border-ink/10 bg-white/70 p-4 md:grid-cols-[1fr_120px_auto] md:items-end"
      >
        <label className="block text-sm">
          <span className="mb-1 block text-ink/60">行业词</span>
          <input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="w-full rounded-lg border border-ink/15 bg-paper px-3 py-2 outline-none ring-accent/30 focus:ring"
            placeholder="例如：二奢、美甲、留学中介"
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block text-ink/60">题量</span>
          <select
            value={count}
            onChange={(e) => setCount(Number(e.target.value))}
            className="w-full rounded-lg border border-ink/15 bg-paper px-3 py-2"
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </label>
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-ink px-5 py-2.5 text-sm text-white transition hover:bg-accent disabled:opacity-60"
        >
          {loading ? "生成中…" : "生成选题"}
        </button>
        <label className="flex items-center gap-2 text-sm text-ink/60 md:col-span-3">
          <input
            type="checkbox"
            checked={forceDemo}
            onChange={(e) => setForceDemo(e.target.checked)}
          />
          强制使用示例/模板模式（不调用 API）
        </label>
      </form>

      {error && <p className="mt-3 text-sm text-red-700">{error}</p>}
      {warning && <p className="mt-3 text-sm text-amber-800">{warning}</p>}

      {result && (
        <div className="mt-8 space-y-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm text-ink/55">
                模式：{result.mode === "llm" ? "大模型" : "示例/模板"} · 共{" "}
                {result.questions.length} 题
              </p>
              <p className="mt-1 text-sm text-ink/55">
                同义词：{result.graph.synonyms.join("、") || "—"}
              </p>
            </div>
            <div className="flex gap-2">
              <CopyButton text={markdown} label="复制 Markdown" />
              <CopyButton
                text={JSON.stringify(result, null, 2)}
                label="复制 JSON"
              />
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
            <div className="rounded-2xl border border-ink/10 bg-white/70 p-4">
              <RingModel graph={result.graph} />
            </div>
            <div className="rounded-2xl border border-ink/10 bg-white/60 p-4 text-sm leading-relaxed text-ink/70">
              <h2 className="font-display text-xl text-ink">节点清单</h2>
              <p className="mt-3">
                <strong>L1 物与服务：</strong>
                {result.graph.items.map((n) => n.label).join("、")}
              </p>
              <p className="mt-2">
                <strong>L2a 人群：</strong>
                {result.graph.audiences.map((n) => n.label).join("、")}
              </p>
              <p className="mt-2">
                <strong>L2b 场景动机：</strong>
                {result.graph.motives.map((n) => n.label).join("、")}
              </p>
              <p className="mt-2">
                <strong>上下游：</strong>
                {result.graph.upstreamDownstream.join("、") || "—"}
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {result.questions.map((q, i) => (
              <QuestionCard key={q.id} question={q} index={i} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
