# Goails

An AI-driven app where a user's natural-language request is routed to the single best-fitting result domain and rendered as a purpose-built, interactive component. A prototype for learning AI-integration best practices, built as if it were a real product.

## Request → result pipeline

**Query**:
A user's natural-language request, typed into the prompt bar. The sole input to the pipeline.
_Avoid_: prompt, search term, message

**Domain**:
One bounded result type the app can answer — Products, Recipes, Flights, Jobs. Each Domain owns exactly one Tool, one Surface Contract, and one Surface.
_Avoid_: vertical, category, type

**Intent**:
The Domain the Router judges a Query to belong to. One Query resolves to one Intent (for now).
_Avoid_: classification, label

**Router**:
The AI step — a single tool-calling pass — that reads a Query and chooses which Domain's Tool to call. Routing *is* the tool choice; there is no separate classifier.
_Avoid_: classifier, dispatcher, orchestrator

**Tool**:
The per-Domain function the model calls to fetch structured results for a Query. Its output is validated by that Domain's Surface Contract.
_Avoid_: function, endpoint, handler

## Rendering and interaction

**Surface Contract**:
The Zod schema that defines a Domain's Tool output, and therefore its Surface's props. The single source of truth for a Domain's shape.
_Avoid_: payload type, DTO, response type

**Surface**:
The purpose-built interactive component that renders one Domain's results. Its props are the inferred type of that Domain's Surface Contract.
_Avoid_: card, widget, result view, component

**Action**:
An interactive operation a user performs inside a Surface — buy, apply, save, book. Fully implemented as UX and stateful, but its proprietary/external leg (payment, real submission) is simulated.
_Avoid_: transaction, flow, mutation
