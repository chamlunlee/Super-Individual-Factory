"use client";

import type { TripleLineGraph } from "@/lib/model/types";

function placeOnCircle(
  count: number,
  radius: number,
  cx: number,
  cy: number,
  startAngle = -Math.PI / 2
) {
  return Array.from({ length: count }, (_, i) => {
    const angle = startAngle + (i / count) * Math.PI * 2;
    return {
      x: cx + Math.cos(angle) * radius,
      y: cy + Math.sin(angle) * radius,
    };
  });
}

export function RingModel({ graph }: { graph: TripleLineGraph }) {
  const size = 420;
  const cx = size / 2;
  const cy = size / 2;
  const outer = placeOnCircle(
    graph.audiences.length + graph.motives.length,
    170,
    cx,
    cy
  );
  const inner = placeOnCircle(graph.items.length, 105, cx, cy, -Math.PI / 3);
  const outerNodes = [...graph.audiences, ...graph.motives];

  return (
    <div className="overflow-x-auto">
      <svg
        viewBox={`0 0 ${size} ${size}`}
        className="mx-auto h-auto w-full max-w-[420px] animate-[fadeIn_0.6s_ease]"
        role="img"
        aria-label={`${graph.keyword} 三点一线圆环模型`}
      >
        <circle
          cx={cx}
          cy={cy}
          r={170}
          fill="none"
          stroke="rgba(26,31,46,0.12)"
          strokeDasharray="4 6"
        />
        <circle
          cx={cx}
          cy={cy}
          r={105}
          fill="none"
          stroke="rgba(47,93,80,0.25)"
          strokeDasharray="3 5"
        />
        <circle cx={cx} cy={cy} r={36} fill="#c45c26" />
        <text
          x={cx}
          y={cy + 5}
          textAnchor="middle"
          fill="#fff"
          fontSize="14"
          fontWeight="700"
        >
          {graph.center.label}
        </text>

        {graph.items.map((item, i) => (
          <g key={item.id}>
            <circle cx={inner[i].x} cy={inner[i].y} r={22} fill="#2f5d50" />
            <text
              x={inner[i].x}
              y={inner[i].y + 4}
              textAnchor="middle"
              fill="#fff"
              fontSize="10"
            >
              {truncate(item.label, 4)}
            </text>
          </g>
        ))}

        {outerNodes.map((n, i) => (
          <g key={n.id}>
            <circle
              cx={outer[i].x}
              cy={outer[i].y}
              r={18}
              fill={n.layer === "L2a" ? "#1a1f2e" : "#8a6a45"}
            />
            <text
              x={outer[i].x}
              y={outer[i].y + 3}
              textAnchor="middle"
              fill="#fff"
              fontSize="9"
            >
              {truncate(n.label, 3)}
            </text>
          </g>
        ))}
      </svg>
      <div className="mt-3 flex flex-wrap justify-center gap-3 text-xs text-ink/60">
        <Legend color="#c45c26" label="L0 行业" />
        <Legend color="#2f5d50" label="L1 物/服务" />
        <Legend color="#1a1f2e" label="L2a 人群" />
        <Legend color="#8a6a45" label="L2b 场景" />
      </div>
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: color }} />
      {label}
    </span>
  );
}

function truncate(s: string, n: number) {
  return s.length > n ? `${s.slice(0, n)}…` : s;
}
