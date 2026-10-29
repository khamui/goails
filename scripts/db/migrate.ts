import { readFileSync } from "node:fs";
import { closeDb, getDb } from "../../src/lib/db/client";

process.loadEnvFile(".env.local");

async function main() {
  const ddl = readFileSync("src/lib/db/schema.sql", "utf8");
  const sql = getDb();
  await sql.unsafe(ddl); // simple protocol: runs the multi-statement DDL
  console.log("✓ schema applied (pgvector + products + recipes)");
  await closeDb();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
