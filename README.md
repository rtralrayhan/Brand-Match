# Vetted

Deals that fit. From people you trust. A web app for creators with one backend and two interfaces, a phone app and a desktop website, both served from https://vettedapp.nyc:

- **Brand Match**: up to 20 brands that fit your content, discovered from the last 7 or 30 days of brand activity, with sources. Open a brand to check pay and current campaigns.
- **Trust Score**: rates a brand, manager or promo email 0–100 (Looks safe / Check first / Risky) across five checks, each with sources.

Powered entirely by You.com: Search, Extract, Answer and the Inference Router. See [PLAN.md](PLAN.md) for the user flow and architecture.

## Run it

```bash
npm install
cp .env.example .env.local   # then paste your key into YDC_API_KEY
npm run dev
```

Open http://localhost:3000. A desktop browser gets the desktop website; a phone gets the phone app. To see the other one, use the "Switch to phone view" / "Switch to desktop view" link, or open http://localhost:3000/mobile or http://localhost:3000/desktop. In a desktop browser the phone app shows in a 390px phone frame.

Without `YDC_API_KEY` (or when discovery fails), the feed shows a saved sample run marked "Sample data". Successful discovery stays live if an individual brand's detail check fails; that check can be retried.

## Two interfaces, one app

Everything except the screens is shared: one `src/lib` (You.com client, pipelines, store), one `src/app/api`, one `src/middleware.ts`, one session cookie and one set of environment variables. An account made on a phone works on desktop and the other way round.

| Screen | URL | Phone (`src/app/mobile`) | Desktop (`src/app/desktop`) |
| --- | --- | --- | --- |
| Home | `/` | Welcome screen | Marketing landing page (hero, how it works with screenshots, Trust Score, pricing, FAQ) |
| Sign up / sign in | `/signup`, `/signup?mode=signin` | Full-screen form | Split screen |
| Onboarding | `/onboarding/connect`, `/niche`, `/inbox` | Step header | Step list on the left |
| Brand Match | `/matches`, `/matches/[id]` | Feed and detail with tab bar | Card grid and detail in a sidebar app shell |
| Trust inbox | `/inbox`, `/inbox/[id]`, `/inbox/check` | List and detail | Split view |
| Profile | `/settings` | Profile tab with log out | Profile page with log out |
| Legal | `/privacy`, `/terms` | Same page in both | |

URLs are identical in both. `src/middleware.ts` picks the interface for every page request and rewrites it to `src/app/mobile/…` or `src/app/desktop/…`:

1. The `ui` cookie (`mobile` or `desktop`) wins when set. Opening `/mobile/…` or `/desktop/…` sets it for a year and redirects to the clean URL; the "Switch to phone/desktop view" links (`src/components/viewSwitch.tsx`) use this.
2. Otherwise the `Sec-CH-UA-Mobile` client hint, then the user agent, decide. iPads and unknown browsers get desktop.
3. Signed-out visitors to `/onboarding`, `/matches`, `/inbox` and `/settings` go to `/signup`.

Screens use `src/components/mobile/*` or `src/components/desktop/*`; `src/components/{gmail,videos,legal,viewSwitch}.tsx` are shared. Landing-page screenshots live in `public/screenshots/` (WebP, 2000×1250 desktop, 780×1688 phone; retake at a 1440×900 window and 2x scale, same file names).

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

New searches start with 7 days. The 30-day search runs only when selected and combines its discoveries with the cached live 7-day matches before deduplicating, sorting by content fit, and keeping up to 20. Switching back reuses the weekly cache. Starting a new search clears both windows; manual refresh reruns the selected window. Sample data is never mixed into live results. If monthly discovery fails, cached live weekly matches remain available with a note.

`POST /api/brand-research` checks only the brand opened in the detail page. Completed checks are reused in the browser session; failed checks can be retried. Unchecked campaigns are labeled "Not checked", and sample runs never trigger live detail checks.

The Inference Router needs purchased You.com credits. After a 402/403, Brand Match first uses lite Research, asking for JSON text and accepting only evidence URLs present in the returned sources. If lite returns no supported brands or invalid JSON, standard Research with native structured output provides a backup. Other features use their existing rule-based or template fallbacks. When no post text is available, picked niches are used directly without a separate profiling model call.

Successful feed responses are also cached on the server for 10 minutes (up to 50 input/window combinations), and simultaneous identical requests share one provider run. Manual refresh bypasses that cache. The cache is local to each server process and resets on restarts or deployments; sample and failed runs are not cached there.

Run `npm run lint` and `npm run build` to validate changes.

Set `YDC_LLM_MODEL` to any model id your key can use (`curl https://api.you.com/v1/models -H "Authorization: Bearer $YDC_API_KEY"`).

## Code map

- `src/lib/you.ts`: You.com client
- `src/lib/brandMatch.ts`, `src/lib/trustScore.ts`: the two pipelines
- `src/lib/researchBrand.ts`, `src/lib/brandResearchState.ts`: on-demand brand research, labels, and cached updates
- `src/lib/fallback.ts`, `src/lib/sampleEmails.ts`: sample runs and demo emails
- `src/app/api/*`: route handlers (`brand-match`, `brand-research`, `trust-score`, `pitch`, `auth/*`, `gmail/*`)
- `src/app/mobile/*`, `src/app/desktop/*`: the two interfaces' screens (see above); `src/middleware.ts` chooses between them

## Deploy

One Vercel project, `vetted`, serves both interfaces at https://vettedapp.nyc. Its environment variables are `YDC_API_KEY`, `AUTH_SECRET`, `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` (optional `YDC_LLM_MODEL`).

The old `website` Vercel project (website-two-azure-81.vercel.app, Root Directory `website`) is no longer needed: its folder is gone from the repo, so delete the project in Vercel → website → Settings → Delete Project. Its redirect URI can come out of the Google OAuth client too.

## Sign-up and Gmail

Sign-up is email only (name + email, no password or code). Apple and Google sign-in are shown as "Soon". The session lives in an encrypted cookie; there is no database.

**Connect Gmail** uses Google sign-in with the read-only Gmail scope (`gmail.readonly`). Vetted searches the last 30 days for brand-deal emails (collab, sponsorship, paid partnership, ambassador…), reads the 10 most recent and runs Trust Score on each. Tokens are stored only in an encrypted, http-only cookie. Disconnect revokes access.

### Gmail setup (one time)

1. In [Google Cloud Console](https://console.cloud.google.com/), create a project and enable the **Gmail API**.
2. **OAuth consent screen**: External, app name "Vetted", add the scope `.../auth/gmail.readonly`, and add your Gmail address under **Test users** (while the app is in Testing, only test users can connect).
3. **Credentials → Create credentials → OAuth client ID → Web application**, with these authorized redirect URIs:
   - `https://vettedapp.nyc/api/gmail/callback` (the only one production needs; it serves both the phone and desktop interfaces)
   - for local work, `http://localhost:3000/api/gmail/callback`
4. Put the client ID and secret in `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`, set `AUTH_SECRET`, locally in `.env.local` and in Vercel → Settings → Environment Variables.

Without the Google variables, "Connect Gmail" shows a note and the inbox keeps the demo emails.
