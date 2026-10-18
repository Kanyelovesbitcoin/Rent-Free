import { REPO_URL, PageHeader } from '../components/ui'

const EXAMPLE_SUB = `{
  "id": "calendly",
  "name": "Calendly",
  "category": "scheduling",
  "website": "https://calendly.com",
  "description": "Lets people book time on your calendar...",
  "coreFeatures": ["Public booking page", "Calendar sync", "..."],
  "plans": [
    { "id": "standard", "name": "Standard",
      "monthlyPrice": 12, "annualPrice": 120, "perSeat": true }
  ],
  "defaultPlan": "standard",
  "sourceUrl": "https://calendly.com/pricing",
  "lastVerified": "2026-10-17",
  "alternatives": ["calcom", "easyappointments"],
  "kind": "software",
  "complexity": 2,
  "extraFeatures": ["Collect payments when people book"],
  "popularity": 39
}`

const FORMS = [
  { emoji: '🆕', title: "Add an app we're missing", text: 'Tell us the name, the price, and what you use it for.', template: 'add-app.yml' },
  { emoji: '💲', title: 'Fix a wrong price', text: 'Prices change a lot. Tell us the new one.', template: 'wrong-price.yml' },
  { emoji: '💡', title: 'Share an idea', text: 'A better free app, something confusing, or a new idea.', template: 'idea.yml' },
]

export default function Contribute() {
  return (
    <div className="max-w-3xl">
      <PageHeader eyebrow="Help out" title={<>Help everyone <span className="hl">stop renting</span>.</>}>
        Rent-Free is made by people like you. You don't need to know how to code. Pick one of these, fill in a short form, and you're done.
      </PageHeader>

      <div className="grid gap-4 sm:grid-cols-3">
        {FORMS.map((f) => (
          <a
            key={f.template}
            href={`${REPO_URL}/issues/new?template=${f.template}`}
            target="_blank"
            rel="noreferrer"
            className="card flex flex-col p-5 transition hover:-translate-y-1 hover:border-ink"
          >
            <span className="text-3xl" aria-hidden>
              {f.emoji}
            </span>
            <span className="mt-2 font-display text-lg font-extrabold">{f.title}</span>
            <span className="mt-1 flex-1 text-sm text-ink-soft">{f.text}</span>
            <span className="mt-3 font-bold text-money">Open the form →</span>
          </a>
        ))}
      </div>
      <p className="mt-3 text-sm text-ink-soft">The forms are on GitHub, a free website for sharing code. You'll need a free GitHub account to send one.</p>

      <div className="card mt-8 p-5">
        <h2 className="font-display text-lg font-extrabold">Our rules</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-ink-soft">
          <li>Tell the truth: say what's not as good, too.</li>
          <li>Prices come from the app's own website, typed in by hand.</li>
          <li>No ads, no secret sales links, no copying other people's logos.</li>
          <li>Write so a 10-year-old could understand it.</li>
        </ul>
      </div>

      <details className="card mt-8 p-5">
        <summary className="cursor-pointer font-display text-lg font-extrabold">For people who code: edit the files yourself</summary>
        <div className="mt-3 space-y-3 text-sm text-ink-soft">
          <p>
            Every app is a small file in <code>data/subscriptions/</code>, and every free swap is a file in <code>data/alternatives/</code>. Copy one that exists, change it,
            and open a pull request. Example:
          </p>
          <pre className="overflow-x-auto rounded-xl bg-ink p-4 text-xs text-paper">{EXAMPLE_SUB}</pre>
          <p>
            Then run <code>npm run validate</code>. It checks every file and tells you exactly what to fix. The full guide is in{' '}
            <a className="font-bold text-money underline" href={`${REPO_URL}/blob/main/CONTRIBUTING.md`} target="_blank" rel="noreferrer">
              CONTRIBUTING.md
            </a>
            .
          </p>
        </div>
      </details>
    </div>
  )
}
