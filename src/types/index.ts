// ============================================================
// Core Domain Types for Business Process Modernization Tool
// ============================================================

// --- Project ---

export type ProjectStatus =
  | "discovery"
  | "analysis"
  | "planning"
  | "building"
  | "complete";

export interface Project {
  id: string;
  name: string;
  clientName: string;
  industry: string;
  companySize: string;
  status: ProjectStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProjectInput {
  name: string;
  clientName: string;
  industry: string;
  companySize: string;
}

// --- Discovery ---

export interface BusinessProfile {
  description: string;
  revenue: string;
  headcount: string;
  goals: string[];
  marketPosition: string;
  keyProcesses: string[];
}

export interface PainPoint {
  id: string;
  category: "process" | "technology" | "people" | "data" | "compliance";
  title: string;
  description: string;
  severity: "low" | "medium" | "high" | "critical";
}

export interface Workflow {
  id: string;
  name: string;
  description: string;
  steps: string[];
  tools: string[];
  painPoints: string[];
  frequency: string;
}

export interface TechStackItem {
  id: string;
  name: string;
  category: "crm" | "erp" | "communication" | "storage" | "analytics" | "custom" | "other";
  purpose: string;
  satisfaction: 1 | 2 | 3 | 4 | 5;
}

export interface DiscoveryData {
  id: string;
  projectId: string;
  businessProfile: BusinessProfile;
  painPoints: PainPoint[];
  currentWorkflows: Workflow[];
  techStack: TechStackItem[];
}

// --- Documents ---

export type ProcessingStatus = "pending" | "processing" | "complete" | "error";

export interface Document {
  id: string;
  projectId: string;
  fileName: string;
  fileType: string;
  filePath: string;
  fileSize: number;
  extractedContent: string;
  processingStatus: ProcessingStatus;
  createdAt: string;
}

// --- Analysis ---

export interface MaturityScore {
  dimension: string;
  currentScore: number;
  targetScore: number;
  maxScore: number;
}

export interface GapItem {
  area: string;
  currentState: string;
  desiredState: string;
  gapSeverity: "low" | "medium" | "high" | "critical";
  recommendation: string;
}

export interface InformationGap {
  id: string;
  area: string;
  question: string;
  importance: "nice_to_have" | "important" | "critical";
  resolved: boolean;
}

export interface Analysis {
  id: string;
  projectId: string;
  currentStateAssessment: {
    summary: string;
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    threats: string[];
  };
  gapAnalysis: GapItem[];
  maturityScores: MaturityScore[];
  informationGaps: InformationGap[];
  createdAt: string;
}

// --- Recommendations ---

export type RecommendationCategory =
  | "quick_win"
  | "medium_effort"
  | "transformational";

export interface Recommendation {
  id: string;
  projectId: string;
  analysisId: string;
  title: string;
  description: string;
  category: RecommendationCategory;
  effortScore: number;
  impactScore: number;
  dependencies: string[];
  selected: boolean;
  customizations: {
    userFeedback?: string;
    scopeAdjustment?: string;
    constraints?: string[];
  };
}

// --- Implementation Plan ---

export interface PlanPhase {
  id: string;
  name: string;
  description: string;
  order: number;
  durationWeeks: number;
  tasks: PlanTask[];
  dependencies: string[];
}

export interface PlanTask {
  id: string;
  title: string;
  description: string;
  recommendationId: string;
  estimatedHours: number;
  resources: string[];
  status: "pending" | "in_progress" | "complete";
}

export interface ImplementationPlan {
  id: string;
  projectId: string;
  phases: PlanPhase[];
  selectedRecommendationIds: string[];
  interdependencies: Record<string, string[]>;
  confirmed: boolean;
  createdAt: string;
}

// --- Deliverables ---

export type PackageStatus = "generating" | "ready" | "downloaded";

export interface ConfigField {
  key: string;
  label: string;
  description: string;
  type: "string" | "path" | "url" | "number" | "boolean";
  defaultValue: string;
  required: boolean;
}

export interface Artifact {
  fileName: string;
  filePath: string;
  description: string;
  category: "scaffold" | "report" | "config" | "spec";
}

export interface DeliverablePackage {
  id: string;
  planId: string;
  projectId: string;
  packageName: string;
  packagePath: string;
  configSchema: ConfigField[];
  artifacts: Artifact[];
  status: PackageStatus;
  createdAt: string;
}

// --- UI State ---

export const PROJECT_PHASES = [
  { key: "discovery", label: "Discovery", icon: "Search" },
  { key: "analysis", label: "Analysis", icon: "BarChart3" },
  { key: "planning", label: "Planning", icon: "GitBranch" },
  { key: "building", label: "Build", icon: "Package" },
  { key: "complete", label: "Complete", icon: "CheckCircle" },
] as const;

export const INDUSTRIES = [
  "Healthcare",
  "Financial Services",
  "Manufacturing",
  "Retail / E-Commerce",
  "Technology",
  "Education",
  "Government",
  "Real Estate",
  "Professional Services",
  "Non-Profit",
  "Other",
] as const;

export const COMPANY_SIZES = [
  "1-10 employees",
  "11-50 employees",
  "51-200 employees",
  "201-500 employees",
  "501-1000 employees",
  "1000+ employees",
] as const;
