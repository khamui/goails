"use client";

import { useState } from "react";
import { useCollections } from "@/components/collections/collections-provider";
import { Button } from "@/components/ui/button";
import type { Recipe, RecipesResult } from "@/lib/domains/recipes/contract";

function RecipeCard({ recipe }: { recipe: Recipe }) {
  const { isSaved, toggleSaved } = useCollections();
  const [open, setOpen] = useState(false);
  const [servings, setServings] = useState(2);
  const [done, setDone] = useState<Set<number>>(new Set());
  const saved = isSaved(recipe.id);

  function toggleStep(index: number) {
    setDone((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  }

  return (
    <div className="space-y-2 rounded-lg border border-border p-4">
      <div className="flex items-baseline justify-between gap-2">
        <h3 className="font-medium leading-tight">{recipe.title}</h3>
        <span className="whitespace-nowrap text-xs text-muted-foreground">
          {recipe.cuisine} · {recipe.minutes} min
        </span>
      </div>
      <p className="text-sm text-muted-foreground">{recipe.description}</p>
      {recipe.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {recipe.tags.slice(0, 5).map((tag) => (
            <span
              key={tag}
              className="rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="flex gap-2">
        <Button size="sm" variant="outline" type="button" onClick={() => setOpen((o) => !o)}>
          {open ? "Hide recipe" : "View recipe"}
        </Button>
        <Button
          size="sm"
          variant={saved ? "secondary" : "outline"}
          type="button"
          aria-pressed={saved}
          onClick={() => toggleSaved(recipe)}
        >
          {saved ? "Saved ✓" : "Save"}
        </Button>
      </div>

      {open && (
        <div className="space-y-3 pt-2">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Servings</span>
            <Button
              size="sm"
              variant="outline"
              type="button"
              aria-label="Fewer servings"
              onClick={() => setServings((s) => Math.max(1, s - 1))}
            >
              −
            </Button>
            <span className="w-6 text-center tabular-nums">{servings}</span>
            <Button
              size="sm"
              variant="outline"
              type="button"
              aria-label="More servings"
              onClick={() => setServings((s) => s + 1)}
            >
              +
            </Button>
          </div>

          <div>
            <h4 className="text-sm font-medium">Ingredients</h4>
            <ul className="mt-1 list-disc pl-5 text-sm text-muted-foreground">
              {recipe.ingredients.map((ingredient, index) => (
                <li key={index}>{ingredient}</li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-medium">Steps</h4>
            <ol className="mt-1 space-y-1 text-sm">
              {recipe.steps.map((step, index) => (
                <li key={index}>
                  <label className="flex items-start gap-2">
                    <input
                      type="checkbox"
                      className="mt-1"
                      checked={done.has(index)}
                      onChange={() => toggleStep(index)}
                    />
                    <span className={done.has(index) ? "text-muted-foreground line-through" : ""}>
                      {step}
                    </span>
                  </label>
                </li>
              ))}
            </ol>
          </div>
        </div>
      )}
    </div>
  );
}

/** The Recipes Surface: interactive recipe cards grounded by RAG retrieval. */
export function RecipesSurface({ recipes }: RecipesResult) {
  if (recipes.length === 0) {
    return <p className="text-sm text-muted-foreground">No matching recipes.</p>;
  }
  return (
    <div className="space-y-3">
      {recipes.map((recipe) => (
        <RecipeCard key={recipe.id} recipe={recipe} />
      ))}
    </div>
  );
}
