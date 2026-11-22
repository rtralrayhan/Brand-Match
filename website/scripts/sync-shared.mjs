// Copies the phone app's shared logic into the website so the two stay in step.
// Run from website/: npm run sync-shared
import { cpSync, existsSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const site = join(dirname(fileURLToPath(import.meta.url)), "..");
const phone = join(site, "..");

// Whole folders are replaced; single files are overwritten. Screens and layout stay the website's own.
const DIRS = ["src/lib", "src/app/api", "src/app/privacy", "src/app/terms"];
const FILES = ["src/middleware.ts", "src/components/gmail.tsx", "src/components/videos.tsx", "src/components/legal.tsx"];
// Files that only the website has, kept when src/lib is replaced.
const KEEP = ["src/lib/links.ts"];

const park = mkdtempSync(join(tmpdir(), "vetted-sync-"));
const kept = KEEP.map((f, i) => [f, existsSync(join(site, f)) ? join(park, String(i)) : null]);
for (const [f, tmp] of kept) if (tmp) cpSync(join(site, f), tmp);

for (const d of DIRS) {
  rmSync(join(site, d), { recursive: true, force: true });
  cpSync(join(phone, d), join(site, d), { recursive: true });
  console.log(`synced ${d}/`);
}
for (const f of FILES) {
  cpSync(join(phone, f), join(site, f));
  console.log(`synced ${f}`);
}
for (const [f, tmp] of kept) {
  if (!tmp) continue;
  cpSync(tmp, join(site, f));
}
rmSync(park, { recursive: true, force: true });
console.log("Done. Run `npx tsc --noEmit` to catch screens that need updating.");
