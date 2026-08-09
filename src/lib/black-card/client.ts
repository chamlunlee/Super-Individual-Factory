const DEFAULT_BASE = "http://127.0.0.1:3456";

export function getBlackCardBaseUrl() {
  return (
    process.env.BLACK_CARD_BASE_URL?.replace(/\/$/, "") || DEFAULT_BASE
  );
}

export class BlackCardError extends Error {
  status: number;
  body: unknown;
  constructor(message: string, status: number, body: unknown) {
    super(message);
    this.status = status;
    this.body = body;
  }
}

export async function blackCardFetch<T = unknown>(
  path: string,
  init?: RequestInit
): Promise<T> {
  const url = `${getBlackCardBaseUrl()}${path.startsWith("/") ? path : `/${path}`}`;
  let res: Response;
  try {
    res = await fetch(url, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(init?.headers || {}),
      },
    });
  } catch (err) {
    throw new BlackCardError(
      `无法连接 Black Card 引擎（${getBlackCardBaseUrl()}）。请先在 black-card-video 目录运行 npm run studio:web。${
        err instanceof Error ? ` ${err.message}` : ""
      }`,
      503,
      null
    );
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const errors = (data as { errors?: string[]; message?: string }).errors;
    const message =
      errors?.join("; ") ||
      (data as { message?: string }).message ||
      `Black Card 请求失败 (${res.status})`;
    throw new BlackCardError(message, res.status, data);
  }
  return data as T;
}
