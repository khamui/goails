# Goails

An AI app where a natural-language **Query** is routed to the best-fitting result
**Domain** and rendered as a purpose-built, interactive **Surface** (products,
recipes, and more). A prototype for learning AI-integration best practices,
built as if it were a real product. See `GLOSSARY.md` and `docs/adr/` for the
domain language and the decisions behind it.

## Prerequisites

- Node.js 24+
- A free Google Gemini API key (no credit card) — the setup wizard gets you there
- Postgres with the pgvector extension — Neon's free tier, or local Docker
  (the wizard sets either up)

## Setup

Run the setup wizard from the repo root. It walks you through getting a Gemini
API key and a Postgres + pgvector database, and writes them to `.env.local`
(gitignored):

```bash
bash scripts/setup-dev.sh
```

`.env.example` documents every variable if you'd rather fill `.env.local` by hand.
The model layer is provider-agnostic (ADR-0003): it defaults to free Gemini, and
switches to Claude by setting `GOAILS_MODEL_PROVIDER=anthropic` + `ANTHROPIC_API_KEY`.

## Scripts

```bash
npm run dev        # start the dev server (http://localhost:3000)
npm run build      # production build
npm run lint       # eslint
npm run typecheck  # next typegen && tsc --noEmit
npm test           # run the test suite (vitest)
npm run db:setup   # migrate + seed the database (run once after setup)
npm run eval       # run the Evalite routing + quality eval (needs a seeded DB + key)
npm run eval:watch # Evalite dashboard with live re-runs
```

## Evals

`evals/routing.eval.ts` runs the real Router over a labeled Query→Domain set and
scores it with two scorers: **Routing accuracy** (exact match) and **Relevance**
(an LLM-as-judge). It's how routing/clarification quality gets measured instead
of eyeballed.

> The eval makes many model calls at once; on the Gemini **free tier** some rows
> can hit the per-minute quota and error. Re-run after a minute, lower the
> dataset size, or use a paid/less-limited key for a full clean run.
