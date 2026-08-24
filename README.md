# 📚 RAG Implementation - Intelligent Document Q&A System

A powerful Retrieval-Augmented Generation (RAG) system that enables intelligent question-answering over PDF documents using semantic search, advanced embeddings, and large language models.

**Upload PDFs → Extract & Chunk → Generate Embeddings → Semantic Search → Context-Grounded Answers**

---

## ✨ Features

- 📄 **PDF Document Ingestion** - Upload and automatically process PDF documents
- 🔍 **Semantic Search** - Find relevant content using vector embeddings
- 🧠 **AI-Powered Responses** - Generate context-grounded answers using Mistral AI
- 🚀 **Fast Vector Database** - Powered by Pinecone for low-latency similarity search
- 💾 **Duplicate Detection** - Automatic hash-based duplicate document checking
- 🛡️ **Type-Safe Processing** - Built with LangChain and modern JavaScript/ES modules
- 🎨 **Web Interface** - Clean, intuitive UI for document upload and querying

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Backend** | Node.js, Express.js |
| **AI/ML** | Mistral AI (LLM & Embeddings), LangChain |
| **Vector DB** | Pinecone |
| **Document Processing** | pdf-parse, RecursiveCharacterTextSplitter |
| **Frontend** | HTML5 with static file serving |
| **File Upload** | Multer (10MB max) |
| **Environment** | dotenv |

---

## 📋 Prerequisites

Before you begin, ensure you have:

- **Node.js** 16+ installed ([Download](https://nodejs.org/))
- **npm** or **yarn** package manager
- **Mistral AI API Key** ([Get here](https://console.mistral.ai/))
- **Pinecone Account & API Key** ([Sign up](https://www.pinecone.io/))
- A Pinecone index named `rag-implementation`

---

## 🚀 Installation

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/rag-implement.git
cd rag-implement
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Set Up Environment Variables

Create a `.env` file in the project root:

```env
MISTRAL_API_KEY=your_mistral_api_key_here
PINECONE_API_KEY=your_pinecone_api_key_here
PORT=3000
```

### 4. Start the Server
```bash
npm start
```

The server will start on `http://localhost:3000`

---

## 📖 Usage

### Web Interface
1. Open `http://localhost:3000` in your browser
2. Upload a PDF document using the upload form
3. Wait for the document to be processed (text extraction, chunking, embedding)
4. Ask questions about the document content
5. Receive context-grounded answers from the AI

### API Endpoints

#### **POST /api/ingest**
Upload and process a PDF document.

**Request:**
```bash
curl -X POST -F "document=@sample.pdf" http://localhost:3000/api/ingest
```

**Response:**
```json
{
  "documentId": "document-abc123...",
  "filename": "sample.pdf",
  "chunks": 15,
  "alreadyIngested": false
}
```

**Error Response:**
```json
{
  "error": "Only PDF documents are supported."
}
```

---

#### **POST /api/query**
Ask a question about ingested documents.

**Request:**
```bash
curl -X POST http://localhost:3000/api/query \
  -H "Content-Type: application/json" \
  -d '{"question": "What is the main topic of the document?"}'
```

**Response:**
```json
{
  "answer": "The main topic of the document is...",
  "matches": [
    {
      "id": "document-abc123...-0",
      "score": 0.87,
      "metadata": {
        "text": "Relevant text excerpt...",
        "documentId": "document-abc123...",
        "filename": "sample.pdf"
      }
    }
  ]
}
```

---

## 🏗️ Project Structure

```
rag-implement/
├── server.js              # Express server & API endpoints
├── ingestion.js           # PDF processing & Pinecone indexing
├── package.json           # Dependencies & scripts
├── .env                   # Environment variables (create this)
├── .gitignore            # Git ignore rules
├── README.md             # This file
└── public/
    └── index.html        # Web interface
```

---

## 🔧 How It Works

### Document Ingestion Flow
```
1. PDF Upload → 2. Extract Text → 3. Split Chunks → 4. Generate Embeddings → 5. Store in Pinecone
```

- **Chunk Size:** 500 characters per chunk
- **Overlap:** 0 characters (no redundancy)
- **Embedding Model:** Mistral Embed
- **Duplicate Prevention:** SHA-256 hash-based detection

### Query Flow
```
1. User Question → 2. Embed Query → 3. Pinecone Search (Top-K) → 4. Build Context → 5. Mistral AI Response
```

- **Search Strategy:** Top 2 most similar chunks retrieved
- **LLM Model:** Mistral Small (Latest)
- **Temperature:** 0.2 (deterministic responses)
- **Context Window:** All retrieved matches included

---

## 📊 Configuration

### Model Settings
- **Embedding Model:** `mistral-embed`
- **Chat Model:** `mistral-small-latest`
- **LLM Temperature:** `0.2` (Lower = more deterministic)

### Pinecone Settings
- **Index Name:** `rag-implementation`
- **Dimension:** Auto-detected from embeddings
- **Metric:** Cosine similarity (default)

### File Upload Settings
- **Max File Size:** 10MB
- **Supported Format:** PDF only
- **Storage Type:** Memory (temporary, not persisted to disk)

---

## 🤝 Contributing

Contributions are welcome! Here's how to help:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 🔐 Security Notes

- ⚠️ **Never commit `.env`** - Add it to `.gitignore`
- 🔑 Keep API keys private
- 📄 Be mindful of PDF file sizes (10MB limit)
- 🛡️ Validate user inputs in production

---

## 🐛 Troubleshooting

### "API Key not found"
- Ensure `.env` file exists in project root
- Verify `MISTRAL_API_KEY` and `PINECONE_API_KEY` are set correctly

### "Pinecone index not found"
- Create an index named `rag-implementation` in your Pinecone dashboard
- Verify your Pinecone API key

### "Only PDF documents are supported"
- Ensure you're uploading actual PDF files (check MIME type)

### "The PDF does not contain extractable text"
- The PDF may be image-based or corrupted
- Try another PDF or OCR the document first

---

## 📈 Future Enhancements

- [ ] Support for more document formats (DOCX, TXT, Markdown)
- [ ] Batch document processing
- [ ] Chat history & context memory
- [ ] Document metadata editing
- [ ] Advanced query filters & facets
- [ ] Streaming responses for long answers
- [ ] User authentication & multi-user support
- [ ] Rate limiting & API keys
- [ ] Analytics & usage metrics

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙋 Questions or Issues?

- 📧 Open an issue on GitHub
- 💬 Start a discussion for feature requests
- 🐦 Connect on Twitter [@yourhandle]

---

## 🙏 Acknowledgments

- [LangChain](https://js.langchain.com/) - Document processing & AI orchestration
- [Mistral AI](https://mistral.ai/) - LLM & embedding models
- [Pinecone](https://www.pinecone.io/) - Vector database
- [Express.js](https://expressjs.com/) - Web framework

---

**Made with ❤️ by [Your Name]**
