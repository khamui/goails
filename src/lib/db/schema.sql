-- Goails data schema. Idempotent: safe to run repeatedly.
-- pgvector is available on the instance; enable it here (ADR: RAG on recipes).
CREATE EXTENSION IF NOT EXISTS vector;

-- Products: plain attribute/text filtering, no embeddings.
CREATE TABLE IF NOT EXISTS products (
  id           text PRIMARY KEY,
  name         text    NOT NULL,
  description  text    NOT NULL,
  category     text    NOT NULL,
  price_cents  integer NOT NULL,
  currency     text    NOT NULL DEFAULT 'EUR',
  tags         text[]  NOT NULL DEFAULT '{}'
);

-- Recipes: carry a Gemini embedding (gemini-embedding-001 -> 3072 dims) for
-- semantic retrieval. 3072 exceeds pgvector's index limit (2000), but for a
-- small corpus a sequential cosine scan is instant, so no index is needed.
CREATE TABLE IF NOT EXISTS recipes (
  id           text PRIMARY KEY,
  title        text    NOT NULL,
  description  text    NOT NULL,
  cuisine      text    NOT NULL,
  ingredients  text[]  NOT NULL,
  steps        text[]  NOT NULL,
  minutes      integer NOT NULL,
  tags         text[]  NOT NULL DEFAULT '{}',
  embedding    vector(3072)
);
