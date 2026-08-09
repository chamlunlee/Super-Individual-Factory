/**
 * 开发（next dev）：项目落盘到 data/projects
 * 生产构建（next build / next start）：项目落在浏览器 localStorage
 */
export function usesBrowserProjectStore(): boolean {
  return process.env.NODE_ENV === "production";
}
