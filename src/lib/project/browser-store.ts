import type { StudioProject } from "./types";

const STORAGE_KEY = "content-studio:projects:v1";

function readAll(): Record<string, StudioProject> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, StudioProject>;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function writeAll(map: Record<string, StudioProject>) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
}

export function browserListProjects(): StudioProject[] {
  return Object.values(readAll()).sort((a, b) =>
    b.updatedAt.localeCompare(a.updatedAt)
  );
}

export function browserGetProject(id: string): StudioProject | null {
  return readAll()[id] ?? null;
}

export function browserSaveProject(project: StudioProject): StudioProject {
  const next = { ...project, updatedAt: new Date().toISOString() };
  const map = readAll();
  map[next.id] = next;
  writeAll(map);
  return next;
}

export function browserDeleteProject(id: string): boolean {
  const map = readAll();
  if (!(id in map)) return false;
  delete map[id];
  writeAll(map);
  return true;
}
