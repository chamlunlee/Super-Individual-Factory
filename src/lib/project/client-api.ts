import { resolveStudioPreset, type PresetId } from "./presets";
import {
  browserDeleteProject,
  browserGetProject,
  browserListProjects,
  browserSaveProject,
} from "./browser-store";
import { usesBrowserProjectStore } from "./storage-mode";
import {
  createEmptyProject,
  type StudioPlatformId,
  type StudioProject,
} from "./types";

export { usesBrowserProjectStore };

async function parseJson<T>(res: Response): Promise<T> {
  const data = (await res.json()) as T & { error?: string };
  if (!res.ok) {
    throw new Error(
      (data as { error?: string }).error || `请求失败 (${res.status})`
    );
  }
  return data;
}

export async function listProjectsClient(): Promise<StudioProject[]> {
  if (usesBrowserProjectStore()) {
    return browserListProjects();
  }
  const data = await parseJson<{ projects: StudioProject[] }>(
    await fetch("/api/projects")
  );
  return data.projects || [];
}

export async function getProjectClient(id: string): Promise<StudioProject> {
  if (usesBrowserProjectStore()) {
    const project = browserGetProject(id);
    if (!project) throw new Error("项目不存在");
    if (!project.brand.presetId) {
      project.brand.presetId = "knowledge_classic";
    }
    return project;
  }
  return parseJson<StudioProject>(await fetch(`/api/projects/${id}`));
}

export async function createProjectClient(input: {
  title?: string;
  industryKeyword: string;
  platforms?: StudioPlatformId[];
  brand?: {
    name?: string;
    watermark?: string;
    accent?: string;
    aspect?: "9:16" | "16:9";
    styleId?: "classic" | "animation";
    presetId?: PresetId;
  };
}): Promise<StudioProject> {
  if (usesBrowserProjectStore()) {
    if (!input.industryKeyword?.trim()) {
      throw new Error("industryKeyword 不能为空");
    }
    const preset = resolveStudioPreset(input.brand?.presetId);
    const project = createEmptyProject({
      title: input.title,
      industryKeyword: input.industryKeyword,
      platforms: input.platforms,
      brand: {
        ...input.brand,
        presetId: preset.id,
        styleId: input.brand?.styleId || preset.styleId,
      },
    });
    return browserSaveProject(project);
  }
  return parseJson<StudioProject>(
    await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    })
  );
}

export async function patchProjectClient(
  id: string,
  patch: Partial<StudioProject>
): Promise<StudioProject> {
  if (usesBrowserProjectStore()) {
    const existing = browserGetProject(id);
    if (!existing) throw new Error("项目不存在");
    const next: StudioProject = {
      ...existing,
      ...patch,
      id: existing.id,
      createdAt: existing.createdAt,
      brand: {
        ...existing.brand,
        ...(patch.brand || {}),
        presetId:
          patch.brand?.presetId ||
          existing.brand.presetId ||
          "knowledge_classic",
        showSubtitles: true,
      },
      selectedQuestionIds:
        patch.selectedQuestionIds ?? existing.selectedQuestionIds,
      selectedTitles: patch.selectedTitles ?? existing.selectedTitles,
    };
    return browserSaveProject(next);
  }
  return parseJson<StudioProject>(
    await fetch(`/api/projects/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    })
  );
}

export async function deleteProjectClient(id: string): Promise<void> {
  if (usesBrowserProjectStore()) {
    if (!browserDeleteProject(id)) throw new Error("项目不存在");
    return;
  }
  await parseJson<{ ok: boolean }>(
    await fetch(`/api/projects/${id}`, { method: "DELETE" })
  );
}

/** 引擎接口返回的项目：生产写回 localStorage，开发服务端已落盘 */
export async function syncReturnedProject(
  project: StudioProject
): Promise<StudioProject> {
  if (usesBrowserProjectStore()) {
    return browserSaveProject(project);
  }
  return project;
}

/** 生产模式把当前项目快照带给引擎 API，避免服务端无磁盘记录 */
export function engineRequestBody(
  project: StudioProject,
  extra: Record<string, unknown> = {}
): string {
  if (usesBrowserProjectStore()) {
    return JSON.stringify({ ...extra, project, clientOwned: true });
  }
  return JSON.stringify(extra);
}

export async function exportProjectZipClient(
  project: StudioProject
): Promise<void> {
  const res = usesBrowserProjectStore()
    ? await fetch(`/api/projects/${project.id}/export-zip`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ project, clientOwned: true }),
      })
    : await fetch(`/api/projects/${project.id}/export-zip`);

  if (!res.ok) {
    const data = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(data.error || "导出失败");
  }

  const blob = await res.blob();
  const disposition = res.headers.get("Content-Disposition") || "";
  const match = disposition.match(/filename\*=UTF-8''([^;]+)/i);
  const fileName = match
    ? decodeURIComponent(match[1])
    : `${project.title}-交付包.zip`;

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(url);
}
