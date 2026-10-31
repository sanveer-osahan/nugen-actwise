import os

os.environ["DATABASE_URL"] = "sqlite:///./test.db"

import pytest
from fastapi.testclient import TestClient

from app.db import Base, SessionLocal, engine
from app.main import app
from app.models import Message


@pytest.fixture()
def client():
    Base.metadata.drop_all(bind=engine)
    with TestClient(app) as c:
        yield c
    Base.metadata.drop_all(bind=engine)


def auth_headers(client, username="alice"):
    creds = {"username": username, "password": "secret123"}
    client.post("/api/auth/signup", json=creds)
    token = client.post("/api/auth/login", json=creds).json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def test_start_chat_and_view_history(client):
    h = auth_headers(client)
    chat = client.post("/api/chats", headers=h).json()
    assert chat["title"] == "New chat"

    r = client.post(
        f"/api/chats/{chat['id']}/messages", json={"content": "What is section 80C?"}, headers=h
    )
    assert r.status_code == 201
    question, answer = r.json()
    assert question["role"] == "user" and question["confidence"] is None
    assert answer["role"] == "assistant" and 0 <= answer["confidence"] <= 1

    client.post(f"/api/chats/{chat['id']}/messages", json={"content": "Thanks"}, headers=h)

    detail = client.get(f"/api/chats/{chat['id']}", headers=h).json()
    assert detail["title"] == "What is section 80C?"
    assert [m["role"] for m in detail["messages"]] == ["user", "assistant"] * 2

    chats = client.get("/api/chats", headers=h).json()
    assert [c["id"] for c in chats] == [chat["id"]]


def test_list_is_newest_first(client):
    h = auth_headers(client)
    first = client.post("/api/chats", headers=h).json()
    second = client.post("/api/chats", headers=h).json()
    client.post(f"/api/chats/{first['id']}/messages", json={"content": "hi"}, headers=h)
    ids = [c["id"] for c in client.get("/api/chats", headers=h).json()]
    assert ids == [first["id"], second["id"]]


def test_delete_chat_removes_messages(client):
    h = auth_headers(client)
    chat = client.post("/api/chats", headers=h).json()
    client.post(f"/api/chats/{chat['id']}/messages", json={"content": "hi"}, headers=h)

    assert client.delete(f"/api/chats/{chat['id']}", headers=h).status_code == 204
    assert client.get(f"/api/chats/{chat['id']}", headers=h).status_code == 404
    assert client.get("/api/chats", headers=h).json() == []
    with SessionLocal() as db:
        assert db.query(Message).count() == 0


def test_users_cannot_see_each_others_chats(client):
    alice = auth_headers(client, "alice")
    bob = auth_headers(client, "bob")
    chat = client.post("/api/chats", headers=alice).json()

    assert client.get("/api/chats", headers=bob).json() == []
    assert client.get(f"/api/chats/{chat['id']}", headers=bob).status_code == 404
    r = client.post(f"/api/chats/{chat['id']}/messages", json={"content": "x"}, headers=bob)
    assert r.status_code == 404
    assert client.delete(f"/api/chats/{chat['id']}", headers=bob).status_code == 404
    assert client.get(f"/api/chats/{chat['id']}", headers=alice).status_code == 200


def test_blank_message_rejected(client):
    h = auth_headers(client)
    chat = client.post("/api/chats", headers=h).json()
    r = client.post(f"/api/chats/{chat['id']}/messages", json={"content": "   "}, headers=h)
    assert r.status_code == 422


def test_chats_need_login(client):
    assert client.get("/api/chats").status_code == 401
    assert client.post("/api/chats").status_code == 401
