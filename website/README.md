# Vetted — website

The desktop web version of Vetted. Same flow as the phone app in the parent folder, laid out for a browser:

| Phone app | Website |
| --- | --- |
| 1. Welcome | `/` Marketing landing page (hero, features, how it works) |
| 1a. Sign up | `/signup` Split screen: form on the left, brand panel on the right |
| 1b–1d. Onboarding | `/onboarding/connect`, `/niche`, `/inbox` with a step list on the left |
| 2. Brand Match feed | `/matches` Card grid, plus a "Your content" side panel |
| 2b. Swipe view | `/matches/swipe` Card deck with ← / → / Z keyboard shortcuts |
| 3. Brand detail | `/matches/[id]` Two columns, sources on the right, pitch in a dialog |
| 4. Trust inbox | `/inbox` Split view: email list on the left, score on the right |
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

## How it relates to the phone app

`src/lib/*` and `src/app/api/*` are copies of the phone app's files (You.com client, Brand Match and Trust Score pipelines, sample data, store). Only the screens and layout are new. If you fix something in one copy's `lib/`, copy it to the other, or move `lib/` into a shared package later.

## Deploy

Import the repo into Vercel, set **Root Directory** to `website`, and add `YDC_API_KEY` as an environment variable.
