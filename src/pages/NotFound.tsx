import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="mx-auto max-w-lg py-16 text-center">
      <p className="text-5xl">🔍</p>
      <h1 className="mt-4 font-display text-3xl font-extrabold">We couldn't find that page</h1>
      <p className="mt-2 text-ink-soft">It might not be in the catalog yet.</p>
      <div className="mt-6 flex justify-center gap-2">
        <Link to="/start" className="btn-primary">
          Go to the calculator
        </Link>
        <Link to="/contribute" className="btn-ghost">
          Add a tool
        </Link>
      </div>
    </div>
  )
}
