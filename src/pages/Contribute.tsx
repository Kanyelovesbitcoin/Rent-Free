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

export default function Contribute() {
  return (
    <div className="max-w-3xl">
      <PageHeader eyebrow="Community" title="Help everyone stop renting">
        Rent-Free is built by its community. Every tool, price and guide is a plain JSON file, so you don't need to be a developer to help.
      </PageHeader>

      <div className="space-y-6">
        <Section n="1" title="Fix a wrong price (2 minutes)">
          Prices change constantly. Spotted an outdated one?{' '}
          <a className="font-semibold text-money underline" href={`${REPO_URL}/issues/new?title=Wrong%20price%3A%20`} target="_blank" rel="noreferrer">
            Open an issue
          </a>{' '}
          with the tool name and a link to its pricing page, or edit the file in <code>data/subscriptions/</code> directly on GitHub.
        </Section>

        <Section n="2" title="Add a subscription (5 minutes)">
          <p>
            Create <code>data/subscriptions/your-tool.json</code>. Copy an existing file as a starting point:
          </p>
          <pre className="mt-3 overflow-x-auto rounded-xl bg-ink p-4 text-xs text-paper">{EXAMPLE_SUB}</pre>
          <p className="mt-3">
            <code>annualPrice</code> is the <em>total per year</em>. Always include <code>sourceUrl</code> and today's date in <code>lastVerified</code>.
          </p>
        </Section>

        <Section n="3" title="Add an alternative">
          Create <code>data/alternatives/the-tool.json</code> with honest <code>gains</code> <em>and</em> <code>tradeoffs</code>, plain-English{' '}
          <code>setupSteps</code>, a difficulty (<code>easy</code> / <code>medium</code> / <code>weekend</code>) and a hosting type. Then list its id in the subscription's{' '}
          <code>alternatives</code>.
        </Section>

        <Section n="4" title="Check your work">
          Run <code>npm run validate</code>. It checks every file and tells you exactly what's wrong. CI runs the same check on every pull request.
        </Section>

        <div className="card p-5">
          <h3 className="font-semibold">Our ground rules</h3>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-ink-soft">
            <li>Be honest about trade-offs. Trust is the whole point.</li>
            <li>Prefer open-source tools. If something is free but closed source, say so in the license field.</li>
            <li>No affiliate links, no logos, no copying anyone's branding.</li>
            <li>Write for someone who has never opened a terminal.</li>
          </ul>
        </div>
        <a href={REPO_URL} target="_blank" rel="noreferrer" className="btn-primary">
          ★ Open the repo on GitHub
        </a>
      </div>
    </div>
  )
}

function Section({ n, title, children }: { n: string; title: string; children: React.ReactNode }) {
  return (
    <section className="card p-5">
      <h2 className="flex items-center gap-3 font-semibold">
        <span className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-ink bg-hilite text-sm font-bold text-ink">{n}</span>
        {title}
      </h2>
      <div className="mt-2 text-sm text-ink-soft">{children}</div>
    </section>
  )
}
