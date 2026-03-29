# Business Process Modernization Tool

## What This Is

A redistributable "consulting-in-a-box" platform that takes a business client from discovery through to deliverable modernization artifacts. Designed for a **single consultant** using AI-assisted development — no team sizing, labor hours, or hourly estimates anywhere in the system.

The tool analyzes a client's current business processes, tech stack, and pain points, then uses AI to generate recommendations, implementation plans, and ready-to-deploy solution packages (ZIP files with configs, scripts, guides, and specs).

## Business Model

- The consultant charges a **flat fee** per engagement
- Recommendations present **two options**: Current Stack (~$0 licensing) vs Improved Stack (with realistic licensing costs)
- The client picks an option, and the tool generates a tailored deliverable package

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) + TypeScript |
| UI | Tailwind CSS + shadcn/ui |
| State | Zustand |
| AI | Claude API (`@anthropic-ai/sdk`) — model: `claude-sonnet-4-6` |
| Database | SQLite + Prisma ORM (zero-config, file-based) |
| Package Gen | `archiver` (ZIP creation) |
| Doc Processing | `pdf-parse`, `mammoth` (docx), `xlsx` |

## Project Phases (User Flow)

Each project moves through these phases in order:

1. **Discovery** (`/projects/[id]/discovery`) — Client intake forms: business profile, pain points, workflows, tech stack
2. **Documents** (`/projects/[id]/documents`) — Upload supporting docs (PDF, DOCX, XLSX). Auto-extracted via Node.js parsers
3. **Analysis** (`/projects/[id]/analysis`) — AI analyzes current state, scores maturity, identifies gaps
4. **Recommendations** (`/projects/[id]/recommendations`) — AI generates scored/categorized recommendations (quick wins, medium effort, transformational) with impact/effort matrix
5. **Plan** (`/projects/[id]/plan`) — User selects recommendations, AI builds phased implementation plan with two stack options
6. **Build & Package** (`/projects/[id]/build`) — AI generates deliverable artifacts (configs, guides, specs, scaffolds), bundled as a downloadable ZIP
7. **Customize** (`/projects/[id]/customize`) — Feedback and refinement layer

## Key Architecture Decisions

### AI Client (`src/lib/ai-client.ts`)

- Uses **tool_use with forced tool_choice** for guaranteed valid JSON output
- `aiJsonRequest<T>()` accepts an optional `toolSchema` parameter for callers that need explicit field guidance
- The build endpoint passes a full JSON schema defining required fields (`artifacts`, `configValues`) because the permissive default schema causes the AI to omit large arrays
- `aiTextRequest()` available for plain text responses

### Database

- All JSON fields stored as `String` in SQLite and parsed at runtime with `safeParse()`
- Prisma schema at `prisma/schema.prisma`
- Run `npx prisma db push` to sync schema, `npx prisma studio` to browse data

### Package Generation (`src/lib/package-generator.ts`)

- Uses `archiver` to create ZIP buffers in memory
- Artifacts organized into category folders: `guides/`, `configs/`, `specs/`, `scaffolds/`, `reports/`, `other/`
- Includes `config.json`, `CONFIG.md`, and `manifest.json` automatically
- ZIPs saved to `uploads/packages/`

### Logging

- File-based logging with rotation at `logs/app.log`
- Client-side errors POST to `/api/log`
- `log()` and `logError()` from `src/lib/logger.ts`

## API Routes

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/projects` | GET/POST | List/create projects |
| `/api/projects/[id]` | GET/PATCH/DELETE | Project CRUD |
| `/api/projects/[id]/discovery` | GET/POST | Discovery data |
| `/api/projects/[id]/documents` | GET/POST | Document upload |
| `/api/projects/[id]/documents/extract` | POST | Extract text from docs |
| `/api/projects/[id]/analyze` | POST | Run AI analysis |
| `/api/projects/[id]/recommendations` | GET/POST | Get/generate recommendations |
| `/api/projects/[id]/plan` | GET/POST | Get/generate implementation plan |
| `/api/projects/[id]/build` | GET/POST | Get/generate deliverable package |
| `/api/projects/[id]/build/download` | GET | Download ZIP |
| `/api/projects/[id]/research` | POST | AI research endpoint |

## AI Prompts (`src/lib/prompts/`)

| File | Purpose |
|------|---------|
| `analyze-business.ts` | Current state assessment + maturity scores |
| `generate-recommendations.ts` | Scored/categorized recommendations |
| `identify-gaps.ts` | Flag missing/ambiguous information |
| `build-implementation-plan.ts` | Phased plan with current vs improved stack options |
| `generate-artifacts.ts` | Deliverable configs, scripts, guides, specs |

## Common Commands

```bash
# Development
npx next dev

# Database
npx prisma db push      # Sync schema to SQLite
npx prisma studio        # Browse data in browser
npx prisma generate      # Regenerate client after schema changes

# Build
npm run build
```

## Known Gotchas

- The AI model (`claude-sonnet-4-6`) does **not** support assistant message prefill — use tool_use instead
- Build/package generation needs an explicit `toolSchema` passed to `aiJsonRequest` because the large artifact payload gets truncated with the default permissive schema
- JSON fields in the database are stored as strings — always use `safeParse()` or `JSON.parse()` with error handling
- If the UI shows stale errors after code changes, clear the `.next` directory and hard-refresh the browser
- `uploads/` directory is gitignored — created at runtime for document and package storage

## Environment Variables

```
DATABASE_URL="file:./dev.db"
ANTHROPIC_API_KEY="your-api-key-here"
```

## Branch

Active development branch: `claude/business-analysis-tool-WZJYn`
