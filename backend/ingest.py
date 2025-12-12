import requests
import xml.etree.ElementTree as ET
import trafilatura
from qdrant_client import QdrantClient
from qdrant_client.models import VectorParams, Distance, PointStruct
import cohere
import socket
from dotenv import load_dotenv
from time import sleep
import os


# -------------------------------------
# CONFIG
# -------------------------------------

load_dotenv()

qdrant_url = os.getenv("QDRANT_URL")
qdrant_api_key = os.getenv("QDRANT_API_KEY")
cohere_api_key = os.getenv("COHERE_API_KEY")

# Your Deployment Link:
SITEMAP_URL = "https://hackathon-physical-ai-humanoid-text-ten.vercel.app/sitemap.xml"
COLLECTION_NAME = "humanoid_ai_book"

cohere_client = cohere.Client(cohere_api_key)

EMBED_MODEL = "embed-english-v3.0"

# Connect to Qdrant Cloud
qdrant = QdrantClient(url=qdrant_url, api_key=qdrant_api_key)

# -------------------------------------
# Helper Functions
# -------------------------------------
def check_dns(hostname):
    """Check if DNS can resolve the hostname"""
    try:
        socket.gethostbyname(hostname)
        print(f"✅ DNS resolved: {hostname}")
        return True
    except socket.gaierror:
        print(f"❌ DNS failed for: {hostname}")
        return False

def safe_request(url, retries=3, timeout=15):
    """Make HTTP request with retry logic"""
    headers = {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
    }
    
    for attempt in range(retries):
        try:
            response = requests.get(url, timeout=timeout, headers=headers)
            response.raise_for_status()
            return response
        except requests.exceptions.ConnectionError as e:
            print(f"   ⚠️  Connection error (attempt {attempt + 1}/{retries}): {e}")
            if attempt < retries - 1:
                wait_time = (attempt + 1) * 3
                print(f"   Retrying in {wait_time} seconds...")
                sleep(wait_time)
            else:
                raise
        except requests.exceptions.Timeout as e:
            print(f"   ⚠️  Timeout (attempt {attempt + 1}/{retries})")
            if attempt < retries - 1:
                timeout += 10
            else:
                raise
        except Exception as e:
            print(f"   ❌ Error: {e}")
            raise

# -------------------------------------
# Step 1 — Extract URLs from sitemap
# -------------------------------------
def get_all_urls(sitemap_url):
    """Extract all URLs from sitemap with error handling"""
    print("="*60)
    print("FETCHING SITEMAP")
    print("="*60)
    
    # Check DNS first
    from urllib.parse import urlparse
    hostname = urlparse(sitemap_url).netloc
    
    if not check_dns(hostname):
        print("Waiting 5 seconds and retrying DNS...")
        sleep(5)
        if not check_dns(hostname):
            raise Exception(f"Cannot resolve {hostname}. Check your internet connection.")
    
    # Fetch sitemap
    print(f"\n📡 Fetching: {sitemap_url}")
    response = safe_request(sitemap_url)
    xml = response.text
    
    # Parse XML
    root = ET.fromstring(xml)
    namespace = {'ns': 'http://www.sitemaps.org/schemas/sitemap/0.9'}
    
    urls = []
    for loc in root.findall('.//ns:loc', namespace):
        if loc.text:
            urls.append(loc.text)
    
    # If no namespace URLs found, try without namespace
    if not urls:
        for child in root:
            loc_tag = child.find("{http://www.sitemaps.org/schemas/sitemap/0.9}loc")
            if loc_tag is not None:
                urls.append(loc_tag.text)
    
    print(f"\n✅ FOUND {len(urls)} URLS:")
    for i, u in enumerate(urls[:10], 1):
        print(f"   {i}. {u}")
    if len(urls) > 10:
        print(f"   ... and {len(urls) - 10} more")
    
    return urls


# -------------------------------------
# Step 2 — Download page + extract text
# -------------------------------------
def extract_text_from_url(url):
    """Extract text from URL using trafilatura"""
    try:
        response = safe_request(url)
        html = response.text
        text = trafilatura.extract(html)
        
        if not text:
            print(f"   ⚠️  No text extracted from: {url}")
            return None
        
        print(f"   ✅ Extracted {len(text)} characters")
        return text
        
    except Exception as e:
        print(f"   ❌ Failed to extract from {url}: {e}")
        return None


# -------------------------------------
# Step 3 — Chunk the text
# -------------------------------------
def chunk_text(text, max_chars=1200):
    """Split text into chunks at sentence boundaries"""
    if not text:
        return []
    
    chunks = []
    while len(text) > max_chars:
        # Try to split at sentence boundary
        split_pos = text[:max_chars].rfind(". ")
        if split_pos == -1:
            # If no sentence boundary, try paragraph
            split_pos = text[:max_chars].rfind("\n")
        if split_pos == -1:
            # Last resort: just split at max_chars
            split_pos = max_chars
        
        chunk = text[:split_pos + 1].strip()
        if chunk:
            chunks.append(chunk)
        text = text[split_pos + 1:].strip()
    
    # Add remaining text
    if text.strip():
        chunks.append(text.strip())
    
    return chunks


# -------------------------------------
# Step 4 — Create embedding
# -------------------------------------
def embed(text):
    """Create embedding using Cohere"""
    try:
        response = cohere_client.embed(
            model=EMBED_MODEL,
            input_type="search_document",  # Use search_document for document chunks
            texts=[text],
        )
        return response.embeddings[0]
    except Exception as e:
        print(f"   ❌ Embedding error: {e}")
        raise


# -------------------------------------
# Step 5 — Store in Qdrant
# -------------------------------------
def create_collection():
    """Create or recreate Qdrant collection"""
    print("\n📦 Creating Qdrant collection...")
    try:
        # Check if collection exists
        collections = qdrant.get_collections().collections
        if any(c.name == COLLECTION_NAME for c in collections):
            print(f"   ⚠️  Collection '{COLLECTION_NAME}' exists, deleting...")
            qdrant.delete_collection(COLLECTION_NAME)
        
        # Create new collection
        qdrant.create_collection(
            collection_name=COLLECTION_NAME,
            vectors_config=VectorParams(
                size=1024,  # Cohere embed-english-v3.0 dimension
                distance=Distance.COSINE
            )
        )
        print(f"   ✅ Collection '{COLLECTION_NAME}' created")
    except Exception as e:
        print(f"   ❌ Error creating collection: {e}")
        raise

def save_chunk_to_qdrant(chunk, chunk_id, url):
    """Save a single chunk to Qdrant"""
    try:
        vector = embed(chunk)
        
        qdrant.upsert(
            collection_name=COLLECTION_NAME,
            points=[
                PointStruct(
                    id=chunk_id,
                    vector=vector,
                    payload={
                        "url": url,
                        "text": chunk,
                        "chunk_id": chunk_id,
                        "char_count": len(chunk)
                    }
                )
            ]
        )
        return True
    except Exception as e:
        print(f"   ❌ Failed to save chunk {chunk_id}: {e}")
        return False


# -------------------------------------
# MAIN INGESTION PIPELINE
# -------------------------------------
def ingest_book():
    """Main ingestion pipeline"""
    print("\n" + "="*60)
    print("STARTING INGESTION PIPELINE")
    print("="*60)
    
    try:
        # Step 1: Get all URLs
        urls = get_all_urls(SITEMAP_URL)
        
        if not urls:
            print("\n❌ No URLs found in sitemap!")
            return
        
        # Step 2: Create collection
        create_collection()
        
        # Step 3: Process each URL
        global_id = 1
        total_chunks = 0
        failed_urls = []
        
        print("\n" + "="*60)
        print("PROCESSING DOCUMENTS")
        print("="*60)
        
        for idx, url in enumerate(urls, 1):
            print(f"\n[{idx}/{len(urls)}] 📄 Processing: {url}")
            
            # Extract text
            text = extract_text_from_url(url)
            if not text:
                failed_urls.append(url)
                continue
            
            # Chunk text
            chunks = chunk_text(text)
            print(f"   ✂️  Created {len(chunks)} chunks")
            
            # Save chunks
            saved_count = 0
            for chunk in chunks:
                if save_chunk_to_qdrant(chunk, global_id, url):
                    saved_count += 1
                    global_id += 1
            
            total_chunks += saved_count
            print(f"   💾 Saved {saved_count}/{len(chunks)} chunks")
            
            # Small delay to avoid rate limiting
            sleep(0.5)
        
        # Final summary
        print("\n" + "="*60)
        print("✅ INGESTION COMPLETED!")
        print("="*60)
        print(f"📊 Statistics:")
        print(f"   - URLs processed: {len(urls) - len(failed_urls)}/{len(urls)}")
        print(f"   - Total chunks stored: {total_chunks}")
        print(f"   - Collection: {COLLECTION_NAME}")
        print(f"   - Qdrant URL: {qdrant._client._host}")
        
        if failed_urls:
            print(f"\n⚠️  Failed URLs ({len(failed_urls)}):")
            for url in failed_urls:
                print(f"   - {url}")
        
        print("="*60)
        
    except KeyboardInterrupt:
        print("\n\n⚠️  Interrupted by user")
    except Exception as e:
        print(f"\n\n❌ Fatal error: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    ingest_book()