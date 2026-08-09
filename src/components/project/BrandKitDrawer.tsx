"use client";

import type { ReactNode } from "react";
import { resolveStudioPreset, STUDIO_PRESETS } from "@/lib/project/presets";
import type { BrandKit } from "@/lib/project/types";

export function BrandKitDrawer({
  brand,
  open,
  onClose,
  onChange,
}: {
  brand: BrandKit;
  open: boolean;
  onClose: () => void;
  onChange: (brand: BrandKit) => void;
}) {
  if (!open) return null;

  const presetId = brand.presetId || "knowledge_classic";

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-ink/30 backdrop-blur-sm">
      <div className="h-full w-full max-w-md overflow-y-auto bg-paper p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-2xl">品牌包</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-sm text-ink/60 hover:text-ink"
          >
            关闭
          </button>
        </div>
        <div className="space-y-4 text-sm">
          <Field label="账号名">
            <input
              value={brand.name}
              onChange={(e) =>
                onChange({
                  ...brand,
                  name: e.target.value,
                  watermark: brand.watermark || e.target.value,
                })
              }
              className="w-full rounded-lg border border-ink/15 bg-white px-3 py-2 outline-none"
            />
          </Field>
          <Field label="角标文案">
            <input
              value={brand.watermark}
              onChange={(e) => onChange({ ...brand, watermark: e.target.value })}
              className="w-full rounded-lg border border-ink/15 bg-white px-3 py-2 outline-none"
            />
          </Field>
          <Field label="强调色">
            <input
              type="color"
              value={brand.accent}
              onChange={(e) => onChange({ ...brand, accent: e.target.value })}
              className="h-10 w-full cursor-pointer rounded-lg border border-ink/15 bg-white"
            />
          </Field>
          <Field label="画幅">
            <select
              value={brand.aspect}
              onChange={(e) =>
                onChange({
                  ...brand,
                  aspect: e.target.value as BrandKit["aspect"],
                })
              }
              className="w-full rounded-lg border border-ink/15 bg-white px-3 py-2 outline-none"
            >
              <option value="9:16">竖屏 9:16</option>
              <option value="16:9">横屏 16:9</option>
            </select>
          </Field>
          <fieldset>
            <legend className="mb-2 text-ink/60">片型预设</legend>
            <div className="space-y-2">
              {STUDIO_PRESETS.map((preset) => (
                <label
                  key={preset.id}
                  className={`flex cursor-pointer gap-3 rounded-xl border p-3 ${
                    presetId === preset.id
                      ? "border-accent bg-accent/10"
                      : "border-ink/10 bg-white"
                  }`}
                >
                  <input
                    type="radio"
                    name="presetId"
                    className="mt-1"
                    checked={presetId === preset.id}
                    onChange={() => {
                      const resolved = resolveStudioPreset(preset.id);
                      onChange({
                        ...brand,
                        presetId: resolved.id,
                        styleId: resolved.styleId,
                      });
                    }}
                  />
                  <span>
                    <span className="font-medium">{preset.label}</span>
                    <span className="mt-1 block text-xs text-ink/55">
                      {preset.description}
                    </span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
          <p className="rounded-lg bg-moss/10 px-3 py-2 text-moss">
            成片默认烧录字幕；片型决定 classic / animation 底层组合，无需手选技术风格。
          </p>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-ink/60">{label}</span>
      {children}
    </label>
  );
}
