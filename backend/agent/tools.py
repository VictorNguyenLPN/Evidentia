import logging
from typing import List, Dict, Any, Optional
from backend.rag.hybrid_retriever import hybrid_retriever
from backend.db.mongo_manager import mongo_manager

logger = logging.getLogger(__name__)

# Tool Definitions and Schemas

TOOLS_SCHEMA = [
    {
        "name": "search_legal_clauses",
        "description": "Tìm kiếm các điều khoản pháp luật Việt Nam liên quan bằng Hybrid Search (Dense Vector + BM25) trên Qdrant kết hợp lọc ngày hiệu lực.",
        "parameters": {
            "type": "object",
            "properties": {
                "query": {
                    "type": "string",
                    "description": "Từ khóa hoặc câu truy vấn pháp lý đã được tối ưu hóa thuật ngữ."
                },
                "target_date": {
                    "type": "string",
                    "description": "Ngày mốc cần tra cứu hiệu lực định dạng YYYY-MM-DD (ví dụ: '2023-01-01'). Để null nếu không có mốc cụ thể."
                },
                "doc_type": {
                    "type": "string",
                    "description": "Loại văn bản nếu muốn thu hẹp phạm vi (ví dụ: 'Luật', 'Nghị định', 'Thông tư'). Để null nếu tìm tất cả."
                },
                "top_k": {
                    "type": "integer",
                    "description": "Số lượng điều khoản liên quan nhất cần trả về (mặc định 5)."
                }
            },
            "required": ["query"]
        }
    },
    {
        "name": "get_law_document_detail",
        "description": "Tra cứu thông tin chi tiết, cơ cấu chương mục và trạng thái hiệu lực của một văn bản quy phạm pháp luật theo ID hoặc số hiệu.",
        "parameters": {
            "type": "object",
            "properties": {
                "document_id": {
                    "type": "string",
                    "description": "Mã ID hoặc số hiệu văn bản (ví dụ: '45/2019/QH14', 'bllđ-2019')."
                }
            },
            "required": ["document_id"]
        }
    },
    {
        "name": "get_law_article",
        "description": "Tra cứu toàn văn nội dung một điều khoản cụ thể trong một văn bản pháp luật từ cơ sở dữ liệu.",
        "parameters": {
            "type": "object",
            "properties": {
                "document_id": {
                    "type": "string",
                    "description": "Mã ID hoặc số hiệu văn bản (ví dụ: '45/2019/QH14')."
                },
                "article_number": {
                    "type": "integer",
                    "description": "Số thứ tự của điều cần tra cứu (ví dụ: Điều 25 -> 25)."
                }
            },
            "required": ["document_id", "article_number"]
        }
    }
]

def search_legal_clauses(
    query: str,
    target_date: Optional[str] = None,
    doc_type: Optional[str] = None,
    top_k: int = 5
) -> List[Dict[str, Any]]:
    """
    Execute Hybrid Search for legal chunks.
    """
    logger.info(f"[Tool:search_legal_clauses] Query: '{query}', Target Date: {target_date}, Top K: {top_k}")
    chunks = hybrid_retriever.search(
        query=query,
        target_date=target_date,
        top_k=top_k,
        doc_type=doc_type
    )
    # Fallback retry without temporal filter if no results and target_date was set
    if not chunks and target_date:
        logger.info(f"[Tool:search_legal_clauses] Fallback: Retrying search without target_date filter...")
        chunks = hybrid_retriever.search(
            query=query,
            target_date=None,
            top_k=top_k,
            doc_type=doc_type
        )
    return chunks

def get_law_document_detail(document_id: str) -> Optional[Dict[str, Any]]:
    """
    Retrieve document metadata and TOC from MongoDB.
    """
    logger.info(f"[Tool:get_law_document_detail] Document ID: '{document_id}'")
    doc = mongo_manager.get_law_detail(document_id)
    return doc

def get_law_article(document_id: str, article_number: int) -> Optional[Dict[str, Any]]:
    """
    Retrieve specific article from MongoDB.
    """
    logger.info(f"[Tool:get_law_article] Document ID: '{document_id}', Article: {article_number}")
    art = mongo_manager.get_law_article(document_id, article_number)
    return art

def execute_tool(tool_name: str, tool_args: Dict[str, Any]) -> Any:
    """
    Dispatcher to execute a tool by name with arguments.
    """
    if tool_name == "search_legal_clauses":
        return search_legal_clauses(
            query=tool_args.get("query", ""),
            target_date=tool_args.get("target_date"),
            doc_type=tool_args.get("doc_type"),
            top_k=tool_args.get("top_k", 5)
        )
    elif tool_name == "get_law_document_detail":
        return get_law_document_detail(document_id=tool_args.get("document_id", ""))
    elif tool_name == "get_law_article":
        return get_law_article(
            document_id=tool_args.get("document_id", ""),
            article_number=int(tool_args.get("article_number", 0))
        )
    else:
        logger.error(f"Unknown tool: {tool_name}")
        return {"error": f"Tool '{tool_name}' not found."}
