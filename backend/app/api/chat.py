from fastapi import APIRouter, HTTPException, Depends
from typing import List
from app.models.schemas import (
    ChatRequest, ChatResponse, ChatMessage, ScorecardResponse, Vertical
)
from app.core.config import get_settings
from app.core.token_counter import count_chat_request_tokens
from app.core.prompt_compressor import compress_prompt
from app.core.openai_client import get_groq_client
from app.prompts.system_prompt import get_system_prompt
import json
import logging

router = APIRouter()
logger = logging.getLogger(__name__)
settings = get_settings()


def get_groq_client_instance():
    return get_groq_client()


def build_messages(
    system_prompt: str,
    conversation_history: List[ChatMessage],
    user_message: str
) -> List[dict]:
    messages = [{"role": "system", "content": system_prompt}]
    for msg in conversation_history:
        messages.append({"role": msg.role, "content": msg.content})
    messages.append({"role": "user", "content": user_message})
    return messages


def try_parse_scorecard(content: str) -> ScorecardResponse | None:
    try:
        data = json.loads(content)
        return ScorecardResponse(**data)
    except (json.JSONDecodeError, ValueError):
        return None


@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest) -> ChatResponse:
    vertical = request.vertical
    system_prompt = get_system_prompt(vertical)

    token_count = count_chat_request_tokens(
        system_prompt,
        request.conversation_history,
        request.message,
        settings.groq_model
    )

    logger.info(f"Token count: {token_count}, threshold: {settings.token_threshold}")

    if token_count > settings.token_threshold:
        logger.info("Compressing prompt...")
        compressed_prompt = compress_prompt(
            system_prompt,
            request.conversation_history,
            request.message,
            settings.target_token_budget
        )
        messages = [{"role": "user", "content": compressed_prompt}]
    else:
        messages = build_messages(system_prompt, request.conversation_history, request.message)

    try:
        groq_client = get_groq_client_instance()
        response = await groq_client.chat_completion(
            messages=messages,
            model=settings.groq_model,
            max_tokens=settings.groq_max_tokens,
            temperature=0.3,
            response_format={"type": "json_object"} if token_count > settings.token_threshold else None
        )
    except Exception as e:
        logger.error(f"Groq error: {str(e)}")
        raise HTTPException(status_code=503, detail=f"AI service unavailable: {str(e)}")

    assistant_content = response["choices"][0]["message"]["content"]

    scorecard = try_parse_scorecard(assistant_content)
    if scorecard:
        return ChatResponse(
            response="",
            scorecard=scorecard,
            interview_complete=True
        )

    return ChatResponse(
        response=assistant_content,
        scorecard=None,
        interview_complete=False
    )


@router.get("/health")
async def health_check():
    return {"status": "healthy", "service": "cyberciso-backend"}