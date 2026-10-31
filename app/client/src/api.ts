export type User = { id: number; username: string }

export type Message = {
  id: number
  role: 'user' | 'assistant'
  content: string
  /** 0-1 for assistant messages, null for user messages. */
  confidence: number | null
  created_at: string
}

export type ChatSummary = { id: number; title: string; created_at: string; updated_at: string }
export type ChatDetail = ChatSummary & { messages: Message[] }

const TOKEN_KEY = 'token'

export const tokenStore = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (token: string) => localStorage.setItem(TOKEN_KEY, token),
  clear: () => localStorage.removeItem(TOKEN_KEY),
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = tokenStore.get()
  const res = await fetch(`/api${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init.headers,
    },
  })
  if (res.status === 204) return undefined as T
  const body = await res.json().catch(() => ({}))
  if (!res.ok) {
    const detail = body?.detail
    const message = Array.isArray(detail)
      ? detail.map((d: { msg: string }) => d.msg).join(', ')
      : detail ?? `Request failed (${res.status})`
    throw new Error(message)
  }
  return body as T
}

export const api = {
  signup: (username: string, password: string) =>
    request<User>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }),
  login: (username: string, password: string) =>
    request<{ access_token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }),
  me: () => request<User>('/auth/me'),
  listChats: () => request<ChatSummary[]>('/chats'),
  createChat: () => request<ChatSummary>('/chats', { method: 'POST' }),
  getChat: (id: number) => request<ChatDetail>(`/chats/${id}`),
  deleteChat: (id: number) => request<void>(`/chats/${id}`, { method: 'DELETE' }),
  sendMessage: (chatId: number, content: string) =>
    request<[Message, Message]>(`/chats/${chatId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    }),
}
