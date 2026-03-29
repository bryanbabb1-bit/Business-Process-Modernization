export const EXTRACT_WORKFLOWS_SYSTEM = `You are a senior business process analyst. Your job is to read documents that describe business processes — SOPs, process maps, workflow descriptions, procedural guides, flowcharts (described in text), or any document that outlines how work gets done — and extract structured workflow data from them.

You must respond with ONLY valid JSON — no markdown, no explanation, no code blocks. Just the raw JSON object.`;

export function buildExtractWorkflowsPrompt(
  documentName: string,
  documentContent: string,
  existingWorkflows: string
): string {
  return `Analyze the following document and extract all business workflows/processes described in it.

**Document:** ${documentName}

**Document Content:**
${documentContent.slice(0, 30000)}

**Existing Workflows Already Captured:**
${existingWorkflows || "None yet"}

For each workflow/process you identify in the document, extract:
- A clear name
- A description of what the workflow accomplishes
- The sequential steps involved
- Tools/systems mentioned or implied
- Pain points, bottlenecks, or inefficiencies mentioned or implied
- How often this workflow runs (daily, weekly, monthly, quarterly, ad-hoc)

Also identify any pain points and tech stack items mentioned in the document.

Return a JSON object with this structure:

{
  "workflows": [
    {
      "id": "wf-doc-1",
      "name": "Workflow name",
      "description": "What this workflow accomplishes",
      "steps": ["Step 1: ...", "Step 2: ...", "Step 3: ..."],
      "tools": ["Tool or system mentioned"],
      "painPoints": ["Any bottleneck or issue mentioned"],
      "frequency": "daily|weekly|monthly|quarterly|ad-hoc"
    }
  ],
  "painPoints": [
    {
      "id": "pp-doc-1",
      "category": "process|technology|people|data|compliance",
      "title": "Short title",
      "description": "Description of the pain point found in the document",
      "severity": "low|medium|high|critical"
    }
  ],
  "techStack": [
    {
      "id": "ts-doc-1",
      "name": "Tool or system name",
      "category": "crm|erp|communication|storage|analytics|custom|other",
      "purpose": "What it's used for based on the document",
      "satisfaction": 3
    }
  ],
  "summary": "Brief 2-3 sentence summary of what this document describes"
}

Rules:
- Extract ALL distinct workflows, even small ones
- If steps are implied but not explicitly listed, infer reasonable steps
- Do NOT duplicate workflows that already exist (check existing workflows list)
- Pain points should only be included if the document mentions issues, bottlenecks, or complaints
- Tech stack items should only be included if specific tools/systems are named
- Use IDs prefixed with "wf-doc-", "pp-doc-", "ts-doc-" to distinguish from manually entered data
- If the document doesn't describe any clear processes, return empty arrays and explain in summary

Return ONLY the JSON object.`;
}
