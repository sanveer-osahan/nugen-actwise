import os

os.environ["DATABASE_URL"] = "sqlite:///./test.db"

import pytest
from fastapi.testclient import TestClient

from app.db import Base, engine
from app.main import app


@pytest.fixture()
def client():
    Base.metadata.drop_all(bind=engine)
    with TestClient(app) as c:
        yield c
    Base.metadata.drop_all(bind=engine)


CREDS = {"username": "alice", "password": "secret123"}


def test_signup_login_me(client):
    r = client.post("/api/auth/signup", json=CREDS)
    assert r.status_code == 201
    assert r.json()["username"] == "alice"

    r = client.post("/api/auth/login", json=CREDS)
    assert r.status_code == 200
    token = r.json()["access_token"]

    r = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert r.status_code == 200
    assert r.json()["username"] == "alice"


def test_duplicate_signup(client):
    client.post("/api/auth/signup", json=CREDS)
    r = client.post("/api/auth/signup", json=CREDS)
    assert r.status_code == 409


def test_wrong_password(client):
    client.post("/api/auth/signup", json=CREDS)
    r = client.post("/api/auth/login", json={**CREDS, "password": "wrongpass"})
    assert r.status_code == 401


def test_me_without_token(client):
    assert client.get("/api/auth/me").status_code == 401
