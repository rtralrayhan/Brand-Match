# Vetted

Deals that fit. From people you trust. A mobile-first web app for creators:

- **Brand Match**: brands that fit your last 7 or 30 days of posts, what they pay creators, and whether they're hiring now, with sources.
- **Trust Score**: rates a brand, manager or promo email 0–100 (Looks safe / Check first / Risky) across five checks, each with sources.

Powered entirely by You.com: Search, Extract, Answer and the Inference Router. See [PLAN.md](PLAN.md) for the user flow and architecture.

## Run it

```bash
npm install
cp .env.example .env.local   # then paste your key into YDC_API_KEY
npm run dev
```

Open http://localhost:3000. On desktop the app shows in a phone frame.

Without `YDC_API_KEY` (or when a call fails) every screen shows a saved sample run, marked "Sample data". With a key the pill turns green: "Live · You.com".

## You.com calls

| Feature | Endpoint | Used for |
| --- | --- | --- |
| Brand Match | `POST ydc-index.io/v1/extract` | Read the creator's pasted post links |
| | Inference Router `POST api.you.com/v1/chat/completions` | Niche profile; pull brand names out of results; pitch email |
| | `POST ydc-index.io/v1/search` (week/month freshness) | Brands sponsoring creators in the niche |
| | `POST api.you.com/v1/answer` | What each brand pays and whether it's hiring now |
| Trust Score | `search` | Official site (identity), scam reports, manager lookup |
| | `answer` (year freshness) | Lawsuits, court cases, unpaid-creator complaints |
| | Inference Router | Parse brand/manager from the email; grade business health |

Brand Match finds brands with one Research call (`research_effort: "standard"` with a JSON `output_schema`, about 17 s). The Inference Router needs purchased You.com credits. Without them the app uses rule-based fallbacks: email parsing, health grading, and a template pitch. It stops calling the router after the first 402.

Set `YDC_LLM_MODEL` to any model id your key can use (`curl https://api.you.com/v1/models -H "Authorization: Bearer $YDC_API_KEY"`).

## Code map

- `src/lib/you.ts`: You.com client
- `src/lib/brandMatch.ts`, `src/lib/trustScore.ts`: the two pipelines
- `src/lib/fallback.ts`, `src/lib/sampleEmails.ts`: sample runs and demo emails
- `src/app/api/*`: route handlers (`brand-match`, `trust-score`, `pitch`)
- `src/app/*`: one route per design artboard

## Deploy

Push to GitHub, import into Vercel, add `YDC_API_KEY` as an environment variable.

## Sign-up and Gmail

Sign-up is email only (name + email, no password or code). Apple and Google sign-in are shown as "Soon". The session lives in an encrypted cookie; there is no database.

**Connect Gmail** uses Google sign-in with the read-only Gmail scope (`gmail.readonly`). Vetted searches the last 30 days for brand-deal emails (collab, sponsorship, paid partnership, ambassador…), reads the 10 most recent and runs Trust Score on each. Tokens are stored only in an encrypted, http-only cookie. Disconnect revokes access.

### Gmail setup (one time)

1. In [Google Cloud Console](https://console.cloud.google.com/), create a project and enable the **Gmail API**.
2. **OAuth consent screen**: External, app name "Vetted", add the scope `.../auth/gmail.readonly`, and add your Gmail address under **Test users** (while the app is in Testing, only test users can connect).
3. **Credentials → Create credentials → OAuth client ID → Web application**, with these authorized redirect URIs:
   - `http://localhost:3100/api/gmail/callback` (and `http://localhost:3000/api/gmail/callback` if you use the default port)
   - `https://<your-vercel-domain>/api/gmail/callback`
4. Put the client ID and secret in `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`, set `AUTH_SECRET`, locally in `.env.local` and in Vercel → Settings → Environment Variables.

Without the Google variables, "Connect Gmail" shows a note and the inbox keeps the demo emails.
