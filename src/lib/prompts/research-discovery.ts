export const RESEARCH_DISCOVERY_SYSTEM = `You are a senior business consultant specializing in digital transformation and process modernization. Your role is to research a company and pre-populate a discovery questionnaire with intelligent defaults based on publicly available information about the company and its industry.

You must respond with ONLY valid JSON — no markdown, no explanation, no code blocks. Just the raw JSON object.`;

export function buildResearchPrompt(
  companyName: string,
  industry: string,
  companySize: string
): string {
  return `Research the following company and generate pre-populated discovery data for a business process modernization engagement.

**Company:** ${companyName}
**Industry:** ${industry}
**Company Size:** ${companySize}

Generate a JSON object with the following structure. Use your knowledge to provide realistic, relevant data. If you know specific details about this company, use them. If not, provide intelligent defaults based on the industry and company size.

{
  "businessProfile": {
    "description": "2-3 sentence description of the company and what they do",
    "revenue": "Estimated annual revenue range (e.g., '$10M - $50M')",
    "headcount": "Estimated headcount based on company size category",
    "goals": ["3-5 strategic business goals typical for this company/industry"],
    "marketPosition": "Brief description of their market position and competitive landscape",
    "keyProcesses": ["4-6 core business processes this company likely runs"]
  },
  "painPoints": [
    {
      "id": "pp-1",
      "category": "process|technology|people|data|compliance",
      "title": "Short title",
      "description": "Detailed description of the pain point",
      "severity": "low|medium|high|critical"
    }
  ],
  "currentWorkflows": [
    {
      "id": "wf-1",
      "name": "Workflow name",
      "description": "What this workflow does",
      "steps": ["Step 1", "Step 2", "Step 3"],
      "tools": ["Tools currently used"],
      "painPoints": ["Known issues with this workflow"],
      "frequency": "daily|weekly|monthly|quarterly"
    }
  ],
  "techStack": [
    {
      "id": "ts-1",
      "name": "Tool/platform name",
      "category": "crm|erp|communication|storage|analytics|custom|other",
      "purpose": "What it's used for",
      "satisfaction": 3
    }
  ]
}

Requirements:
- Generate 3-5 pain points covering different categories
- Generate 3-4 realistic workflows for this industry
- Generate 5-8 tech stack items typical for this industry and company size
- Pain point severity should be realistic — not everything is critical
- Tech satisfaction scores should range from 1-5, with a realistic distribution
- Make the data specific to the industry, not generic
- Use IDs like "pp-1", "wf-1", "ts-1" etc.

Return ONLY the JSON object, nothing else.`;
}
