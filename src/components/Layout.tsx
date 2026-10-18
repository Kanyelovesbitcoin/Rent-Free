import { useState, type ReactNode } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { REPO_URL, ToastProvider } from './ui'

const NAV = [
  { to: '/start', label: 'Calculator' },
  { to: '/results', label: 'My savings' },
  { to: '/remake', label: 'Remake with AI' },
  { to: '/local-ai', label: 'Local AI' },
  { to: '/contribute', label: 'Contribute' },
]

export function Logo() {
  return (
    <span className="flex items-center gap-2 font-display text-xl font-extrabold tracking-tight">
      <span aria-hidden className="pop flex h-8 w-8 -rotate-6 items-center justify-center rounded-lg bg-hilite text-base">
        🔑
      </span>
      Rent-Free
    </span>
  )
}

export default function Layout({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false)
  const linkCls = ({ isActive }: { isActive: boolean }) =>
    `rounded-lg px-3 py-2 text-sm font-bold transition ${isActive ? 'bg-ink text-paper' : 'text-ink-soft hover:text-ink'}`

  return (
    <ToastProvider>
      <div className="flex min-h-screen flex-col">
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-lg focus:bg-hilite focus:px-3 focus:py-2 focus:font-bold focus:text-ink">
          Skip to content
        </a>
        <header className="sticky top-0 z-30 border-b-2 border-line bg-paper/90 backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
            <Link to="/" onClick={() => setOpen(false)} aria-label="Rent-Free home">
              <Logo />
            </Link>
            <nav className="hidden items-center gap-1 lg:flex">
              {NAV.map((n) => (
                <NavLink key={n.to} to={n.to} className={linkCls}>
                  {n.label}
                </NavLink>
              ))}
              <a href={REPO_URL} className="btn-ghost ml-2 py-2" target="_blank" rel="noreferrer">
                ★ GitHub
              </a>
            </nav>
            <button className="btn-ghost px-3 py-2 lg:hidden" aria-label="Menu" aria-expanded={open} onClick={() => setOpen(!open)}>
              {open ? '✕' : '☰'}
            </button>
          </div>
          {open && (
            <nav className="flex flex-col gap-1 border-t-2 border-line px-4 py-3 lg:hidden">
              {NAV.map((n) => (
                <NavLink key={n.to} to={n.to} className={linkCls} onClick={() => setOpen(false)}>
                  {n.label}
                </NavLink>
              ))}
              <a href={REPO_URL} className={linkCls({ isActive: false })} target="_blank" rel="noreferrer">
                ★ GitHub
              </a>
            </nav>
          )}
        </header>

        <main id="main" className="mx-auto w-full max-w-6xl flex-1 px-4 py-10">
          {children}
        </main>

        <footer className="border-t-2 border-line bg-paper-2">
          <div className="mx-auto max-w-6xl px-4 py-8 text-sm text-ink-soft">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <Logo />
                <p className="mt-2">Free and open source (MIT). Your picks never leave your browser.</p>
              </div>
              <p className="flex flex-wrap gap-x-4 gap-y-1 font-semibold">
                <Link to="/about" className="hover:text-ink">
                  About & disclaimer
                </Link>
                <Link to="/contribute" className="hover:text-ink">
                  Add a tool
                </Link>
                <a href={REPO_URL} className="hover:text-ink" target="_blank" rel="noreferrer">
                  GitHub
                </a>
                <a href={`${REPO_URL}/issues/new`} className="hover:text-ink" target="_blank" rel="noreferrer">
                  Report a wrong price
                </a>
              </p>
            </div>
            <p className="mt-6 text-xs" data-testid="disclaimer">
              Rent-Free is independent and not affiliated with any company listed. Product names are trademarks of their owners and are used only to identify
              them. Prices are estimates; check official pricing pages before deciding.
            </p>
          </div>
        </footer>
      </div>
    </ToastProvider>
  )
}
