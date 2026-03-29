"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  PackageCheck,
  ArrowUpCircle,
  AlertTriangle,
  Shield,
  DollarSign,
} from "lucide-react";

interface NewTool {
  tool: string;
  purpose: string;
  cost: string;
}

interface ImplementationOptions {
  currentStack: {
    description: string;
    totalLicensingCost: string;
    toolsLeveraged: string[];
    limitations: string[];
  };
  improvedStack: {
    description: string;
    newTools: NewTool[];
    totalLicensingCost: string;
    advantages: string[];
  };
}

interface Risk {
  risk: string;
  mitigation: string;
  likelihood: string;
}

interface ResourceEstimateProps {
  implementationOptions?: ImplementationOptions | null;
  risks: Risk[];
}

const likelihoodConfig: Record<string, { color: string; label: string }> = {
  low: { color: "bg-green-100 text-green-800", label: "Low" },
  medium: { color: "bg-amber-100 text-amber-800", label: "Medium" },
  high: { color: "bg-red-100 text-red-800", label: "High" },
};

export function ResourceEstimate({
  implementationOptions,
  risks,
}: ResourceEstimateProps) {
  return (
    <div className="space-y-4">
      {/* Options comparison */}
      {implementationOptions && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Option A: Current Stack */}
          <Card className="border-green-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2 text-green-800">
                <PackageCheck className="h-4 w-4" />
                Option A: Current Stack
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {implementationOptions.currentStack.description}
              </p>

              <div className="rounded-lg bg-green-50 border border-green-200 p-3 text-center">
                <DollarSign className="h-5 w-5 mx-auto mb-1 text-green-700" />
                <p className="text-xl font-bold text-green-800">
                  {implementationOptions.currentStack.totalLicensingCost}
                </p>
                <p className="text-[10px] text-green-600">Licensing Cost</p>
              </div>

              {implementationOptions.currentStack.toolsLeveraged.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1.5">
                    Existing Tools Used
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {implementationOptions.currentStack.toolsLeveraged.map((tool) => (
                      <Badge
                        key={tool}
                        variant="outline"
                        className="text-xs border-green-300 text-green-700 bg-green-50"
                      >
                        {tool}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {implementationOptions.currentStack.limitations.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1.5">
                    Trade-offs
                  </p>
                  <ul className="text-xs text-muted-foreground space-y-1 pl-4">
                    {implementationOptions.currentStack.limitations.map((l) => (
                      <li key={l} className="list-disc">{l}</li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Option B: Improved Stack */}
          <Card className="border-blue-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2 text-blue-800">
                <ArrowUpCircle className="h-4 w-4" />
                Option B: Improved Stack
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {implementationOptions.improvedStack.description}
              </p>

              <div className="rounded-lg bg-blue-50 border border-blue-200 p-3 text-center">
                <DollarSign className="h-5 w-5 mx-auto mb-1 text-blue-700" />
                <p className="text-xl font-bold text-blue-800">
                  {implementationOptions.improvedStack.totalLicensingCost}
                </p>
                <p className="text-[10px] text-blue-600">Licensing Cost</p>
              </div>

              {implementationOptions.improvedStack.newTools.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1.5">
                    New Tools Required
                  </p>
                  <div className="space-y-2">
                    {implementationOptions.improvedStack.newTools.map((item) => (
                      <div
                        key={item.tool}
                        className="rounded-md border border-blue-200 bg-blue-50/50 p-2 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-blue-800">{item.tool}</span>
                          <Badge className="text-[10px] h-4 bg-blue-100 text-blue-800 border-blue-300">
                            {item.cost}
                          </Badge>
                        </div>
                        <p className="text-blue-700 mt-0.5">{item.purpose}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {implementationOptions.improvedStack.advantages.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1.5">
                    Advantages
                  </p>
                  <ul className="text-xs text-muted-foreground space-y-1 pl-4">
                    {implementationOptions.improvedStack.advantages.map((a) => (
                      <li key={a} className="list-disc">{a}</li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Risks */}
      {risks.length > 0 && (
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
