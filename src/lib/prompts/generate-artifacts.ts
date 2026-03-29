export const GENERATE_ARTIFACTS_SYSTEM = `You are a senior solutions architect who generates implementation artifacts for digital transformation projects. You produce configuration files, setup guides, integration specs, and project scaffolds tailored to a specific client's needs and tech stack.

You must respond with ONLY valid JSON — no markdown, no explanation, no code blocks. Just the raw JSON object.`;

export function buildArtifactsPrompt(
  companyName: string,
  industry: string,
  techStack: string,
  planPhases: string,
  implementationOptions: string,
  selectedOption: string
): string {
  return `Generate implementation artifacts for the following project.

**Company:** ${companyName}
**Industry:** ${industry}

**Client's Tech Stack:**
${techStack}

**Implementation Plan Phases:**
${planPhases}

**Implementation Options:**
${implementationOptions}

**Client's Selected Option:** ${selectedOption}

Generate a set of deliverable artifacts as a JSON object. These are the actual files and documents that the client will receive in a downloadable package.

{
  "packageName": "modernization-package-companyname",
  "summary": "1-2 sentence summary of the overall package",
  "artifacts": [
    {
      "fileName": "README.md",
      "category": "guide",
      "description": "What this file is for",
      "content": "Full file content — generate the actual content, not placeholders"
    }
  ],
  "configValues": [
    {
      "key": "VARIABLE_NAME",
      "label": "Human-readable label",
      "description": "What this value configures",
      "type": "string|path|url|number|boolean",
      "defaultValue": "sensible default",
      "required": true
    }
  ]
}

Artifact rules:
- Generate 6-12 artifacts depending on the plan complexity
- Every artifact must have FULL, real content — not stubs or TODOs
- Content should be specific to this company, industry, and their chosen tech stack option
- Use the client's actual tool names and realistic configuration values

Required artifact categories:
1. **guide** — A main README.md with setup instructions and overview
2. **guide** — A deployment/setup guide specific to their stack
3. **config** — Environment configuration template (.env.example) with documented variables
4. **config** — Docker Compose or infrastructure config if applicable
5. **spec** — Integration specification or API contracts for key integrations
6. **spec** — Data flow or architecture documentation
7. **scaffold** — Setup script (setup.sh) that automates initial configuration

Optional (include if relevant to the plan):
- Migration scripts for moving data between systems
- Webhook configuration files
- Monitoring/alerting configuration
- Security checklist or compliance documentation

configValues should list every value the client needs to fill in before deploying (database URLs, API keys, service endpoints, etc). Use {{CONFIG:KEY_NAME}} placeholders in artifact content where these values go.

Return ONLY the JSON object.`;
}
