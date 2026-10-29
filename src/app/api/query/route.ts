import {
  convertToModelMessages,
  createUIMessageStreamResponse,
  toUIMessageStream,
} from "ai";
import { handleQuery } from "@/lib/ai/handle-query";
import { resolveModel } from "@/lib/ai/provider";
import type { GoailsUIMessage } from "@/lib/ai/ui";
import { domainTools } from "@/lib/domains/registry.server";

export async function POST(request: Request) {
  const { messages } = (await request.json()) as { messages: GoailsUIMessage[] };

  const result = handleQuery({
    messages: await convertToModelMessages(messages),
    model: resolveModel(),
    tools: domainTools,
  });

  return createUIMessageStreamResponse({
    stream: toUIMessageStream({ stream: result.stream }),
  });
}
