import express from "express";
import { MistralAIEmbeddings, ChatMistralAI } from "@langchain/mistralai";
import { Pinecone } from "@pinecone-database/pinecone";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());
app.use(express.static("public")); // serves index.html

const embeddingModel = new MistralAIEmbeddings({
  apiKey: process.env.MISTRAL_API_KEY,
  model: "mistral-embed",
});

const chatModel = new ChatMistralAI({
  apiKey: process.env.MISTRAL_API_KEY,
  model: "mistral-small-latest",
  temperature: 0.2,
});

const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
const index = pc.index("rag-implementation");

// Same working as main.js: embed query -> Pinecone topK query -> use matches as context
app.post("/api/query", async (req, res) => {
  try {
    const { question } = req.body;

    if (!question || typeof question !== "string" || !question.trim()) {
      return res.status(400).json({ error: "Question is required." });
    }

    // 1. Embed the user query (same as main.js)
    const queryEmbedding = await embeddingModel.embedQuery(question);

    // 2. Query Pinecone (same as main.js)
    const searchResult = await index.query({
      vector: queryEmbedding,
      topK: 2,
      includeMetadata: true,
    });

    const matches = searchResult.matches || [];
    const contextText = matches
      .map((m) => m.metadata?.text)
      .filter(Boolean)
      .join("\n\n");

    // 3. Generate a response using Mistral chat model, grounded in retrieved context
    const prompt = `You are a helpful assistant. Answer the user's question using ONLY the context below. If the answer isn't in the context, say you don't know.

Context:
${contextText || "No relevant context found."}

Question: ${question}

Answer:`;

    const chatResponse = await chatModel.invoke(prompt);

    res.json({
      answer: chatResponse.content,
      matches: matches.map((m) => ({
        id: m.id,
        score: m.score,
        text: m.metadata?.text,
      })),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong processing your query." });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
