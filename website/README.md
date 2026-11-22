# Vetted — website

The desktop web version of Vetted. Same flow as the phone app in the parent folder, laid out for a browser:

| Phone app | Website |
| --- | --- |
| 1. Welcome | `/` Marketing landing page (hero, features, how it works) |
| 1a. Sign up | `/signup` Split screen: Google or email sign-up (Apple soon), `?mode=signin` to sign back in |
| 1b–1d. Onboarding | `/onboarding/connect` (video links), `/niche`, `/inbox` (Connect Gmail) with a step list on the left |
| 2. Brand Match feed | `/matches` Card grid, plus a "Your content" side panel |
| 3. Brand detail | `/matches/[id]` Creator videos, pay and hiring checked on open, sources on the right, pitch in a dialog |
| Profile | `/settings` Account, niches, connected Gmail, log out |
| 4. Trust inbox | `/inbox` Split view: your Gmail brand emails (or demo emails) on the left, score on the right |
| 5. Email Trust Score | `/inbox/[id]` |
| Paste an email | `/inbox/check` |

The app screens share a sidebar with navigation, saved brands and the profile. Below `md` width the sidebar becomes a top bar and the inbox shows one pane at a time.

## Landing page

`/` is a full marketing page: hero, the problem, a six-step "How to use it" walkthrough with app screenshots, a Trust Score deep-dive, who it's for, benefits with a before/after, a mobile section, FAQ and a final call to action.

Screenshots live in `public/screenshots/` (WebP, 2000×1250 for desktop, 780×1688 for mobile). They're real captures of this app on sample data. If you change a screen, retake it at a 1440×900 window and 2x scale, and keep the same file name. Step screenshots open full size on click.

## Run it

```bash
cd website
npm install
cp .env.example .env.local   # paste your key into YDC_API_KEY
npm run dev                  # http://localhost:3001
```

It runs on port 3001, so it can sit next to the phone app on 3000. Without `YDC_API_KEY` every screen shows the saved sample run, marked "Sample data".

Sign-up, sessions and Gmail need the same variables as the phone app: `AUTH_SECRET`, `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` (see the parent README's Gmail setup). Add this site's callback, `http://localhost:3001/api/gmail/callback` and `https://<website-domain>/api/gmail/callback`, to the Google OAuth client's authorised redirect URIs. App screens (`/onboarding`, `/matches`, `/inbox`, `/settings`) need an account; `src/middleware.ts` sends signed-out visitors to `/signup`.

## How it relates to the phone app

`src/lib/*`, `src/app/api/*`, `src/middleware.ts`, `src/app/privacy`, `src/app/terms` and `src/components/{gmail,videos,legal}.tsx` are copies of the phone app's files (You.com client, Brand Match and Trust Score pipelines, accounts, Gmail, sample data, store). Only the screens and layout are new. When you change one of those in the phone app, copy it here too:

```bash
npm run sync-shared   # from website/: copies the phone app's shared files over these
```

## Deploy

Import the repo into Vercel as a second project, set **Root Directory** to `website`, and add `YDC_API_KEY`, `AUTH_SECRET`, `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` as environment variables.
