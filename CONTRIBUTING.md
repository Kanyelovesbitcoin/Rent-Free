# Contributing to Rent-Free

Thanks for helping people stop renting their software! Most contributions are just editing JSON files. You can even do it right on GitHub without installing anything.

## Ground rules

1. **Be honest.** List trade-offs as clearly as benefits. Trust is the whole point.
2. **Cite prices.** Every subscription needs a `sourceUrl` (its official pricing page) and a `lastVerified` date.
3. **Prefer open source.** If a tool is free but closed source (e.g. LM Studio, Obsidian), say so in `license`.
4. **No affiliate links, logos or copied branding.**
5. **Write for beginners.** Setup steps should make sense to someone who has never opened a terminal.

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
  "localAI": false
}
```

- `monthlyPrice`: price per month when billed monthly (`null` if not offered).
- `annualPrice`: the **total per year** when billed yearly (`null` if not offered).
- `alternatives`: best first. The first one is the "Pick for me" recommendation.
- `category`: must exist in `data/categories.json`.

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
