import json
import logging
from typing import Dict, Any
from fastapi import APIRouter, HTTPException, status, Depends, Request
from fastapi.responses import StreamingResponse

from backend.agent.agentic_rag import legal_agentic_rag
from backend.db.mongo_manager import mongo_manager
from backend.auth import get_current_user
from backend.config import get_plan_question_limit
from backend.schemas.chat import ChatRequest, ChatResponse

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/chat", tags=["Agent Inference"])

@router.post("", response_model=ChatResponse)
def chat_endpoint(
    payload: ChatRequest,
    current_user: Dict[str, Any] = Depends(get_current_user),
) -> Dict[str, Any]:
    """
    Main Agentic-RAG Chat Endpoint (Batch).
    Performs Query Analysis -> Hybrid Retrieval on Qdrant Cloud -> Legal Grounding -> Persists in MongoDB.
    Requires authenticated user.
    """
    if not payload.query.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Query cannot be empty",
        )

    user_id = current_user["id"]
    user_email = current_user.get("email")
    user_plan = current_user.get("plan", "free")
    user_role = current_user.get("role", "user")

    # Check question limit based on user plan and role (No hard-coding)
    plan_limit = get_plan_question_limit(user_plan, user_role)
    if plan_limit != -1:
        questions_used = mongo_manager.get_user_question_count(user_id)
        if questions_used >= plan_limit:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Tài khoản của bạn đã sử dụng hết hạn mức {questions_used}/{plan_limit} câu hỏi. Vui lòng liên hệ nâng cấp gói cước để tiếp tục tra cứu không giới hạn.",
            )

    try:
        response_data = legal_agentic_rag.run(
            query=payload.query.strip(),
            target_date=payload.target_date,
            top_k=payload.top_k or 5,
        )

        # Persist conversation turn in MongoDB
        save_res = mongo_manager.save_chat_turn(
            chat_id=payload.chat_id,
            query=payload.query.strip(),
            answer=response_data["answer"],
            target_date=payload.target_date,
            analysis=response_data.get("analysis"),
            citations=response_data.get("citations"),
            steps=response_data.get("steps"),
            token_usage=response_data.get("token_usage"),
            user_id=user_id,
            user_email=user_email,
        )

        # Increment user question count
        mongo_manager.increment_user_question_count(user_id)

        response_data["chat_id"] = save_res.get("chat_id")
        response_data["title"] = save_res.get("title")
        response_data["tag"] = save_res.get("tag")
        response_data["user_message"] = save_res.get("user_message")
        response_data["assistant_message"] = save_res.get("assistant_message")

        return response_data
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error processing chat query: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error executing Legal Agentic-RAG pipeline: {str(e)}",
        )

@router.post("/stream")
def chat_stream_endpoint(
    payload: ChatRequest,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """
    Real-Time Streaming Agentic-RAG Chat Endpoint (SSE).
    Progressively emits step updates and answer tokens,
    then automatically persists the complete turn in MongoDB on completion.
    Requires authenticated user.
    """
    if not payload.query.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Query cannot be empty",
        )

    user_id = current_user["id"]
    user_email = current_user.get("email")
    user_plan = current_user.get("plan", "free")
    user_role = current_user.get("role", "user")

    # Check question limit based on user plan and role (No hard-coding)
    plan_limit = get_plan_question_limit(user_plan, user_role)
    if plan_limit != -1:
        questions_used = mongo_manager.get_user_question_count(user_id)
        if questions_used >= plan_limit:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Tài khoản của bạn đã sử dụng hết hạn mức {questions_used}/{plan_limit} câu hỏi. Vui lòng liên hệ nâng cấp gói cước để tiếp tục tra cứu không giới hạn.",
            )

    def event_generator():
        try:
            for event in legal_agentic_rag.run_stream(
                query=payload.query.strip(),
                target_date=payload.target_date,
                top_k=payload.top_k or 5,
            ):
                if event.get("type") == "done":
                    # Persist conversation turn in MongoDB
                    save_res = mongo_manager.save_chat_turn(
                        chat_id=payload.chat_id,
                        query=payload.query.strip(),
                        answer=event.get("answer", ""),
                        target_date=payload.target_date,
                        analysis=event.get("analysis"),
                        citations=event.get("citations"),
                        steps=event.get("steps"),
                        token_usage=event.get("token_usage"),
                        user_id=user_id,
                        user_email=user_email,
                    )
                    event["chat_id"] = save_res.get("chat_id")
                    event["title"] = save_res.get("title")
                    event["tag"] = save_res.get("tag")
                    event["user_message"] = save_res.get("user_message")
                    event["assistant_message"] = save_res.get("assistant_message")

                    # Increment user question count
                    mongo_manager.increment_user_question_count(user_id)

                # SSE message format
                yield f"data: {json.dumps(event, ensure_ascii=False)}\n\n"
        except Exception as e:
            logger.error(f"Error in chat stream: {e}", exc_info=True)
            err_event = {
                "type": "error",
                "detail": str(e),
            }
            yield f"data: {json.dumps(err_event, ensure_ascii=False)}\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )
