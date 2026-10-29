import type { InferUITools, UIDataTypes, UIMessage } from "ai";
// Type-only import: erased at build, so the server-only tool code (and its DB
// imports) never reaches the client bundle, while the tool part types do.
import type { domainTools } from "../domains/registry.server";

export type GoailsUITools = InferUITools<typeof domainTools>;

/** The typed message shape shared by the /api/query route and the client. */
export type GoailsUIMessage = UIMessage<unknown, UIDataTypes, GoailsUITools>;
