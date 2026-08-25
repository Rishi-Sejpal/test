from llmlingua import PromptCompressor
from typing import List, Optional
from app.models.schemas import ChatMessage
from app.core.config import get_settings


_compressor: Optional[PromptCompressor] = None


def get_compressor() -> PromptCompressor:
    global _compressor
    if _compressor is None:
        _compressor = PromptCompressor()
    return _compressor


def compress_prompt(
    system_prompt: str,
    conversation_history: List[ChatMessage],
    user_message: str,
    target_budget: Optional[int] = None
) -> str:
    settings = get_settings()
    budget = target_budget or settings.target_token_budget

    messages = [
        {"role": "system", "content": system_prompt},
        *[{"role": msg.role, "content": msg.content} for msg in conversation_history],
        {"role": "user", "content": user_message}
    ]

    compressed = get_compressor().compress_prompt(
        messages,
        rate=0.5,
        target_token=budget,
        use_sentence_level_filter=True
    )

    compressed_messages = compressed.get("compressed_prompt", messages)
    return "\n\n".join([f"{m['role']}: {m['content']}" for m in compressed_messages])