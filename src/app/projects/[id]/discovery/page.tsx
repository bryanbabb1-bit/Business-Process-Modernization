"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Save, Plus, X } from "lucide-react";
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
import type { BusinessProfile, PainPoint, TechStackItem, Workflow } from "@/types";

type Tab = "profile" | "workflows" | "techstack" | "painpoints";

export default function DiscoveryPage() {
  const params = useParams();
  const projectId = params.id as string;
  const [activeTab, setActiveTab] = useState<Tab>("profile");
  const [saving, setSaving] = useState(false);
  const [discoveryId, setDiscoveryId] = useState<string | null>(null);

  // Form states
  const [profile, setProfile] = useState<BusinessProfile>({
    description: "",
    revenue: "",
    headcount: "",
    goals: [],
    marketPosition: "",
    keyProcesses: [],
  });
  const [painPoints, setPainPoints] = useState<PainPoint[]>([]);
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [techStack, setTechStack] = useState<TechStackItem[]>([]);

  // Temp inputs
  const [newGoal, setNewGoal] = useState("");
  const [newProcess, setNewProcess] = useState("");

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/projects/${projectId}`);
      if (res.ok) {
        const data = await res.json();
        if (data.discovery) {
          setDiscoveryId(data.discovery.id);
          try {
            setProfile(JSON.parse(data.discovery.businessProfile));
          } catch { /* empty default */ }
          try {
            setPainPoints(JSON.parse(data.discovery.painPoints));
          } catch { /* empty default */ }
          try {
            setWorkflows(JSON.parse(data.discovery.currentWorkflows));
          } catch { /* empty default */ }
          try {
            setTechStack(JSON.parse(data.discovery.techStack));
          } catch { /* empty default */ }
        }
      }
    }
    load();
  }, [projectId]);

  async function handleSave() {
    setSaving(true);
    await fetch(`/api/projects/${projectId}/discovery`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        businessProfile: JSON.stringify(profile),
        painPoints: JSON.stringify(painPoints),
        currentWorkflows: JSON.stringify(workflows),
        techStack: JSON.stringify(techStack),
      }),
    });
    setSaving(false);
  }

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

  function removePainPoint(id: string) {
    setPainPoints(painPoints.filter((p) => p.id !== id));
  }

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

  function removeWorkflow(id: string) {
    setWorkflows(workflows.filter((w) => w.id !== id));
  }

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

  function removeTechItem(id: string) {
    setTechStack(techStack.filter((t) => t.id !== id));
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: "profile", label: "Business Profile" },
    { key: "workflows", label: "Workflows" },
    { key: "techstack", label: "Tech Stack" },
    { key: "painpoints", label: "Pain Points" },
  ];

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Discovery</h2>
          <p className="text-sm text-muted-foreground">
            Capture information about the business, its processes, and challenges.
          </p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          <Save className="mr-2 h-4 w-4" />
          {saving ? "Saving..." : "Save Progress"}
        </Button>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-1 rounded-lg bg-muted p-1">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Business Profile Tab */}
      {activeTab === "profile" && (
        <Card>
          <CardHeader>
            <CardTitle>Business Profile</CardTitle>
            <CardDescription>
              General information about the company and its objectives.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Business Description</Label>
              <Textarea
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
                <Label>Annual Revenue</Label>
                <Input
                  placeholder="e.g., $5M-10M"
                  value={profile.revenue}
                  onChange={(e) =>
                    setProfile({ ...profile, revenue: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Headcount</Label>
                <Input
                  placeholder="e.g., 150"
                  value={profile.headcount}
                  onChange={(e) =>
                    setProfile({ ...profile, headcount: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Market Position</Label>
              <Textarea
                placeholder="How does the company position itself in the market?"
                value={profile.marketPosition}
                onChange={(e) =>
                  setProfile({ ...profile, marketPosition: e.target.value })
                }
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label>Business Goals</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Add a goal..."
                  value={newGoal}
                  onChange={(e) => setNewGoal(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && newGoal.trim()) {
                      setProfile({
                        ...profile,
                        goals: [...profile.goals, newGoal.trim()],
                      });
                      setNewGoal("");
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    if (newGoal.trim()) {
                      setProfile({
                        ...profile,
                        goals: [...profile.goals, newGoal.trim()],
                      });
                      setNewGoal("");
                    }
                  }}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {profile.goals.map((goal, i) => (
                  <Badge key={i} variant="secondary" className="gap-1">
                    {goal}
                    <button
                      onClick={() =>
                        setProfile({
                          ...profile,
                          goals: profile.goals.filter((_, j) => j !== i),
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
              <Label>Key Processes</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Add a key process..."
                  value={newProcess}
                  onChange={(e) => setNewProcess(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && newProcess.trim()) {
                      setProfile({
                        ...profile,
                        keyProcesses: [
                          ...profile.keyProcesses,
                          newProcess.trim(),
                        ],
                      });
                      setNewProcess("");
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    if (newProcess.trim()) {
                      setProfile({
                        ...profile,
                        keyProcesses: [
                          ...profile.keyProcesses,
                          newProcess.trim(),
                        ],
                      });
                      setNewProcess("");
                    }
                  }}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {profile.keyProcesses.map((proc, i) => (
                  <Badge key={i} variant="secondary" className="gap-1">
                    {proc}
                    <button
                      onClick={() =>
                        setProfile({
                          ...profile,
                          keyProcesses: profile.keyProcesses.filter(
                            (_, j) => j !== i
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
      )}

      {/* Pain Points Tab */}
      {activeTab === "painpoints" && (
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
                      onClick={() => removePainPoint(pp.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label>Title</Label>
                      <Input
                        placeholder="Brief title"
                        value={pp.title}
                        onChange={(e) => {
                          const updated = [...painPoints];
                          updated[i] = { ...pp, title: e.target.value };
                          setPainPoints(updated);
                        }}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label>Category</Label>
                        <Select
                          value={pp.category}
                          onValueChange={(val) => {
                            const updated = [...painPoints];
                            updated[i] = {
                              ...pp,
                              category: val as PainPoint["category"],
                            };
                            setPainPoints(updated);
                          }}
                        >
                          <SelectTrigger>
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
                          onValueChange={(val) => {
                            const updated = [...painPoints];
                            updated[i] = {
                              ...pp,
                              severity: val as PainPoint["severity"],
                            };
                            setPainPoints(updated);
                          }}
                        >
                          <SelectTrigger>
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
                    <Label>Description</Label>
                    <Textarea
                      placeholder="Describe this pain point in detail..."
                      value={pp.description}
                      onChange={(e) => {
                        const updated = [...painPoints];
                        updated[i] = { ...pp, description: e.target.value };
                        setPainPoints(updated);
                      }}
                      rows={2}
                    />
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Workflows Tab */}
      {activeTab === "workflows" && (
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
                      onClick={() => removeWorkflow(wf.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label>Name</Label>
                      <Input
                        placeholder="e.g., Invoice Processing"
                        value={wf.name}
                        onChange={(e) => {
                          const updated = [...workflows];
                          updated[i] = { ...wf, name: e.target.value };
                          setWorkflows(updated);
                        }}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label>Frequency</Label>
                      <Input
                        placeholder="e.g., Daily, Weekly"
                        value={wf.frequency}
                        onChange={(e) => {
                          const updated = [...workflows];
                          updated[i] = { ...wf, frequency: e.target.value };
                          setWorkflows(updated);
                        }}
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label>Description</Label>
                    <Textarea
                      placeholder="Describe this workflow..."
                      value={wf.description}
                      onChange={(e) => {
                        const updated = [...workflows];
                        updated[i] = { ...wf, description: e.target.value };
                        setWorkflows(updated);
                      }}
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Tech Stack Tab */}
      {activeTab === "techstack" && (
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
                          <Label>Tool Name</Label>
                          <Input
                            placeholder="e.g., Salesforce, Slack"
                            value={item.name}
                            onChange={(e) => {
                              const updated = [...techStack];
                              updated[i] = { ...item, name: e.target.value };
                              setTechStack(updated);
                            }}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <Label>Category</Label>
                            <Select
                              value={item.category}
                              onValueChange={(val) => {
                                const updated = [...techStack];
                                updated[i] = {
                                  ...item,
                                  category: val as TechStackItem["category"],
                                };
                                setTechStack(updated);
                              }}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="crm">CRM</SelectItem>
                                <SelectItem value="erp">ERP</SelectItem>
                                <SelectItem value="communication">Communication</SelectItem>
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
                              onValueChange={(val) => {
                                const updated = [...techStack];
                                updated[i] = {
                                  ...item,
                                  satisfaction: Number(val) as TechStackItem["satisfaction"],
                                };
                                setTechStack(updated);
                              }}
                            >
                              <SelectTrigger>
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
                          <Label>Purpose</Label>
                          <Input
                            placeholder="What is this used for?"
                            value={item.purpose}
                            onChange={(e) => {
                              const updated = [...techStack];
                              updated[i] = { ...item, purpose: e.target.value };
                              setTechStack(updated);
                            }}
                          />
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="ml-2 shrink-0"
                        onClick={() => removeTechItem(item.id)}
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
      )}
    </div>
  );
}
