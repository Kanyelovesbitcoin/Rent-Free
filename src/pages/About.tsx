import { Link } from 'react-router-dom'
import { PageHeader, REPO_URL } from '../components/ui'

export default function About() {
  return (
    <div className="max-w-3xl">
      <PageHeader eyebrow="About" title="About Rent-Free & the fine print">
        Rent-Free is a free, open-source project that helps people stop paying monthly rent on software they could own, run themselves, or build.
      </PageHeader>

      <div className="space-y-4">
        <Block title="Independent, not affiliated">
          Rent-Free is independent and is not affiliated with, endorsed by, or sponsored by any company or product listed. Product names are trademarks of
          their respective owners and are used only to identify the products being compared. We don't use their logos.
        </Block>
        <Block title="Prices are estimates">
          Prices are entered by hand from each company's public pricing page and show the date they were last checked. Prices, plans, taxes and regional
          pricing change, so check the official page before you make a decision. Savings shown are estimates, not guarantees. Spot a wrong price?{' '}
          <a className="underline" href={`${REPO_URL}/issues/new`} target="_blank" rel="noreferrer">
            Tell us
          </a>
          .
        </Block>
        <Block title="Not professional advice">
          Everything here is general information, not financial, legal or security advice. Setup steps and time estimates are best-effort guides.
        </Block>
        <Block title="You own your setup">
          When you self-host or switch tools, you're responsible for your own data, backups and security. Always export your data before cancelling a
          subscription, and be extra careful when moving passwords.
        </Block>
        <Block title="Open-source licenses">
          Each alternative lists its license. Most are fine for personal and business use. Some have extra rules if you modify the software and offer it to
          others, or if you resell it as a hosted service; we flag these on each tool page. Read the license before building a business on top of a tool.
        </Block>
        <Block title="Building your own">
          The build kit helps you make an <em>original</em> app with the features you need. Don't copy another product's name, logo, design, text or code.
          Ideas and features are fair game; branding and copyrighted material aren't.
        </Block>
        <Block title="Privacy">
          No accounts, no cookies, no analytics, no tracking. Your selections are stored only in your own browser. Share links contain your picks encoded in
          the URL itself, and nothing is sent to a server. Fonts are bundled with the site, so loading a page doesn't contact any third party.
        </Block>
        <Block title="The software">
          Rent-Free's code is released under the MIT License and provided "as is", without warranty of any kind.{' '}
          <Link to="/contribute" className="underline">
            Contributions welcome
          </Link>
          .
        </Block>
      </div>
    </div>
  )
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="card p-5">
      <h2 className="font-semibold">{title}</h2>
      <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">{children}</p>
    </section>
  )
}
