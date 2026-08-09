import dns from "node:dns";

// Windows / 部分网络下 IPv6 优先会导致 fetch failed，强制 IPv4 优先
try {
  dns.setDefaultResultOrder("ipv4first");
} catch {
  // ignore older Node
}

export interface LlmConfig {
  apiKey: string;
  baseUrl: string;
  model: string;
}

export function getLlmConfig(): LlmConfig | null {
  const apiKey =
    process.env.LLM_API_KEY ||
    process.env.DEEPSEEK_API_KEY ||
    process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  const usingDeepseek = Boolean(
    process.env.DEEPSEEK_API_KEY &&
      !process.env.LLM_API_KEY &&
      !process.env.OPENAI_API_KEY
  );

  return {
    apiKey,
    baseUrl: (
      process.env.LLM_BASE_URL ||
      process.env.OPENAI_BASE_URL ||
      (usingDeepseek || process.env.DEEPSEEK_API_KEY
        ? "https://api.deepseek.com/v1"
        : "https://api.openai.com/v1")
    ).replace(/\/$/, ""),
    model:
      process.env.LLM_MODEL ||
      process.env.OPENAI_MODEL ||
      (process.env.DEEPSEEK_API_KEY ? "deepseek-chat" : "gpt-4o-mini"),
  };
}

export function hasLlmConfig(): boolean {
  return Boolean(
    process.env.LLM_API_KEY ||
      process.env.DEEPSEEK_API_KEY ||
      process.env.OPENAI_API_KEY
  );
}

function formatFetchError(err: unknown): string {
  if (!(err instanceof Error)) return String(err);
  const cause = (err as Error & { cause?: { code?: string; message?: string } })
    .cause;
  const code = cause?.code ? ` [${cause.code}]` : "";
  const detail = cause?.message && cause.message !== err.message
    ? ` (${cause.message})`
    : "";
  return `${err.message}${code}${detail}`;
}

function isRetryableNetworkError(err: unknown): boolean {
  const msg = formatFetchError(err).toLowerCase();
  return /fetch failed|econnreset|etimedout|enotfound|eai_again|socket|network|und_err|other side closed/i.test(
    msg
  );
}

export async function chatJson<T>(
  system: string,
  user: string,
  config = getLlmConfig()
): Promise<T> {
  if (!config) {
    throw new Error(
      "缺少 LLM_API_KEY / DEEPSEEK_API_KEY。请在 content-growth/.env.local 配置后重启 npm run dev"
    );
  }

  const url = `${config.baseUrl}/chat/completions`;
  const payload = JSON.stringify({
    model: config.model,
    temperature: 0.7,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
  });

  let lastError: unknown;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${config.apiKey}`,
        },
        body: payload,
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`LLM 请求失败 ${res.status}: ${text.slice(0, 300)}`);
      }

      const data = (await res.json()) as {
        choices?: { message?: { content?: string } }[];
      };
      const content = data.choices?.[0]?.message?.content;
      if (!content) {
        throw new Error("LLM 返回为空");
      }

      return JSON.parse(stripFences(content)) as T;
    } catch (err) {
      lastError = err;
      const retryable = isRetryableNetworkError(err);
      if (!retryable || attempt === 3) break;
      await new Promise((r) => setTimeout(r, 600 * attempt));
    }
  }

  throw new Error(
    `LLM 网络失败（已重试）：${formatFetchError(lastError)}。请确认能访问 ${config.baseUrl}，并重启 Next（npm run dev）以加载 .env.local`
  );
}

function stripFences(raw: string): string {
  const trimmed = raw.trim();
  const matched = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  return matched ? matched[1] : trimmed;
}
