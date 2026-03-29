"use client";

import { Shield, AlertTriangle, TrendingUp, Target } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface SwotData {
  summary: string;
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
}

interface SwotCardProps {
  assessment: SwotData;
}

const sections = [
  {
    key: "strengths" as const,
    label: "Strengths",
    icon: Shield,
    color: "text-green-600",
    bg: "bg-green-50",
    border: "border-green-200",
  },
  {
    key: "weaknesses" as const,
    label: "Weaknesses",
    icon: AlertTriangle,
    color: "text-red-600",
    bg: "bg-red-50",
    border: "border-red-200",
  },
  {
    key: "opportunities" as const,
    label: "Opportunities",
    icon: TrendingUp,
    color: "text-blue-600",
    bg: "bg-blue-50",
    border: "border-blue-200",
  },
  {
    key: "threats" as const,
    label: "Threats",
    icon: Target,
    color: "text-amber-600",
    bg: "bg-amber-50",
    border: "border-amber-200",
  },
];

export function SwotCard({ assessment }: SwotCardProps) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Executive Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-relaxed">{assessment.summary}</p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {sections.map(({ key, label, icon: Icon, color, bg, border }) => (
          <Card key={key} className={`${border}`}>
            <CardHeader className={`pb-2 ${bg} rounded-t-lg`}>
              <CardTitle className={`flex items-center gap-2 text-sm ${color}`}>
                <Icon className="h-4 w-4" />
                {label}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-3">
              <ul className="space-y-1.5">
                {assessment[key].map((item, i) => (
                  <li key={i} className="flex gap-2 text-sm">
                    <span className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${color.replace("text-", "bg-")}`} />
                    {item}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
