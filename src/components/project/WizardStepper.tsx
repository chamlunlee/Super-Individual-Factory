import type { WizardStep } from "@/lib/project/types";
import { WIZARD_STEPS } from "@/lib/project/types";

export function WizardStepper({
  current,
  onChange,
  completed,
}: {
  current: WizardStep;
  onChange: (step: WizardStep) => void;
  completed: Partial<Record<WizardStep, boolean>>;
}) {
  return (
    <ol className="flex flex-wrap gap-2">
      {WIZARD_STEPS.map((step, index) => {
        const active = step.id === current;
        const done = Boolean(completed[step.id]);
        return (
          <li key={step.id}>
            <button
              type="button"
              onClick={() => onChange(step.id)}
              className={`rounded-full px-3 py-1.5 text-sm transition ${
                active
                  ? "bg-ink text-white"
                  : done
                    ? "bg-moss/15 text-moss"
                    : "bg-ink/5 text-ink/60 hover:bg-ink/10"
              }`}
            >
              {index + 1}.{step.label}
            </button>
          </li>
        );
      })}
    </ol>
  );
}
