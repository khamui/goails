"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function Home() {
  const [query, setQuery] = useState("");

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    // No AI behavior yet: the handleQuery seam and streaming arrive in a later ticket.
  }

  return (
    <main className="flex flex-1 items-center justify-center p-4">
      <div className="w-full max-w-xl space-y-6 text-center">
        <div className="space-y-2">
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
          />
          <Button type="submit" disabled={!query.trim()}>
            Ask
          </Button>
        </form>
      </div>
    </main>
  );
}
