// Load .env.local so integration tests (e.g. pgvector retrieval) see
// DATABASE_URL and the model keys. Absent in CI → those tests skip.
try {
  process.loadEnvFile(".env.local");
} catch {
  // no .env.local present; integration tests guard on the env themselves
}
