"use client";

import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart as ReRadar,
  ResponsiveContainer,
} from "recharts";
import { RADAR_LABELS } from "@/lib/model/types";
import type { RadarScores } from "@/lib/model/types";

export function TitleRadarChart({ scores }: { scores: RadarScores }) {
  const data = (Object.keys(RADAR_LABELS) as (keyof RadarScores)[]).map((key) => ({
    dim: RADAR_LABELS[key],
    value: scores[key],
  }));

  return (
    <div className="h-[320px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ReRadar data={data} cx="50%" cy="50%" outerRadius="75%">
          <PolarGrid stroke="rgba(26,31,46,0.2)" />
          <PolarAngleAxis dataKey="dim" tick={{ fill: "#1a1f2e", fontSize: 12 }} />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 100]}
            tick={{ fill: "#1a1f2e99", fontSize: 10 }}
          />
          <Radar
            name="得分"
            dataKey="value"
            stroke="#c45c26"
            fill="#c45c26"
            fillOpacity={0.35}
            isAnimationActive
          />
        </ReRadar>
      </ResponsiveContainer>
    </div>
  );
}
