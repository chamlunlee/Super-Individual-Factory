import { existsSync, mkdirSync, readdirSync, readFileSync, unlinkSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { StudioProject } from "./types";

const DATA_DIR = join(process.cwd(), "data", "projects");

function ensureDir() {
  mkdirSync(DATA_DIR, { recursive: true });
}

function projectPath(id: string) {
  return join(DATA_DIR, `${id}.json`);
}

export function listProjects(): StudioProject[] {
  ensureDir();
  return readdirSync(DATA_DIR)
    .filter((name) => name.endsWith(".json"))
    .map((name) => {
      try {
        return JSON.parse(
          readFileSync(join(DATA_DIR, name), "utf-8")
        ) as StudioProject;
      } catch {
        return null;
      }
    })
    .filter((p): p is StudioProject => Boolean(p))
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export function getProject(id: string): StudioProject | null {
  const path = projectPath(id);
  if (!existsSync(path)) return null;
  try {
    return JSON.parse(readFileSync(path, "utf-8")) as StudioProject;
  } catch {
    return null;
  }
}

export function saveProject(project: StudioProject): StudioProject {
  ensureDir();
  const next = { ...project, updatedAt: new Date().toISOString() };
  writeFileSync(projectPath(project.id), JSON.stringify(next, null, 2), "utf-8");
  return next;
}

export function deleteProject(id: string): boolean {
  const path = projectPath(id);
  if (!existsSync(path)) return false;
  unlinkSync(path);
  return true;
}

export function getProjectsDir() {
  ensureDir();
  return DATA_DIR;
}
