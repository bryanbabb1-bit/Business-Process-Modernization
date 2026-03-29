"use client";

import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  Tooltip,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { MaturityScore } from "@/types";

interface MaturityRadarProps {
  scores: MaturityScore[];
}

export function MaturityRadar({ scores }: MaturityRadarProps) {
  const data = scores.map((s) => ({
    dimension: s.dimension.replace(/\s*&\s*/g, " & "),
    current: s.currentScore,
    target: s.targetScore,
    max: s.maxScore,
  }));

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Maturity Assessment</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[380px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={data} cx="50%" cy="50%" outerRadius="70%">
              <PolarGrid strokeDasharray="3 3" />
              <PolarAngleAxis
                dataKey="dimension"
                tick={{ fontSize: 11 }}
                className="text-muted-foreground"
              />
              <PolarRadiusAxis
                angle={90}
                domain={[0, 5]}
                tickCount={6}
                tick={{ fontSize: 10 }}
              />
              <Radar
                name="Current"
                dataKey="current"
                stroke="hsl(221, 83%, 53%)"
                fill="hsl(221, 83%, 53%)"
                fillOpacity={0.2}
                strokeWidth={2}
              />
              <Radar
                name="Target"
                dataKey="target"
                stroke="hsl(142, 71%, 45%)"
                fill="hsl(142, 71%, 45%)"
                fillOpacity={0.1}
                strokeWidth={2}
                strokeDasharray="5 5"
              />
              <Legend />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
          {scores.map((s) => (
            <div key={s.dimension} className="flex justify-between">
              <span className="truncate">{s.dimension}</span>
              <span className="ml-2 font-medium text-foreground">
                {s.currentScore} → {s.targetScore}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
