import { PDFParse } from "pdf-parse";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { MistralAIEmbeddings } from "@langchain/mistralai";
import { Pinecone } from "@pinecone-database/pinecone";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config();

const embeddingModel = new MistralAIEmbeddings({
  apiKey: process.env.MISTRAL_API_KEY,
  model: "mistral-embed",
});

const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
const index = pc.index("rag-implementation");

// 1. Read and parse the PDF
const dataBuffer = fs.readFileSync("./story.pdf");
const parser = new PDFParse({ data: dataBuffer });
const data = await parser.getText();

// 2. Split into chunks
const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 500,
  chunkOverlap: 0,
});
const chunks = await splitter.splitText(data.text);

// 3. Embed each chunk
const docs = await Promise.all(
  chunks.map(async (chunk) => {
    const embedding = await embeddingModel.embedQuery(chunk);
    return { text: chunk, embedding };
  }),
);

// 4. Upsert into Pinecone
await index.upsert({
  records: docs.map((doc, i) => ({
    id: `doc-${i}`,
    values: doc.embedding,
    metadata: {
      text: doc.text,
    },
  })),
});

console.log(`Ingestion complete: ${docs.length} chunks upserted to Pinecone.`);