"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createProjectClient } from "@/lib/project/client-api";
import {
  resolveStudioPreset,
  STUDIO_PRESETS,
  type PresetId,
} from "@/lib/project/presets";
import type { StudioPlatformId } from "@/lib/project/types";

const ALL_PLATFORMS: Array<{ id: StudioPlatformId; label: string }> = [
  { id: "douyin", label: "抖音" },
  { id: "xiaohongshu", label: "小红书" },
  { id: "shipinhao", label: "视频号" },
  { id: "bilibili", label: "B站" },
  { id: "gongzhonghao", label: "公众号" },
];

export function NewProjectModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [industryKeyword, setIndustryKeyword] = useState("二奢");
  const [brandName, setBrandName] = useState("未命名账号");
  const [watermark, setWatermark] = useState("");
  const [platforms, setPlatforms] = useState<StudioPlatformId[]>([
    "douyin",
    "xiaohongshu",
  ]);
  const [presetId, setPresetId] = useState<PresetId>("knowledge_classic");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!open) return null;

  function togglePlatform(id: StudioPlatformId) {
    setPlatforms((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const data = await createProjectClient({
        title: title || undefined,
        industryKeyword,
        platforms,
        brand: {
          name: brandName,
          watermark: watermark || brandName,
          presetId,
          styleId: resolveStudioPreset(presetId).styleId,
        },
      });
      onClose();
      router.push(`/projects/${data.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "创建失败");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4 backdrop-blur-sm">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-lg rounded-2xl border border-ink/10 bg-paper p-6 shadow-xl"
      >
        <h2 className="font-display text-2xl">新建内容项目</h2>
        <p className="mt-1 text-sm text-ink/60">
          填写行业与品牌包后进入选题→成片向导。
        </p>
        <div className="mt-5 space-y-3 text-sm">
          <label className="block">
            <span className="mb-1 block text-ink/60">行业词 *</span>
            <input
              required
              value={industryKeyword}
              onChange={(e) => setIndustryKeyword(e.target.value)}
              className="w-full rounded-lg border border-ink/15 bg-white px-3 py-2"
              placeholder="二奢 / 美甲 / 哲学口播"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-ink/60">项目名</span>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-lg border border-ink/15 bg-white px-3 py-2"
              placeholder="可空，默认用行业词"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-ink/60">账号 / 品牌名</span>
            <input
              value={brandName}
              onChange={(e) => setBrandName(e.target.value)}
              className="w-full rounded-lg border border-ink/15 bg-white px-3 py-2"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-ink/60">角标文案</span>
            <input
              value={watermark}
              onChange={(e) => setWatermark(e.target.value)}
              className="w-full rounded-lg border border-ink/15 bg-white px-3 py-2"
              placeholder="默认同品牌名"
            />
          </label>
          <fieldset>
            <legend className="mb-2 text-ink/60">目标平台</legend>
            <div className="flex flex-wrap gap-2">
              {ALL_PLATFORMS.map((p) => (
                <label
                  key={p.id}
                  className={`cursor-pointer rounded-full px-3 py-1.5 ${
                    platforms.includes(p.id)
                      ? "bg-ink text-white"
                      : "bg-ink/5 text-ink/70"
                  }`}
                >
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={platforms.includes(p.id)}
                    onChange={() => togglePlatform(p.id)}
                  />
                  {p.label}
                </label>
              ))}
            </div>
          </fieldset>
          <fieldset>
            <legend className="mb-2 text-ink/60">默认片型</legend>
            <div className="flex flex-wrap gap-2">
              {STUDIO_PRESETS.map((p) => (
                <label
                  key={p.id}
                  className={`cursor-pointer rounded-full px-3 py-1.5 ${
                    presetId === p.id
                      ? "bg-ink text-white"
                      : "bg-ink/5 text-ink/70"
                  }`}
                >
                  <input
                    type="radio"
                    name="preset"
                    className="sr-only"
                    checked={presetId === p.id}
                    onChange={() => setPresetId(p.id)}
                  />
                  {p.label}
                </label>
              ))}
            </div>
          </fieldset>
        </div>
        {error && <p className="mt-3 text-sm text-red-700">{error}</p>}
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-sm text-ink/70 hover:bg-ink/5"
          >
            取消
          </button>
          <button
            type="submit"
            disabled={loading || !platforms.length}
            className="rounded-lg bg-ink px-4 py-2 text-sm text-white hover:bg-accent disabled:opacity-50"
          >
            {loading ? "创建中…" : "创建并进入向导"}
          </button>
        </div>
      </form>
    </div>
  );
}
