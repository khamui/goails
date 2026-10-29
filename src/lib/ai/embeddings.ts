import { google } from "@ai-sdk/google";
import { embed, embedMany } from "ai";

/** gemini-embedding-001 produces 3072-dimensional vectors. */
export const EMBEDDING_DIMENSIONS = 3072;

function embeddingModel() {
  const id = process.env.GOAILS_EMBEDDING_MODEL ?? "gemini-embedding-001";
  return google.textEmbeddingModel(id);
}

/** Embed a single text (e.g. a Query) into a vector. */
export async function embedText(text: string): Promise<number[]> {
  const { embedding } = await embed({ model: embeddingModel(), value: text });
  return embedding;
}

/** Embed many texts in as few requests as the provider allows. */
export async function embedTexts(values: string[]): Promise<number[][]> {
  const { embeddings } = await embedMany({ model: embeddingModel(), values });
  return embeddings;
}

/** pgvector accepts a vector as the text literal `[v1,v2,...]`. */
export function toVectorLiteral(vector: number[]): string {
  return `[${vector.join(",")}]`;
}
