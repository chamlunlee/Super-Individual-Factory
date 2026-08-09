"use client";

import { useState } from "react";

export function CopyButton({
  text,
  label = "复制",
}: {
  text: string;
  label?: string;
}) {
  const [done, setDone] = useState(false);

  async function onCopy() {
    try {
      await navigator.clipboard.writeText(text);
      setDone(true);
      setTimeout(() => setDone(false), 1600);
    } catch {
      setDone(false);
    }
  }

  return (
    <button
      type="button"
      onClick={onCopy}
      className="rounded-md border border-ink/15 bg-white/70 px-3 py-1.5 text-sm transition hover:border-accent/40 hover:bg-white"
    >
      {done ? "已复制" : label}
    </button>
  );
}
