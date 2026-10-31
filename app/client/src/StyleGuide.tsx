import { ThemeToggle } from './ThemeToggle'
import { useTheme } from './theme'

const COLORS = [
  ['--bg', 'Page and card background'],
  ['--bg-soft', 'Section background'],
  ['--text', 'Body text'],
  ['--text-muted', 'Secondary text'],
  ['--ink', 'Dark button, borders'],
  ['--green', 'Brand fill, primary button'],
  ['--green-hover', 'Primary button hover'],
  ['--green-strong', 'Links, focus ring'],
  ['--green-soft', 'Tinted background'],
  ['--orange', 'Accent: markers, tiles, tags'],
  ['--pink', 'Accent: markers, tiles, tags'],
  ['--shadow', 'Hard shadow'],
  ['--error-bg', 'Error fill'],
  ['--error-text', 'Error text'],
] as const

function readVar(name: string) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim()
}

export function StyleGuide() {
  const { theme } = useTheme()

  return (
    <>
      <header className="topbar">
        <ThemeToggle />
      </header>
      <main className="sg">
        <section>
          <p className="badge">Style guide · {theme} theme</p>
          <h1 className="display">Actwise style guide</h1>
          <p className="text-muted">
            CodeFast style with a green brand color. Use the button at the top right to change the theme.
          </p>
        </section>

        <section>
          <h2>Colors</h2>
          <div className="sg-swatches" key={theme}>
            {COLORS.map(([name, use]) => (
              <div className="sg-swatch" key={name}>
                <div className="sg-chip" style={{ background: `var(${name})` }} />
                <code>{name}</code>
                <span className="mono text-muted">{readVar(name)}</span>
                <span className="text-small text-muted">{use}</span>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2>Fonts</h2>
          <div className="sg-type">
            <div className="display">Display · Bebas Neue 56</div>
            <h1>Heading 1 · Bebas Neue 44</h1>
            <h2>Heading 2 · Bebas Neue 32</h2>
            <p>Body · Noto Sans 16 / 24. The quick brown fox jumps over the lazy dog.</p>
            <p className="text-small text-muted">Small · Noto Sans 14 / 20, muted.</p>
            <code>Mono · ui-monospace 14</code>
          </div>
        </section>

        <section>
          <h2>Buttons</h2>
          <p className="text-muted text-small">
            Hover: the button moves 3px up and left and shows a 3px hard shadow. Press: the button scales to 0.95.
          </p>
          <div className="sg-row">
            <button className="btn btn-primary">Primary</button>
            <button className="btn btn-ink">Ink</button>
            <button className="btn btn-outline">Outline</button>
            <button className="btn btn-ghost">Ghost</button>
            <button className="btn btn-primary" disabled>
              Disabled
            </button>
          </div>
          <div className="sg-row">
            <button className="btn btn-primary btn-sm">Small</button>
            <button className="btn btn-primary">Default</button>
            <button className="btn btn-primary btn-lg">Large</button>
            <button className="btn btn-primary btn-wide">Wide</button>
          </div>
          <div className="sg-row">
            <button className="link">Text link</button>
          </div>
        </section>

        <section>
          <h2>Inputs</h2>
          <div className="sg-grid">
            <label className="field">
              Default
              <input className="input" placeholder="username" />
            </label>
            <label className="field">
              Error
              <input className="input" aria-invalid="true" defaultValue="ab" />
            </label>
          </div>
        </section>

        <section>
          <h2>Cards, badges, messages</h2>
          <div className="sg-grid">
            <div className="card">
              <div className="sg-row">
                <span className="badge">Badge</span>
                <span className="badge badge-orange">Orange</span>
                <span className="badge badge-pink">Pink</span>
              </div>
              <h2 style={{ marginTop: 12 }}>
                <span className="mark">Green</span>, <span className="mark mark-orange">orange</span> and{' '}
                <span className="mark mark-pink">pink</span> markers
              </h2>
              <h2 style={{ marginTop: 12 }}>Card title</h2>
              <p className="text-muted">Card with a 1px border and a 6px hard shadow.</p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <p className="message-error">Invalid username or password</p>
              <div className="card" style={{ background: 'var(--bg-soft)', boxShadow: 'none', padding: 20 }}>
                Soft section on <code>--bg-soft</code>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  )
}
