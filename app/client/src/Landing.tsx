import { ACT_URL } from './links'
import { ThemeToggle } from './ThemeToggle'

type Props = {
  onStart: () => void
  onLogin: () => void
}

const icon = {
  width: 24,
  height: 24,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
}

type Accent = 'green' | 'orange' | 'pink'
const ACCENTS: Accent[] = ['pink', 'orange', 'green']

const PROBLEMS = [
  {
    title: 'Every section moved',
    body: 'The Income-tax Act, 2025 replaced the 1961 Act on 1 April 2026. The new Act has 536 sections, and the old numbers no longer apply.',
  },
  {
    title: 'Blogs disagree',
    body: 'Tax blogs give different new section numbers for the same old section. A wrong citation in a notice reply costs your client.',
  },
  {
    title: 'Chatbots sound sure',
    body: 'General AI tools answer in the same confident tone when they are right and when they guess. You cannot tell the two apart.',
  },
]

const STEPS = [
  {
    title: 'Ask in plain words',
    body: 'Type the question as you would ask a senior: "What is the new section for old 80C?"',
  },
  {
    title: 'Get an answer from the Act',
    body: 'Actwise runs on a Nugen model aligned to the official text of the Income-tax Act, 2025.',
  },
  {
    title: 'See how much to trust it',
    body: 'Every answer shows a confidence score. When the score is low, Actwise tells you to check the official text.',
  },
]

const USERS = [
  {
    title: 'Article assistants',
    body: 'Draft a notice reply in ten minutes with the correct new sections.',
  },
  {
    title: 'Tax staff in CA firms',
    body: 'Cite the right section in client work and ITR filings.',
  },
  {
    title: 'Company finance teams',
    body: 'Look up TDS rules and the forms that changed names.',
  },
]

const CONTESTANTS: { name: string; tag: string; accent: Accent; detail: string }[] = [
  { name: 'Base model', tag: 'Baseline', accent: 'orange', detail: 'Llama 3.2 3B, no training on the new Act' },
  { name: 'Actwise', tag: 'Aligned', accent: 'green', detail: 'The same model, aligned by Nugen to the official Act text' },
  { name: 'Frontier model + web search', tag: 'Web search', accent: 'pink', detail: 'A large general model that reads the web' },
]

function ChatPreview() {
  return (
    <div className="card lp-preview" aria-label="Example conversation">
      <span className="badge lp-example">Example</span>

      <div className="lp-msg lp-msg-user">What is the new section for old 80C?</div>
      <div className="lp-msg lp-msg-bot">
        <p>
          <strong>Section 123</strong> of the Income-tax Act, 2025. It allows a deduction of up to
          ₹1,50,000 for life insurance premia, provident fund contributions and the other sums
          listed in Schedule XV.
        </p>
        <span className="badge">High confidence · 92</span>
      </div>

      <div className="lp-msg lp-msg-user">How does this apply to my client's foreign ESOPs?</div>
      <div className="lp-msg lp-msg-bot">
        <p>The answer depends on facts that the Act does not state directly…</p>
        <span className="badge lp-badge-low">Low confidence · 41</span>
        <p className="text-small lp-warn">
          Check this against the{' '}
          <a href={ACT_URL} target="_blank" rel="noreferrer">
            official text
          </a>
          .
        </p>
      </div>
    </div>
  )
}

export function Landing({ onStart, onLogin }: Props) {
  return (
    <>
      <header className="lp-nav">
        <a className="brand lp-brand" href="/">
          <img src="/logo.svg" alt="" />
          <span>Actwise</span>
        </a>
        <nav className="lp-nav-actions">
          <button type="button" className="btn btn-outline btn-sm" onClick={onLogin}>
            Log in
          </button>
          <ThemeToggle />
        </nav>
      </header>

      <main>
        <section className="lp-hero lp-wrap">
          <div className="lp-hero-text">
            <span className="badge badge-orange">For CA firms · Income-tax Act, 2025</span>
            <h1 className="display lp-title">
              Ask anything about the <span className="mark mark-pink">new Income-tax Act</span>.
              Know when to <span className="mark">trust</span> the answer.
            </h1>
            <p className="lp-lead text-muted">
              Actwise finds the new section for an old one, explains it in plain words, and shows a
              confidence score on every answer.
            </p>
            <div className="lp-cta">
              <button type="button" className="btn btn-primary btn-lg" onClick={onStart}>
                Start asking
              </button>
              <a className="btn btn-ink btn-lg" href="#accuracy">
                How accurate is it?
              </a>
            </div>
          </div>
          <ChatPreview />
        </section>

        <section className="lp-band">
          <div className="lp-wrap lp-section">
            <h2>
              Why tax staff need this <span className="mark mark-orange">now</span>
            </h2>
            <div className="lp-grid">
              {PROBLEMS.map((p, i) => (
                <article key={p.title} className={`lp-tile lp-fill-${ACCENTS[i]}`}>
                  <h3>{p.title}</h3>
                  <p className="text-muted">{p.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="how" className="lp-wrap lp-section">
          <h2>
            How it <span className="mark">works</span>
          </h2>
          <ol className="lp-steps">
            {STEPS.map((s, i) => (
              <li key={s.title} className="card lp-step">
                <span className={`lp-step-num lp-fill-${ACCENTS[(i + 2) % 3]}`}>{i + 1}</span>
                <h3>{s.title}</h3>
                <p className="text-muted">{s.body}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="lp-band">
          <div className="lp-wrap lp-section lp-split">
            <div>
              <h2>
                A score you can <span className="mark mark-pink">act on</span>
              </h2>
              <p className="text-muted">
                Nugen gives a confidence score from 0 to 100 with each answer. General chatbots do
                not. Actwise turns that score into a clear signal.
              </p>
            </div>
            <ul className="lp-levels">
              <li className="lp-level">
                <span className="badge">High confidence</span>
                <p>Use the answer. The section number and the source are shown.</p>
              </li>
              <li className="lp-level">
                <span className="badge lp-badge-low">Low confidence</span>
                <p>
                  Actwise tells you to check the answer against the official text, with a link to
                  the Act.
                </p>
              </li>
            </ul>
          </div>
        </section>

        <section className="lp-wrap lp-section">
          <h2>
            Built for the people who <span className="mark mark-orange">file</span>
          </h2>
          <div className="lp-grid">
            {USERS.map((u, i) => (
              <article key={u.title} className="lp-tile">
                <span className={`lp-icon-chip lp-fill-${ACCENTS[i]}`}>
                  <svg {...icon}>
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                </span>
                <h3>{u.title}</h3>
                <p className="text-muted">{u.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="accuracy" className="lp-band">
          <div className="lp-wrap lp-section">
            <h2>
              How accurate is <span className="mark">Actwise</span>?
            </h2>
            <p className="text-muted lp-narrow">
              We test three models on the same questions. A person checks each answer against the
              official Act text. We publish the result, also if Actwise loses.
            </p>
            <div className="lp-grid">
              {CONTESTANTS.map((c) => (
                <article key={c.name} className="lp-tile lp-tagged">
                  <span className={`lp-tag lp-fill-${c.accent}`}>{c.tag}</span>
                  <h3>{c.name}</h3>
                  <p className="text-muted">{c.detail}</p>
                </article>
              ))}
            </div>
            <p className="text-small text-muted">
              We score accuracy, accuracy when the model is confident, and the cost and time of
              each answer. Results coming soon.
            </p>
          </div>
        </section>

        <section className="lp-wrap lp-section lp-final">
          <h2>
            Stop <span className="mark mark-pink">guessing</span> section numbers
          </h2>
          <p className="text-muted">Ask your first question in under a minute.</p>
          <button type="button" className="btn btn-ink btn-lg" onClick={onStart}>
            Create a free account
          </button>
        </section>
      </main>

      <footer className="lp-footer lp-wrap text-small text-muted">
        <span>
          Actwise runs on a{' '}
          <a href="https://nugen.in" target="_blank" rel="noreferrer">
            Nugen
          </a>{' '}
          domain-aligned model.
        </span>
        <span>
          Not tax advice. Always check against the{' '}
          <a href={ACT_URL} target="_blank" rel="noreferrer">
            official Act
          </a>
          .
        </span>
      </footer>
    </>
  )
}
