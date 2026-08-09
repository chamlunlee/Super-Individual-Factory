import { getProject, saveProject } from "./store";
import type { StudioProject } from "./types";

export type ProjectBody = {
  project?: StudioProject;
  clientOwned?: boolean;
};

export function resolveRequestProject(
  id: string,
  body: ProjectBody | null | undefined
): { project: StudioProject | null; clientOwned: boolean } {
  const clientOwned = Boolean(body?.clientOwned && body.project?.id === id);
  if (clientOwned && body?.project) {
    return { project: body.project, clientOwned: true };
  }
  return { project: getProject(id), clientOwned: false };
}

/** 开发写磁盘；生产客户端持有时只回写内存态，由浏览器落库 */
export function commitProject(
  project: StudioProject,
  clientOwned: boolean
): StudioProject {
  if (clientOwned) {
    return { ...project, updatedAt: new Date().toISOString() };
  }
  return saveProject(project);
}
