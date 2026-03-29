"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  ReferenceLine,
  Label,
} from "recharts";

interface Rec {
  id: string;
  title: string;
  category: string;
  effortScore: number;
  impactScore: number;
  selected: boolean;
}

interface ImpactEffortMatrixProps {
  recommendations: Rec[];
  onToggleSelect: (id: string, selected: boolean) => void;
}

const categoryColors: Record<string, { fill: string; stroke: string }> = {
  quick_win: { fill: "#22c55e", stroke: "#16a34a" },
  medium_effort: { fill: "#3b82f6", stroke: "#2563eb" },
  transformational: { fill: "#a855f7", stroke: "#9333ea" },
};

function CustomTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: Rec }> }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="rounded-lg border bg-background p-3 shadow-md text-xs">
      <p className="font-semibold mb-1">{d.title}</p>
      <p>Impact: {d.impactScore}/10</p>
      <p>Effort: {d.effortScore}/10</p>
      <p className="mt-1 text-muted-foreground">
        {d.selected ? "Selected" : "Click to select"}
      </p>
    </div>
  );
}

export function ImpactEffortMatrix({
  recommendations,
  onToggleSelect,
}: ImpactEffortMatrixProps) {
  const data = recommendations.map((r) => ({
    ...r,
    x: r.effortScore,
    y: r.impactScore,
  }));

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Impact vs. Effort Matrix</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Quadrant labels */}
        <div className="relative">
          <div className="absolute top-1 left-14 text-[10px] text-muted-foreground font-medium z-10">
            High Impact, Low Effort (Do First)
          </div>
          <div className="absolute top-1 right-2 text-[10px] text-muted-foreground font-medium z-10">
            High Impact, High Effort (Plan)
          </div>
          <div className="absolute bottom-8 left-14 text-[10px] text-muted-foreground font-medium z-10">
            Low Impact, Low Effort (Nice to Have)
          </div>
          <div className="absolute bottom-8 right-2 text-[10px] text-muted-foreground font-medium z-10">
            Low Impact, High Effort (Avoid)
          </div>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis
                  type="number"
                  dataKey="x"
                  name="Effort"
                  domain={[0, 10]}
                  tickCount={6}
                  tick={{ fontSize: 11 }}
                >
                  <Label value="Effort →" position="insideBottomRight" offset={-5} style={{ fontSize: 11 }} />
                </XAxis>
                <YAxis
                  type="number"
                  dataKey="y"
                  name="Impact"
                  domain={[0, 10]}
                  tickCount={6}
                  tick={{ fontSize: 11 }}
                >
                  <Label value="Impact →" position="insideTopLeft" offset={-5} angle={-90} style={{ fontSize: 11 }} />
                </YAxis>
                <ReferenceLine x={5} stroke="hsl(var(--border))" strokeDasharray="5 5" />
                <ReferenceLine y={5} stroke="hsl(var(--border))" strokeDasharray="5 5" />
                <Tooltip content={<CustomTooltip />} />
                <Scatter
                  data={data}
                  onClick={(entry) => {
                    if (entry) onToggleSelect(entry.id, !entry.selected);
                  }}
                  cursor="pointer"
                >
                  {data.map((d) => {
                    const colors = categoryColors[d.category] || categoryColors.medium_effort;
                    return (
                      <Cell
                        key={d.id}
                        fill={colors.fill}
                        stroke={d.selected ? "#000" : colors.stroke}
                        strokeWidth={d.selected ? 2.5 : 1}
                        r={d.selected ? 8 : 6}
                        fillOpacity={d.selected ? 1 : 0.7}
                      />
                    );
                  })}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Legend */}
        <div className="flex justify-center gap-4 mt-2 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-3 rounded-full bg-green-500" />
            Quick Win
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-3 rounded-full bg-blue-500" />
            Medium Effort
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-3 rounded-full bg-purple-500" />
            Transformational
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-3 rounded-full border-2 border-black bg-gray-200" />
            Selected
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
