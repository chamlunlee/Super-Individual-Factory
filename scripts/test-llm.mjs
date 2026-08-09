import { readFileSync } from "node:fs";
import { resolve } from "node:path";

for (const line of readFileSync(resolve(".env.local"), "utf8").split(/\r?\n/)) {
  const m = line.match(/^([^#=]+)=(.*)$/);
  if (m) process.env[m[1].trim()] = m[2].trim();
}

const base = (process.env.LLM_BASE_URL || "https://api.deepseek.com/v1").replace(
  /\/$/,
  ""
);
const key = process.env.LLM_API_KEY || process.env.DEEPSEEK_API_KEY;
const model = process.env.LLM_MODEL || "deepseek-chat";

console.log("base", base);
console.log("model", model);
console.log("key", key ? `len=${key.length}` : "missing");

try {
  const res = await fetch(`${base}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model,
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: 'Return JSON {"ok":true}' },
        { role: "user", content: "ping" },
      ],
    }),
  });
  console.log("status", res.status);
  console.log((await res.text()).slice(0, 300));
} catch (e) {
  console.log("fetch failed:", e?.message);
  console.log("cause:", e?.cause?.message || e?.cause);
  console.log("code:", e?.cause?.code);
}
