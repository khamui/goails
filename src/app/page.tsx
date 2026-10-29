"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CollectionsBar } from "@/components/collections/collections-bar";
import { ProductsSurface } from "@/components/surfaces/products-surface";
import { RecipesSurface } from "@/components/surfaces/recipes-surface";
import type { GoailsUIMessage } from "@/lib/ai/ui";

type MessagePart = GoailsUIMessage["parts"][number];

function renderPart(part: MessagePart, index: number) {
  if (part.type === "text") {
    return (
      <p key={index} className="text-sm whitespace-pre-wrap">
        {part.text}
      </p>
    );
  }

  if (part.type === "tool-searchProducts") {
    switch (part.state) {
      case "input-streaming":
      case "input-available":
        return (
          <p key={index} className="text-sm text-muted-foreground">
            Searching products…
          </p>
        );
      case "output-available":
        return <ProductsSurface key={index} products={part.output.products} />;
      case "output-error":
        return (
          <p key={index} className="text-sm text-destructive">
            Error: {part.errorText}
          </p>
        );
      default:
        return null;
    }
  }

  if (part.type === "tool-searchRecipes") {
    switch (part.state) {
      case "input-streaming":
      case "input-available":
        return (
          <p key={index} className="text-sm text-muted-foreground">
            Finding recipes…
          </p>
        );
      case "output-available":
        return <RecipesSurface key={index} recipes={part.output.recipes} />;
      case "output-error":
        return (
          <p key={index} className="text-sm text-destructive">
            Error: {part.errorText}
          </p>
        );
      default:
        return null;
    }
  }

  return null;
}

function textOf(message: GoailsUIMessage): string {
  return message.parts.map((part) => (part.type === "text" ? part.text : "")).join("");
}

export default function Home() {
  const [input, setInput] = useState("");
  const { messages, sendMessage, status } = useChat<GoailsUIMessage>({
    transport: new DefaultChatTransport({ api: "/api/query" }),
  });
  const isBusy = status === "submitted" || status === "streaming";

  // In-place active Surface: show only the latest turn. Refinement ("cheaper",
  // "make it vegetarian") re-runs the Router with the full history and replaces
  // the result, rather than appending. The whole conversation is still sent to
  // the model for context.
  const reversed = [...messages].reverse();
  const activeQuery = reversed.find((message) => message.role === "user");
  const activeResult = reversed.find((message) => message.role === "assistant");

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const text = input.trim();
    if (!text || isBusy) return;
    sendMessage({ text });
    setInput("");
  }

  return (
    <main className="flex flex-1 flex-col items-center p-4">
      <div className="w-full max-w-2xl space-y-6">
        <CollectionsBar />
        <header className="space-y-2 text-center">
          <h1 className="text-3xl font-semibold tracking-tight">Goails</h1>
          <p className="text-muted-foreground">
            Ask for anything — products, recipes, and more.
          </p>
        </header>

        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="e.g. a laptop under €1000 — then refine: “cheaper”"
            aria-label="Query"
            disabled={isBusy}
          />
          <Button type="submit" disabled={isBusy || !input.trim()}>
            {isBusy ? "…" : "Ask"}
          </Button>
        </form>

        {activeQuery && (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              You asked:{" "}
              <span className="text-foreground">“{textOf(activeQuery)}”</span>
            </p>
            {status === "submitted" ? (
              <p className="text-sm text-muted-foreground">Thinking…</p>
            ) : (
              activeResult && (
                <div className="space-y-2">{activeResult.parts.map(renderPart)}</div>
              )
            )}
          </div>
        )}
      </div>
    </main>
  );
}
