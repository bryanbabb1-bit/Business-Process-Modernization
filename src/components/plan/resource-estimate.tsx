"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  DollarSign,
  Clock,
  AlertTriangle,
  Shield,
  PackageCheck,
  PackagePlus,
  PiggyBank,
} from "lucide-react";

interface ResourceSummary {
  roles: string[];
  estimatedTeamSize: number;
  estimatedBudgetRange: string;
}

interface NewToolItem {
  tool: string;
  purpose: string;
  estimatedAnnualCost: string;
  alternatives: string;
}

interface CostBreakdown {
  laborCost: string;
  newToolingCost: string;
  existingToolsLeveraged: string[];
  newToolsRequired: NewToolItem[];
  costSavingsFromReuse: string;
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
  costBreakdown?: CostBreakdown | null;
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
  costBreakdown,
  risks,
}: ResourceEstimateProps) {
  return (
    <div className="space-y-4">
      {/* Top row: Resources + Cost */}
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
                <p className="text-[10px] text-muted-foreground">Total Budget</p>
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

        {/* Cost Breakdown */}
        {costBreakdown ? (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Cost Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-muted p-3 text-center">
                  <Users className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                  <p className="text-sm font-bold">{costBreakdown.laborCost}</p>
                  <p className="text-[10px] text-muted-foreground">Labor</p>
                </div>
                <div className="rounded-lg bg-muted p-3 text-center">
                  <PackagePlus className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                  <p className="text-sm font-bold">{costBreakdown.newToolingCost}</p>
                  <p className="text-[10px] text-muted-foreground">New Tooling</p>
                </div>
              </div>

              {/* Existing tools leveraged */}
              {costBreakdown.existingToolsLeveraged.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-green-700 mb-1.5 flex items-center gap-1">
                    <PackageCheck className="h-3 w-3" />
                    Existing Tools Leveraged
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {costBreakdown.existingToolsLeveraged.map((tool) => (
                      <Badge
                        key={tool}
                        variant="outline"
                        className="text-[10px] h-5 border-green-300 text-green-700 bg-green-50"
                      >
                        {tool}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* New tools required */}
              {costBreakdown.newToolsRequired.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-amber-700 mb-1.5 flex items-center gap-1">
                    <PackagePlus className="h-3 w-3" />
                    New Tools Required
                  </p>
                  <div className="space-y-2">
                    {costBreakdown.newToolsRequired.map((item) => (
                      <div
                        key={item.tool}
                        className="rounded-md border border-amber-200 bg-amber-50/50 p-2 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-amber-800">
                            {item.tool}
                          </span>
                          <Badge className="text-[10px] h-4 bg-amber-100 text-amber-800 border-amber-300">
                            {item.estimatedAnnualCost}
                          </Badge>
                        </div>
                        <p className="text-amber-700 mt-0.5">{item.purpose}</p>
                        {item.alternatives && (
                          <p className="text-amber-600 mt-0.5 italic">
                            Alternative: {item.alternatives}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Savings */}
              {costBreakdown.costSavingsFromReuse && (
                <div className="rounded-lg bg-green-50 border border-green-200 p-3">
                  <p className="text-xs font-medium text-green-800 flex items-center gap-1">
                    <PiggyBank className="h-3.5 w-3.5" />
                    Savings from Reuse
                  </p>
                  <p className="text-xs text-green-700 mt-1">
                    {costBreakdown.costSavingsFromReuse}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          /* Risks — shown here if no cost breakdown */
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
        )}
      </div>

      {/* Bottom row: Risks (shown separately when cost breakdown exists) */}
      {costBreakdown && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Risk Assessment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
