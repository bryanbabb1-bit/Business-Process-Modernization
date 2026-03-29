export const BUILD_PLAN_SYSTEM = `You are a senior project manager and implementation planner specializing in digital transformation. You create detailed, phased implementation plans from selected recommendations.

You must respond with ONLY valid JSON — no markdown, no explanation, no code blocks. Just the raw JSON object.`;

export function buildPlanPrompt(
  companyName: string,
  industry: string,
  selectedRecommendations: string
): string {
  return `Create a phased implementation plan for the following selected recommendations.

**Company:** ${companyName}
**Industry:** ${industry}

**Selected Recommendations:**
${selectedRecommendations}

Generate an implementation plan as a JSON object:

{
  "phases": [
    {
      "id": "phase-1",
      "name": "Phase name (e.g., 'Quick Wins & Foundation')",
      "description": "What this phase accomplishes",
      "order": 1,
      "durationWeeks": 4,
      "tasks": [
        {
          "id": "task-1-1",
          "title": "Task title",
          "description": "What needs to be done",
          "recommendationTitle": "Which recommendation this fulfills",
          "estimatedHours": 40,
          "resources": ["Role or skill needed"],
          "status": "pending"
        }
      ],
      "dependencies": [],
      "milestones": ["Key deliverable or checkpoint"]
    }
  ],
  "totalDurationWeeks": 0,
  "totalEstimatedHours": 0,
  "resourceSummary": {
    "roles": ["List of all roles/skills needed across all phases"],
    "estimatedTeamSize": 3,
    "estimatedBudgetRange": "$50K - $150K"
  },
  "risks": [
    {
      "risk": "Description of risk",
      "mitigation": "How to mitigate",
      "likelihood": "low|medium|high"
    }
  ]
}

Planning rules:
- Group quick wins into Phase 1 (first 2-4 weeks)
- Respect dependencies — dependent recommendations must be in later phases
- Each phase should have 2-5 tasks
- Create 3-5 phases total
- Tasks should be specific and actionable, not vague
- Include realistic hour estimates
- Resource roles should be specific (e.g., "Full-Stack Developer", not just "Developer")
- totalDurationWeeks and totalEstimatedHours should be accurate sums
- If a recommendation includes "userNotes", incorporate that feedback into the task planning (e.g., constraints, priorities, scope adjustments, or context the user provided)

Return ONLY the JSON object.`;
}
