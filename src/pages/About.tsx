import { Link } from 'react-router-dom'
import { GLOSSARY } from '../lib/glossary'
import { PageHeader, REPO_URL } from '../components/ui'

// Show each meaning once (some words share a meaning, like "self-host" and "self-hosted").
const WORDS = Object.entries(GLOSSARY).filter(([, v], i, all) => all.findIndex(([, w]) => w === v) === i)

export default function About() {
  return (
    <div className="max-w-3xl">
      <PageHeader eyebrow="About" title="About Rent-Free (the fine print, in plain words)">
        Rent-Free is a free website that helps you stop paying every month for apps you could get for free, run yourself, or build.
      </PageHeader>

      <div className="space-y-4">
        <Block title="Independent, not affiliated">
          We are not part of, paid by, or approved by any company on this site. App names belong to their companies. We only use them so you know which app we mean. We
          don't use their logos.
        </Block>
        <Block title="Prices are our best guess">
          We copy prices by hand from each company's website and show the date we checked. Prices change often, so check the real website before you decide. Savings are
          estimates, not promises. See a wrong price?{' '}
          <a className="underline" href={`${REPO_URL}/issues/new?template=wrong-price.yml`} target="_blank" rel="noreferrer">
            Tell us
          </a>
          .
        </Block>
        <Block title="This is not expert advice">Everything here is general help, not money, legal or security advice. Setup steps and times are our best guess.</Block>
        <Block title="Keep your stuff safe">
          If you switch apps, save a copy of your data first. If you run an app yourself, you're in charge of backups. Be extra careful when moving passwords.
        </Block>
        <Block title="The rules for free apps (licenses)">
          Every free app shows its license, which is its rulebook. Most say "use it however you want." A few have extra rules if you change the app and share it, or sell
          it as a service. We point those out.
        </Block>
        <Block title="Building your own">
          The build helper makes your own, new app with the features you need. Don't copy another app's name, logo, look, words or code. Ideas are free to use; logos
          and copied work are not.
        </Block>
        <Block title="Game mode">
          Game names belong to their companies. We only use them to say which game we mean. We only link to code that companies or the original makers released, and to
          free fan projects. We never link to leaked, cracked or AI-decompiled copies. When you make your own game, copy the fun (rules and ideas), not the stuff (name,
          characters, art, music, story or code). This is general help, not legal advice.
        </Block>
        <Block title="Privacy">
          No accounts, no cookies, no tracking. What you pick stays in your own web browser. A share link stores your picks inside the link itself, so we never see them.
          Even our fonts are part of the site, so nothing gets sent to anyone else.
        </Block>
        <Block title="The code">
          Rent-Free's code is free to use under the MIT license, as is. <Link to="/contribute" className="underline">Want to help?</Link>
        </Block>
      </div>

      <section className="mt-10" aria-labelledby="words">
        <h2 id="words" className="font-display text-2xl font-extrabold">
          Words we use
        </h2>
        <p className="mt-1 text-ink-soft">Tech words are underlined across the site. Tap one to see what it means. Here they all are:</p>
        <dl className="mt-4 grid gap-3 sm:grid-cols-2">
          {WORDS.map(([word, meaning]) => (
            <div key={word} className="card p-4">
              <dt className="font-bold">{word}</dt>
              <dd className="mt-1 text-sm text-ink-soft">{meaning}</dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  )
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="card p-5">
      <h2 className="font-display text-lg font-extrabold">{title}</h2>
      <p className="mt-1 text-sm text-ink-soft">{children}</p>
    </section>
  )
}
