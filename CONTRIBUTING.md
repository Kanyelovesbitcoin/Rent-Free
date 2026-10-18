# Contributing to Rent-Free

Thanks for helping people stop paying rent on their software!

## No coding? Use a form (2 minutes)

- 🆕 [Add an app we're missing](../../issues/new?template=add-app.yml)
- 💲 [Fix a wrong price](../../issues/new?template=wrong-price.yml)
- 💡 [Share an idea or a better free app](../../issues/new?template=idea.yml)

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
