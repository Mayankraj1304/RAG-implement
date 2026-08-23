import { PDFParse } from "pdf-parse";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { MistralAIEmbeddings } from "@langchain/mistralai";
import dotenv from "dotenv";
import { Pinecone } from "@pinecone-database/pinecone";
import fs from "fs";
dotenv.config();

const embeddingModel = new MistralAIEmbeddings({
  apiKey: process.env.MISTRAL_API_KEY,
  model: "mistral-embed",
});
const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
const index = pc.index("rag-implementation");

let dataBuffer = fs.readFileSync("./story.pdf");
const parser = new PDFParse({
  data: dataBuffer,
});
const data = await parser.getText();
console.log(data);

const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 500,
  chunkOverlap: 0,
});
const chunks = await splitter.splitText(data.text);
console.log(chunks);

const docs = await Promise.all(
  chunks.map(async (chunk) => {
    const embedding = await embeddingModel.embedQuery(chunk);
    return {
      text: chunk,
      embedding,
    };
  }),
);
console.log(docs);

const result = await index.upsert({
  records: docs.map((doc, i) => ({
    id: `doc-${i}`,
    values: doc.embedding,
    metadata: {
      text: doc.text,
    },
  })),
});

const queryEmbedding = await embeddingModel.embedQuery(
  "how was the internship experience?",
);
console.log(queryEmbedding);

const response = await index.query({
  vector: queryEmbedding,
  topK: 2,
  includeMetadata: true,
});

console.log(JSON.stringify(response));
