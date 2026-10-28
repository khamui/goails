# Generative UI via one Zod-typed tool per domain

Each result Domain is exposed to the model as exactly one Tool whose output is validated by a Zod Surface Contract; the Router is a single tool-calling pass, and the client renders the Surface keyed to whichever Tool the model called, typed from that Contract. Adding a Domain therefore means adding one `{ Zod schema + tool + surface component }` triple and nothing else.

## Status

accepted

## Considered options

- **One tool per domain (chosen).** Canonical Vercel AI SDK generative-UI pattern; routing and fetching happen in a single model pass; the schema is the single source of truth for both tool output and component props.
- **Classify-then-fetch.** A first model call labels the intent, then our code calls a domain fetcher. Rejected: two hops, less idiomatic, and the intent label and the fetch can drift apart.

## Consequences

The Zod schema per Domain is load-bearing: it is simultaneously the model's tool-output contract, the runtime validation boundary, and the Surface's prop type. A single Query resolves to a single Surface today; the response is modelled as a list of surfaces (length 1) so blended multi-domain results are a later change, not a rewrite.
