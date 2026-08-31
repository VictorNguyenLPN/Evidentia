import logging
from typing import Any

# pyrefly: ignore [missing-import]
from fastembed import SparseTextEmbedding, TextEmbedding

logger = logging.getLogger(__name__)


class EmbeddingService:
    """
    Embedding Service providing:
    - Dense Embeddings: intfloat/multilingual-e5-large (1024 dim) or supported FastEmbed models
    - Sparse Embeddings / BM25: Qdrant/bm25
    """

    def __init__(
        self,
        dense_model_name: str = "intfloat/multilingual-e5-large",
        sparse_model_name: str = "Qdrant/bm25",
    ):
        self.dense_model_name = dense_model_name
        self.sparse_model_name = sparse_model_name
        self._dense_model: TextEmbedding | None = None
        self._sparse_model: SparseTextEmbedding | None = None
        self._dimension: int | None = None

    @property
    def dense_model(self) -> TextEmbedding:
        if self._dense_model is None:
            logger.info(f"Loading dense embedding model: {self.dense_model_name}")
            self._dense_model = TextEmbedding(model_name=self.dense_model_name)
        return self._dense_model

    @property
    def sparse_model(self) -> SparseTextEmbedding:
        if self._sparse_model is None:
            logger.info(f"Loading sparse BM25 embedding model: {self.sparse_model_name}")
            self._sparse_model = SparseTextEmbedding(model_name=self.sparse_model_name)
        return self._sparse_model

    def get_dense_dimension(self) -> int:
        """
        Get the vector dimension for the dense model.
        """
        if self._dimension is None:
            # Query supported models metadata
            for m in TextEmbedding.list_supported_models():
                if m.get("model") == self.dense_model_name:
                    self._dimension = m.get("dim", 1024)
                    break
            if self._dimension is None:
                # Test with a dummy embed to measure dimension
                test_emb = self.embed_query_dense("test")
                self._dimension = len(test_emb)
        return self._dimension

    def embed_passages_dense(self, texts: list[str], batch_size: int = 32) -> list[list[float]]:
        """
        Embed passages/chunks using E5 passage prefix.
        """
        prefixed_texts = [f"passage: {t}" for t in texts]
        embeddings = list(self.dense_model.embed(prefixed_texts, batch_size=batch_size))
        return [emb.tolist() for emb in embeddings]

    def embed_query_dense(self, query: str) -> list[float]:
        """
        Embed search query using E5 query prefix.
        """
        prefixed_query = f"query: {query}"
        embedding = list(self.dense_model.embed([prefixed_query]))[0]
        return embedding.tolist()

    def embed_passages_sparse(self, texts: list[str], batch_size: int = 32) -> list[Any]:
        """
        Embed passages to sparse vectors (BM25 indices and values).
        """
        embeddings = list(self.sparse_model.embed(texts, batch_size=batch_size))
        return embeddings

    def embed_query_sparse(self, query: str) -> Any:
        """
        Embed query to sparse vector for BM25 search.
        """
        embedding = list(self.sparse_model.embed([query]))[0]
        return embedding


# Singleton instance
embedding_service = EmbeddingService()
