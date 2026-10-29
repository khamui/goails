"use client";

import type { ReactNode } from "react";
import { CollectionsProvider } from "@/components/collections/collections-provider";

export function Providers({ children }: { children: ReactNode }) {
  return <CollectionsProvider>{children}</CollectionsProvider>;
}
