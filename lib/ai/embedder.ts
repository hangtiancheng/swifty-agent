/**
 * Copyright (c) 2026 hangtiancheng
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

// Embedding via @ai-sdk/openai-compatible; provider selected by EMBEDDING_PROVIDER:
//   "openai" (default, text-embedding-v4)
import { embed, embedMany, type EmbeddingModel } from "ai";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { config } from "@/lib/config";

// Provider factory — symmetric with resolveThinkModel/resolveQuickModel in models.ts
function createEmbeddingProvider(): EmbeddingModel {
  // Default: openai (text-embedding-v4, OpenAI compatible)
  const openai = createOpenAICompatible({
    name: "openai",
    baseURL: config.openaiEmbedding.baseURL,
    apiKey: config.openaiEmbedding.apiKey,
  });
  return openai.embeddingModel(config.openaiEmbedding.model);
}

export const embeddingModel = createEmbeddingProvider();

// Get float embedding for a single text (dimension depends on the active provider)
export async function embedText(text: string): Promise<number[]> {
  const { embedding } = await embed({ model: embeddingModel, value: text });
  return embedding;
}

// Batch get embeddings.
// OpenAI-compatible endpoints cap inputs per request (text-embedding-v4 allows 10), while the SDK default is 2048 per call —
// large documents would fail with "batch size is invalid" without splitting.
const EMBED_BATCH_SIZE = 10;

export async function embedTexts(texts: string[]): Promise<number[][]> {
  const results: number[][] = [];
  for (let i = 0; i < texts.length; i += EMBED_BATCH_SIZE) {
    const { embeddings } = await embedMany({
      model: embeddingModel,
      values: texts.slice(i, i + EMBED_BATCH_SIZE),
    });
    results.push(...embeddings);
  }
  return results;
}
