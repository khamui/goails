import postgres from "postgres";

let client: ReturnType<typeof postgres> | undefined;

/**
 * Lazily-created Postgres client from DATABASE_URL. Portable (ADR-0003):
 * SSL is required for managed hosts (e.g. Neon) and off for local Postgres,
 * so the same code points at Neon now and a self-hosted VPS later.
 */
export function getDb() {
  if (client) return client;
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL is not set. Copy .env.example to .env.local and run scripts/setup-dev.sh.",
    );
  }
  const isLocal = /@(localhost|127\.0\.0\.1)[:/]/.test(url);
  client = postgres(url, { ssl: isLocal ? false : "require" });
  return client;
}

/** Close the pool (used by scripts and tests so the process can exit). */
export async function closeDb() {
  if (client) {
    await client.end();
    client = undefined;
  }
}
