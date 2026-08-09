"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { BrandKitDrawer } from "@/components/project/BrandKitDrawer";
import { StoryboardTable } from "@/components/project/StoryboardTable";
import { WizardStepper } from "@/components/project/WizardStepper";
import { QuestionCard } from "@/components/QuestionCard";
import { RingModel } from "@/components/RingModel";
import { TitleRadarChart } from "@/components/RadarChart";
import { CopyButton } from "@/components/CopyButton";
import {
  engineRequestBody,
  exportProjectZipClient,
  getProjectClient,
  patchProjectClient,
  syncReturnedProject,
} from "@/lib/project/client-api";
import { buildScriptRaw } from "@/lib/project/script";
import {
  resolveStudioPreset,
  STUDIO_PRESETS,
  type PresetId,
} from "@/lib/project/presets";
import type {
  BrandKit,
  PublishPackage,
  StudioProject,
  WizardStep,
} from "@/lib/project/types";
import { WIZARD_STEPS } from "@/lib/project/types";
import type { StoryboardShotType } from "@/lib/project/storyboard-types";
import type { PlatformId } from "@/lib/model/platform-titles";

const ASSIST_URLS: Record<string, string> = {
  douyin: "https://creator.douyin.com/",
  xiaohongshu: "https://creator.xiaohongshu.com/",
  shipinhao: "https://channels.weixin.qq.com/",
  bilibili: "https://member.bilibili.com/platform/upload/video/frame",
  gongzhonghao: "https://mp.weixin.qq.com/",
};

export default function ProjectWizardPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const [project, setProject] = useState<StudioProject | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [brandOpen, setBrandOpen] = useState(false);
  const [forceDemo, setForceDemo] = useState(false);
  const [withTts, setWithTts] = useState(true);
  const [questionCount, setQuestionCount] = useState(20);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setProject(await getProjectClient(id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "加载失败");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  async function patchProject(patch: Partial<StudioProject>) {
    const data = await patchProjectClient(id, patch);
    setProject(data);
    return data;
  }

  const step = project?.currentStep || "ideation";
  const stepIndex = WIZARD_STEPS.findIndex((s) => s.id === step);

  const completed = useMemo(() => {
    if (!project) return {};
    return {
      ideation: Boolean(project.tripleLine && project.selectedQuestionIds.length),
      titles: Boolean(project.titleRadar && project.selectedTitles.length),
      platforms: Boolean(project.platformCopies?.items?.length),
      script: Boolean(project.scriptRaw || project.koubo?.markdown),
      produce: Boolean(
        project.produce?.mp4Path || project.storyboard?.project?.shots?.length
      ),
      publish: Boolean(project.publish?.packages?.length),
    } satisfies Partial<Record<WizardStep, boolean>>;
  }, [project]);

  async function goStep(next: WizardStep) {
    if (!project) return;
    await patchProject({ currentStep: next });
  }

  async function goNext() {
    const next = WIZARD_STEPS[Math.min(stepIndex + 1, WIZARD_STEPS.length - 1)];
    await goStep(next.id);
  }

  async function goPrev() {
    const prev = WIZARD_STEPS[Math.max(stepIndex - 1, 0)];
    await goStep(prev.id);
  }

  async function generateTripleLine() {
    if (!project) return;
    setBusy("生成选题…");
    setError("");
    try {
      const res = await fetch("/api/triple-line", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          keyword: project.industryKeyword,
          count: questionCount,
          forceDemo,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "生成失败");
      await patchProject({
        tripleLine: data,
        selectedQuestionIds: [],
        status: "ideation",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "生成失败");
    } finally {
      setBusy("");
    }
  }

  async function acceptIdeation() {
    if (!project?.selectedQuestionIds.length) {
      setError("请至少勾选一道选题");
      return;
    }
    setBusy("进入标题…");
    try {
      const seeds = project.tripleLine!.questions
        .filter((q) => project.selectedQuestionIds.includes(q.id))
        .map((q) => q.question);
      const res = await fetch("/api/title-radar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          titles: seeds.join("\n"),
          forceDemo,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "标题雷达失败");
      await patchProject({
        titleRadar: data,
        selectedTitles: [],
        status: "titles",
        currentStep: "titles",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "标题雷达失败");
    } finally {
      setBusy("");
    }
  }

  async function acceptTitles() {
    if (!project?.selectedTitles.length) {
      setError("请至少勾选一条标题");
      return;
    }
    setBusy("平台改写…");
    setError("");
    try {
      const seed = project.selectedTitles[0].title;
      const platformParam =
        project.platforms.length === 1 ? project.platforms[0] : "all";
      // gongzhonghao 走 all 时由后端扩展；单选公众号时传 all 并在前端过滤也可
      const apiPlatform =
        platformParam === "gongzhonghao" ? "all" : platformParam;
      const res = await fetch("/api/platform-adapt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          seedTitle: seed,
          platform: apiPlatform,
          forceDemo,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "平台改写失败");
      await patchProject({
        platformCopies: data,
        status: "script",
        currentStep: "platforms",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "平台改写失败");
    } finally {
      setBusy("");
    }
  }

  async function buildScript() {
    if (!project) return;
    const scriptRaw = buildScriptRaw(project);
    await patchProject({ scriptRaw, currentStep: "script", status: "script" });
  }

  async function runKoubo() {
    if (!project) return;
    setBusy("口播洗稿中（需 Black Card 引擎）…");
    setError("");
    try {
      if (!project.scriptRaw) {
        await patchProject({ scriptRaw: buildScriptRaw(project) });
      }
      const latest = await getProjectClient(id);
      const res = await fetch(`/api/projects/${id}/koubo`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: engineRequestBody(latest, { targetMinutes: 4 }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "洗稿失败");
      setProject(await syncReturnedProject(data.project));
    } catch (err) {
      setError(err instanceof Error ? err.message : "洗稿失败");
    } finally {
      setBusy("");
    }
  }

  async function selectPreset(presetId: PresetId) {
    if (!project) return;
    const preset = resolveStudioPreset(presetId);
    await patchProject({
      brand: {
        ...project.brand,
        presetId: preset.id,
        styleId: preset.styleId,
        showSubtitles: true,
      },
    });
  }

  async function runStoryboard(forceRules = false) {
    if (!project) return;
    setBusy(forceRules ? "规则分镜中…" : "AI 分镜中（失败将自动降级）…");
    setError("");
    try {
      const res = await fetch(`/api/projects/${id}/storyboard`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: engineRequestBody(project, {
          presetId: project.brand.presetId || "knowledge_classic",
          forceRules,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "分镜失败");
      setProject(await syncReturnedProject(data.project));
      if (data.warning) setError(data.warning);
    } catch (err) {
      setError(err instanceof Error ? err.message : "分镜失败");
    } finally {
      setBusy("");
    }
  }

  async function changeShotType(shotId: string, type: StoryboardShotType) {
    if (!project) return;
    setBusy("更新镜头语义…");
    setError("");
    try {
      const res = await fetch(`/api/projects/${id}/storyboard`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: engineRequestBody(project, { shotId, type }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "修改失败");
      setProject(await syncReturnedProject(data.project));
    } catch (err) {
      setError(err instanceof Error ? err.message : "修改失败");
    } finally {
      setBusy("");
    }
  }

  async function runProduce() {
    if (!project) return;
    if (!project.storyboard?.project) {
      setError("请先生成并确认分镜表，再渲染");
      return;
    }
    setBusy("确认分镜后渲染中（可能需数分钟）…");
    setError("");
    try {
      const res = await fetch(`/api/projects/${id}/produce`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: engineRequestBody(project, { withTts }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "成片失败");
      setProject(await syncReturnedProject(data.project));
    } catch (err) {
      setError(err instanceof Error ? err.message : "成片失败");
    } finally {
      setBusy("");
    }
  }

  async function createPublishPackages() {
    if (!project) return;
    setBusy("生成发布包…");
    setError("");
    try {
      const res = await fetch(`/api/projects/${id}/publish`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: engineRequestBody(project),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "生成失败");
      setProject(await syncReturnedProject(data.project));
    } catch (err) {
      setError(err instanceof Error ? err.message : "生成失败");
    } finally {
      setBusy("");
    }
  }

  async function updatePublishPackage(
    packageId: string,
    patch: Partial<PublishPackage>
  ) {
    if (!project) return;
    const res = await fetch(`/api/projects/${id}/publish`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: engineRequestBody(project, {
        packageId,
        status: patch.status,
        metrics: patch.metrics,
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "更新失败");
    setProject(await syncReturnedProject(data));
  }

  async function exportZip() {
    if (!project) return;
    setBusy("导出交付包…");
    setError("");
    try {
      await exportProjectZipClient(project);
    } catch (err) {
      setError(err instanceof Error ? err.message : "导出失败");
    } finally {
      setBusy("");
    }
  }

  async function saveBrand(brand: BrandKit) {
    await patchProject({ brand: { ...brand, showSubtitles: true } });
  }

  if (loading) {
    return <p className="pt-10 text-ink/60">加载项目…</p>;
  }
  if (!project) {
    return (
      <div className="pt-10">
        <p className="text-red-700">{error || "项目不存在"}</p>
        <Link href="/" className="mt-4 inline-block text-moss">
          ← 返回列表
        </Link>
      </div>
    );
  }

  const leadTotal =
    project.publish?.packages.reduce(
      (sum, p) => sum + (p.metrics?.leads || 0),
      0
    ) || 0;

  return (
    <div className="pt-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link href="/" className="text-sm text-moss hover:underline">
            ← 项目列表
          </Link>
          <h1 className="mt-2 font-display text-3xl md:text-4xl">
            {project.title}
          </h1>
          <p className="mt-1 text-sm text-ink/60">
            {project.industryKeyword} · {project.brand.name} · 状态{" "}
            {project.status}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setBrandOpen(true)}
            className="rounded-lg border border-ink/15 px-3 py-2 text-sm hover:bg-white"
          >
            品牌包
          </button>
          <button
            type="button"
            onClick={() => void exportZip()}
            className="rounded-lg bg-moss px-3 py-2 text-sm text-white hover:opacity-90"
          >
            导出交付包 ZIP
          </button>
        </div>
      </div>

      <div className="mt-6">
        <WizardStepper
          current={step}
          completed={completed}
          onChange={(s) => void goStep(s)}
        />
      </div>

      <label className="mt-4 flex items-center gap-2 text-sm text-ink/60">
        <input
          type="checkbox"
          checked={forceDemo}
          onChange={(e) => setForceDemo(e.target.checked)}
        />
        强制示例/模板模式（不调用 LLM）
      </label>

      {error && <p className="mt-3 text-sm text-red-700">{error}</p>}
      {busy && <p className="mt-3 text-sm text-moss">{busy}</p>}

      <section className="mt-6 rounded-2xl border border-ink/10 bg-white/60 p-5">
        {step === "ideation" && (
          <div>
            <h2 className="font-display text-2xl">① 三点一线选题</h2>
            <div className="mt-4 flex flex-wrap items-end gap-3">
              <label className="text-sm">
                <span className="mb-1 block text-ink/60">题量</span>
                <select
                  value={questionCount}
                  onChange={(e) => setQuestionCount(Number(e.target.value))}
                  className="rounded-lg border border-ink/15 px-3 py-2"
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </label>
              <button
                type="button"
                disabled={Boolean(busy)}
                onClick={() => void generateTripleLine()}
                className="rounded-lg bg-ink px-4 py-2 text-sm text-white disabled:opacity-50"
              >
                生成选题
              </button>
            </div>
            {project.tripleLine && (
              <>
                <div className="mt-6">
                  <RingModel graph={project.tripleLine.graph} />
                </div>
                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  {project.tripleLine.questions.map((q, i) => (
                    <QuestionCard
                      key={q.id}
                      question={q}
                      index={i}
                      selected={project.selectedQuestionIds.includes(q.id)}
                      onToggle={() => {
                        const set = new Set(project.selectedQuestionIds);
                        if (set.has(q.id)) set.delete(q.id);
                        else set.add(q.id);
                        void patchProject({
                          selectedQuestionIds: [...set],
                        });
                      }}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {step === "titles" && (
          <div>
            <h2 className="font-display text-2xl">② 标题雷达</h2>
            {!project.titleRadar ? (
              <p className="mt-3 text-sm text-ink/60">
                请在选题步勾选题目后点「采纳并下一步」。
              </p>
            ) : (
              <>
                <p className="mt-2 text-sm text-ink/65">
                  {project.titleRadar.diagnosis}
                </p>
                <div className="mt-4 max-w-md">
                  <TitleRadarChart scores={project.titleRadar.scores} />
                </div>
                <ul className="mt-6 space-y-3">
                  {project.titleRadar.generated.map((g) => {
                    const selected = project.selectedTitles.some(
                      (t) => t.title === g.title
                    );
                    return (
                      <li
                        key={g.title}
                        className={`rounded-xl border p-4 ${
                          selected
                            ? "border-accent bg-accent/10"
                            : "border-ink/10 bg-white"
                        }`}
                      >
                        <label className="flex cursor-pointer gap-3">
                          <input
                            type="checkbox"
                            checked={selected}
                            onChange={() => {
                              const next = selected
                                ? project.selectedTitles.filter(
                                    (t) => t.title !== g.title
                                  )
                                : [
                                    ...project.selectedTitles,
                                    {
                                      title: g.title,
                                      platform: "all",
                                      outline: g.outline,
                                    },
                                  ];
                              void patchProject({ selectedTitles: next });
                            }}
                          />
                          <div>
                            <p className="font-medium">{g.title}</p>
                            <ol className="mt-2 list-decimal pl-5 text-sm text-ink/65">
                              {g.outline.map((line) => (
                                <li key={line}>{line}</li>
                              ))}
                            </ol>
                          </div>
                        </label>
                      </li>
                    );
                  })}
                </ul>
              </>
            )}
          </div>
        )}

        {step === "platforms" && (
          <div>
            <h2 className="font-display text-2xl">③ 平台文案</h2>
            {!project.platformCopies ? (
              <p className="mt-3 text-sm text-ink/60">
                勾选标题后点「采纳并下一步」生成各平台改写。
              </p>
            ) : (
              <div className="mt-4 space-y-4">
                {project.platformCopies.items
                  .filter((item) => {
                    if (project.platforms.includes(item.platform as PlatformId))
                      return true;
                    // 公众号单独在下一步口播里用模板；若后端暂无 gongzhonghao 项则显示全部
                    return project.platforms.length > 1;
                  })
                  .map((item) => (
                    <article
                      key={item.platform}
                      className="rounded-xl border border-ink/10 bg-white p-4"
                    >
                      <h3 className="font-display text-xl">
                        {item.platformName}
                      </h3>
                      <ul className="mt-2 space-y-1 text-sm">
                        {item.adaptedTitles.map((t) => (
                          <li key={t}>· {t}</li>
                        ))}
                      </ul>
                      <p className="mt-3 text-sm">
                        <strong>钩子：</strong>
                        {item.copy.hook}
                      </p>
                      <p className="mt-2 text-sm text-ink/70">
                        {item.copy.body.join(" ")}
                      </p>
                      <p className="mt-2 text-sm text-moss">
                        CTA：{item.copy.cta}
                      </p>
                      <div className="mt-3">
                        <CopyButton
                          text={[
                            item.adaptedTitles[0],
                            item.copy.hook,
                            ...item.copy.body,
                            item.copy.cta,
                          ].join("\n")}
                          label="复制文案"
                        />
                      </div>
                    </article>
                  ))}
              </div>
            )}
          </div>
        )}

        {step === "script" && (
          <div>
            <h2 className="font-display text-2xl">④ 口播成稿</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                disabled={Boolean(busy)}
                onClick={() => void buildScript()}
                className="rounded-lg border border-ink/15 px-4 py-2 text-sm"
              >
                生成口播原文
              </button>
              <button
                type="button"
                disabled={Boolean(busy)}
                onClick={() => void runKoubo()}
                className="rounded-lg bg-ink px-4 py-2 text-sm text-white disabled:opacity-50"
              >
                洗稿成片稿（koubo）
              </button>
            </div>
            <textarea
              className="mt-4 min-h-48 w-full rounded-xl border border-ink/15 bg-white p-3 text-sm"
              value={project.scriptRaw || ""}
              onChange={(e) =>
                setProject({ ...project, scriptRaw: e.target.value })
              }
              onBlur={() =>
                void patchProject({ scriptRaw: project.scriptRaw || "" })
              }
              placeholder="标题 + 大纲 + 平台 hook/body/cta 将拼到这里"
            />
            {project.koubo?.markdown && (
              <div className="mt-4">
                <h3 className="font-display text-lg">洗稿结果</h3>
                <pre className="mt-2 max-h-96 overflow-auto whitespace-pre-wrap rounded-xl bg-ink/5 p-3 text-xs">
                  {project.koubo.markdown}
                </pre>
              </div>
            )}
          </div>
        )}

        {step === "produce" && (
          <div>
            <h2 className="font-display text-2xl">⑤ 成片渲染</h2>
            <p className="mt-2 text-sm text-ink/65">
              一人工作室流程：选片型 → AI/规则出分镜表 → 点改语义 → 确认渲染。需引擎{" "}
              <code className="rounded bg-ink/5 px-1">npm run studio:web</code>
              。
            </p>

            <div className="mt-4">
              <p className="mb-2 text-sm text-ink/60">片型预设</p>
              <div className="grid gap-2 md:grid-cols-3">
                {STUDIO_PRESETS.map((preset) => {
                  const active =
                    (project.brand.presetId || "knowledge_classic") ===
                    preset.id;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      disabled={Boolean(busy)}
                      onClick={() => void selectPreset(preset.id)}
                      className={`rounded-xl border p-3 text-left text-sm transition ${
                        active
                          ? "border-accent bg-accent/10"
                          : "border-ink/10 bg-white hover:border-ink/25"
                      }`}
                    >
                      <p className="font-medium">{preset.label}</p>
                      <p className="mt-1 text-xs text-ink/55">
                        {preset.description}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                disabled={Boolean(busy)}
                onClick={() => void runStoryboard(false)}
                className="rounded-lg bg-ink px-4 py-2 text-sm text-white disabled:opacity-50"
              >
                生成分镜表
              </button>
              <button
                type="button"
                disabled={Boolean(busy)}
                onClick={() => void runStoryboard(true)}
                className="rounded-lg border border-ink/15 px-4 py-2 text-sm disabled:opacity-50"
              >
                仅用规则分镜
              </button>
            </div>

            {project.storyboard?.project && (
              <div className="mt-4">
                <p className="text-sm text-ink/60">
                  分镜模式：{project.storyboard.mode || "—"}
                  {project.storyboard.warning
                    ? ` · ${project.storyboard.warning}`
                    : ""}
                  {" · "}
                  共 {project.storyboard.project.shots.length} 镜 · 可改「语义」列
                </p>
                <StoryboardTable
                  board={project.storyboard.project}
                  busy={Boolean(busy)}
                  onChangeType={(shotId, type) =>
                    void changeShotType(shotId, type)
                  }
                />
              </div>
            )}

            <label className="mt-4 flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={withTts}
                onChange={(e) => setWithTts(e.target.checked)}
              />
              合成人声（Edge-TTS）
            </label>
            <button
              type="button"
              disabled={Boolean(busy) || !project.storyboard?.project}
              onClick={() => void runProduce()}
              className="mt-4 rounded-lg bg-accent px-4 py-2 text-sm text-ink disabled:opacity-50"
            >
              确认分镜并渲染
            </button>
            {project.produce?.mp4Url && (
              <div className="mt-6">
                <p className="text-sm text-moss">
                  已生成：{project.produce.fileName}
                  {project.produce.presetId
                    ? ` · ${resolveStudioPreset(project.produce.presetId).label}`
                    : ""}
                </p>
                <video
                  className="mt-3 max-h-[480px] w-full max-w-sm rounded-xl bg-black"
                  src={project.produce.mp4Url}
                  controls
                />
                <p className="mt-2 break-all text-xs text-ink/50">
                  {project.produce.mp4Path}
                </p>
              </div>
            )}
          </div>
        )}

        {step === "publish" && (
          <div>
            <h2 className="font-display text-2xl">⑥ 发布与效果</h2>
            <button
              type="button"
              disabled={Boolean(busy)}
              onClick={() => void createPublishPackages()}
              className="mt-4 rounded-lg bg-ink px-4 py-2 text-sm text-white disabled:opacity-50"
            >
              生成发布包
            </button>
            <p className="mt-3 text-sm text-ink/60">
              线索合计：{leadTotal}
              {project.produce?.mp4Path
                ? ` · 成片路径可在资源管理器打开`
                : ""}
            </p>
            <div className="mt-4 space-y-4">
              {(project.publish?.packages || []).map((pkg) => (
                <article
                  key={pkg.id}
                  className="rounded-xl border border-ink/10 bg-white p-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="font-display text-lg">
                      {pkg.platform} · {pkg.title}
                    </h3>
                    <div className="flex gap-2">
                      <CopyButton
                        text={`${pkg.title}\n\n${pkg.body}\n\n${pkg.cta}`}
                        label="复制文案"
                      />
                      <a
                        href={ASSIST_URLS[pkg.platform] || "#"}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-lg border border-ink/15 px-3 py-1.5 text-sm"
                        onClick={() =>
                          void updatePublishPackage(pkg.id, {
                            status: "assisted",
                          })
                        }
                      >
                        打开创作后台
                      </a>
                    </div>
                  </div>
                  <p className="mt-2 text-sm text-ink/70 whitespace-pre-wrap">
                    {pkg.body}
                  </p>
                  <p className="mt-2 text-sm text-moss">
                    私信话术 / CTA：{pkg.cta}
                  </p>
                  <p className="mt-1 text-xs text-ink/45">
                    状态 {pkg.status}
                    {pkg.sourceTitle ? ` · 来自标题：${pkg.sourceTitle}` : ""}
                  </p>
                  <div className="mt-3 grid grid-cols-2 gap-2 md:grid-cols-5">
                    {(
                      [
                        ["views", "播放"],
                        ["likes", "点赞"],
                        ["comments", "评论"],
                        ["dms", "私信"],
                        ["leads", "线索"],
                      ] as const
                    ).map(([key, label]) => (
                      <label key={key} className="text-xs text-ink/60">
                        {label}
                        <input
                          type="number"
                          min={0}
                          className="mt-1 w-full rounded border border-ink/15 px-2 py-1 text-sm"
                          defaultValue={pkg.metrics?.[key] ?? ""}
                          onBlur={(e) => {
                            const value = e.target.value
                              ? Number(e.target.value)
                              : undefined;
                            void updatePublishPackage(pkg.id, {
                              metrics: { ...pkg.metrics, [key]: value },
                            });
                          }}
                        />
                      </label>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}
      </section>

      <div className="sticky bottom-0 mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-ink/10 bg-paper/95 py-4 backdrop-blur">
        <button
          type="button"
          onClick={() => void goPrev()}
          disabled={stepIndex <= 0}
          className="rounded-lg border border-ink/15 px-4 py-2 text-sm disabled:opacity-40"
        >
          上一步
        </button>
        <div className="flex flex-wrap gap-2">
          {step === "ideation" && (
            <button
              type="button"
              disabled={Boolean(busy)}
              onClick={() => void acceptIdeation()}
              className="rounded-lg bg-accent px-4 py-2 text-sm text-ink disabled:opacity-50"
            >
              采纳并下一步
            </button>
          )}
          {step === "titles" && (
            <button
              type="button"
              disabled={Boolean(busy)}
              onClick={() => void acceptTitles()}
              className="rounded-lg bg-accent px-4 py-2 text-sm text-ink disabled:opacity-50"
            >
              采纳并下一步
            </button>
          )}
          {step !== "ideation" && step !== "titles" && (
            <button
              type="button"
              onClick={() => void goNext()}
              disabled={stepIndex >= WIZARD_STEPS.length - 1}
              className="rounded-lg bg-ink px-4 py-2 text-sm text-white disabled:opacity-40"
            >
              下一步
            </button>
          )}
        </div>
      </div>

      <BrandKitDrawer
        open={brandOpen}
        brand={project.brand}
        onClose={() => setBrandOpen(false)}
        onChange={(brand) => void saveBrand(brand)}
      />
    </div>
  );
}
