"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  DollarSign,
  Clock,
  AlertTriangle,
  Shield,
} from "lucide-react";

interface ResourceSummary {
  roles: string[];
  estimatedTeamSize: number;
  estimatedBudgetRange: string;
}

interface Risk {
  risk: string;
  mitigation: string;
  likelihood: string;
}

interface ResourceEstimateProps {
  totalDurationWeeks: number;
  totalEstimatedHours: number;
  resourceSummary: ResourceSummary;
  risks: Risk[];
}

const likelihoodConfig: Record<string, { color: string; label: string }> = {
  low: { color: "bg-green-100 text-green-800", label: "Low" },
  medium: { color: "bg-amber-100 text-amber-800", label: "Medium" },
  high: { color: "bg-red-100 text-red-800", label: "High" },
};

export function ResourceEstimate({
  totalDurationWeeks,
  totalEstimatedHours,
  resourceSummary,
  risks,
}: ResourceEstimateProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Resource Summary */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="h-4 w-4" />
            Resource Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-lg bg-muted p-3 text-center">
              <Clock className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
              <p className="text-lg font-bold">{totalDurationWeeks}</p>
              <p className="text-[10px] text-muted-foreground">Weeks</p>
            </div>
            <div className="rounded-lg bg-muted p-3 text-center">
              <Users className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
              <p className="text-lg font-bold">{resourceSummary.estimatedTeamSize}</p>
              <p className="text-[10px] text-muted-foreground">Team Size</p>
            </div>
            <div className="rounded-lg bg-muted p-3 text-center">
              <DollarSign className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
              <p className="text-sm font-bold">{resourceSummary.estimatedBudgetRange}</p>
              <p className="text-[10px] text-muted-foreground">Budget</p>
            </div>
          </div>

          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">
              Total Estimated Hours: {totalEstimatedHours}h
            </p>
          </div>

          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">
              Required Roles
            </p>
            <div className="flex flex-wrap gap-1.5">
              {resourceSummary.roles.map((role) => (
                <Badge key={role} variant="outline" className="text-xs">
                  {role}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Risks */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Risk Assessment
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {risks.map((risk) => {
            const config = likelihoodConfig[risk.likelihood] || likelihoodConfig.medium;
            return (
              <div
                key={risk.risk}
                className="rounded-lg border p-3 space-y-1.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium">{risk.risk}</p>
                  <Badge className={`shrink-0 text-[10px] ${config.color}`}>
                    {config.label}
                  </Badge>
                </div>
                <div className="flex items-start gap-1.5 text-xs text-muted-foreground">
                  <Shield className="h-3 w-3 mt-0.5 shrink-0" />
                  <span>{risk.mitigation}</span>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
