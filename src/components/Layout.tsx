import { useEffect, useState, type ReactNode } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { REPO_URL, ToastProvider } from './ui'

type NavItem = { to: string; label: string; end?: boolean }
type TabItem = NavItem & { emoji: string }

const NAV: NavItem[] = [
  { to: '/start', label: 'Start' },
  { to: '/results', label: 'My savings' },
  { to: '/plan', label: 'My plan' },
  { to: '/remake', label: 'Build your own' },
  { to: '/toolbox', label: 'Toolbox' },
  { to: '/ai-helpers', label: 'New to AI?' },
  { to: '/games', label: '🎮 Games' },
]

// Thumb-friendly tabs on phones, so the main steps are always one tap away.
const TABS: TabItem[] = [
  { to: '/start', emoji: '🧾', label: 'Start' },
  { to: '/results', emoji: '💰', label: 'Savings' },
  { to: '/plan', emoji: '✅', label: 'Plan' },
  { to: '/remake', emoji: '✨', label: 'Build' },
  { to: '/games', emoji: '🎮', label: 'Games' },
]

// In Game mode the menus switch to game pages, with a clear way back.
const GAME_NAV: NavItem[] = [
  { to: '/games', label: 'Games', end: true },
  { to: '/games/drops', label: 'Source drops' },
  { to: '/games/build', label: 'Make a game' },
  { to: '/ai-helpers', label: 'New to AI?' },
]
const GAME_TABS: TabItem[] = [
  { to: '/games', emoji: '🕹️', label: 'Games', end: true },
  { to: '/games/drops', emoji: '📦', label: 'Drops' },
  { to: '/games/build', emoji: '🛠️', label: 'Make' },
  { to: '/ai-helpers', emoji: '👋', label: 'Learn' },
  { to: '/', emoji: '🧾', label: 'Exit', end: true },
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
  const { pathname } = useLocation()
  const game = pathname === '/games' || pathname.startsWith('/games/')
  // The arcade skin lives on <html> so the page background re-skins too (see index.css).
  useEffect(() => {
    if (game) document.documentElement.dataset.mode = 'game'
    else delete document.documentElement.dataset.mode
  }, [game])
  const nav = game ? GAME_NAV : NAV
  const tabs = game ? GAME_TABS : TABS
  const linkCls = ({ isActive }: { isActive: boolean }) =>
    `rounded-lg px-2.5 py-2 text-sm font-bold whitespace-nowrap transition ${isActive ? 'bg-ink text-paper' : 'text-ink-soft hover:text-ink'}`

  return (
    <ToastProvider>
      <div className="flex min-h-screen flex-col">
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-lg focus:bg-hilite focus:px-3 focus:py-2 focus:font-bold focus:text-ink">
          Skip to content
        </a>
        <header className="sticky top-0 z-30 border-b-2 border-line bg-paper/90 backdrop-blur print:hidden">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
            <div className="flex items-center gap-2">
              <Link to={game ? '/games' : '/'} onClick={() => setOpen(false)} aria-label={game ? 'Game mode home' : 'Rent-Free home'}>
                <Logo />
              </Link>
              {game && (
                <span className="pixel bg-neon px-2 py-0.5 font-pixel text-xs font-bold text-[#110c22]" data-testid="game-mode-badge">
                  GAME MODE
                </span>
              )}
            </div>
            <nav className={`hidden items-center gap-0.5 ${game ? 'lg:flex' : 'xl:flex'}`} aria-label="Main">
              {nav.map((n) => (
                <NavLink key={n.to} to={n.to} end={n.end} className={linkCls}>
                  {n.label}
                </NavLink>
              ))}
              {game ? (
                <Link to="/" className="btn-ghost ml-2 py-2">
                  ← Exit Game mode
                </Link>
              ) : (
                <a href={REPO_URL} className="btn-ghost ml-2 py-2" target="_blank" rel="noreferrer">
                  ★ GitHub
                </a>
              )}
            </nav>
            <button className={`btn-ghost px-3 py-2 ${game ? 'lg:hidden' : 'xl:hidden'}`} aria-label="Menu" aria-expanded={open} onClick={() => setOpen(!open)}>
              {open ? '✕' : '☰ Menu'}
            </button>
          </div>
          {open && (
            <nav className={`grid grid-cols-2 gap-1 border-t-2 border-line px-4 py-3 ${game ? 'lg:hidden' : 'xl:hidden'}`} aria-label="Menu">
              {([
                ...(game ? [...GAME_NAV, { to: '/', label: '← Exit Game mode', end: true }] : [...NAV, { to: '/local-ai', label: 'Free AI' }]),
                { to: '/contribute', label: 'Help out' },
                { to: '/about', label: 'About' },
              ] as NavItem[]).map((n) => (
                <NavLink key={n.to} to={n.to} end={n.end} className={linkCls} onClick={() => setOpen(false)}>
                  {n.label}
                </NavLink>
              ))}
            </nav>
          )}
        </header>

        <main id="main" className="mx-auto w-full max-w-6xl flex-1 px-4 pt-10 pb-28 lg:pb-12">
          {children}
        </main>

        <footer className="border-t-2 border-line bg-paper-2 pb-20 lg:pb-0 print:hidden">
          <div className="mx-auto max-w-6xl px-4 py-8 text-sm text-ink-soft">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <Logo />
                <p className="mt-2">Free for everyone. What you pick stays on your device.</p>
              </div>
              <p className="flex flex-wrap gap-x-4 gap-y-1 font-semibold">
                <Link to="/toolbox" className="hover:text-ink">
                  Toolbox
                </Link>
                <Link to="/ai-helpers" className="hover:text-ink">
                  New to AI coding?
                </Link>
                <Link to="/games" className="hover:text-ink">
                  Game mode
                </Link>
                <Link to="/local-ai" className="hover:text-ink">
                  Free AI
                </Link>
                <Link to="/about" className="hover:text-ink">
                  About & disclaimer
                </Link>
                <Link to="/contribute" className="hover:text-ink">
                  Help out
                </Link>
                <a href={REPO_URL} className="hover:text-ink" target="_blank" rel="noreferrer">
                  GitHub
                </a>
                <a href={`${REPO_URL}/issues/new?template=wrong-price.yml`} className="hover:text-ink" target="_blank" rel="noreferrer">
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

        <nav
          className="fixed inset-x-0 bottom-0 z-30 border-t-2 border-ink bg-card lg:hidden print:hidden"
          aria-label="Quick tabs"
          data-testid={game ? 'game-tab-bar' : 'tab-bar'}
        >
          <div className="mx-auto grid max-w-md grid-cols-5">
            {tabs.map((t) => (
              <NavLink
                key={t.to}
                to={t.to}
                end={t.end}
                className={({ isActive }) => `flex flex-col items-center gap-0.5 py-2 text-[11px] font-bold ${isActive ? 'text-ink' : 'text-ink-soft'}`}
              >
                {({ isActive }) => (
                  <>
                    <span className={`flex h-7 w-10 items-center justify-center rounded-full text-base ${isActive ? 'bg-hilite' : ''}`} aria-hidden>
                      {t.emoji}
                    </span>
                    {t.label}
                  </>
                )}
              </NavLink>
            ))}
          </div>
        </nav>
      </div>
    </ToastProvider>
  )
}
