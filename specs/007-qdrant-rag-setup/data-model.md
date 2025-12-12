# Data Model: Qdrant Setup for RAG Chatbot Backend

## Document Entity

### Document
- **id**: UUID (primary identifier)
- **filename**: String (original file name)
- **file_path**: String (storage location)
- **file_size**: Integer (size in bytes)
- **file_type**: String (PDF, TXT, DOCX, etc.)
- **upload_date**: DateTime (timestamp of ingestion)
- **status**: String (processing, completed, failed)

### DocumentChunk
- **id**: UUID (primary identifier)
- **document_id**: UUID (foreign key to Document)
- **content**: String (text content of the chunk)
- **chunk_index**: Integer (order of chunk in original document)
- **embedding**: List[float] (vector embedding values)
- **metadata**: JSON (additional chunk metadata)
- **relevance_score**: Float (for retrieval ranking)

## API Request/Response Models

### Ingestion Request
- **file**: File (uploaded document)
- **collection_name**: String (optional, defaults to main collection)

### Ingestion Response
- **document_id**: UUID (identifier for the ingested document)
- **chunks_count**: Integer (number of chunks created)
- **status**: String (success, processing, failed)

### Retrieval Request
- **query**: String (user query text)
- **top_k**: Integer (number of results, default 5)
- **collection_name**: String (optional, defaults to main collection)

### Retrieval Response
- **query**: String (original query)
- **results**: List[RetrievalResult]
- **query_embedding**: List[float] (vector representation of query)

### RetrievalResult
- **chunk_id**: UUID (identifier of the retrieved chunk)
- **document_id**: UUID (identifier of the source document)
- **content**: String (text content of the chunk)
- **relevance_score**: Float (similarity score)
- **metadata**: JSON (chunk metadata)

## Qdrant Collection Schema

### Vector Collection Configuration
- **Collection Name**: "documents" (single collection as specified)
- **Vector Size**: 1024 (for Cohere embeddings)
- **Distance Function**: Cosine (for semantic similarity)
- **Payload Schema**:
  - document_id: UUID
  - chunk_id: UUID
  - content: Text
  - chunk_index: Integer
  - metadata: JSON

## Validation Rules

### Document Validation
- File size must be ≤ 10MB
- File type must be in supported formats (PDF, TXT, DOCX)
- Required fields: filename, file_type

### Chunk Validation
- Content length must be > 0
- Chunk must have valid embedding vector
- Required fields: document_id, content, embedding

### Query Validation
- Query text must be non-empty
- top_k must be between 1 and 10