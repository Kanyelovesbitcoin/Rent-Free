# 🔑 Rent-Free

**Stop paying rent on your software.**

Lots of us pay every month for apps like Netflix, Spotify, iCloud, ChatGPT or Canva. Rent-Free helps you:

1. **See what you really pay.** Tap the apps you pay for. We add up the cost for a whole year.
2. **Find free apps that do the same job.** For each one, we show how hard the switch is and if it's worth it.
3. **Build your own version with AI.** Pick the features you use, and we write the instructions for an AI helper (like Claude Code) that builds the app for you.

It's free. No sign-up. Nothing you pick leaves your device.

---

## How hard is it to replace an app?

Every app gets a simple meter:

| | What it means |
|---|---|
| 🟢 **Easy swap** | About 15–30 minutes. Like downloading a new app. |
| 🟡 **Takes an afternoon** | A few hours. You follow some steps. |
| 🔴 **Weekend project** | Needs a small rented computer (a "server") and some patience. |

And an honest answer to "Is it worth it?":

- ✅ **Do it:** easy, and you save real money.
- 🤔 **Maybe:** worth it if you have a free afternoon.
- 🛑 **Probably keep paying:** you'd save very little for a lot of work. (For example, a $3/month iCloud plan usually isn't worth a weekend of setup.)

## What about Netflix, Spotify and Amazon Prime?

Nobody can give you free copies of movies or songs. So for those, we show real ways to pay less:

- **Rotate:** keep one streaming service at a time, watch what you want, cancel, then switch.
- **Free plans:** many apps have a free version with ads.
- **Your library card:** Libby, Kanopy and Hoopla let you borrow ebooks, audiobooks and movies for free.
- **Your own media app** (like Jellyfin) for movies and music you already own.

## Building your own app with AI

When no free app fits, Rent-Free helps you make your own:

1. Pick an app (or describe your own).
2. Tick the features you actually use.
3. Pick your AI helper: **Claude Code, Codex, OpenCode, Cursor**, or just Claude.ai / ChatGPT.
4. Copy the instructions and paste them into your AI helper. It builds the app for you.

We also tell you how big the job is: 🧩 small (like a puzzle), 🧱 medium (like a big LEGO set), 🏠 big (like a treehouse), or 🏰 huge (like a castle). Bigger jobs get more careful, step-by-step instructions.

---

## Want your own copy of the website? (no coding needed)

You can put Rent-Free online for free in about 5 minutes:

1. Make a free account at [github.com](https://github.com) and a free account at [vercel.com](https://vercel.com) (sign in with GitHub).
2. On this page, click **Fork** (top right) to make your own copy.
3. In Vercel, click **Add New → Project**, pick your copy of `rent-free`, and click **Deploy**.
4. Wait about a minute. Vercel gives you a link to your own Rent-Free website. 🎉

## Want to help? (no coding needed)

- 🆕 [Add an app we're missing](../../issues/new?template=add-app.yml)
- 💲 [Fix a wrong price](../../issues/new?template=wrong-price.yml)
- 💡 [Share an idea or a better free app](../../issues/new?template=idea.yml)

Each one is a short form. You'll need a free GitHub account.

---

## For people who code

Rent-Free is a static website built with React, TypeScript and Tailwind. All the app data lives in simple JSON files, so adding an app doesn't need any code changes.

```bash
npm install
npm run dev        # open http://localhost:5173
```

| Command | What it does |
| --- | --- |
| `npm run validate` | Checks every file in `/data` and says exactly what to fix |
| `npm test` | Unit tests: savings math, verdicts, AI advisor, prompts, and a reading-level check |
| `npm run build` | Checks types and builds the site into `dist/` |
| `npm run e2e` | Clicks through the site in a real browser (desktop + phone) |

```
data/
  subscriptions/*.json   # paid apps: plans, prices, where the price came from, how hard to remake
  alternatives/*.json    # free swaps: how hard, how long, what's good, what's not, step-by-step
  categories.json        # groups like "Streaming" or "Notes"
  local-models.json      # free AI models and how much memory they need
```

The rules for each file are in [`src/lib/schema.ts`](src/lib/schema.ts). The full guide is in [CONTRIBUTING.md](CONTRIBUTING.md).

### How we count savings

- Free apps and free plans cost **$0**.
- Apps that need a server share **one** small server (about $6 a month, you can change it). We count it once.
- "Rotate it" means you keep paying about 3 months a year, so you keep 75%.
- If you choose "keep paying," that app saves **$0**. We never count savings we can't back up.

### Plain-language rule

Everything on the site should be easy to read for a 5th grader. A test (`tests/readability.test.ts`) checks the reading level of every app description. Tech words that can't be avoided are explained when you tap them (see `src/lib/glossary.ts`).

## Legal notes

Rent-Free is independent and not affiliated with any company it lists. App names are used only to say which app we mean (no logos). Prices are hand-checked estimates with a source and a date. Each free app shows its license, plus a note when that license has extra rules for businesses. The site makes no third-party requests, uses no cookies and collects no data. The full text is on the in-app **About** page.

## License

MIT
