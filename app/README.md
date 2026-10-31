# App

- `server/` — FastAPI API (dependencies managed with [uv](https://docs.astral.sh/uv/))
- `client/` — React + TypeScript (Vite)

## Database

The server stores users and chat history in Postgres. Start it with Docker:

```sh
docker run -d --name actwise-postgres --restart unless-stopped \
  -e POSTGRES_USER=actwise -e POSTGRES_PASSWORD=actwise -e POSTGRES_DB=actwise \
  -p 5432:5432 -v actwise-pgdata:/var/lib/postgresql/data postgres:17
```

The default `DATABASE_URL` is `postgresql+psycopg://actwise:actwise@localhost:5432/actwise`.
The server creates the tables on start. The tests use SQLite and do not need Postgres.

## Server

```sh
cd server
uv sync                                  # install dependencies from uv.lock
uv run fastapi dev app/main.py           # http://127.0.0.1:8000 (docs at /docs)
uv run pytest                            # run tests
uv add <package>                         # add a dependency
```

Environment variables: `SECRET_KEY`, `ACCESS_TOKEN_EXPIRE_MINUTES`, `DATABASE_URL`, `CORS_ORIGINS`.
Set `SECRET_KEY` to a long random value outside local development.

## Client

```sh
cd client
npm install
npm run dev                              # http://localhost:5173, proxies /api to the server
```

## API

| Method | Path               | Body                     | Result                 |
|--------|--------------------|--------------------------|------------------------|
| POST   | `/api/auth/signup` | `{username, password}`   | `201` user             |
| POST   | `/api/auth/login`  | `{username, password}`   | `{access_token}` (JWT) |
| GET    | `/api/auth/me`     | `Authorization: Bearer`  | current user           |
| GET    | `/api/chats`                 | —                 | chats, newest first             |
| POST   | `/api/chats`                 | —                 | `201` new chat                  |
| GET    | `/api/chats/{id}`            | —                 | chat with its messages          |
| DELETE | `/api/chats/{id}`            | —                 | `204`                           |
| POST   | `/api/chats/{id}/messages`   | `{content}`       | `201` `[user msg, reply]`       |

All `/api/chats` routes need `Authorization: Bearer`. A user can only see their own chats.
The model reply comes from `server/app/llm.py`, a placeholder that makes no network calls.
