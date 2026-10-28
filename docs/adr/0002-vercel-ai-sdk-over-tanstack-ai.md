# Vercel AI SDK over TanStack AI

We use the Vercel AI SDK as the AI layer rather than TanStack AI. The goal of this repo is learning AI-integration best practices, and the Vercel SDK is stable with by far the deepest pool of tutorials, examples, and prebuilt chat UI (AI Elements) to learn from; TanStack AI, though more ergonomic (isomorphic tools, no vendor lock-in), was still a release candidate with thin docs when we chose.

## Status

accepted

## Consequences

Both libraries now converge on the same generative-UI pattern (tool calls + client-side rendering), since the Vercel SDK's React Server Components path is on hold. That makes this choice relatively reversible — a future migration to TanStack AI is a port, not a redesign — and worth revisiting once TanStack AI is stable.
