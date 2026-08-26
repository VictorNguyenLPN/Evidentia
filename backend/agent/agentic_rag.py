import json
import logging
from datetime import datetime
from typing import List, Dict, Any, Optional, Tuple

from backend.agent.gemini_llm import gemini_client
from backend.agent.tools import (
    execute_tool,
    search_legal_clauses,
    get_law_document_detail,
    get_law_article,
    TOOLS_SCHEMA
)

logger = logging.getLogger(__name__)

REACT_SYSTEM_INSTRUCTION = f"""
Bạn là AI Điều Phối Trợ Lý Pháp Luật Evidentia (Autonomous Legal ReAct Agent).
Nhiệm vụ của bạn là giải quyết câu hỏi của người dùng bằng cách suy luận từng bước (ReAct: Thought -> Action -> Observation).

Hôm nay là: {datetime.now().strftime('%Y-%m-%d')}.

BẠN CÓ CÁC CÔNG CỤ (TOOLS) SAU:
1. `search_legal_clauses(query: string, target_date: string | null, doc_type: string | null, top_k: int)`:
   - Tìm kiếm các điều khoản pháp luật liên quan bằng Hybrid Search (Dense Vector + BM25) trên cơ sở dữ liệu pháp luật Việt Nam.
   - QUAN TRỌNG: Kết quả trả về ĐÃ BAO GỒM TOÀN VĂN nội dung từng điều/khoản. Nếu kết quả đã đủ thông tin trả lời, PHẢI chọn `final_answer` ngay lập tức, KHÔNG gọi lại `get_law_article` thừa thãi.
2. `get_law_document_detail(document_id: string)`:
   - Tra cứu cấu trúc chương mục, ngày ban hành/hiệu lực của một văn bản (ví dụ: '45/2019/QH14').
3. `get_law_article(document_id: string, article_number: int)`:
   - Tra cứu toàn văn một điều luật cụ thể (ví dụ: document_id='45/2019/QH14', article_number=98).
   - CHỈ sử dụng khi bạn cần xem một điều luật khác chưa xuất hiện trong kết quả `search_legal_clauses` (ví dụ: điều khoản tìm thấy viện dẫn "theo quy định tại Điều X" mà Điều X chưa có trong danh sách).
4. `final_answer`:
   - Dùng khi bạn ĐÃ CÓ ĐỦ thông tin pháp lý từ các công cụ hoặc câu hỏi là chào hỏi/thông thường không cần tra cứu.

QUY TẮC PHẢN HỒI (BẮT BUỘC TRẢ VỀ JSON HỢP LỆ):
Ở mỗi lượt, bạn chỉ trả về JSON duy nhất theo định dạng:
{{
    "thought": "Giải thích ngắn gọn 1-2 câu về suy nghĩ hiện tại và lý do thực hiện hành động tiếp theo.",
    "action": "tên_công_cụ_hoặc_final_answer",
    "action_input": {{
        "tham_số_1": "giá_trị_1"
    }}
}}

VÍ DỤ:
1. Nếu người dùng chào hỏi / hỏi thông tin chung:
{{
    "thought": "Đây là câu chào hỏi thông thường, không cần tra cứu cơ sở dữ liệu pháp luật.",
    "action": "final_answer",
    "action_input": {{
        "direct_response": "Xin chào! Tôi là Evidentia, trợ lý pháp lý thông minh. Tôi có thể hỗ trợ bạn tra cứu văn bản quy phạm pháp luật và tư vấn quy định hiện hành."
    }}
}}

2. Nếu cần tìm kiếm điều khoản:
{{
    "thought": "Cần tra cứu quy định về tiền lương làm thêm giờ vào ngày lễ theo Bộ luật Lao động.",
    "action": "search_legal_clauses",
    "action_input": {{
        "query": "tiền lương làm thêm giờ ngày nghỉ lễ tết",
        "target_date": null,
        "top_k": 5
    }}
}}

3. Nếu đã đủ căn cứ pháp lý trong Observation:
{{
    "thought": "Các điều khoản tìm thấy từ Điều 98 và Điều 112 Bộ luật Lao động 2019 đã đầy đủ thông tin để trả lời chính xác mức lương làm thêm giờ ngày lễ.",
    "action": "final_answer",
    "action_input": {{}}
}}
""".strip()

class LegalAgenticRAG:
    """
    Autonomous ReAct Agent for Vietnamese Legal Intelligence.
    Features:
    - Multi-turn autonomous Tool Use (search_legal_clauses, get_law_document_detail, get_law_article)
    - Dynamic Thought -> Action -> Observation loop
    - Real-Time Event Streaming with dynamic steps
    - Grounded Legal Answer Synthesis
    """
    def __init__(self, llm=gemini_client, max_turns: int = 8):
        self.llm = llm
        self.max_turns = max_turns

    def _build_react_prompt(
        self,
        user_query: str,
        target_date: Optional[str],
        history_trace: List[Dict[str, Any]]
    ) -> str:
        prompt = f"CÂU HỎI NGƯỜI DÙNG: \"{user_query}\"\n"
        if target_date:
            prompt += f"MỐC THỜI GIAN TRA CỨU: {target_date}\n"

        if not history_trace:
            prompt += "\nĐây là bước đầu tiên. Hãy phân tích và đưa ra hành động (Action) đầu tiên."
        else:
            prompt += "\nLỊCH SỬ CÁC BƯỚC ĐÃ THỰC HIỆN TRƯỚC ĐÓ:\n"
            for i, step in enumerate(history_trace, 1):
                prompt += f"--- Vòng {i} ---\n"
                prompt += f"Thought: {step.get('thought')}\n"
                prompt += f"Action: {step.get('action')}({json.dumps(step.get('action_input', {}), ensure_ascii=False)})\n"
                prompt += f"Observation: {step.get('observation', 'Không có kết quả')}\n\n"
            prompt += "Dựa vào các quan sát trên, hãy đưa ra Thought và Action tiếp theo (hoặc final_answer nếu đã đủ)."

        return prompt

    def _extract_citations(self, chunks: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        citations = []
        seen_ids = set()
        for c in chunks:
            cid = c.get("chunk_id") or f"{c.get('doc_identity')}_{c.get('article_number')}_{c.get('clause_number')}"
            if cid in seen_ids:
                continue
            seen_ids.add(cid)
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
        return citations

    def _format_context_blocks(self, retrieved_chunks: List[Dict[str, Any]]) -> List[str]:
        context_blocks = []
        for idx, chunk in enumerate(retrieved_chunks, start=1):
            doc_title = chunk.get("document_title", "Văn bản quy phạm")
            doc_identity = chunk.get("doc_identity", "")
            hierarchy = " > ".join(chunk.get("hierarchy_path", []))
            issue_date = chunk.get("issue_date", "Chưa rõ")
            effect_date = chunk.get("effect_date", "Chưa rõ")
            expire_date = chunk.get("expire_date") or "Đang áp dụng / Chưa hết hiệu lực"
            effect_status = chunk.get("effect_status_name", "Chưa xác định")
            lead_in = chunk.get("lead_in_text") or ""
            text = chunk.get("text", "")

            block = (
                f"--- [CĂN CỨ PHÁP LÝ {idx}] ---\n"
                f"Văn bản: {doc_title} (Số hiệu: {doc_identity})\n"
                f"Phân cấp: {hierarchy}\n"
                f"Ngày ban hành: {issue_date} | Ngày có hiệu lực: {effect_date} | Hết hiệu lực: {expire_date}\n"
                f"Trạng thái hiệu lực: {effect_status}\n"
                f"Nội dung điều khoản:\n{lead_in} {text}\n"
            )
            context_blocks.append(block)
        return context_blocks

    def _get_synthesis_system_instruction(self) -> str:
        return """
Bạn là Trợ lý Pháp lý Thông minh Evidentia (Evidentia Legal AI Assistant).
Nhiệm vụ: Trả lời câu hỏi pháp lý của người dùng một cách trực diện, chính xác, súc tích và có cơ sở pháp lý vững chắc dựa trên các tài liệu đã được cung cấp.

QUY TẮC NỘI DUNG:
1. TUYỆT ĐỐI KHÔNG CHÀO HỎI XÃ GIAO: Không mở đầu bằng các câu như "Chào bạn...", "Tôi xin giải đáp...", "Với tư cách là trợ lý...". Hãy đi thẳng trực tiếp vào nội dung trả lời.
2. TRUNG THỰC VÀ GROUNDED: Chỉ đưa ra kết luận dựa trên các tài liệu đã cung cấp. Không bịa đặt điều luật hay số hiệu văn bản.
3. DẪN CHỨNG RÕ RÀNG: Luôn ghi rõ trích dẫn cụ thể (ví dụ: *Khoản 1 Điều 98 Bộ luật Lao động số 45/2019/QH14*).
4. ĐÁNH GIÁ HIỆU LỰC: Nêu rõ tình trạng hiệu lực của văn bản/điều khoản được áp dụng tại mốc thời gian tra cứu.

QUY TẮC ĐỊNH DẠNG MARKDOWN:
1. CẤU TRÚC VĂN BẢN VỚI HEADING:
   Sử dụng heading cấp độ 3 (`###`) hoặc 4 (`####`) để chia rõ ràng các phần:
   - `### 1. Kết luận`: Câu trả lời trực diện, ngắn gọn 1-2 câu cho vấn đề người dùng hỏi.
   - `### 2. Căn cứ & Phân tích pháp lý`: Phân tích chi tiết từng quy định, nội dung điều khoản áp dụng.
   - `### 3. Bảng tổng hợp quy định / So sánh` (NẾU THỰC SỰ CẦN THIẾT): Sử dụng bảng Markdown khi cần đối chiếu các trường hợp, tỷ lệ % (ví dụ: % lương làm thêm giờ), mức xử phạt, thời hạn giải quyết hoặc phân loại điều kiện.
   - `### 4. Lưu ý & Áp dụng thực tế`: Các điều kiện áp dụng, trường hợp ngoại lệ hoặc lưu ý về hiệu lực thời gian.
2. SỬ DỤNG BULLET POINTS & DANH SÁCH:
   - Sử dụng bullet points (`- `) hoặc danh sách đánh số (`1. `, `2. `) để trình bày các điều kiện, tiêu chí, quyền và nghĩa vụ giúp người đọc dễ nắm bắt thông tin.
3. SỬ DỤNG BẢNG MARKDOWN (TABLE) KHI THỰC SỰ CẦN THIẾT:
   - Khi câu trả lời liên quan đến việc so sánh nhiều trường hợp, bảng biểu phí, mức phạt theo từng khung, tỷ lệ tiền lương làm thêm giờ, các mốc thời hạn... hãy trình bày bằng bảng Markdown chuẩn.
   - BẮT BUỘC: Mỗi hàng bảng phải nằm trên một dòng riêng biệt có dấu xuống dòng `\n`, có hàng tiêu đề và hàng phân cách `| :--- | :--- | :--- |`. Tuyệt đối không viết gộp các hàng bảng trên cùng một dòng.
4. NHẤN MẠNH (EMPHASIS):
   - In đậm `**...**` cho các từ khóa cốt lõi, mốc thời gian, số tiền/tỷ lệ quan trọng.
   - In nghiêng `*...*` cho tên văn bản quy phạm pháp luật và trích dẫn điều khoản.
""".strip()

    def generate_grounded_answer_with_usage(
        self,
        user_query: str,
        retrieved_chunks: List[Dict[str, Any]],
        target_date: Optional[str] = None
    ) -> Tuple[str, Dict[str, int]]:
        if not retrieved_chunks:
            time_suffix = f" tại mốc thời gian {target_date}" if target_date else ""
            return (
                "⚠️ **Không tìm thấy căn cứ pháp lý phù hợp trong cơ sở dữ liệu** "
                f"cho câu hỏi *\"{user_query}\"*{time_suffix}.\n\n"
                "Vui lòng kiểm tra lại mốc thời gian hoặc mở rộng phạm vi câu hỏi."
            ), {"prompt_tokens": 0, "system_tokens": 0, "answer_tokens": 0, "total_tokens": 0}

        context_blocks = self._format_context_blocks(retrieved_chunks)
        context_str = "\n".join(context_blocks)
        system_instruction = self._get_synthesis_system_instruction()
        target_date_info = f"Mốc thời gian tra cứu: {target_date}" if target_date else "Mốc thời gian tra cứu: Thời điểm hiện tại"

        prompt = f"""
CÂU HỎI NGƯỜI DÙNG:
"{user_query}"

{target_date_info}

NGỮ CẢNH VĂN BẢN PHÁP LUẬT ĐÃ ĐƯỢC AGENT TRUY XUẤT:
{context_str}

YÊU CẦU:
Hãy trả lời câu hỏi của người dùng theo đúng các quy tắc nội dung và định dạng Markdown chuẩn (sử dụng heading `###`, danh sách bullet points `- `, và bảng table `|...|` nếu cần thiết để so sánh/tổng hợp dữ liệu).
""".strip()

        return self.llm.generate_with_usage(prompt=prompt, system_instruction=system_instruction, temperature=0.2)

    def generate_grounded_answer(
        self,
        user_query: str,
        retrieved_chunks: List[Dict[str, Any]],
        target_date: Optional[str] = None
    ) -> str:
        text, _ = self.generate_grounded_answer_with_usage(user_query, retrieved_chunks, target_date)
        return text

    def generate_grounded_answer_stream_with_usage(
        self,
        user_query: str,
        retrieved_chunks: List[Dict[str, Any]],
        target_date: Optional[str] = None
    ):
        if not retrieved_chunks:
            time_suffix = f" tại mốc thời gian {target_date}" if target_date else ""
            fallback = (
                "⚠️ **Không tìm thấy căn cứ pháp lý phù hợp trong cơ sở dữ liệu** "
                f"cho câu hỏi *\"{user_query}\"*{time_suffix}.\n\n"
                "Vui lòng kiểm tra lại mốc thời gian hoặc mở rộng phạm vi câu hỏi."
            )
            yield {"type": "token", "content": fallback}
            yield {"type": "usage", "usage": {"prompt_tokens": 0, "system_tokens": 0, "answer_tokens": 0, "total_tokens": 0}}
            return

        context_blocks = self._format_context_blocks(retrieved_chunks)
        context_str = "\n".join(context_blocks)
        system_instruction = self._get_synthesis_system_instruction()
        target_date_info = f"Mốc thời gian tra cứu: {target_date}" if target_date else "Mốc thời gian tra cứu: Thời điểm hiện tại"

        prompt = f"""
CÂU HỎI NGƯỜI DÙNG:
"{user_query}"

{target_date_info}

NGỮ CẢNH VĂN BẢN PHÁP LUẬT ĐÃ ĐƯỢC AGENT TRUY XUẤT:
{context_str}

YÊU CẦU:
Hãy trả lời câu hỏi của người dùng theo đúng các quy tắc nội dung và định dạng Markdown chuẩn (sử dụng heading `###`, danh sách bullet points `- `, và bảng table `|...|` nếu cần thiết để so sánh/tổng hợp dữ liệu).
""".strip()

        for event in self.llm.generate_stream_with_usage(prompt=prompt, system_instruction=system_instruction, temperature=0.2):
            if event.get("type") == "text":
                yield {"type": "token", "content": event.get("content", "")}
            elif event.get("type") == "usage":
                yield {"type": "usage", "usage": event.get("usage", {})}

    def generate_grounded_answer_stream(
        self,
        user_query: str,
        retrieved_chunks: List[Dict[str, Any]],
        target_date: Optional[str] = None
    ):
        for event in self.generate_grounded_answer_stream_with_usage(user_query, retrieved_chunks, target_date):
            if event.get("type") == "token":
                yield event.get("content", "")

    def run(
        self,
        query: str,
        target_date: Optional[str] = None,
        top_k: int = 5
    ) -> Dict[str, Any]:
        """
        Autonomous ReAct Agent execution (Synchronous Batch).
        """
        steps = []
        history_trace = []
        accumulated_chunks = []
        seen_chunk_ids = set()
        final_direct_answer = None
        final_synthesis_thought = None

        thinking_prompt = 0
        thinking_system = 0
        thinking_answer = 0
        thinking_total = 0
        token_breakdown = []

        for turn in range(1, self.max_turns + 1):
            prompt = self._build_react_prompt(query, target_date, history_trace)
            step_id = f"agent_turn_{turn}"

            try:
                decision, turn_usage = self.llm.generate_json_with_usage(prompt=prompt, system_instruction=REACT_SYSTEM_INSTRUCTION)
            except Exception as e:
                logger.warning(f"Error during ReAct LLM call: {e}")
                decision = {
                    "thought": "Tra cứu trực tiếp cơ sở dữ liệu pháp luật.",
                    "action": "search_legal_clauses",
                    "action_input": {"query": query, "target_date": target_date, "top_k": top_k}
                }
                turn_usage = {"prompt_tokens": 0, "system_tokens": 0, "answer_tokens": 0, "total_tokens": 0}

            thinking_prompt += turn_usage.get("prompt_tokens", 0)
            thinking_system += turn_usage.get("system_tokens", 0)
            thinking_answer += turn_usage.get("answer_tokens", 0)
            thinking_total += turn_usage.get("total_tokens", 0)

            thought = decision.get("thought", "")
            action = decision.get("action", "final_answer")
            action_input = decision.get("action_input", {})

            # Case: Final Answer
            if action == "final_answer":
                if not accumulated_chunks and action_input and action_input.get("direct_response"):
                    final_direct_answer = action_input.get("direct_response")
                    steps.append({
                        "step": step_id,
                        "step_type": "direct_answer",
                        "title": "Phân tích & Phản hồi trực tiếp",
                        "status": "completed",
                        "message": thought or "Trả lời trực tiếp yêu cầu của người dùng",
                        "details": {"thought": thought, "reasoning": thought}
                    })
                    token_breakdown.append({
                        "step": step_id,
                        "phase": "thinking",
                        "title": "Phân tích & Phản hồi trực tiếp",
                        "prompt_tokens": turn_usage.get("prompt_tokens", 0),
                        "system_tokens": turn_usage.get("system_tokens", 0),
                        "answer_tokens": turn_usage.get("answer_tokens", 0),
                        "total_tokens": turn_usage.get("total_tokens", 0)
                    })
                else:
                    final_synthesis_thought = thought or "Đã thu thập đầy đủ căn cứ pháp lý cần thiết. Bắt đầu tổng hợp câu trả lời chi tiết và kiểm chứng tính hiệu lực."
                    token_breakdown.append({
                        "step": step_id,
                        "phase": "thinking",
                        "title": "Tổng hợp kết quả & Quyết định",
                        "prompt_tokens": turn_usage.get("prompt_tokens", 0),
                        "system_tokens": turn_usage.get("system_tokens", 0),
                        "answer_tokens": turn_usage.get("answer_tokens", 0),
                        "total_tokens": turn_usage.get("total_tokens", 0)
                    })
                break

            # Execute Tool Action
            tool_title = f"Gọi công cụ: {action}"
            if action == "search_legal_clauses":
                tool_title = f"Tìm kiếm điều khoản: \"{action_input.get('query', query)}\""
            elif action == "get_law_document_detail":
                tool_title = f"Tra cứu văn bản: {action_input.get('document_id', '')}"
            elif action == "get_law_article":
                tool_title = f"Tra cứu Điều {action_input.get('article_number', '')} ({action_input.get('document_id', '')})"

            token_breakdown.append({
                "step": step_id,
                "phase": "thinking",
                "title": tool_title,
                "prompt_tokens": turn_usage.get("prompt_tokens", 0),
                "system_tokens": turn_usage.get("system_tokens", 0),
                "answer_tokens": turn_usage.get("answer_tokens", 0),
                "total_tokens": turn_usage.get("total_tokens", 0)
            })

            steps.append({
                "step": step_id,
                "step_type": "tool_call",
                "tool": action,
                "tool_args": action_input,
                "title": tool_title,
                "status": "running",
                "message": thought or f"Đang thực thi {action}...",
                "details": {
                    "thought": thought,
                    "reasoning": thought,
                    "tool": action,
                    "tool_args": action_input
                }
            })

            # Execute tool
            tool_res = execute_tool(action, action_input)

            observation = ""
            if action == "search_legal_clauses" and isinstance(tool_res, list):
                new_count = 0
                for c in tool_res:
                    cid = c.get("chunk_id") or c.get("id") or str(hash(c.get("text", "")))
                    if cid not in seen_chunk_ids:
                        seen_chunk_ids.add(cid)
                        accumulated_chunks.append(c)
                        new_count += 1

                top_sources = [
                    f"{c.get('document_title')} - {c.get('article_title') or 'Điều khoản'}"
                    for c in accumulated_chunks[:4]
                ]
                observation = f"Tìm thấy {len(tool_res)} điều khoản liên quan. Nguồn tiêu biểu: {', '.join(top_sources[:2])}."
                steps[-1]["status"] = "completed"
                steps[-1]["details"]["num_retrieved"] = len(accumulated_chunks)
                steps[-1]["details"]["top_sources"] = top_sources
                steps[-1]["details"]["search_query"] = action_input.get("query")
            elif action == "get_law_document_detail" and isinstance(tool_res, dict):
                doc_title = tool_res.get("title", "")
                observation = f"Đã lấy thông tin văn bản: {doc_title} (Số hiệu: {tool_res.get('doc_identity')})."
                steps[-1]["status"] = "completed"
                steps[-1]["details"]["document_title"] = doc_title
            elif action == "get_law_article" and isinstance(tool_res, dict):
                art_title = tool_res.get("title", "")
                art_text = tool_res.get("text", "")
                observation = f"Nội dung Điều {action_input.get('article_number')}: {art_title} - {art_text[:150]}..."
                # Accumulate article chunk as evidence
                accumulated_chunks.append(tool_res)
                steps[-1]["status"] = "completed"
                steps[-1]["details"]["article_title"] = art_title
            else:
                observation = f"Kết quả từ {action}: {str(tool_res)[:200]}"
                steps[-1]["status"] = "completed"

            history_trace.append({
                "thought": thought,
                "action": action,
                "action_input": action_input,
                "observation": observation
            })

        # Answer Synthesis
        synthesis_tokens = {"prompt_tokens": 0, "system_tokens": 0, "answer_tokens": 0, "total_tokens": 0}
        if final_direct_answer and not accumulated_chunks:
            answer = final_direct_answer
        else:
            synthesis_thought = final_synthesis_thought or f"Đã hoàn tất các bước tra cứu ({len(accumulated_chunks)} căn cứ pháp lý thu thập được). Bắt đầu kiểm chứng và tổng hợp câu trả lời."
            steps.append({
                "step": "answer_synthesis",
                "step_type": "synthesis",
                "title": "Kiểm chứng & Tổng hợp câu trả lời",
                "status": "running",
                "message": synthesis_thought,
                "details": {
                    "thought": synthesis_thought,
                    "reasoning": synthesis_thought
                }
            })
            answer, synthesis_tokens = self.generate_grounded_answer_with_usage(
                user_query=query,
                retrieved_chunks=accumulated_chunks,
                target_date=target_date
            )
            steps[-1]["status"] = "completed"
            token_breakdown.append({
                "step": "answer_synthesis",
                "phase": "synthesis",
                "title": "Kiểm chứng & Tổng hợp câu trả lời",
                "prompt_tokens": synthesis_tokens.get("prompt_tokens", 0),
                "system_tokens": synthesis_tokens.get("system_tokens", 0),
                "answer_tokens": synthesis_tokens.get("answer_tokens", 0),
                "total_tokens": synthesis_tokens.get("total_tokens", 0)
            })

        citations = self._extract_citations(accumulated_chunks)

        total_prompt = thinking_prompt + synthesis_tokens.get("prompt_tokens", 0)
        total_system = thinking_system + synthesis_tokens.get("system_tokens", 0)
        total_answer = thinking_answer + synthesis_tokens.get("answer_tokens", 0)
        total_tokens = thinking_total + synthesis_tokens.get("total_tokens", 0)

        token_usage = {
            "prompt_tokens": total_prompt,
            "system_tokens": total_system,
            "answer_tokens": total_answer,
            "total_tokens": total_tokens,
            "thinking_tokens": {
                "prompt_tokens": thinking_prompt,
                "system_tokens": thinking_system,
                "answer_tokens": thinking_answer,
                "total_tokens": thinking_total
            },
            "synthesis_tokens": synthesis_tokens,
            "breakdown": token_breakdown
        }

        return {
            "query": query,
            "answer": answer,
            "analysis": {
                "search_query": history_trace[0]["action_input"].get("query") if history_trace and history_trace[0].get("action") == "search_legal_clauses" else query,
                "target_date": target_date,
                "reasoning": history_trace[0].get("thought") if history_trace else "Xử lý trực tiếp",
                "intent": "search" if accumulated_chunks else "general"
            },
            "citations": citations,
            "steps": steps,
            "token_usage": token_usage
        }

    def run_stream(
        self,
        query: str,
        target_date: Optional[str] = None,
        top_k: int = 5
    ):
        """
        Autonomous ReAct Agent execution with Real-Time SSE Streaming.
        Yields dynamic step events for every tool action and reflection.
        """
        steps = []
        history_trace = []
        accumulated_chunks = []
        seen_chunk_ids = set()
        final_direct_answer = None
        final_synthesis_thought = None

        thinking_prompt = 0
        thinking_system = 0
        thinking_answer = 0
        thinking_total = 0
        token_breakdown = []

        for turn in range(1, self.max_turns + 1):
            prompt = self._build_react_prompt(query, target_date, history_trace)
            step_id = f"agent_turn_{turn}"

            try:
                decision, turn_usage = self.llm.generate_json_with_usage(prompt=prompt, system_instruction=REACT_SYSTEM_INSTRUCTION)
            except Exception as e:
                logger.warning(f"Error during ReAct LLM call: {e}")
                decision = {
                    "thought": "Tra cứu trực tiếp cơ sở dữ liệu pháp luật.",
                    "action": "search_legal_clauses",
                    "action_input": {"query": query, "target_date": target_date, "top_k": top_k}
                }
                turn_usage = {"prompt_tokens": 0, "system_tokens": 0, "answer_tokens": 0, "total_tokens": 0}

            thinking_prompt += turn_usage.get("prompt_tokens", 0)
            thinking_system += turn_usage.get("system_tokens", 0)
            thinking_answer += turn_usage.get("answer_tokens", 0)
            thinking_total += turn_usage.get("total_tokens", 0)

            thought = decision.get("thought", "")
            action = decision.get("action", "final_answer")
            action_input = decision.get("action_input", {})

            # Case: Final Answer
            if action == "final_answer":
                if not accumulated_chunks and action_input and action_input.get("direct_response"):
                    final_direct_answer = action_input.get("direct_response")
                    step_data = {
                        "step": step_id,
                        "step_type": "direct_answer",
                        "title": "Phân tích & Phản hồi trực tiếp",
                        "status": "completed",
                        "message": thought or "Trả lời trực tiếp yêu cầu của người dùng",
                        "details": {"thought": thought, "reasoning": thought}
                    }
                    steps.append(step_data)
                    token_breakdown.append({
                        "step": step_id,
                        "phase": "thinking",
                        "title": "Phân tích & Phản hồi trực tiếp",
                        "prompt_tokens": turn_usage.get("prompt_tokens", 0),
                        "system_tokens": turn_usage.get("system_tokens", 0),
                        "answer_tokens": turn_usage.get("answer_tokens", 0),
                        "total_tokens": turn_usage.get("total_tokens", 0)
                    })
                    yield {"type": "step_start", "step": step_id, "message": step_data["message"]}
                    yield {"type": "step_complete", "step": step_id, "message": step_data["message"], "details": step_data["details"]}
                else:
                    final_synthesis_thought = thought or "Đã thu thập đầy đủ căn cứ pháp lý cần thiết. Bắt đầu tổng hợp câu trả lời chi tiết và kiểm chứng tính hiệu lực."
                    token_breakdown.append({
                        "step": step_id,
                        "phase": "thinking",
                        "title": "Tổng hợp kết quả & Quyết định",
                        "prompt_tokens": turn_usage.get("prompt_tokens", 0),
                        "system_tokens": turn_usage.get("system_tokens", 0),
                        "answer_tokens": turn_usage.get("answer_tokens", 0),
                        "total_tokens": turn_usage.get("total_tokens", 0)
                    })
                break

            # Execute Tool Action
            tool_title = f"Gọi công cụ: {action}"
            if action == "search_legal_clauses":
                tool_title = f"Tìm kiếm điều khoản: \"{action_input.get('query', query)}\""
            elif action == "get_law_document_detail":
                tool_title = f"Tra cứu văn bản: {action_input.get('document_id', '')}"
            elif action == "get_law_article":
                tool_title = f"Tra cứu Điều {action_input.get('article_number', '')} ({action_input.get('document_id', '')})"

            token_breakdown.append({
                "step": step_id,
                "phase": "thinking",
                "title": tool_title,
                "prompt_tokens": turn_usage.get("prompt_tokens", 0),
                "system_tokens": turn_usage.get("system_tokens", 0),
                "answer_tokens": turn_usage.get("answer_tokens", 0),
                "total_tokens": turn_usage.get("total_tokens", 0)
            })

            step_data = {
                "step": step_id,
                "step_type": "tool_call",
                "tool": action,
                "tool_args": action_input,
                "title": tool_title,
                "status": "running",
                "message": thought or f"Đang thực thi {action}...",
                "details": {
                    "thought": thought,
                    "reasoning": thought,
                    "tool": action,
                    "tool_args": action_input
                }
            }
            steps.append(step_data)
            yield {"type": "step_start", "step": step_id, "message": step_data["message"]}

            # Execute tool
            tool_res = execute_tool(action, action_input)

            observation = ""
            if action == "search_legal_clauses" and isinstance(tool_res, list):
                for c in tool_res:
                    cid = c.get("chunk_id") or c.get("id") or str(hash(c.get("text", "")))
                    if cid not in seen_chunk_ids:
                        seen_chunk_ids.add(cid)
                        accumulated_chunks.append(c)

                top_sources = [
                    f"{c.get('document_title')} - {c.get('article_title') or 'Điều khoản'}"
                    for c in accumulated_chunks[:4]
                ]
                observation = f"Tìm thấy {len(tool_res)} điều khoản liên quan. Nguồn tiêu biểu: {', '.join(top_sources[:2])}."
                steps[-1]["status"] = "completed"
                steps[-1]["details"]["num_retrieved"] = len(accumulated_chunks)
                steps[-1]["details"]["top_sources"] = top_sources
                steps[-1]["details"]["search_query"] = action_input.get("query")
            elif action == "get_law_document_detail" and isinstance(tool_res, dict):
                doc_title = tool_res.get("title", "")
                observation = f"Đã lấy thông tin văn bản: {doc_title} (Số hiệu: {tool_res.get('doc_identity')})."
                steps[-1]["status"] = "completed"
                steps[-1]["details"]["document_title"] = doc_title
            elif action == "get_law_article" and isinstance(tool_res, dict):
                art_title = tool_res.get("title", "")
                art_text = tool_res.get("text", "")
                observation = f"Nội dung Điều {action_input.get('article_number')}: {art_title} - {art_text[:150]}..."
                accumulated_chunks.append(tool_res)
                steps[-1]["status"] = "completed"
                steps[-1]["details"]["article_title"] = art_title
            else:
                observation = f"Kết quả từ {action}: {str(tool_res)[:200]}"
                steps[-1]["status"] = "completed"

            history_trace.append({
                "thought": thought,
                "action": action,
                "action_input": action_input,
                "observation": observation
            })

            current_citations = self._extract_citations(accumulated_chunks)
            yield {
                "type": "step_complete",
                "step": step_id,
                "message": observation or f"Hoàn tất {action}",
                "details": steps[-1]["details"],
                "citations": current_citations
            }

        # Step: Answer Synthesis
        synth_step_id = "answer_synthesis"
        synthesis_thought = final_synthesis_thought or f"Đã hoàn tất các bước tra cứu ({len(accumulated_chunks)} căn cứ pháp lý thu thập được). Bắt đầu kiểm chứng và tổng hợp câu trả lời."
        step_data = {
            "step": synth_step_id,
            "step_type": "synthesis",
            "title": "Kiểm chứng & Tổng hợp câu trả lời",
            "status": "running",
            "message": synthesis_thought,
            "details": {
                "thought": synthesis_thought,
                "reasoning": synthesis_thought
            }
        }
        steps.append(step_data)
        yield {"type": "step_start", "step": synth_step_id, "message": step_data["message"]}

        full_answer = ""
        synthesis_tokens = {"prompt_tokens": 0, "system_tokens": 0, "answer_tokens": 0, "total_tokens": 0}

        if final_direct_answer and not accumulated_chunks:
            full_answer = final_direct_answer
            for char in full_answer:
                yield {"type": "token", "content": char}
        else:
            for event in self.generate_grounded_answer_stream_with_usage(
                user_query=query,
                retrieved_chunks=accumulated_chunks,
                target_date=target_date
            ):
                if event.get("type") == "token":
                    full_answer += event.get("content", "")
                    yield {"type": "token", "content": event.get("content", "")}
                elif event.get("type") == "usage":
                    synthesis_tokens = event.get("usage", {})
                    token_breakdown.append({
                        "step": synth_step_id,
                        "phase": "synthesis",
                        "title": "Kiểm chứng & Tổng hợp câu trả lời",
                        "prompt_tokens": synthesis_tokens.get("prompt_tokens", 0),
                        "system_tokens": synthesis_tokens.get("system_tokens", 0),
                        "answer_tokens": synthesis_tokens.get("answer_tokens", 0),
                        "total_tokens": synthesis_tokens.get("total_tokens", 0)
                    })

        steps[-1]["status"] = "completed"
        yield {
            "type": "step_complete",
            "step": synth_step_id,
            "message": "Hoàn tất tổng hợp câu trả lời",
            "details": step_data["details"]
        }

        final_citations = self._extract_citations(accumulated_chunks)
        final_analysis = {
            "search_query": history_trace[0]["action_input"].get("query") if history_trace and history_trace[0].get("action") == "search_legal_clauses" else query,
            "target_date": target_date,
            "reasoning": history_trace[0].get("thought") if history_trace else "Xử lý trực tiếp",
            "intent": "search" if accumulated_chunks else "general"
        }

        total_prompt = thinking_prompt + synthesis_tokens.get("prompt_tokens", 0)
        total_system = thinking_system + synthesis_tokens.get("system_tokens", 0)
        total_answer = thinking_answer + synthesis_tokens.get("answer_tokens", 0)
        total_tokens = thinking_total + synthesis_tokens.get("total_tokens", 0)

        token_usage = {
            "prompt_tokens": total_prompt,
            "system_tokens": total_system,
            "answer_tokens": total_answer,
            "total_tokens": total_tokens,
            "thinking_tokens": {
                "prompt_tokens": thinking_prompt,
                "system_tokens": thinking_system,
                "answer_tokens": thinking_answer,
                "total_tokens": thinking_total
            },
            "synthesis_tokens": synthesis_tokens,
            "breakdown": token_breakdown
        }

        yield {
            "type": "done",
            "query": query,
            "answer": full_answer,
            "analysis": final_analysis,
            "citations": final_citations,
            "steps": steps,
            "token_usage": token_usage
        }

# Singleton instance
legal_agentic_rag = LegalAgenticRAG()