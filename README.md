# 🔑 Rent-Free

**Stop renting your software.**

Rent-Free is a free, open-source web app that shows you what your subscriptions really cost per year, and how to replace them with free, open-source or local tools.

- **Savings calculator**: pick what you pay for (Calendly, Descript, ChatGPT, Notion, Canva…) or add anything custom. See what you pay now vs. the open-source route, including any server costs and setup time.
- **Honest swap guides**: for every tool, see what you gain, what you give up, a difficulty level, and plain-English steps to switch.
- **Build kit**: no good alternative? Get a copy-paste build prompt and a wireframe mockup to hand to Claude, ChatGPT, Lovable or Bolt so you can build your own.
- **Local AI advisor**: enter your RAM/GPU and see which open models your computer can actually run, which app to use, and whether local, hybrid (local + pay-as-you-go) or keeping your subscription makes the most sense.
- **Shareable receipt**: download a "Rent-Free receipt" image or share a link to your results.

Everything runs in your browser. No accounts, no tracking, and your picks are never sent anywhere.

## Run it locally

```bash
npm install
npm run dev        # http://localhost:5173
```

| Command | What it does |
| --- | --- |
| `npm run validate` | Checks every file in `/data` (schemas, cross-references, price sources) |
| `npm test` | Unit tests (savings math, hardware advisor, build kit, share links) |
| `npm run build` | Typecheck + production build into `dist/` |
| `npm run e2e` | Playwright smoke tests (desktop + phone) against `npm run preview` |

## Deploy (free)

The build is a static site that works from any folder, because it uses hash routing and relative paths.

- **Vercel / Netlify / Cloudflare Pages**: import the repo, build command `npm run build`, output directory `dist`.
- **GitHub Pages**: upload `dist/` with any Pages action.

## How the data works

All content lives in JSON files, so contributing doesn't require touching code:

```
data/
  subscriptions/*.json   # paid tools: plans, prices, source URL, last-verified date
  alternatives/*.json    # open-source/local tools: hosting, difficulty, gains, trade-offs, setup steps
  categories.json        # categories + which wireframe the build kit uses
  local-models.json      # open models: size, memory needed, what they're good at
```

The schemas live in [`src/lib/schema.ts`](src/lib/schema.ts). See [CONTRIBUTING.md](CONTRIBUTING.md) to add a tool in about 5 minutes.

### How savings are calculated

- Desktop apps and free web tiers cost **$0**.
- Self-hosted apps share **one small server** (default $6/month, editable), counted once no matter how many apps run on it.
- Pay-as-you-go options (e.g. an AI API) use a stated monthly estimate.
- If you choose "keep paying," that tool counts **zero** savings. We never count savings we can't back up.

Prices were last checked on the date shown on each tool page. Prices change, so please [report a wrong one](../../issues/new).

## Legal notes

Rent-Free is independent and not affiliated with any company it lists. Product names are used only to identify the products being compared (no logos). Prices are hand-checked estimates with a source and date. Each alternative shows its license, plus a note when that license limits commercial use. The site makes no third-party requests (fonts are bundled), uses no cookies and collects no data. See the in-app **About & disclaimer** page for the full text.

## License

MIT
