"""Placeholder for the Nugen model API.

No network calls are made. `generate_reply` returns a canned answer and a
confidence score derived from the question, so the same question always gets
the same reply. Replace the body of `generate_reply` with the real API call.
"""

import hashlib
from dataclasses import dataclass


@dataclass(frozen=True)
class Reply:
    content: str
    confidence: float  # 0.0 - 1.0


def generate_reply(history: list[tuple[str, str]]) -> Reply:
    """Return a reply to the last user message.

    `history` is the full conversation as (role, content) pairs, oldest first.
    """
    question = history[-1][1] if history else ""
    digest = hashlib.sha256(question.encode()).digest()
    confidence = round(0.4 + (digest[0] / 255) * 0.59, 2)
    content = (
        "This is a placeholder answer from the dummy model. "
        f'You asked: "{question.strip()}". '
        "The real Nugen model will answer with references to the Income-tax Act, 2025."
    )
    return Reply(content=content, confidence=confidence)
