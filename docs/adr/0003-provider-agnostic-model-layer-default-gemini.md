# Provider-agnostic model layer, default to free Gemini

The AI layer is written against the Vercel AI SDK's provider interface so the generation/routing model is a one-line swap, and it defaults to **Google Gemini Flash (free tier)** with **Claude Sonnet** kept as a swappable alternative. Recipe embeddings likewise use **Gemini embeddings (free tier)**. The driver is cost: the prototype must run at $0 with no credit card and without drawing on the author's Claude Pro subscription (which is a separate product from the API and cannot fund it anyway).

## Status

accepted

## Considered options

- **Provider-agnostic, default Gemini free (chosen).** Zero cost, no card, single Google key for both generation and embeddings; provider abstraction is itself a best practice to learn; Claude remains a flip-the-switch option on its ~$5 trial credit.
- **Claude Sonnet 5.5 only.** The original "learn Claude" plan, but runs down a small trial credit and likely needs a card for sustained use.
- **Gemini only, hard-coded.** Cheapest to write but forfeits the portability lesson and the ability to compare providers.

## Consequences

Model-specific code (prompts, tool definitions) must stay within what both providers support — standard tool calling and streaming, which both do. Gemini's free tier is rate-limited (~10 req/min, ~1,500/day) and its free-tier data may be used to improve Google products; acceptable for a mock-data prototype. ADR-0001 (tool-per-domain generative UI) is provider-neutral and unaffected.
