import json
import logging
import uuid
from pathlib import Path
from typing import Any

# pyrefly: ignore [missing-import]
from qdrant_client import QdrantClient

# pyrefly: ignore [missing-import]
from qdrant_client.http import models

from backend.config import DATA_PATH, QDRANT_API_KEY, QDRANT_COLLECTION_NAME, QDRANT_URL
from backend.rag.embeddings import embedding_service

logger = logging.getLogger(__name__)

DENSE_VECTOR_NAME = "dense"
SPARSE_VECTOR_NAME = "sparse_bm25"


class QdrantCloudManager:
    """
    Manager for Qdrant Cloud Vector Database.
    Strictly operates in Pure Cloud Mode using QdrantClient(url=..., api_key=...).
    """

    def __init__(
        self,
        url: str = QDRANT_URL,
        api_key: str = QDRANT_API_KEY,
        collection_name: str = QDRANT_COLLECTION_NAME,
    ):
        self.url = url
        self.api_key = api_key
        self.collection_name = collection_name
        self._client: QdrantClient | None = None

    def get_client(self) -> QdrantClient:
        """
        Initialize and return Qdrant Cloud Client.
        """
        if self._client is None:
            if not self.url or not self.api_key:
                raise ValueError(
                    "Qdrant Cloud credentials missing! Please configure QDRANT_URL and QDRANT_API_KEY in .env"
                )
            logger.info(f"Connecting to Qdrant Cloud at {self.url}...")
            self._client = QdrantClient(url=self.url, api_key=self.api_key, timeout=60.0)
        return self._client

    def is_configured(self) -> bool:
        return bool(self.url and self.api_key)

    def collection_exists(self) -> bool:
        client = self.get_client()
        return client.collection_exists(self.collection_name)

    def get_collection_count(self) -> int:
        client = self.get_client()
        try:
            res = client.count(self.collection_name)
            return res.count
        except Exception:
            return 0

    def create_collection(self) -> None:
        """
        Create collection with both Dense (Cosine, dynamic dim) and Sparse (BM25) vector support.
        """
        client = self.get_client()
        dense_dim = embedding_service.get_dense_dimension()
        logger.info(
            f"Creating Qdrant Cloud collection '{self.collection_name}' with Hybrid Vectors (Dense dim={dense_dim})..."
        )

        client.recreate_collection(
            collection_name=self.collection_name,
            vectors_config={
                DENSE_VECTOR_NAME: models.VectorParams(
                    size=dense_dim, distance=models.Distance.COSINE
                )
            },
            sparse_vectors_config={
                SPARSE_VECTOR_NAME: models.SparseVectorParams(modifier=models.Modifier.IDF)
            },
        )

        # Create payload indexes for temporal filtering and metadata
        try:
            client.create_payload_index(
                collection_name=self.collection_name,
                field_name="effect_date",
                field_schema=models.PayloadSchemaType.DATETIME,
            )
            client.create_payload_index(
                collection_name=self.collection_name,
                field_name="document_type",
                field_schema=models.PayloadSchemaType.KEYWORD,
            )
        except Exception as e:
            logger.warning(f"Note on creating payload index: {e}")

        logger.info(f"Collection '{self.collection_name}' created successfully on Qdrant Cloud.")

    def ingest_chunks(self, chunks: list[dict[str, Any]], batch_size: int = 32) -> int:
        """
        Encode and upload chunks to Qdrant Cloud in batches.
        """
        client = self.get_client()
        total = len(chunks)
        logger.info(
            f"Starting ingestion of {total} chunks to Qdrant Cloud collection '{self.collection_name}'..."
        )

        for i in range(0, total, batch_size):
            batch = chunks[i : i + batch_size]

            # Prepare textual content for embedding
            embedding_texts = []
            for item in batch:
                meta = item.get("metadata", {})
                doc_title = meta.get("document_title", "")
                hierarchy = " > ".join(meta.get("hierarchy_path", []))
                lead_in = meta.get("lead_in_text") or ""
                text = item.get("text", "")

                # Context-enriched passage representation
                full_passage = f"{doc_title}. {hierarchy}. {lead_in} {text}".strip()
                embedding_texts.append(full_passage)

            # Generate dense embeddings
            dense_vectors = embedding_service.embed_passages_dense(embedding_texts)

            # Generate sparse BM25 embeddings
            sparse_vectors = embedding_service.embed_passages_sparse(embedding_texts)

            points = []
            for j, item in enumerate(batch):
                chunk_id = item.get("chunk_id", str(uuid.uuid4()))
                # Generate deterministic UUID for point_id from chunk_id
                point_id = str(uuid.uuid5(uuid.NAMESPACE_DNS, chunk_id))

                sparse_res = sparse_vectors[j]

                points.append(
                    models.PointStruct(
                        id=point_id,
                        vector={
                            DENSE_VECTOR_NAME: dense_vectors[j],
                            SPARSE_VECTOR_NAME: models.SparseVector(
                                indices=sparse_res.indices.tolist(),
                                values=sparse_res.values.tolist(),
                            ),
                        },
                        payload={
                            "chunk_id": chunk_id,
                            "node_type": item.get("node_type"),
                            "text": item.get("text"),
                            "amendment_notes": item.get("amendment_notes", []),
                            **item.get("metadata", {}),
                        },
                    )
                )

            client.upsert(collection_name=self.collection_name, points=points)
            logger.info(
                f"Uploaded batch {i // batch_size + 1}/{(total + batch_size - 1) // batch_size} ({len(points)} chunks)."
            )

        final_count = self.get_collection_count()
        logger.info(f"Ingestion complete! Total records on Qdrant Cloud: {final_count}")
        return final_count

    def sync_data_on_startup(self, data_path: Path = DATA_PATH) -> dict[str, Any]:
        """
        Check Qdrant Cloud collection on startup. Ingests if collection is missing, warns if count mismatch.
        Called on FastAPI lifespan startup.
        """
        if not self.is_configured():
            msg = "Qdrant Cloud credentials (QDRANT_URL, QDRANT_API_KEY) are not set in .env. Auto-sync skipped."
            logger.warning(msg)
            return {"status": "unconfigured", "message": msg, "cloud_count": 0, "local_count": 0}

        if not data_path.exists():
            msg = f"Data file not found at {data_path}. Auto-sync skipped."
            logger.warning(msg)
            return {"status": "file_not_found", "message": msg, "cloud_count": 0, "local_count": 0}

        with open(data_path, encoding="utf-8") as f:
            local_chunks = json.load(f)

        local_count = len(local_chunks)
        logger.info(
            f"Checking Qdrant Cloud synchronization with local file (count = {local_count})"
        )

        try:
            if not self.collection_exists():
                msg = f"Collection '{self.collection_name}' not found on Qdrant Cloud. Auto-ingestion skipped. Use --ingest-qdrant to create and ingest."
                logger.warning(msg)
                return {
                    "status": "not_found_warning",
                    "local_count": local_count,
                    "cloud_count": 0,
                    "message": msg,
                }

            cloud_count = self.get_collection_count()
            if cloud_count != local_count:
                msg = f"Count mismatch detected on Qdrant Cloud: Cloud={cloud_count} vs Local={local_count}. Auto-ingestion skipped. Use --ingest-qdrant to re-ingest."
                logger.warning(msg)
                return {
                    "status": "count_mismatch",
                    "local_count": local_count,
                    "cloud_count": cloud_count,
                    "message": msg,
                }

            logger.info(f"Qdrant Cloud is in sync with local dataset ({cloud_count} items).")
            return {
                "status": "in_sync",
                "local_count": local_count,
                "cloud_count": cloud_count,
                "message": f"Qdrant Cloud collection is in sync with {cloud_count} items.",
            }

        except Exception as e:
            logger.error(f"Error during Qdrant Cloud startup check: {e}", exc_info=True)
            return {
                "status": "error",
                "error": str(e),
                "local_count": local_count,
                "cloud_count": 0,
                "message": f"Check failed: {e}",
            }

    def ingest_dataset(self, data_path: Path = DATA_PATH) -> dict[str, Any]:
        """
        Explicitly create collection and ingest dataset into Qdrant Cloud.
        Only triggered by CLI argument (--ingest-qdrant) or manual invocation.
        """
        if not self.is_configured():
            raise ValueError(
                "Qdrant Cloud credentials (QDRANT_URL, QDRANT_API_KEY) are missing in .env"
            )

        path_obj = Path(data_path) if isinstance(data_path, str | Path) else DATA_PATH
        if not path_obj.exists():
            raise FileNotFoundError(f"Data file not found at {path_obj}")

        with open(path_obj, encoding="utf-8") as f:
            local_chunks = json.load(f)

        logger.info(
            f"Explicitly initiating Qdrant ingestion of {len(local_chunks)} chunks from {path_obj}..."
        )
        self.create_collection()
        cloud_count = self.ingest_chunks(local_chunks)
        return {
            "status": "success",
            "cloud_count": cloud_count,
            "message": f"Successfully created collection '{self.collection_name}' and ingested {cloud_count} chunks to Qdrant Cloud.",
        }


# Singleton instance
qdrant_manager = QdrantCloudManager()
