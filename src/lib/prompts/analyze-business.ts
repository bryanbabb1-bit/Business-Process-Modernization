export const ANALYZE_BUSINESS_SYSTEM = `You are a senior business process consultant and digital transformation expert. You analyze businesses across multiple dimensions to identify their current state, strengths, weaknesses, and modernization opportunities.

You must respond with ONLY valid JSON — no markdown, no explanation, no code blocks. Just the raw JSON object.`;

export function buildAnalyzePrompt(
  companyName: string,
  industry: string,
  companySize: string,
  businessProfile: string,
  painPoints: string,
  workflows: string,
  techStack: string,
  documentSummaries: string
): string {
  return `Perform a comprehensive business process analysis for the following company based on all discovery data collected.

**Company:** ${companyName}
**Industry:** ${industry}
**Company Size:** ${companySize}

**Business Profile:**
${businessProfile}

**Pain Points Identified:**
${painPoints}

**Current Workflows:**
${workflows}

**Technology Stack:**
${techStack}

**Document Insights:**
${documentSummaries || "No documents uploaded"}

Generate a complete analysis as a JSON object with this structure:

{
  "currentStateAssessment": {
    "summary": "3-5 sentence executive summary of the company's current operational state",
    "strengths": ["3-5 identified organizational strengths"],
    "weaknesses": ["3-5 identified weaknesses or inefficiencies"],
    "opportunities": ["3-5 modernization opportunities"],
    "threats": ["3-5 risks if modernization is delayed"]
  },
  "gapAnalysis": [
    {
      "area": "Name of the gap area (e.g., 'Process Automation', 'Data Integration')",
      "currentState": "Description of where they are now",
      "desiredState": "Description of where they should be",
      "gapSeverity": "low|medium|high|critical",
      "recommendation": "Brief recommendation to close this gap"
    }
  ],
  "maturityScores": [
    {
      "dimension": "Dimension name",
      "currentScore": 0,
      "targetScore": 0,
      "maxScore": 5
    }
  ],
  "informationGaps": [
    {
      "id": "ig-1",
      "area": "Area where more info is needed",
      "question": "Specific question to ask the client",
      "importance": "nice_to_have|important|critical",
      "resolved": false
    }
  ]
}

Requirements for each section:

**Gap Analysis (6-10 items):**
- Cover technology, process, people, data, and compliance dimensions
- Be specific to this company and industry, not generic
- gapSeverity should reflect actual business impact

**Maturity Scores (exactly 8 dimensions):**
Use these dimensions:
1. Process Automation
2. Data Management
3. System Integration
4. Customer Experience
5. Security & Compliance
6. Scalability
7. Analytics & Reporting
8. Workforce Enablement

- currentScore: realistic score 1-5 based on discovery data
- targetScore: achievable target within 12-18 months (always >= currentScore)
- maxScore: always 5

**Information Gaps (3-7 items):**
- Identify what's missing from the discovery data
- Questions should be specific and actionable
- At least 1 should be "critical" importance

Return ONLY the JSON object.`;
}
