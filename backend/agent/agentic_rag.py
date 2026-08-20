import logging
from datetime import datetime
from typing import List, Dict, Any, Optional

from backend.rag.hybrid_retriever import hybrid_retriever
from backend.agent.gemini_llm import gemini_client

logger = logging.getLogger(__name__)

class LegalAgenticRAG:
    """
    Coordinator Agent for Legal Information Retrieval, Temporal Reasoning, and Verification.
    """
    def __init__(self, retriever=hybrid_retriever, llm=gemini_client):
        self.retriever = retriever
        self.llm = llm

    def analyze_query(self, user_query: str, client_date: Optional[str] = None) -> Dict[str, Any]:
        """
        Step 1: Parse user query to extract legal topic, target date/year, and intent.
        """
        current_year = datetime.now().year
        system_instruction = f"""
Bạn là chuyên gia phân tích truy vấn pháp luật Việt Nam.
Nhiệm vụ: Phân tích câu hỏi của người dùng và trả về JSON:
- "search_query": Chuỗi từ khóa pháp lý tối ưu cho Hybrid Retrieval (BM25 + Semantic Search). Loại bỏ các từ thừa, giữ lại thuật ngữ pháp lý.
- "target_date": Ngày mốc cần tra cứu hiệu lực định dạng YYYY-MM-DD nếu người dùng đề cập (ví dụ: năm 2022 -> 2022-01-01, hiện tại -> {datetime.now().strftime('%Y-%m-%d')}). Nếu không rõ, để null.
- "intent": Một trong ["search", "compare", "temporal_update"].
- "domain": Lĩnh vực pháp luật (Lao động, Dân sự, Hình sự, Đất đai, Thuế, Doanh nghiệp, Chưa phân loại).
- "reasoning": Giải thích ngắn gọn 1 câu về ý định người dùng.
""".strip()

        prompt = f"Truy vấn của người dùng: \"{user_query}\"\nMốc thời gian người dùng cung cấp (nếu có): {client_date or 'Không có'}"

        try:
            analysis = self.llm.generate_json(prompt=prompt, system_instruction=system_instruction)
            if "search_query" not in analysis:
                analysis["search_query"] = user_query
            if client_date and not analysis.get("target_date"):
                analysis["target_date"] = client_date
            return analysis
        except Exception as e:
            logger.warning(f"Fallback query analysis due to error: {e}")
            return {
                "search_query": user_query,
                "target_date": client_date,
                "intent": "search",
                "domain": "Chưa phân loại",
                "reasoning": "Sử dụng truy vấn trực tiếp"
            }

    def generate_grounded_answer(
        self,
        user_query: str,
        retrieved_chunks: List[Dict[str, Any]],
        analysis: Dict[str, Any]
    ) -> str:
        """
        Step 3: Synthesize grounded response with explicit legal citations and temporal verification.
        """
        if not retrieved_chunks:
            target_date_str = analysis.get('target_date')
            time_suffix = f" tại mốc thời gian {target_date_str}" if target_date_str else ""
            return (
                "⚠️ **Không tìm thấy căn cứ pháp lý phù hợp trong cơ sở dữ liệu** "
                f"với từ khóa tìm kiếm *\"{analysis.get('search_query', user_query)}\"*{time_suffix}.\n\n"
                "Vui lòng kiểm tra lại mốc thời gian hoặc mở rộng phạm vi câu hỏi."
            )

        # Prepare context blocks
        context_blocks = []
        for idx, chunk in enumerate(retrieved_chunks, start=1):
            doc_title = chunk.get("document_title", "Văn bản quy phạm")
            doc_identity = chunk.get("doc_identity", "")
            hierarchy = " > ".join(chunk.get("hierarchy_path", []))
            issue_date = chunk.get("issue_date", "Chưa rõ")
            effect_date = chunk.get("effect_date", "Chưa rõ")
            expire_date = chunk.get("expire_date") or "Đang cập nhật / Không xác định"
            effect_status = chunk.get("effect_status_name", "Chưa xác định")
            lead_in = chunk.get("lead_in_text") or ""
            text = chunk.get("text", "")

            block = (
                f"--- [TÀI LIỆU {idx}] ---\n"
                f"Văn bản: {doc_title} (Số hiệu: {doc_identity})\n"
                f"Phân cấp: {hierarchy}\n"
                f"Ngày ban hành: {issue_date} | Ngày có hiệu lực: {effect_date} | Ngày hết hiệu lực: {expire_date}\n"
                f"Trạng thái hiệu lực: {effect_status}\n"
                f"Nội dung điều khoản:\n{lead_in} {text}\n"
            )
            context_blocks.append(block)

        context_str = "\n".join(context_blocks)

        system_instruction = """
Bạn là Trợ lý Pháp lý Thông minh Evidentia (Agentic Legal Assistant).
Nhiệm vụ: Trả lời câu hỏi của người dùng một cách chuyên nghiệp, chính xác, có cơ sở pháp lý vững chắc dựa trên các tài liệu được cung cấp.

Quy tắc bắt buộc:
1. TRUNG THỰC VÀ GROUNDED: Chỉ đưa ra kết luận dựa trên các tài liệu đã cung cấp. Không bịa đặt điều luật hay số hiệu văn bản.
2. DẪN CHỨNG RÕ RÀNG: Luôn ghi rõ trích dẫn (ví dụ: *Khoản 1 Điều 2 Bộ luật Lao động số 45/2019/QH14*).
3. ĐÁNH GIÁ HIỆU LỰC: Nêu rõ tình trạng hiệu lực của văn bản/điều khoản được áp dụng.
4. CẤU TRÚC RÕ RÀNG:
   - **Kết luận / Tóm tắt câu trả lời**
   - **Căn cứ pháp lý chi tiết** (phân tích từng điều khoản liên quan)
   - **Lưu ý về hiệu lực thời gian & Áp dụng thực tế**
""".strip()

        target_date_info = f"Mốc thời gian tra cứu: {analysis.get('target_date')}" if analysis.get('target_date') else "Mốc thời gian tra cứu: Thời điểm hiện tại"

        prompt = f"""
CÂU HỎI NGƯỜI DÙNG:
"{user_query}"

{target_date_info}
Lĩnh vực: {analysis.get('domain', 'Pháp luật')}

NGỮ CẢNH VĂN BẢN PHÁP LUẬT ĐÃ TRUY XUẤT ĐƯỢC:
{context_str}

Hãy trả lời câu hỏi của người dùng theo đúng các quy tắc trên.
""".strip()

        return self.llm.generate(prompt=prompt, system_instruction=system_instruction, temperature=0.2)

    def run(
        self,
        query: str,
        target_date: Optional[str] = None,
        top_k: int = 5
    ) -> Dict[str, Any]:
        """
        Full Agentic-RAG Pipeline:
        1. Analyze Query & Temporal Intent
        2. Hybrid Retrieval on Qdrant Cloud
        3. Citation Verification & Answer Generation
        """
        steps = []
        
        # Step 1: Query & Intent Analysis
        logger.debug("Step 1: Query & Intent Analysis")
        steps.append({"step": "query_analysis", "status": "running", "message": "Phân tích câu hỏi và mốc thời gian..."})
        analysis = self.analyze_query(user_query=query, client_date=target_date)
        search_query = analysis.get("search_query", query)
        resolved_date = analysis.get("target_date") or target_date
        steps[-1]["status"] = "completed"
        steps[-1]["details"] = {
            "search_query": search_query,
            "target_date": resolved_date,
            "domain": analysis.get("domain"),
            "intent": analysis.get("intent")
        }

        # Step 2: Hybrid Retrieval on Qdrant Cloud
        logger.debug("Step 2: Hybrid Retrieval on Qdrant Cloud")
        steps.append({
            "step": "hybrid_retrieval",
            "status": "running",
            "message": f"Tìm kiếm Hybrid (BM25 + Dense) trên Qdrant Cloud..."
        })
        
        retrieved_chunks = self.retriever.search(
            query=search_query,
            target_date=resolved_date,
            top_k=top_k
        )

        # Fallback: if no chunks found with strict temporal filter, try search without filter
        if not retrieved_chunks and resolved_date:
            logger.info("No chunks found with strict temporal filter. Retrying broad search...")
            retrieved_chunks = self.retriever.search(
                query=search_query,
                target_date=None,
                top_k=top_k
            )

        steps[-1]["status"] = "completed"
        steps[-1]["details"] = {
            "num_retrieved": len(retrieved_chunks),
            "top_sources": [
                f"{c.get('document_title')} - {c.get('article_title') or 'Điều khoản'}"
                for c in retrieved_chunks[:3]
            ]
        }

        # Step 3: Answer Generation & Citations Grounding
        steps.append({
            "step": "answer_synthesis",
            "status": "running",
            "message": "Kiểm chứng trích dẫn và tổng hợp câu trả lời với Gemini Flash Lite..."
        })
        
        answer = self.generate_grounded_answer(
            user_query=query,
            retrieved_chunks=retrieved_chunks,
            analysis=analysis
        )
        steps[-1]["status"] = "completed"

        # Format clean citations for UI
        citations = []
        for c in retrieved_chunks:
            citations.append({
                "chunk_id": c.get("chunk_id"),
                "document_title": c.get("document_title"),
                "doc_identity": c.get("doc_identity"),
                "article_number": c.get("article_number"),
                "article_title": c.get("article_title"),
                "clause_number": c.get("clause_number"),
                "point": c.get("point"),
                "issue_date": c.get("issue_date"),
                "effect_date": c.get("effect_date"),
                "expire_date": c.get("expire_date"),
                "effect_status_name": c.get("effect_status_name"),
                "hierarchy_path": c.get("hierarchy_path", []),
                "text": c.get("text", ""),
                "score": c.get("score", 0.0),
                "vbpl_url": c.get("vbpl_url")
            })

        return {
            "query": query,
            "answer": answer,
            "analysis": analysis,
            "citations": citations,
            "steps": steps
        }

# Singleton instance
legal_agentic_rag = LegalAgenticRAG()