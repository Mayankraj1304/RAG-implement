import pdf from "pdf-parse";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { MistralAIEmbeddings } from "@langchain/mistralai";
import { Pinecone } from "@pinecone-database/pinecone";
import dotenv from "dotenv";
import fs from "fs";
import { createHash } from "crypto";

dotenv.config();

const embeddingModel = new MistralAIEmbeddings({
  apiKey: process.env.MISTRAL_API_KEY,
  model: "mistral-embed",
});

const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
const index = pc.index("rag-implementation");

export async function ingestDocument(dataBuffer, filename = "document.pdf") {
  const documentHash = createHash("sha256").update(dataBuffer).digest("hex");
  const documentId = `document-${documentHash}`;
  const existingDocument = await index.fetch([`${documentId}-0`]);
  if (existingDocument.records?.[`${documentId}-0`]) {
    return { documentId, filename, chunks: 0, alreadyIngested: true };
  }

  const data = await pdf(dataBuffer);
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 500,
    chunkOverlap: 0,
  });
  const chunks = await splitter.splitText(data.text);
  if (chunks.length === 0) {
    throw new Error("The PDF does not contain extractable text.");
  }
  const docs = await Promise.all(
    chunks.map(async (chunk) => ({
      text: chunk,
      embedding: await embeddingModel.embedQuery(chunk),
    })),
  );

  await index.upsert(
    docs.map((doc, i) => ({
      id: `${documentId}-${i}`,
      values: doc.embedding,
      metadata: {
        text: doc.text,
        documentId,
        documentHash,
        filename,
      },
    })),
  );

  return { documentId, filename, chunks: docs.length };
}

