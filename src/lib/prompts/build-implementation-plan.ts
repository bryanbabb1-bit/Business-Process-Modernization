export const BUILD_PLAN_SYSTEM = `You are a digital transformation implementation planner. You create phased delivery plans from selected recommendations. Implementation is done by a single consultant using AI-assisted development, so traditional labor estimates (hours, team size) do not apply. Focus on deliverables, sequencing, and tooling options.

You must respond with ONLY valid JSON — no markdown, no explanation, no code blocks. Just the raw JSON object.`;

export function buildPlanPrompt(
  companyName: string,
  industry: string,
  selectedRecommendations: string,
  techStack: string
): string {
  return `Create a phased implementation plan for the following selected recommendations.

**Company:** ${companyName}
**Industry:** ${industry}

**Client's Current Tech Stack:**
${techStack}

**Selected Recommendations:**
${selectedRecommendations}

**Important context:** Implementation is done by a single consultant using AI-assisted development. Do NOT include labor hours, team sizes, or hourly estimates. Focus on what gets delivered, in what order, and what it costs the client in tooling/licensing.

Generate an implementation plan as a JSON object:

{
  "phases": [
    {
      "id": "phase-1",
      "name": "Phase name (e.g., 'Quick Wins & Foundation')",
      "description": "What this phase accomplishes",
      "order": 1,
      "tasks": [
        {
          "id": "task-1-1",
          "title": "Task title",
          "description": "What gets delivered",
          "recommendationTitle": "Which recommendation this fulfills",
          "deliverables": ["Specific outputs the client receives"],
          "status": "pending"
        }
      ],
      "dependencies": [],
      "milestones": ["Key deliverable or checkpoint"]
    }
  ],
  "implementationOptions": {
    "currentStack": {
      "description": "Implementation using only the client's existing tools — no new licensing costs",
      "totalLicensingCost": "$0",
      "toolsLeveraged": ["List of existing tools from the client's stack that will be used"],
      "limitations": ["Trade-offs or constraints from staying with current tools"]
    },
    "improvedStack": {
      "description": "Implementation with upgraded tools for better outcomes",
      "newTools": [
        {
          "tool": "Tool name",
          "purpose": "Why it's better than the existing option",
          "cost": "$X/month or $X/year"
        }
      ],
      "totalLicensingCost": "$X/month or $X/year total",
      "advantages": ["What the client gains by upgrading"]
    }
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
- Group quick wins into Phase 1
- Respect dependencies — dependent recommendations must be in later phases
- Each phase should have 2-5 tasks
- Create 3-5 phases total
- Tasks should describe specific deliverables, not effort estimates
- Do NOT include estimatedHours, resources, team size, or labor cost
- implementationOptions should present a clear current-stack vs improved-stack comparison
- currentStack.toolsLeveraged must reference specific tools from the client's actual tech stack
- Licensing costs should be realistic market pricing
- If a recommendation includes "userNotes", incorporate that feedback into the task planning
- Only recommend new tools when the client's stack genuinely cannot cover the need

Return ONLY the JSON object.`;
}
