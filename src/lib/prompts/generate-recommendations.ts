export const GENERATE_RECOMMENDATIONS_SYSTEM = `You are a senior digital transformation strategist. Based on a business analysis, you generate specific, actionable modernization recommendations that are scored by effort and impact, categorized by type, and linked by dependencies.

Each recommendation should present TWO implementation options: one that leverages the client's existing tech stack (near $0 tooling cost), and one that uses improved/new tools (with licensing costs). The client will choose which path to take.

You must respond with ONLY valid JSON — no markdown, no explanation, no code blocks. Just the raw JSON array.`;

export function buildRecommendationsPrompt(
  companyName: string,
  industry: string,
  assessment: string,
  gapAnalysis: string,
  maturityScores: string,
  workflows: string,
  painPoints: string,
  techStack: string
): string {
  return `Generate modernization recommendations for the following company based on the analysis results.

**Company:** ${companyName}
**Industry:** ${industry}

**Current State Assessment:**
${assessment}

**Gap Analysis:**
${gapAnalysis}

**Maturity Scores:**
${maturityScores}

**Current Workflows:**
${workflows}

**Pain Points:**
${painPoints}

**Client's Current Tech Stack:**
${techStack}

Generate 8-12 recommendations as a JSON array. Each recommendation should present TWO options: one using the client's current tools, and one using improved/new tools.

[
  {
    "title": "Clear, actionable recommendation title",
    "description": "2-3 sentences explaining what to do, why, and expected outcome",
    "category": "quick_win|medium_effort|transformational",
    "effortScore": 1-10,
    "impactScore": 1-10,
    "dependencies": ["titles of other recommendations this depends on"],
    "keyBenefits": ["3-4 specific benefits"],
    "riskFactors": ["1-2 risks to consider"],
    "currentStackOption": {
      "approach": "How to achieve this using the client's existing tools",
      "toolsUsed": ["Specific tools from their current stack"],
      "limitations": "What trade-offs or limitations come with using existing tools",
      "licensingCost": "$0"
    },
    "improvedStackOption": {
      "approach": "How to achieve this with better/new tools",
      "newTools": ["Specific new tools or platforms to acquire"],
      "advantages": "What the client gains over the current-stack approach",
      "licensingCost": "$X/month or $X/year — be specific per tool"
    }
  }
]

Category rules:
- **quick_win**: effortScore 1-3, impactScore 5+
- **medium_effort**: effortScore 4-6, any impact
- **transformational**: effortScore 7+, impactScore 7+

Requirements:
- **ALWAYS present a current-stack option** — show how existing tools can solve the problem, even if imperfectly
- The improved-stack option should only be recommended when it provides a meaningful upgrade over existing tools
- toolsUsed in currentStackOption must reference specific tools from the client's actual tech stack
- licensingCost for currentStackOption should be "$0" or near-zero (they already own the tools)
- licensingCost for improvedStackOption should be realistic market pricing for the specific tools
- Include at least 3 quick wins, 3-4 medium effort, and 2-3 transformational
- Dependencies should reference other recommendation titles in this list
- Quick wins should have no dependencies or depend only on other quick wins
- effortScore and impactScore must be integers 1-10
- Be specific to this company and industry, not generic advice
- Each recommendation should address a specific gap or pain point from the analysis

Return ONLY the JSON array.`;
}
