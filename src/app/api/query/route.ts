import {
  createTextStreamResponse,
  toTextStream,
  type ModelMessage,
} from "ai";
import { handleQuery } from "@/lib/ai/handle-query";
import { resolveModel } from "@/lib/ai/provider";

interface QueryRequest {
  query?: unknown;
  history?: ModelMessage[];
}

export async function POST(request: Request) {
  const body = (await request.json()) as QueryRequest;

  if (typeof body.query !== "string" || body.query.trim() === "") {
    return new Response("A non-empty 'query' string is required.", {
      status: 400,
    });
  }

  const result = handleQuery({
    query: body.query,
    history: body.history,
    model: resolveModel(),
  });

  return createTextStreamResponse({
    stream: toTextStream({ stream: result.stream }),
  });
}
