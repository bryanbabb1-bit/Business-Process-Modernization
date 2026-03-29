export const GENERATE_RECOMMENDATIONS_SYSTEM = `You are a senior digital transformation strategist. Based on a business analysis, you generate specific, actionable modernization recommendations that are scored by effort and impact, categorized by type, and linked by dependencies.

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

Generate 8-12 recommendations as a JSON array. Each recommendation should be:

[
  {
    "title": "Clear, actionable recommendation title",
    "description": "2-3 sentences explaining what to do, why, and expected outcome",
    "category": "quick_win|medium_effort|transformational",
    "effortScore": 1-10,
    "impactScore": 1-10,
    "dependencies": ["titles of other recommendations this depends on"],
    "estimatedWeeks": 2-26,
    "keyBenefits": ["3-4 specific benefits"],
    "riskFactors": ["1-2 risks to consider"],
    "techLeverage": ["Names of existing tools/platforms from the client's stack that this recommendation uses or extends"],
    "newToolsRequired": ["Any new tools, platforms, or licenses the client would need to acquire"],
    "estimatedCostRange": "$0 - $5K | $5K - $25K | $25K - $100K | $100K+"
  }
]

Category rules:
- **quick_win**: effortScore 1-3, impactScore 5+, can be done in under 4 weeks
- **medium_effort**: effortScore 4-6, any impact, 4-12 weeks
- **transformational**: effortScore 7+, impactScore 7+, 12+ weeks

Requirements:
- **PRIORITIZE leveraging the client's existing tech stack** — favor solutions that build on tools the client already owns and knows before recommending new tools
- When a recommendation CAN be achieved with existing tools, say so explicitly and keep effortScore lower
- When new tools are truly needed, justify why existing tools are insufficient
- techLeverage should list specific tools from the client's stack (not generic terms)
- newToolsRequired should be empty when existing tools suffice
- estimatedCostRange should reflect licensing, tooling, and implementation costs (not labor — that's separate)
- Include at least 3 quick wins, 3-4 medium effort, and 2-3 transformational
- Dependencies should reference other recommendation titles in this list
- Quick wins should have no dependencies or depend only on other quick wins
- effortScore and impactScore must be integers 1-10
- Be specific to this company and industry, not generic advice
- Each recommendation should address a specific gap or pain point from the analysis

Return ONLY the JSON array.`;
}
