# Qdrant RAG API Contract

## Document Ingestion API

### POST /api/v1/ingest
**Description**: Ingest a document into the Qdrant vector database

**Request**:
- Method: POST
- Path: /api/v1/ingest
- Content-Type: multipart/form-data
- Headers:
  - Authorization: Bearer {token} (optional, no auth required per spec)
- Body:
  - file: File (document to ingest)
  - collection: String (optional, defaults to main collection)

**Response**:
- 200: Document successfully ingested
  ```json
  {
    "document_id": "uuid-string",
    "chunks_count": 15,
    "status": "completed",
    "message": "Document successfully ingested and indexed"
  }
  ```
- 400: Invalid request (file too large, unsupported format)
  ```json
  {
    "error": "Invalid file format or size exceeds 10MB limit"
  }
  ```
- 422: File processing error
  ```json
  {
    "error": "Could not process the uploaded file"
  }
  ```
- 500: Server error
  ```json
  {
    "error": "Internal server error during ingestion"
  }
  ```

## Document Retrieval API

### POST /api/v1/retrieve
**Description**: Retrieve relevant document chunks based on user query

**Request**:
- Method: POST
- Path: /api/v1/retrieve
- Content-Type: application/json
- Headers:
  - Authorization: Bearer {token} (optional, no auth required per spec)
- Body:
  ```json
  {
    "query": "user query text",
    "top_k": 5,
    "collection": "documents"
  }
  ```

**Response**:
- 200: Successful retrieval
  ```json
  {
    "query": "user query text",
    "results": [
      {
        "chunk_id": "uuid-string",
        "document_id": "uuid-string",
        "content": "relevant text content...",
        "relevance_score": 0.85,
        "metadata": {
          "chunk_index": 2,
          "source_file": "document.pdf"
        }
      }
    ],
    "query_embedding": [0.1, 0.3, 0.5, ...],
    "total_results": 5
  }
  ```
- 400: Invalid query
  ```json
  {
    "error": "Query cannot be empty"
  }
  ```
- 500: Server error
  ```json
  {
    "error": "Internal server error during retrieval"
  }
  ```

## Health Check API

### GET /api/v1/health
**Description**: Check the health of the Qdrant connection

**Request**:
- Method: GET
- Path: /api/v1/health
- Headers: None required

**Response**:
- 200: Service healthy
  ```json
  {
    "status": "healthy",
    "qdrant_connection": "connected",
    "timestamp": "2025-12-12T10:00:00Z"
  }
  ```
- 503: Service unhealthy
  ```json
  {
    "status": "unhealthy",
    "qdrant_connection": "disconnected",
    "error": "Cannot connect to Qdrant service"
  }
  ```