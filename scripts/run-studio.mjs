import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const growthRoot = resolve(here, "..");
const blackCardRoot = resolve(growthRoot, "..", "black-card-video");

if (!existsSync(blackCardRoot)) {
  console.error("未找到并列目录 black-card-video：", blackCardRoot);
  process.exit(1);
}

function run(name, cwd, command, args) {
  const child = spawn(command, args, {
    cwd,
    stdio: "inherit",
    shell: true,
    env: process.env,
  });
  child.on("exit", (code) => {
    if (code && code !== 0) {
      console.error(`[${name}] exited with`, code);
    }
  });
  return child;
}

console.log("启动内容工作室：Growth :3000 + Black Card :3456");
const growth = run("growth", growthRoot, "npm", ["run", "dev"]);
const engine = run("black-card", blackCardRoot, "npm", ["run", "studio:web"]);

function shutdown() {
  growth.kill("SIGTERM");
  engine.kill("SIGTERM");
  process.exit(0);
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
