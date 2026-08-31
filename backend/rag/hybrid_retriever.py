import logging
from datetime import datetime
from typing import Any

# pyrefly: ignore [missing-import]
from qdrant_client.http import models

from backend.rag.embeddings import embedding_service
from backend.rag.qdrant_manager import DENSE_VECTOR_NAME, SPARSE_VECTOR_NAME, qdrant_manager

logger = logging.getLogger(__name__)


def _normalize_iso_date(date_str: str | None) -> str | None:
    """
    Normalize various date string formats (e.g. 2020/10/20, 2020-10-20, 2020) to ISO-8601 string.
    """
    if not date_str or not isinstance(date_str, str):
        return None
    raw = date_str.strip().replace("/", "-")
    if len(raw) == 4 and raw.isdigit():
        return f"{raw}-12-31T23:59:59Z"

    # Remove existing timezone suffix for parsing
    base = raw.split("Z")[0].split("+")[0]
    formats = [
        "%Y-%m-%dT%H:%M:%S",
        "%Y-%m-%d",
        "%d-%m-%Y",
        "%d-%m-%Y %H:%M:%S",
    ]
    for fmt in formats:
        try:
            dt = datetime.strptime(base, fmt)
            return dt.strftime("%Y-%m-%dT23:59:59Z")
        except ValueError:
            continue
    return None


class HybridRetriever:
    """
    Hybrid Retriever combining:
    - Dense Semantic Search (intfloat/multilingual-e5-large)
    - Sparse BM25 Search (Qdrant/bm25)
    - Fusion using Reciprocal Rank Fusion (RRF)
    - Temporal Filtering (effect_date <= target_date < expire_date)
    """

    def __init__(self, manager=qdrant_manager):
        self.manager = manager

    def _build_temporal_filter(
        self,
        target_date: str | None = None,
        doc_type: str | None = None,
        doc_title_keyword: str | None = None,
    ) -> models.Filter | None:
        """
        Build Qdrant Filter conditions for temporal constraints and metadata.
        """
        must_conditions = []

        # Temporal filter: effect_date <= target_date
        if target_date:
            norm_date = _normalize_iso_date(target_date)
            if norm_date:
                must_conditions.append(
                    models.FieldCondition(
                        key="effect_date", range=models.DatetimeRange(lte=norm_date)
                    )
                )

        if doc_type:
            must_conditions.append(
                models.FieldCondition(key="document_type", match=models.MatchValue(value=doc_type))
            )

        if doc_title_keyword:
            must_conditions.append(
                models.FieldCondition(
                    key="document_title", match=models.MatchText(text=doc_title_keyword)
                )
            )

        if must_conditions:
            return models.Filter(must=must_conditions)
        return None

    def search(
        self,
        query: str,
        target_date: str | None = None,
        top_k: int = 5,
        doc_type: str | None = None,
    ) -> list[dict[str, Any]]:
        """
        Execute Hybrid Search on Qdrant Cloud.
        """
        client = self.manager.get_client()
        collection_name = self.manager.collection_name

        # Encode query
        dense_query_vector = embedding_service.embed_query_dense(query)
        sparse_query_res = embedding_service.embed_query_sparse(query)

        sparse_query_vector = models.SparseVector(
            indices=sparse_query_res.indices.tolist(), values=sparse_query_res.values.tolist()
        )

        query_filter = self._build_temporal_filter(target_date=target_date, doc_type=doc_type)

        try:
            # Hybrid search using Qdrant Prefetch + RRF Fusion
            response = client.query_points(
                collection_name=collection_name,
                prefetch=[
                    models.Prefetch(
                        query=dense_query_vector,
                        using=DENSE_VECTOR_NAME,
                        limit=top_k * 2,
                        filter=query_filter,
                    ),
                    models.Prefetch(
                        query=sparse_query_vector,
                        using=SPARSE_VECTOR_NAME,
                        limit=top_k * 2,
                        filter=query_filter,
                    ),
                ],
                query=models.FusionQuery(fusion=models.Fusion.RRF),
                limit=top_k,
            )

            results = []
            for point in response.points:
                payload = point.payload or {}
                results.append(
                    {
                        "id": str(point.id),
                        "score": float(point.score) if point.score is not None else 0.0,
                        "chunk_id": payload.get("chunk_id"),
                        "text": payload.get("text", ""),
                        "node_type": payload.get("node_type"),
                        "document_id": payload.get("document_id"),
                        "document_title": payload.get("document_title"),
                        "doc_identity": payload.get("doc_identity"),
                        "document_type": payload.get("document_type"),
                        "issue_date": payload.get("issue_date"),
                        "effect_date": payload.get("effect_date"),
                        "expire_date": payload.get("expire_date"),
                        "effect_status_name": payload.get("effect_status_name"),
                        "hierarchy_path": payload.get("hierarchy_path", []),
                        "article_number": payload.get("article_number"),
                        "article_title": payload.get("article_title"),
                        "clause_number": payload.get("clause_number"),
                        "point": payload.get("point"),
                        "lead_in_text": payload.get("lead_in_text"),
                        "organ_names": payload.get("organ_names", []),
                        "vbpl_url": payload.get("vbpl_url"),
                        "amendment_notes": payload.get("amendment_notes", []),
                    }
                )

            return results

        except Exception as e:
            logger.error(f"Error executing hybrid search on Qdrant Cloud: {e}", exc_info=True)
            raise e


# Singleton instance
hybrid_retriever = HybridRetriever()
