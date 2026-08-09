"use client";

import {
  SHOT_TYPE_OPTIONS,
  type StoryboardProject,
  type StoryboardShotType,
} from "@/lib/project/storyboard-types";

export function StoryboardTable({
  board,
  busy,
  onChangeType,
}: {
  board: StoryboardProject;
  busy?: boolean;
  onChangeType: (shotId: string, type: StoryboardShotType) => void;
}) {
  return (
    <div className="mt-4 overflow-x-auto rounded-xl border border-ink/10">
      <table className="min-w-full text-left text-sm">
        <thead className="bg-ink/5 text-ink/60">
          <tr>
            <th className="px-3 py-2 font-medium">#</th>
            <th className="px-3 py-2 font-medium">语义</th>
            <th className="px-3 py-2 font-medium">文案</th>
            <th className="px-3 py-2 font-medium">秒</th>
            <th className="px-3 py-2 font-medium">模板</th>
          </tr>
        </thead>
        <tbody>
          {board.shots.map((shot, index) => (
            <tr key={shot.id} className="border-t border-ink/10 align-top">
              <td className="px-3 py-2 text-ink/45">{index + 1}</td>
              <td className="px-3 py-2">
                <select
                  disabled={busy}
                  value={shot.type}
                  onChange={(e) =>
                    onChangeType(shot.id, e.target.value as StoryboardShotType)
                  }
                  className="rounded border border-ink/15 bg-white px-2 py-1"
                >
                  {SHOT_TYPE_OPTIONS.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </td>
              <td className="px-3 py-2">
                <p className="max-w-md whitespace-pre-wrap">{shot.text}</p>
                {shot.emphasis?.length ? (
                  <p className="mt-1 text-xs text-accent">
                    强调：{shot.emphasis.join("、")}
                  </p>
                ) : null}
                {shot.subText ? (
                  <p className="mt-1 text-xs text-ink/45">编号 {shot.subText}</p>
                ) : null}
              </td>
              <td className="px-3 py-2 tabular-nums">{shot.durationSec}</td>
              <td className="px-3 py-2 text-ink/55">
                {shot.style?.template || "plain"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
