"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function Home() {
  const [query, setQuery] = useState("");
  const [answer, setAnswer] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const trimmed = query.trim();
    if (!trimmed || isStreaming) return;

    setAnswer("");
    setIsStreaming(true);
    try {
      const response = await fetch("/api/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: trimmed }),
      });
      if (!response.ok || !response.body) {
        throw new Error(`Request failed (${response.status}).`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let received = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        received += decoder.decode(value, { stream: true });
        setAnswer(received);
      }
      if (!received) {
        setAnswer(
          "No response — the model may be busy (a 503). Check the server logs, retry, or set GOAILS_MODEL_ID=gemini-3.5-flash-lite in .env.local and restart.",
        );
      }
    } catch (error) {
      setAnswer(
        error instanceof Error ? error.message : "Something went wrong.",
      );
    } finally {
      setIsStreaming(false);
    }
  }

  return (
    <main className="flex flex-1 items-center justify-center p-4">
      <div className="w-full max-w-xl space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-semibold tracking-tight">Goails</h1>
          <p className="text-muted-foreground">
            Ask for anything — products, recipes, and more.
          </p>
        </div>
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="e.g. a warm dinner for a rainy night"
            aria-label="Query"
            disabled={isStreaming}
          />
          <Button type="submit" disabled={isStreaming || !query.trim()}>
            {isStreaming ? "…" : "Ask"}
          </Button>
        </form>
        {answer && (
          <div
            aria-live="polite"
            className="rounded-lg border border-border bg-card p-4 text-sm whitespace-pre-wrap text-card-foreground"
          >
            {answer}
          </div>
        )}
      </div>
    </main>
  );
}
