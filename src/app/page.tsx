"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ProductsSurface } from "@/components/surfaces/products-surface";
import { RecipesSurface } from "@/components/surfaces/recipes-surface";
import type { GoailsUIMessage } from "@/lib/ai/ui";

export default function Home() {
  const [input, setInput] = useState("");
  const { messages, sendMessage, status } = useChat<GoailsUIMessage>({
    transport: new DefaultChatTransport({ api: "/api/query" }),
  });
  const isBusy = status === "submitted" || status === "streaming";

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
        <header className="space-y-2 pt-8 text-center">
          <h1 className="text-3xl font-semibold tracking-tight">Goails</h1>
          <p className="text-muted-foreground">
            Ask for anything — products, recipes, and more.
          </p>
        </header>

        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="e.g. a laptop under €1000"
            aria-label="Query"
            disabled={isBusy}
          />
          <Button type="submit" disabled={isBusy || !input.trim()}>
            {isBusy ? "…" : "Ask"}
          </Button>
        </form>

        <div className="space-y-6">
          {messages.map((message) => (
            <div key={message.id} className="space-y-2">
              {message.parts.map((part, index) => {
                if (part.type === "text") {
                  return (
                    <p
                      key={index}
                      className={
                        message.role === "user"
                          ? "text-right text-sm text-muted-foreground"
                          : "text-sm whitespace-pre-wrap"
                      }
                    >
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
                      return (
                        <ProductsSurface key={index} products={part.output.products} />
                      );
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
                      return (
                        <RecipesSurface key={index} recipes={part.output.recipes} />
                      );
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
              })}
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
