import { useState, type FormEvent } from 'react'

type Props = {
  mode: 'login' | 'signup'
  onSubmit: (username: string, password: string) => Promise<void>
  onSwitchMode: () => void
}

export function AuthForm({ mode, onSubmit, onSwitchMode }: Props) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const isLogin = mode === 'login'

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await onSubmit(username, password)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className="card auth-card" onSubmit={handleSubmit}>
      <h1>{isLogin ? 'Welcome back' : 'Create your account'}</h1>
      <p className="subtitle text-muted">
        {isLogin ? 'Log in to continue.' : 'It takes less than a minute.'}
      </p>
      <label className="field">
        Username
        <input
          className="input"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoComplete="username"
          minLength={3}
          maxLength={50}
          required
        />
      </label>
      <label className="field">
        Password
        <input
          className="input"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete={isLogin ? 'current-password' : 'new-password'}
          minLength={8}
          maxLength={72}
          required
        />
      </label>
      {error && (
        <p className="message-error" role="alert">
          {error}
        </p>
      )}
      <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
        {loading ? 'Please wait…' : isLogin ? 'Log in' : 'Create account'}
      </button>
      <p className="switch text-small text-muted">
        {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
        <button type="button" className="link" onClick={onSwitchMode}>
          {isLogin ? 'Sign up' : 'Log in'}
        </button>
      </p>
    </form>
  )
}
