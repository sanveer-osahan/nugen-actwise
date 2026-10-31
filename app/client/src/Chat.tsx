import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react'
import { api, type ChatSummary, type Message, type User } from './api'
import { ConfirmDialog } from './ConfirmDialog'
import { ACT_URL } from './links'
import { ThemeToggle } from './ThemeToggle'

// Answers below this score (0-100) get the low-confidence badge and a warning.
const LOW_CONFIDENCE = 70

type Props = { user: User; onLogout: () => void }

export function Chat({ user, onLogout }: Props) {
  const [chats, setChats] = useState<ChatSummary[]>([])
  // null = a new chat that is not saved yet. The first message saves it.
  const [activeId, setActiveId] = useState<number | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [draft, setDraft] = useState('')
  const [sending, setSending] = useState(false)
  const [loadingChat, setLoadingChat] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [pendingDelete, setPendingDelete] = useState<ChatSummary | null>(null)
  const endRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    api
      .listChats()
      .then(setChats)
      .catch((err) => setError(message(err)))
  }, [])

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end' })
  }, [messages, sending])

  function newChat() {
    setActiveId(null)
    setMessages([])
    setError(null)
    setSidebarOpen(false)
    inputRef.current?.focus()
  }

  async function openChat(id: number) {
    setSidebarOpen(false)
    if (id === activeId) return
    setActiveId(id)
    setMessages([])
    setError(null)
    setLoadingChat(true)
    try {
      const chat = await api.getChat(id)
      setMessages(chat.messages)
    } catch (err) {
      setError(message(err))
    } finally {
      setLoadingChat(false)
    }
  }

  async function deleteChat(chat: ChatSummary) {
    try {
      await api.deleteChat(chat.id)
      setChats((cs) => cs.filter((c) => c.id !== chat.id))
      if (chat.id === activeId) newChat()
    } catch (err) {
      setError(message(err))
    } finally {
      setPendingDelete(null)
    }
  }

  async function send(e?: FormEvent) {
    e?.preventDefault()
    const content = draft.trim()
    if (!content || sending) return
    setError(null)
    setSending(true)
    try {
      let chatId = activeId
      if (chatId === null) {
        const created = await api.createChat()
        chatId = created.id
        setActiveId(chatId)
        setChats((cs) => [created, ...cs])
      }
      const [question, answer] = await api.sendMessage(chatId, content)
      setMessages((ms) => [...ms, question, answer])
      setDraft('')
      // The server sets the title from the first message and bumps updated_at.
      const updated = await api.listChats()
      setChats(updated)
    } catch (err) {
      setError(message(err))
    } finally {
      setSending(false)
      inputRef.current?.focus()
    }
  }

  function onKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault()
      void send()
    }
  }

  const activeTitle = chats.find((c) => c.id === activeId)?.title ?? 'New chat'

  return (
    <div className="chat-app">
      <aside className={`chat-sidebar${sidebarOpen ? ' is-open' : ''}`} aria-label="Chat history">
        <div className="chat-sidebar-head">
          <div className="brand lp-brand">
            <img src="/logo.svg" alt="" />
            <span>Actwise</span>
          </div>
        </div>
        <button className="btn btn-primary btn-block" onClick={newChat}>
          New chat
        </button>
        <nav className="chat-list">
          {chats.length === 0 ? (
            <p className="text-small text-muted chat-list-empty">No chats yet.</p>
          ) : (
            chats.map((c) => (
              <div key={c.id} className={`chat-item${c.id === activeId ? ' is-active' : ''}`}>
                <button className="chat-item-open" onClick={() => openChat(c.id)} title={c.title}>
                  <span className="chat-item-title">{c.title}</span>
                  <span className="text-small text-muted">{formatDate(c.updated_at)}</span>
                </button>
                <button
                  className="btn btn-ghost btn-sm btn-icon chat-item-delete"
                  onClick={() => setPendingDelete(c)}
                  aria-label={`Delete chat ${c.title}`}
                  title="Delete chat"
                >
                  <TrashIcon />
                </button>
              </div>
            ))
          )}
        </nav>
        <div className="chat-sidebar-foot">
          <span className="text-small">
            Logged in as <strong>{user.username}</strong>
          </span>
          <button className="btn btn-ink btn-sm" onClick={onLogout}>
            Log out
          </button>
        </div>
      </aside>
      {sidebarOpen && <div className="chat-scrim" onClick={() => setSidebarOpen(false)} />}

      <section className="chat-main">
        <header className="chat-header">
          <button
            className="btn btn-ghost btn-sm chat-menu"
            onClick={() => setSidebarOpen(true)}
            aria-label="Show chat history"
          >
            Chats
          </button>
          <h2 className="chat-title">{activeTitle}</h2>
          <ThemeToggle />
        </header>

        <div className="chat-scroll">
          <div className="chat-thread">
            {loadingChat ? (
              <p className="text-muted">Loading…</p>
            ) : messages.length === 0 && !sending ? (
              <div className="chat-empty">
                <h1>
                  Ask about the <span className="mark">Income-tax Act</span>, 2025
                </h1>
                <p className="text-muted">
                  Every answer shows a confidence score. The model is a placeholder for now.
                </p>
              </div>
            ) : (
              messages.map((m) => <Bubble key={m.id} message={m} />)
            )}
            {sending && (
              <>
                <div className="lp-msg lp-msg-user">{draft.trim()}</div>
                <div className="lp-msg lp-msg-bot text-muted">Thinking…</div>
              </>
            )}
            <div ref={endRef} />
          </div>
        </div>

        <form className="chat-composer" onSubmit={send}>
          {error && (
            <p className="message-error" role="alert">
              {error}
            </p>
          )}
          <div className="chat-composer-row">
            <textarea
              ref={inputRef}
              className="input chat-input"
              placeholder="Ask a question…"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={onKeyDown}
              rows={1}
              maxLength={8000}
              disabled={sending}
              aria-label="Message"
              autoFocus
            />
            <button type="submit" className="btn btn-ink" disabled={sending || !draft.trim()}>
              Send
            </button>
          </div>
        </form>
      </section>

      <ConfirmDialog
        open={pendingDelete !== null}
        title="Delete chat?"
        message={`"${pendingDelete?.title ?? ''}" and all its messages will be deleted. You cannot undo this.`}
        confirmLabel="Delete"
        onConfirm={() => (pendingDelete ? deleteChat(pendingDelete) : undefined)}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  )
}

function Bubble({ message: m }: { message: Message }) {
  if (m.role === 'user') return <div className="lp-msg lp-msg-user chat-text">{m.content}</div>
  const score = m.confidence === null ? null : Math.round(m.confidence * 100)
  const low = score !== null && score < LOW_CONFIDENCE
  return (
    <div className="lp-msg lp-msg-bot">
      <p className="chat-text">{m.content}</p>
      {score !== null && (
        <span className={`badge${low ? ' lp-badge-low' : ''}`}>
          {low ? 'Low' : 'High'} confidence · {score}
        </span>
      )}
      {low && (
        <p className="text-small lp-warn">
          Check this against the{' '}
          <a href={ACT_URL} target="_blank" rel="noreferrer">
            official text
          </a>
          .
        </p>
      )}
    </div>
  )
}

function TrashIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6M10 11v6M14 11v6" />
    </svg>
  )
}

function formatDate(iso: string) {
  // SQLite drops the time zone; treat a bare timestamp as UTC.
  const date = new Date(/[zZ]|[+-]\d\d:\d\d$/.test(iso) ? iso : `${iso}Z`)
  return date.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
}

function message(err: unknown) {
  return err instanceof Error ? err.message : 'Something went wrong'
}
