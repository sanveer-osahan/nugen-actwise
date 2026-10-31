from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.orm import Session

from app.db import get_db
from app.llm import generate_reply
from app.models import Chat, Message, User, utcnow
from app.schemas import ChatDetail, ChatSummary, MessageIn, MessageOut
from app.security import get_current_user

router = APIRouter(prefix="/api/chats", tags=["chats"])

TITLE_LENGTH = 60


def get_owned_chat(chat_id: int, user: User, db: Session) -> Chat:
    chat = db.get(Chat, chat_id)
    # Return 404 (not 403) for other users' chats, so chat IDs do not leak.
    if chat is None or chat.user_id != user.id:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Chat not found")
    return chat


@router.get("", response_model=list[ChatSummary])
def list_chats(
    user: User = Depends(get_current_user), db: Session = Depends(get_db)
) -> list[Chat]:
    return (
        db.query(Chat)
        .filter(Chat.user_id == user.id)
        .order_by(Chat.updated_at.desc(), Chat.id.desc())
        .all()
    )


@router.post("", response_model=ChatSummary, status_code=status.HTTP_201_CREATED)
def create_chat(
    user: User = Depends(get_current_user), db: Session = Depends(get_db)
) -> Chat:
    chat = Chat(user_id=user.id)
    db.add(chat)
    db.commit()
    db.refresh(chat)
    return chat


@router.get("/{chat_id}", response_model=ChatDetail)
def get_chat(
    chat_id: int, user: User = Depends(get_current_user), db: Session = Depends(get_db)
) -> Chat:
    return get_owned_chat(chat_id, user, db)


@router.delete("/{chat_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_chat(
    chat_id: int, user: User = Depends(get_current_user), db: Session = Depends(get_db)
) -> Response:
    db.delete(get_owned_chat(chat_id, user, db))
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.post(
    "/{chat_id}/messages",
    response_model=list[MessageOut],
    status_code=status.HTTP_201_CREATED,
)
def send_message(
    chat_id: int,
    body: MessageIn,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[Message]:
    """Save the user's message, get the model reply, and return both."""
    chat = get_owned_chat(chat_id, user, db)
    content = body.content.strip()
    if not chat.messages:
        chat.title = content[:TITLE_LENGTH] + ("…" if len(content) > TITLE_LENGTH else "")

    question = Message(role="user", content=content)
    chat.messages.append(question)
    reply = generate_reply([(m.role, m.content) for m in chat.messages])
    answer = Message(role="assistant", content=reply.content, confidence=reply.confidence)
    chat.messages.append(answer)
    chat.updated_at = utcnow()
    db.commit()
    db.refresh(question)
    db.refresh(answer)
    return [question, answer]
