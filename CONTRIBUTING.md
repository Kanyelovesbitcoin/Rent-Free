# Contributing to Rent-Free

Thanks for helping people stop paying rent on their software!

## No coding? Use a form (2 minutes)

- 🆕 [Add an app we're missing](../../issues/new?template=add-app.yml)
- 💲 [Fix a wrong price](../../issues/new?template=wrong-price.yml)
- 💡 [Share an idea or a better free app](../../issues/new?template=idea.yml)
- 📦 [Spotted a game going open source?](../../issues/new?template=source-drop.yml)

You just need a free GitHub account. We'll turn your form into a real update.

## Do you code? Edit the files yourself

Most changes are just editing small JSON files. You can even do it right on GitHub without installing anything.

## Ground rules

1. **Be honest.** List trade-offs as clearly as benefits. Trust is the whole point.
2. **Cite prices.** Every subscription needs a `sourceUrl` (its official pricing page) and a `lastVerified` date.
3. **Prefer open source.** If a tool is free but closed source (e.g. LM Studio, Obsidian), say so in `license`.
4. **No affiliate links, logos or copied branding.**
5. **Write for a 5th grader.** Short sentences, simple words. Setup steps should make sense to someone who has never opened a terminal. `npm test` checks the reading level of every description.

## Legal basics for contributors

- By contributing, you agree your contribution is released under the project's MIT License.
- Enter prices **by hand** from the company's official pricing page. Don't scrape sites, and don't copy text from other comparison sites or blogs; write descriptions in your own words.
- Refer to products by name only. No logos, screenshots of their branding, or claims that a company endorses Rent-Free.
- If an alternative's license limits commercial use (e.g. no reselling as a hosted service), add a `commercialNote`.

## Fix a wrong price (2 minutes)

Edit the file in `data/subscriptions/`, update the price and `lastVerified`, and open a pull request. Or [open an issue](../../issues/new) with a link to the pricing page.

## Add a subscription (5 minutes)

Create `data/subscriptions/<id>.json`. The file name must match `id` (lowercase-with-dashes).

```json
{
  "id": "calendly",
  "name": "Calendly",
  "category": "scheduling",
  "website": "https://calendly.com",
  "description": "One plain-English sentence about what people use it for.",
  "coreFeatures": ["The 3–6 features people actually use", "These feed the build prompt", "..."],
  "plans": [
    { "id": "standard", "name": "Standard", "monthlyPrice": 12, "annualPrice": 120, "perSeat": true }
  ],
  "defaultPlan": "standard",
  "sourceUrl": "https://calendly.com/pricing",
  "lastVerified": "2026-10-17",
  "priceNote": "Optional caveat, e.g. 'price grows with contacts'",
  "alternatives": ["calcom", "easyappointments"],
  "localAI": false,
  "kind": "software",
  "complexity": 2,
  "extraFeatures": ["Optional features people can switch on in the Remake studio"],
  "remakeNote": "Optional honest warning shown in the Remake studio",
  "popularity": 39
}
```

- `monthlyPrice`: price per month when billed monthly (`null` if not offered).
- `annualPrice`: the **total per year** when billed yearly (`null` if not offered).
- `alternatives`: best first. The first one is the "Pick for me" recommendation.
- `category`: must exist in `data/categories.json`.
- `kind`: `software`, `content` (movies, music, books) or `membership` (shipping, game libraries). Content and memberships also need a `remakeTarget`: what you'd honestly build instead (e.g. "a personal media server for movies you own").
- `complexity`: 1 simple (link page), 2 standard (to-do app), 3 complex (notes with databases), 4 platform (Netflix, Adobe, Zoom). It decides how much structure the Remake prompt asks for.
- `popularity`: rough order of how many people pay for it (1 = most). Editorial, not a survey rank.

## Add an alternative

Create `data/alternatives/<id>.json`:

```json
{
  "id": "calcom",
  "name": "Cal.com",
  "website": "https://cal.com",
  "repo": "https://github.com/calcom/cal.com",
  "license": "AGPL-3.0",
  "hosting": "browser",
  "monthlyCost": 0,
  "platforms": ["Web"],
  "difficulty": "easy",
  "setupHours": 0.5,
  "summary": "One or two sentences.",
  "gains": ["What you get"],
  "tradeoffs": ["What you give up. Be honest!"],
  "setupSteps": ["Step 1", "Step 2"],
  "freeTierLimits": "Optional",
  "commercialNote": "Optional: license rules for business use, reselling or hosting for others"
}
```

- `hosting`: `desktop` (install an app), `browser` (free web app / free tier), `self-host` (needs a server; the server is counted once across all apps), or `pay-as-you-go` (set `monthlyCost` to a typical estimate).
- `difficulty`: `easy`, `medium` or `weekend`.
- `partial` hosting (e.g. "Rotate it") needs `keepFraction`: the share of the bill you still pay (0.25 = 3 months a year).

Then add its id to the `alternatives` list of the subscription(s) it replaces.

The first alternative in that list is the default, unless it isn't worth the effort (then the next one is). For ChatGPT, Claude and Gemini we keep **LM Studio** first because it's the easiest for beginners.

## Add a building block (Toolbox)

`data/apis.json` lists free or cheap services people can plug into the apps they build. Add one entry:

```json
{
  "id": "resend",
  "name": "Resend",
  "category": "email",
  "what": "Sends emails from your app, like booking confirmations.",
  "freeTier": "3,000 emails a month (100 a day)",
  "paidFrom": "$20/mo",
  "openSource": false,
  "runsLocally": false,
  "website": "https://resend.com",
  "docsUrl": "https://resend.com/docs",
  "signupSteps": ["Make a free account", "Click API Keys → Create", "Copy the key into your .env file"],
  "envVars": ["RESEND_API_KEY"],
  "goodFor": ["confirmations", "reminders"],
  "sourceUrl": "https://resend.com/pricing",
  "lastVerified": "2026-10-18"
}
```

- `category`: `ai`, `email`, `database`, `login`, `hosting`, `payments`, `storage`, `speech`, `search`, `maps`, `images` or `video`.
- Keep `what` short and plain (a test checks the reading level).
- Write the free tier exactly as the pricing page says. If you aren't sure, say less, not more.
- No affiliate or referral links.
- Want the Build studio to suggest it? Add a keyword rule in `src/lib/apiSuggest.ts`.

## Game mode: add a source drop

When a company releases a game's (or engine's) code, add it to `data/source-drops.json`:

```json
{
  "id": "zork",
  "title": "Zork I, II and III",
  "by": "Microsoft, Team Xbox and Activision",
  "date": "2025-11-20",
  "kind": "game",
  "license": "MIT",
  "licenseKind": "open",
  "includesArt": true,
  "needsYourCopy": false,
  "what": "One or two short, plain sentences.",
  "why": "Why they said they did it.",
  "repoUrl": "https://github.com/historicalsource/zork1",
  "gameId": "zork",
  "howToPlay": ["Step 1", "Step 2"],
  "sourceUrl": "https://…",
  "lastVerified": "2026-10-19"
}
```

- `licenseKind`:
  - `open` for MIT, GPL and other OSI licenses;
  - `public-domain` for CC0;
  - `source-available` when the license has limits like "no selling".
- `includesArt`: did the pictures, music and levels come too? `needsYourCopy`: do players need to own the game?
- Only official releases by the company or the original makers. Never decompiled or leaked code.

## Game mode: add a game

Add `data/games/<id>.json`. See `GameSchema` in `src/lib/schema.ts` and copy an existing file.

- `openness`:
  - `code-out` needs a `dropId`;
  - `fans-rebuilt` and `look-alike` need at least one `fanProjects` entry, with its license and whether it needs your own copy;
  - `closed` means "make your own".
- `lovedFeatures`: 3–5 things people love, in plain words. They are ticked by default in the builder.
- `scopeNote`: an honest size warning for huge games. `legalNote`: extra care for companies known to protect their look.
- Fan projects must be free and open source, and still around.

## Game mode: add a genre

Add an entry to `data/game-genres.json` with:
- a one-sentence `coreLoop`;
- 4 `defaultFeatures`;
- a `base` size (1 mini-game … 4 epic);
- a `sketch` layout (see `src/lib/wireframes/game.ts`).

## Update local AI models

`data/local-models.json` lists open models with their Ollama tag, parameter count, 4-bit download size (`sizeGB`) and what they're good at. New models come out constantly, so PRs are very welcome. Please check the size on the Ollama library page.

## Check your work

```bash
npm install
npm run validate   # tells you exactly what's wrong, file by file
npm test
npm run dev        # see your change at http://localhost:5173
```

CI runs `validate`, `test` and `build` on every pull request.
