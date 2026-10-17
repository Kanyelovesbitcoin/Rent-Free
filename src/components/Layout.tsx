import { useState, type ReactNode } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { REPO_URL } from './ui'

const NAV = [
  { to: '/start', label: 'Calculator' },
  { to: '/results', label: 'My savings' },
  { to: '/local-ai', label: 'Local AI' },
  { to: '/contribute', label: 'Contribute' },
]

export default function Layout({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false)
  const linkCls = ({ isActive }: { isActive: boolean }) =>
    `rounded-lg px-3 py-2 text-sm font-medium transition ${
      isActive ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100'
    }`

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-20 border-b border-stone-200 bg-stone-50/90 backdrop-blur dark:border-stone-800 dark:bg-stone-950/90">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link to="/" className="flex items-center gap-2 font-display text-xl font-extrabold tracking-tight" onClick={() => setOpen(false)}>
            <span aria-hidden>🔑</span> Rent-Free
          </Link>
          <nav className="hidden items-center gap-1 md:flex">
            {NAV.map((n) => (
              <NavLink key={n.to} to={n.to} className={linkCls}>
                {n.label}
              </NavLink>
            ))}
            <a href={REPO_URL} className="btn-ghost ml-2 py-2" target="_blank" rel="noreferrer">
              ★ GitHub
            </a>
          </nav>
          <button className="btn-ghost px-3 py-2 md:hidden" aria-label="Menu" aria-expanded={open} onClick={() => setOpen(!open)}>
            ☰
          </button>
        </div>
        {open && (
          <nav className="flex flex-col gap-1 border-t border-stone-200 px-4 py-3 md:hidden dark:border-stone-800">
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

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10">{children}</main>

      <footer className="border-t border-stone-200 dark:border-stone-800">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-8 text-sm text-stone-500 sm:flex-row sm:items-center sm:justify-between dark:text-stone-400">
          <p>
            <strong className="text-stone-700 dark:text-stone-300">Rent-Free</strong> is free and open source (MIT). Your picks never leave your browser.
          </p>
          <p className="flex gap-4">
            <Link to="/contribute" className="hover:text-stone-900 dark:hover:text-stone-100">
              Add a tool
            </Link>
            <a href={REPO_URL} className="hover:text-stone-900 dark:hover:text-stone-100" target="_blank" rel="noreferrer">
              GitHub
            </a>
            <a href={`${REPO_URL}/issues/new`} className="hover:text-stone-900 dark:hover:text-stone-100" target="_blank" rel="noreferrer">
              Report a wrong price
            </a>
          </p>
        </div>
      </footer>
    </div>
  )
}
