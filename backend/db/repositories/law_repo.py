import json
import logging
from datetime import datetime
from pathlib import Path
from typing import Any

from backend.config import DATA_PATH
from backend.db.connection import MongoConnectionManager

logger = logging.getLogger(__name__)


class LawRepository:
    def __init__(self, conn: MongoConnectionManager):
        self.conn = conn

    def _structure_law_data(
        self,
        chunks: list[dict[str, Any]],
    ) -> tuple[list[dict[str, Any]], list[dict[str, Any]]]:
        """
        Transform flat legal chunks into structured laws and articles collections.
        """
        laws_map: dict[str, dict[str, Any]] = {}
        articles_map: dict[str, dict[str, Any]] = {}

        for chunk in chunks:
            meta = chunk.get("metadata", {})
            doc_id = meta.get("doc_identity") or meta.get("document_id") or "unknown_law"
            doc_title = meta.get("document_title", "Văn bản quy phạm pháp luật")

            if doc_id not in laws_map:
                laws_map[doc_id] = {
                    "document_id": doc_id,
                    "document_title": doc_title,
                    "doc_identity": meta.get("doc_identity", doc_id),
                    "document_type": meta.get("document_type"),
                    "issue_date": meta.get("issue_date"),
                    "effect_date": meta.get("effect_date"),
                    "expire_date": meta.get("expire_date"),
                    "effect_status_name": meta.get("effect_status_name"),
                    "organ_names": meta.get("organ_names", []),
                    "vbpl_url": meta.get("vbpl_url"),
                    "hierarchy": [],
                    "articles_count": 0,
                    "created_at": datetime.now(),
                    "updated_at": datetime.now(),
                }

            art_num = meta.get("article_number")
            if art_num is not None:
                art_key = f"{doc_id}_art_{art_num}"
                if art_key not in articles_map:
                    articles_map[art_key] = {
                        "article_key": art_key,
                        "document_id": doc_id,
                        "document_title": doc_title,
                        "article_number": art_num,
                        "article_title": meta.get("article_title") or f"Điều {art_num}",
                        "hierarchy_path": meta.get("hierarchy_path", []),
                        "lead_in_text": meta.get("lead_in_text", ""),
                        "clauses": [],
                        "full_text": "",
                        "issue_date": meta.get("issue_date"),
                        "effect_date": meta.get("effect_date"),
                        "expire_date": meta.get("expire_date"),
                        "effect_status_name": meta.get("effect_status_name"),
                        "vbpl_url": meta.get("vbpl_url"),
                        "amendment_notes": chunk.get("amendment_notes", []),
                    }

                clause_num = meta.get("clause_number")
                point = meta.get("point")
                chunk_text = chunk.get("text", "")

                clause_entry = {
                    "chunk_id": chunk.get("chunk_id"),
                    "clause_number": clause_num,
                    "point": point,
                    "text": chunk_text,
                    "amendment_notes": chunk.get("amendment_notes", []),
                }
                articles_map[art_key]["clauses"].append(clause_entry)

        # Assemble full text for each article
        for art in articles_map.values():
            art["clauses"].sort(
                key=lambda x: (
                    x.get("clause_number") is None,
                    x.get("clause_number") or 0,
                    x.get("point") or "",
                )
            )
            clause_texts = [c.get("text", "") for c in art["clauses"] if c.get("text")]
            art["full_text"] = "\n".join(clause_texts)

        # Count articles per law
        for doc_id, law in laws_map.items():
            count = sum(1 for a in articles_map.values() if a.get("document_id") == doc_id)
            law["articles_count"] = count

            # Reconstruct table of contents
            doc_articles = [a for a in articles_map.values() if a.get("document_id") == doc_id]
            doc_articles.sort(key=lambda x: x.get("article_number", 0))

            toc_structure: list[dict[str, Any]] = []
            for a in doc_articles:
                h_path = a.get("hierarchy_path", [])
                toc_structure.append(
                    {
                        "article_number": a.get("article_number"),
                        "article_title": a.get("article_title"),
                        "hierarchy_path": h_path,
                    }
                )
            law["hierarchy"] = toc_structure

        return list(laws_map.values()), list(articles_map.values())

    def sync_laws_on_startup(self, data_path: Any = DATA_PATH) -> dict[str, Any]:
        """
        Check MongoDB laws and articles collections on startup.
        """
        path_obj = Path(data_path) if isinstance(data_path, str | Path) else DATA_PATH
        if not path_obj.exists():
            return {"status": "file_not_found", "message": f"Data file not found at {path_obj}"}

        try:
            with open(path_obj, encoding="utf-8") as f:
                chunks = json.load(f)
        except Exception as e:
            return {"status": "error", "message": f"Cannot read data file: {e}"}

        laws_list, articles_list = self._structure_law_data(chunks)
        for law in laws_list:
            self.conn._fallback_laws[law["document_id"]] = law
        for art in articles_list:
            doc_id = art["document_id"]
            if doc_id not in self.conn._fallback_articles:
                self.conn._fallback_articles[doc_id] = []
            self.conn._fallback_articles[doc_id].append(art)

        laws_col = self.conn.get_laws_collection()
        arts_col = self.conn.get_articles_collection()

        if laws_col is None or arts_col is None:
            return {
                "status": "fallback_loaded",
                "laws_count": len(laws_list),
                "articles_count": len(articles_list),
                "message": f"Loaded {len(laws_list)} laws into in-memory fallback.",
            }

        try:
            db_laws_count = laws_col.count_documents({})
            db_arts_count = arts_col.count_documents({})

            if db_laws_count == 0 or db_arts_count == 0:
                logger.info(
                    f"MongoDB Laws collections empty (laws={db_laws_count}, arts={db_arts_count}). Populating structure..."
                )
                laws_col.create_index("document_id", unique=True)
                arts_col.create_index("article_key", unique=True)
                arts_col.create_index([("document_id", 1), ("article_number", 1)])

                if laws_list:
                    laws_col.insert_many([dict(law) for law in laws_list])
                if articles_list:
                    arts_col.insert_many([dict(a) for a in articles_list])

                return {
                    "status": "populated",
                    "laws_count": len(laws_list),
                    "articles_count": len(articles_list),
                    "message": f"Populated {len(laws_list)} laws and {len(articles_list)} articles in MongoDB.",
                }
            else:
                return {
                    "status": "in_sync",
                    "laws_count": db_laws_count,
                    "articles_count": db_arts_count,
                    "message": f"MongoDB Laws in sync ({db_laws_count} laws, {db_arts_count} articles).",
                }
        except Exception as e:
            logger.error(f"Error checking laws in MongoDB: {e}")
            return {"status": "error", "error": str(e)}

    def ingest_laws(self, data_path: Any = DATA_PATH) -> dict[str, Any]:
        """
        Explicitly parse and ingest legal hierarchy and articles into MongoDB.
        """
        path_obj = Path(data_path) if isinstance(data_path, str | Path) else DATA_PATH
        if not path_obj.exists():
            raise FileNotFoundError(f"Data file not found at {path_obj}")

        with open(path_obj, encoding="utf-8") as f:
            chunks = json.load(f)

        laws_list, articles_list = self._structure_law_data(chunks)
        laws_col = self.conn.get_laws_collection()
        arts_col = self.conn.get_articles_collection()

        if laws_col is not None and arts_col is not None:
            laws_col.drop()
            arts_col.drop()

            laws_col.create_index("document_id", unique=True)
            arts_col.create_index("article_key", unique=True)
            arts_col.create_index([("document_id", 1), ("article_number", 1)])

            if laws_list:
                laws_col.insert_many([dict(law) for law in laws_list])
            if articles_list:
                arts_col.insert_many([dict(a) for a in articles_list])

        return {
            "status": "success",
            "laws_count": len(laws_list),
            "articles_count": len(articles_list),
            "message": f"Ingested {len(laws_list)} laws and {len(articles_list)} articles into MongoDB.",
        }

    def get_all_laws(self) -> dict[str, Any]:
        laws_col = self.conn.get_laws_collection()
        results: list[dict[str, Any]] = []

        if laws_col is not None:
            try:
                cursor = laws_col.find({}, {"_id": 0, "hierarchy": 0}).sort("document_id", 1)
                for doc in cursor:
                    results.append(doc)
                return {"laws": results, "total": len(results)}
            except Exception as e:
                logger.error(f"Error fetching laws list: {e}")

        for law in self.conn._fallback_laws.values():
            clean = dict(law)
            clean.pop("hierarchy", None)
            results.append(clean)
        return {"laws": results, "total": len(results)}

    def get_law_detail(self, document_id: str) -> dict[str, Any] | None:
        if not document_id:
            return None
        clean_id = document_id.strip()

        laws_col = self.conn.get_laws_collection()
        if laws_col is not None:
            try:
                doc = laws_col.find_one(
                    {"$or": [{"document_id": clean_id}, {"doc_identity": clean_id}]},
                    {"_id": 0},
                )
                if doc:
                    return doc
            except Exception as e:
                logger.error(f"Error fetching law detail for {clean_id}: {e}")

        if clean_id in self.conn._fallback_laws:
            return dict(self.conn._fallback_laws[clean_id])
        return None

    def get_law_articles(
        self,
        document_id: str,
        skip: int = 0,
        limit: int = 50,
    ) -> dict[str, Any]:
        if not document_id:
            return {"articles": [], "total": 0}
        clean_id = document_id.strip()

        arts_col = self.conn.get_articles_collection()
        results: list[dict[str, Any]] = []
        total = 0

        if arts_col is not None:
            try:
                query = {"$or": [{"document_id": clean_id}, {"doc_identity": clean_id}]}
                total = arts_col.count_documents(query)
                cursor = (
                    arts_col.find(query, {"_id": 0})
                    .sort("article_number", 1)
                    .skip(skip)
                    .limit(limit)
                )
                for doc in cursor:
                    results.append(doc)
                return {"articles": results, "total": total}
            except Exception as e:
                logger.error(f"Error fetching articles for {clean_id}: {e}")

        all_arts = self.conn._fallback_articles.get(clean_id, [])
        total = len(all_arts)
        paginated = all_arts[skip : skip + limit]
        return {"articles": [dict(a) for a in paginated], "total": total}

    def get_law_article(self, document_id: str, article_number: int) -> dict[str, Any] | None:
        if not document_id:
            return None
        clean_id = document_id.strip()

        arts_col = self.conn.get_articles_collection()
        if arts_col is not None:
            try:
                art = arts_col.find_one(
                    {
                        "$or": [{"document_id": clean_id}, {"doc_identity": clean_id}],
                        "article_number": int(article_number),
                    },
                    {"_id": 0},
                )
                if art:
                    return art
            except Exception as e:
                logger.error(f"Error fetching article {article_number} for {clean_id}: {e}")

        for art in self.conn._fallback_articles.get(clean_id, []):
            if art.get("article_number") == int(article_number):
                return dict(art)
        return None
