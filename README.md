# 🔑 Rent-Free

**Stop paying rent on your software.**

Lots of us pay every month for apps like Netflix, Spotify, iCloud, ChatGPT or Canva. Rent-Free helps you:

1. **See what you really pay.** Type the apps you pay for. We add up the cost for a whole year.
2. **Find free apps that do the same job.** For each one, we show how hard the switch is and if it's worth it.
3. **Follow your switch plan.** Easiest wins first. Tick each one off, watch your savings grow, and add reminders to your calendar.
4. **Build your own version with AI.** Pick the features you use. We hand you a ready-to-go starter kit for an AI helper (like Claude Code or Codex) that builds the app for you.

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

## Free ChatGPT on your computer

Paying $20 a month for ChatGPT or Claude? Many computers can run a free AI that never leaves your device. The **Free AI** page asks 2 questions (what computer, how much memory) and tells you which AI fits.

We start everyone on **LM Studio**: one app, no typing commands. Open it, search for the AI we suggest, click Download, then Chat. (Ollama is there too, for people who like the terminal.)

## Building your own app with AI

When no free app fits, Rent-Free helps you make your own:

1. Pick an app (or describe your own).
2. Tick the features you actually use.
3. Pick your **building blocks**: free services your app plugs into, like email, logins or payments. We suggest the right ones for you.
4. Pick your AI helper: **Claude Code, Codex, OpenCode, Cursor**, or just Claude.ai / ChatGPT.
5. Click **Download starter kit**. Unzip it, open the folder in your AI helper, and say: *"Read START-HERE.md and PROMPT.md, then let's build it."*

The starter kit has everything in one folder: the instructions, a sketch of the screen, a memory file for the AI (`CLAUDE.md` or `AGENTS.md`), and a `.env.example` that lists every key your app needs.

We also tell you how big the job is: 🧩 small (like a puzzle), 🧱 medium (like a big LEGO set), 🏠 big (like a treehouse), or 🏰 huge (like a castle). Bigger jobs get more careful, step-by-step instructions.

### Never used an AI coding helper?

Open the **New to AI?** page. It explains, in plain words:

- what Claude Code, Codex, OpenCode and Cursor are, and what each one costs;
- which one to pick (already pay for ChatGPT Plus? Codex is included. Want $0? Try OpenCode);
- your first 30 minutes, step by step;
- how to put your app online, and how to stay safe (never paste passwords, keep keys in `.env`).

### The Toolbox: free building blocks

The **Toolbox** page lists 28 services your app can plug into, each with its free plan, the price after that, and sign-up steps. Some examples:

| Job | Free picks |
| --- | --- |
| AI | LM Studio or Ollama (on your computer), OpenRouter, Google AI Studio, Groq |
| Sending email | Resend, Brevo |
| Saving data and logins | SQLite, PocketBase, Supabase |
| Putting it online | Cloudflare Pages, Netlify, Coolify (your own server) |
| Files, speech, maps, video | Cloudflare R2, Whisper, OpenStreetMap, Jitsi |

Free plans change. Every entry has a source link and the date we checked it.

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
  apis.json              # Toolbox: free building blocks (free plan, price after, sign-up steps, keys)
```

The rules for each file are in [`src/lib/schema.ts`](src/lib/schema.ts). The full guide is in [CONTRIBUTING.md](CONTRIBUTING.md).

**Adding a building block:** add an entry to `data/apis.json` with a plain one-line `what`, the `freeTier`, `paidFrom`, `signupSteps`, `envVars` (the key names), a `sourceUrl` and a `lastVerified` date. Then run `npm run validate`. To have the Build studio suggest it, add a keyword rule in `src/lib/apiSuggest.ts`.

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
