# Quickstart Guide: Qdrant RAG Backend

## Prerequisites

- Python 3.11+
- pip package manager
- Qdrant Cloud account or local Qdrant instance
- Cohere API key

## Setup

1. **Install Dependencies**
   ```bash
   pip install fastapi uvicorn qdrant-client cohere python-dotenv PyPDF2 python-docx
   ```

2. **Environment Configuration**
   Create a `.env` file with the following variables:
   ```env
   QDRANT_URL=https://your-cluster-url.qdrant.tech
   QDRANT_API_KEY=your-qdrant-api-key
   COHERE_API_KEY=your-cohere-api-key
   QDRANT_HOST=localhost
   QDRANT_PORT=6333
   ```

3. **Initialize Qdrant Collection**
   The system will automatically create a "documents" collection with appropriate vector dimensions for Cohere embeddings.

## Running the Service

1. **Start the Backend Server**
   ```bash
   uvicorn main:app --host 0.0.0.0 --port 8000
   ```

2. **Verify Installation**
   Navigate to `http://localhost:8000/docs` to access the API documentation.

## Basic Usage

### 1. Ingest a Document
Upload a document to the vector database:
```bash
curl -X POST "http://localhost:8000/api/v1/ingest" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@document.pdf"
```

### 2. Retrieve Relevant Chunks
Query the system for relevant information:
```bash
curl -X POST "http://localhost:8000/api/v1/retrieve" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "your question here",
    "top_k": 5
  }'
```

## File Structure
```
backend/
├── main.py              # FastAPI application entry point
├── qdrant_retrieve.py   # Qdrant retrieval service
├── ingest.py            # Document ingestion service
├── config.py            # Configuration and settings
├── models/              # Data models and schemas
│   ├── document.py      # Document and chunk models
│   └── response.py      # API response models
├── services/            # Business logic services
│   ├── embedding.py     # Embedding generation service
│   ├── qdrant_service.py # Qdrant interaction service
│   └── document_processor.py # Document parsing service
└── utils/               # Utility functions
    ├── file_handler.py  # File handling utilities
    └── validation.py    # Validation utilities
```

## Testing
Run the test suite:
```bash
pytest tests/
```