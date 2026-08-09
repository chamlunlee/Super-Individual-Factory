import type { ReactNode } from "react";
import { FORMULA_LABELS } from "@/lib/model/types";
import type { TripleLineQuestion } from "@/lib/model/types";
import { CopyButton } from "./CopyButton";

export function QuestionCard({
  question,
  index,
  selected,
  onToggle,
}: {
  question: TripleLineQuestion;
  index: number;
  selected?: boolean;
  onToggle?: () => void;
}) {
  const text = [
    question.question,
    ...question.options.map((o, i) => `${String.fromCharCode(65 + i)}. ${o}`),
    `三点：${question.nodes.join(" → ")}`,
    `CTA：${question.cta}`,
  ].join("\n");

  return (
    <article
      className={`rounded-xl border p-4 shadow-sm backdrop-blur transition hover:-translate-y-0.5 hover:shadow-md ${
        selected
          ? "border-accent bg-accent/10"
          : "border-ink/10 bg-white/75"
      }`}
    >
      <div className="mb-2 flex items-start justify-between gap-3">
        <h3 className="font-display text-base leading-snug">
          {onToggle && (
            <input
              type="checkbox"
              className="mr-2 align-middle"
              checked={Boolean(selected)}
              onChange={onToggle}
            />
          )}
          <span className="mr-2 text-accent">{index + 1}.</span>
          {question.question}
        </h3>
        <CopyButton text={text} label="复制题" />
      </div>
      <p className="mb-3 text-xs text-ink/55">
        {FORMULA_LABELS[question.formula]} · {question.nodes.join(" → ")}
      </p>
      <ul className="mb-3 space-y-1.5 text-sm">
        {question.options.map((opt, i) => (
          <li key={opt} className="flex gap-2">
            <span className="font-medium text-moss">
              {String.fromCharCode(65 + i)}.
            </span>
            <span>{opt}</span>
          </li>
        ))}
      </ul>
      <div className="flex flex-wrap gap-2 text-xs text-ink/65">
        <Tag>钩子 {question.hookStrength}</Tag>
        <Tag>{question.targetAudience}</Tag>
        <Tag>{question.contentFormat}</Tag>
        <Tag>CTA · {question.cta}</Tag>
      </div>
    </article>
  );
}

function Tag({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-md bg-sand/80 px-2 py-1">{children}</span>
  );
}
