# Vetted

Deals that fit. From people you trust. A mobile-first web app for creators:

- **Brand Match**: up to 20 brands that fit your content, discovered from the last 7 or 30 days of brand activity, with sources. Open a brand to check pay and current campaigns.
- **Trust Score**: rates a brand, manager or promo email 0–100 (Looks safe / Check first / Risky) across five checks, each with sources.

Powered entirely by You.com: Search, Extract, Answer and the Inference Router. See [PLAN.md](PLAN.md) for the user flow and architecture.

## Run it

```bash
npm install
cp .env.example .env.local   # then paste your key into YDC_API_KEY
npm run dev
```

Open http://localhost:3000. On desktop the app shows in a phone frame.

Without `YDC_API_KEY` (or when discovery fails), the feed shows a saved sample run marked "Sample data". Successful discovery stays live if an individual brand's detail check fails; that check can be retried.

## You.com calls

| Feature | Endpoint | Used for |
| --- | --- | --- |
| Brand Match | `POST ydc-index.io/v1/extract` | Read the creator's pasted post links |
| | Inference Router `POST api.you.com/v1/chat/completions` | Niche profile; merge and rank all search results; pitch email |
| | `POST ydc-index.io/v1/search` (week/month freshness) | Three parallel lanes: sponsorships, creator programs, adjacent product categories |
| | `POST api.you.com/v1/research` | Alternative discovery when the Inference Router is unavailable |
| | `POST api.you.com/v1/answer` | Pay and campaigns for one brand when opened |
| Trust Score | `search` | Official site (identity), scam reports, manager lookup |
| | `answer` (year freshness) | Lawsuits, court cases, unpaid-creator complaints |
| | Inference Router | Parse brand/manager from the email; grade business health |

Brand Match combines three parallel Search calls in one shared extraction/ranking call, merges duplicate brand names and website domains while preserving their sources, and returns up to 20 supported brands. A failed search lane does not discard successful lanes. It returns fewer brands when evidence is insufficient. Fit is based on content relevance and stays stable when details arrive.

`POST /api/brand-research` checks only the brand opened in the detail page. Completed checks are reused in the browser session; failed checks can be retried. Unchecked campaigns are labeled "Not checked", and sample runs never trigger live detail checks.

The Inference Router needs purchased You.com credits. After a 402/403, Brand Match uses one structured Research call as its alternative. Other features use their existing rule-based or template fallbacks.

Run `npm run lint` and `npm run build` to validate changes.

Set `YDC_LLM_MODEL` to any model id your key can use (`curl https://api.you.com/v1/models -H "Authorization: Bearer $YDC_API_KEY"`).

## Code map

- `src/lib/you.ts`: You.com client
- `src/lib/brandMatch.ts`, `src/lib/trustScore.ts`: the two pipelines
- `src/lib/researchBrand.ts`, `src/lib/brandResearchState.ts`: on-demand brand research, labels, and cached updates
- `src/lib/fallback.ts`, `src/lib/sampleEmails.ts`: sample runs and demo emails
- `src/app/api/*`: route handlers (`brand-match`, `brand-research`, `trust-score`, `pitch`)
- `src/app/*`: one route per design artboard

## Deploy

Push to GitHub, import into Vercel, add `YDC_API_KEY` as an environment variable.
