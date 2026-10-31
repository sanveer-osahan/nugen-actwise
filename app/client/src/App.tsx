import { useEffect, useState } from 'react'
import { api, tokenStore, type User } from './api'
import { AuthForm } from './AuthForm'
import { Chat } from './Chat'
import { Landing } from './Landing'
import { ThemeToggle } from './ThemeToggle'

type Route = 'landing' | 'login' | 'signup'

function routeFromPath(): Route {
  const path = window.location.pathname
  if (path === '/login') return 'login'
  if (path === '/signup') return 'signup'
  return 'landing'
}

export default function App() {
  const [user, setUser] = useState<User | null>(null)
  const [route, setRoute] = useState<Route>(routeFromPath)
  const [checking, setChecking] = useState(() => tokenStore.get() !== null)

  useEffect(() => {
    if (!tokenStore.get()) return
    api
      .me()
      .then(setUser)
      .catch(() => tokenStore.clear())
      .finally(() => setChecking(false))
  }, [])

  useEffect(() => {
    const onPop = () => setRoute(routeFromPath())
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  function go(next: Route) {
    window.history.pushState(null, '', next === 'landing' ? '/' : `/${next}`)
    setRoute(next)
    window.scrollTo(0, 0)
  }

  async function login(username: string, password: string) {
    const { access_token } = await api.login(username, password)
    tokenStore.set(access_token)
    setUser(await api.me())
    window.history.replaceState(null, '', '/')
  }

  async function signup(username: string, password: string) {
    await api.signup(username, password)
    await login(username, password)
  }

  function logout() {
    tokenStore.clear()
    setUser(null)
    go('landing')
  }

  if (user) {
    return <Chat user={user} onLogout={logout} />
  }

  if (!checking && route === 'landing') {
    return <Landing onStart={() => go('signup')} onLogin={() => go('login')} />
  }

  return (
    <>
      <header className="topbar">
        <ThemeToggle />
      </header>
      <main className="page">
        <a
          className="brand"
          href="/"
          onClick={(e) => {
            e.preventDefault()
            go('landing')
          }}
        >
          <img src="/logo.svg" alt="" />
          <span>Actwise</span>
        </a>
        {checking ? (
          <p className="text-muted">Loading…</p>
        ) : (
          <AuthForm
            key={route}
            mode={route === 'signup' ? 'signup' : 'login'}
            onSubmit={route === 'signup' ? signup : login}
            onSwitchMode={() => go(route === 'signup' ? 'login' : 'signup')}
          />
        )}
      </main>
    </>
  )
}
