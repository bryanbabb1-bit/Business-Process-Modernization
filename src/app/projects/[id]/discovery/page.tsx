"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useParams } from "next/navigation";
import { Save, Plus, X, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type {
  BusinessProfile,
  PainPoint,
  TechStackItem,
  Workflow,
} from "@/types";

// ─── Helpers ──────────────────────────────────────────────

function safeParse<T>(raw: string, fallback: T): { value: T; error: boolean } {
  try {
    const parsed = JSON.parse(raw) as T;
    // Merge with fallback to ensure all expected fields exist
    if (fallback && typeof fallback === "object" && !Array.isArray(fallback)) {
      return { value: { ...fallback, ...parsed }, error: false };
    }
    return { value: parsed, error: false };
  } catch {
    console.error("Failed to parse saved discovery data:", raw.slice(0, 200));
    return { value: fallback, error: true };
  }
}

const DEFAULT_PROFILE: BusinessProfile = {
  description: "",
  revenue: "",
  headcount: "",
  goals: [],
  marketPosition: "",
  keyProcesses: [],
};

// ─── Sub-components ───────────────────────────────────────

function BusinessProfileTab({
  profile,
  setProfile,
}: {
  profile: BusinessProfile;
  setProfile: (p: BusinessProfile) => void;
}) {
  const [newGoal, setNewGoal] = useState("");
  const [newProcess, setNewProcess] = useState("");

  function addGoal() {
    if (!newGoal.trim()) return;
    setProfile({ ...profile, goals: [...profile.goals, newGoal.trim()] });
    setNewGoal("");
  }

  function addProcess() {
    if (!newProcess.trim()) return;
    setProfile({
      ...profile,
      keyProcesses: [...profile.keyProcesses, newProcess.trim()],
    });
    setNewProcess("");
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Business Profile</CardTitle>
        <CardDescription>
          General information about the company and its objectives.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="description">Business Description</Label>
          <Textarea
            id="description"
            placeholder="Describe the business, what they do, their market..."
            value={profile.description}
            onChange={(e) =>
              setProfile({ ...profile, description: e.target.value })
            }
            rows={4}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="revenue">Annual Revenue</Label>
            <Input
              id="revenue"
              placeholder="e.g., $5M-10M"
              value={profile.revenue}
              onChange={(e) =>
                setProfile({ ...profile, revenue: e.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="headcount">Headcount</Label>
            <Input
              id="headcount"
              placeholder="e.g., 150"
              value={profile.headcount}
              onChange={(e) =>
                setProfile({ ...profile, headcount: e.target.value })
              }
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="marketPosition">Market Position</Label>
          <Textarea
            id="marketPosition"
            placeholder="How does the company position itself in the market?"
            value={profile.marketPosition}
            onChange={(e) =>
              setProfile({ ...profile, marketPosition: e.target.value })
            }
            rows={2}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="newGoal">Business Goals</Label>
          <div className="flex gap-2">
            <Input
              id="newGoal"
              placeholder="Add a goal..."
              value={newGoal}
              onChange={(e) => setNewGoal(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addGoal();
                }
              }}
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={addGoal}
              aria-label="Add goal"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {profile.goals.map((goal) => (
              <Badge key={goal} variant="secondary" className="gap-1">
                {goal}
                <button
                  type="button"
                  aria-label={`Remove ${goal}`}
                  onClick={() =>
                    setProfile({
                      ...profile,
                      goals: profile.goals.filter((g) => g !== goal),
                    })
                  }
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="newProcess">Key Processes</Label>
          <div className="flex gap-2">
            <Input
              id="newProcess"
              placeholder="Add a key process..."
              value={newProcess}
              onChange={(e) => setNewProcess(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addProcess();
                }
              }}
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={addProcess}
              aria-label="Add key process"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {profile.keyProcesses.map((proc) => (
              <Badge key={proc} variant="secondary" className="gap-1">
                {proc}
                <button
                  type="button"
                  aria-label={`Remove ${proc}`}
                  onClick={() =>
                    setProfile({
                      ...profile,
                      keyProcesses: profile.keyProcesses.filter(
                        (p) => p !== proc
                      ),
                    })
                  }
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function PainPointsTab({
  painPoints,
  setPainPoints,
}: {
  painPoints: PainPoint[];
  setPainPoints: (pp: PainPoint[]) => void;
}) {
  function addPainPoint() {
    setPainPoints([
      ...painPoints,
      {
        id: crypto.randomUUID(),
        category: "process",
        title: "",
        description: "",
        severity: "medium",
      },
    ]);
  }

  function updatePainPoint(index: number, updates: Partial<PainPoint>) {
    const updated = [...painPoints];
    updated[index] = { ...updated[index], ...updates };
    setPainPoints(updated);
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button variant="outline" onClick={addPainPoint}>
          <Plus className="mr-2 h-4 w-4" />
          Add Pain Point
        </Button>
      </div>
      {painPoints.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center">
            <p className="text-muted-foreground">
              No pain points added yet. Click &quot;Add Pain Point&quot; to start
              capturing business challenges.
            </p>
          </CardContent>
        </Card>
      ) : (
        painPoints.map((pp, i) => (
          <Card key={pp.id}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <CardTitle className="text-base">
                  Pain Point #{i + 1}
                </CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`Remove pain point ${i + 1}`}
                  onClick={() =>
                    setPainPoints(painPoints.filter((p) => p.id !== pp.id))
                  }
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor={`pp-title-${pp.id}`}>Title</Label>
                  <Input
                    id={`pp-title-${pp.id}`}
                    placeholder="Brief title"
                    value={pp.title}
                    onChange={(e) => updatePainPoint(i, { title: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label>Category</Label>
                    <Select
                      value={pp.category}
                      onValueChange={(val) =>
                        updatePainPoint(i, { category: val as PainPoint["category"] })
                      }
                    >
                      <SelectTrigger aria-label="Pain point category">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="process">Process</SelectItem>
                        <SelectItem value="technology">Technology</SelectItem>
                        <SelectItem value="people">People</SelectItem>
                        <SelectItem value="data">Data</SelectItem>
                        <SelectItem value="compliance">Compliance</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label>Severity</Label>
                    <Select
                      value={pp.severity}
                      onValueChange={(val) =>
                        updatePainPoint(i, { severity: val as PainPoint["severity"] })
                      }
                    >
                      <SelectTrigger aria-label="Pain point severity">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <div className="space-y-1">
                <Label htmlFor={`pp-desc-${pp.id}`}>Description</Label>
                <Textarea
                  id={`pp-desc-${pp.id}`}
                  placeholder="Describe this pain point in detail..."
                  value={pp.description}
                  onChange={(e) =>
                    updatePainPoint(i, { description: e.target.value })
                  }
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}

function WorkflowsTab({
  workflows,
  setWorkflows,
}: {
  workflows: Workflow[];
  setWorkflows: (wf: Workflow[]) => void;
}) {
  function addWorkflow() {
    setWorkflows([
      ...workflows,
      {
        id: crypto.randomUUID(),
        name: "",
        description: "",
        steps: [],
        tools: [],
        painPoints: [],
        frequency: "",
      },
    ]);
  }

  function updateWorkflow(index: number, updates: Partial<Workflow>) {
    const updated = [...workflows];
    updated[index] = { ...updated[index], ...updates };
    setWorkflows(updated);
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button variant="outline" onClick={addWorkflow}>
          <Plus className="mr-2 h-4 w-4" />
          Add Workflow
        </Button>
      </div>
      {workflows.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center">
            <p className="text-muted-foreground">
              No workflows mapped yet. Click &quot;Add Workflow&quot; to start
              documenting business processes.
            </p>
          </CardContent>
        </Card>
      ) : (
        workflows.map((wf, i) => (
          <Card key={wf.id}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <CardTitle className="text-base">
                  Workflow #{i + 1}
                </CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`Remove workflow ${i + 1}`}
                  onClick={() =>
                    setWorkflows(workflows.filter((w) => w.id !== wf.id))
                  }
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor={`wf-name-${wf.id}`}>Name</Label>
                  <Input
                    id={`wf-name-${wf.id}`}
                    placeholder="e.g., Invoice Processing"
                    value={wf.name}
                    onChange={(e) => updateWorkflow(i, { name: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor={`wf-freq-${wf.id}`}>Frequency</Label>
                  <Input
                    id={`wf-freq-${wf.id}`}
                    placeholder="e.g., Daily, Weekly"
                    value={wf.frequency}
                    onChange={(e) =>
                      updateWorkflow(i, { frequency: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="space-y-1">
                <Label htmlFor={`wf-desc-${wf.id}`}>Description</Label>
                <Textarea
                  id={`wf-desc-${wf.id}`}
                  placeholder="Describe this workflow..."
                  value={wf.description}
                  onChange={(e) =>
                    updateWorkflow(i, { description: e.target.value })
                  }
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}

function TechStackTab({
  techStack,
  setTechStack,
}: {
  techStack: TechStackItem[];
  setTechStack: (ts: TechStackItem[]) => void;
}) {
  function addTechItem() {
    setTechStack([
      ...techStack,
      {
        id: crypto.randomUUID(),
        name: "",
        category: "other",
        purpose: "",
        satisfaction: 3,
      },
    ]);
  }

  function updateTechItem(index: number, updates: Partial<TechStackItem>) {
    const updated = [...techStack];
    updated[index] = { ...updated[index], ...updates };
    setTechStack(updated);
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button variant="outline" onClick={addTechItem}>
          <Plus className="mr-2 h-4 w-4" />
          Add Tool / Platform
        </Button>
      </div>
      {techStack.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center">
            <p className="text-muted-foreground">
              No tools or platforms added. Click &quot;Add Tool / Platform&quot; to
              inventory the current tech stack.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {techStack.map((item, i) => (
            <Card key={item.id}>
              <CardContent className="space-y-3 pt-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-3">
                    <div className="space-y-1">
                      <Label htmlFor={`tech-name-${item.id}`}>Tool Name</Label>
                      <Input
                        id={`tech-name-${item.id}`}
                        placeholder="e.g., Salesforce, Slack"
                        value={item.name}
                        onChange={(e) =>
                          updateTechItem(i, { name: e.target.value })
                        }
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <Label>Category</Label>
                        <Select
                          value={item.category}
                          onValueChange={(val) =>
                            updateTechItem(i, {
                              category: val as TechStackItem["category"],
                            })
                          }
                        >
                          <SelectTrigger aria-label="Tool category">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="crm">CRM</SelectItem>
                            <SelectItem value="erp">ERP</SelectItem>
                            <SelectItem value="communication">
                              Communication
                            </SelectItem>
                            <SelectItem value="storage">Storage</SelectItem>
                            <SelectItem value="analytics">Analytics</SelectItem>
                            <SelectItem value="custom">Custom</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1">
                        <Label>Satisfaction (1-5)</Label>
                        <Select
                          value={String(item.satisfaction)}
                          onValueChange={(val) =>
                            updateTechItem(i, {
                              satisfaction:
                                Number(val) as TechStackItem["satisfaction"],
                            })
                          }
                        >
                          <SelectTrigger aria-label="Tool satisfaction rating">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">1 - Very Poor</SelectItem>
                            <SelectItem value="2">2 - Poor</SelectItem>
                            <SelectItem value="3">3 - Adequate</SelectItem>
                            <SelectItem value="4">4 - Good</SelectItem>
                            <SelectItem value="5">5 - Excellent</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor={`tech-purpose-${item.id}`}>Purpose</Label>
                      <Input
                        id={`tech-purpose-${item.id}`}
                        placeholder="What is this used for?"
                        value={item.purpose}
                        onChange={(e) =>
                          updateTechItem(i, { purpose: e.target.value })
                        }
                      />
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="ml-2 shrink-0"
                    aria-label={`Remove ${item.name || "tool"}`}
                    onClick={() =>
                      setTechStack(techStack.filter((t) => t.id !== item.id))
                    }
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main Discovery Page ──────────────────────────────────

export default function DiscoveryPage() {
  const params = useParams();
  const projectId = params.id as string;

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);

  // Form states
  const [profile, setProfile] = useState<BusinessProfile>(DEFAULT_PROFILE);
  const [painPoints, setPainPoints] = useState<PainPoint[]>([]);
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [techStack, setTechStack] = useState<TechStackItem[]>([]);

  // Track initial load to set isDirty correctly
  const initialLoadDone = useRef(false);

  // Wrap setters to track dirty state
  const markDirty = useCallback(() => {
    if (initialLoadDone.current) setIsDirty(true);
  }, []);

  const handleSetProfile = useCallback(
    (p: BusinessProfile) => {
      setProfile(p);
      markDirty();
    },
    [markDirty]
  );

  const handleSetPainPoints = useCallback(
    (pp: PainPoint[]) => {
      setPainPoints(pp);
      markDirty();
    },
    [markDirty]
  );

  const handleSetWorkflows = useCallback(
    (wf: Workflow[]) => {
      setWorkflows(wf);
      markDirty();
    },
    [markDirty]
  );

  const handleSetTechStack = useCallback(
    (ts: TechStackItem[]) => {
      setTechStack(ts);
      markDirty();
    },
    [markDirty]
  );

  // Load existing discovery data
  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/projects/${projectId}`);
      if (!res.ok) return;
      const data = await res.json();
      if (data.discovery) {
        const errors: string[] = [];

        const p = safeParse<BusinessProfile>(
          data.discovery.businessProfile,
          DEFAULT_PROFILE
        );
        if (p.error) errors.push("business profile");
        setProfile(p.value);

        const pp = safeParse<PainPoint[]>(data.discovery.painPoints, []);
        if (pp.error) errors.push("pain points");
        setPainPoints(pp.value);

        const wf = safeParse<Workflow[]>(data.discovery.currentWorkflows, []);
        if (wf.error) errors.push("workflows");
        setWorkflows(wf.value);

        const ts = safeParse<TechStackItem[]>(data.discovery.techStack, []);
        if (ts.error) errors.push("tech stack");
        setTechStack(ts.value);

        if (errors.length > 0) {
          setLoadError(
            `Some saved data could not be loaded: ${errors.join(", ")}. Default values were used.`
          );
        }
      }
      // Mark initial load complete after a tick so state updates settle
      requestAnimationFrame(() => {
        initialLoadDone.current = true;
      });
    }
    load();
  }, [projectId]);

  // Warn about unsaved changes
  useEffect(() => {
    function handleBeforeUnload(e: BeforeUnloadEvent) {
      if (isDirty) {
        e.preventDefault();
      }
    }
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  // Save handler with error feedback
  async function handleSave() {
    setSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    try {
      const res = await fetch(`/api/projects/${projectId}/discovery`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessProfile: JSON.stringify(profile),
          painPoints: JSON.stringify(painPoints),
          currentWorkflows: JSON.stringify(workflows),
          techStack: JSON.stringify(techStack),
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Save failed (${res.status})`);
      }

      setIsDirty(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      setSaveError(
        err instanceof Error ? err.message : "Failed to save. Please try again."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Discovery</h2>
          <p className="text-sm text-muted-foreground">
            Capture information about the business, its processes, and
            challenges.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {isDirty && (
            <span className="text-sm text-amber-600">Unsaved changes</span>
          )}
          {saveSuccess && (
            <span className="text-sm text-green-600">Saved!</span>
          )}
          <Button onClick={handleSave} disabled={saving}>
            <Save className="mr-2 h-4 w-4" />
            {saving ? "Saving..." : "Save Progress"}
          </Button>
        </div>
      </div>

      {/* Error banners */}
      {loadError && (
        <div className="mb-4 flex items-center gap-2 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {loadError}
        </div>
      )}
      {saveError && (
        <div className="mb-4 flex items-center gap-2 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {saveError}
        </div>
      )}

      {/* Accessible Tabs */}
      <Tabs defaultValue="profile">
        <TabsList className="mb-6 grid w-full grid-cols-4">
          <TabsTrigger value="profile">Business Profile</TabsTrigger>
          <TabsTrigger value="workflows">Workflows</TabsTrigger>
          <TabsTrigger value="techstack">Tech Stack</TabsTrigger>
          <TabsTrigger value="painpoints">Pain Points</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <BusinessProfileTab
            profile={profile}
            setProfile={handleSetProfile}
          />
        </TabsContent>

        <TabsContent value="workflows">
          <WorkflowsTab
            workflows={workflows}
            setWorkflows={handleSetWorkflows}
          />
        </TabsContent>

        <TabsContent value="techstack">
          <TechStackTab
            techStack={techStack}
            setTechStack={handleSetTechStack}
          />
        </TabsContent>

        <TabsContent value="painpoints">
          <PainPointsTab
            painPoints={painPoints}
            setPainPoints={handleSetPainPoints}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
