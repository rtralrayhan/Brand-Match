import type { Metadata } from "next";
import { CONTACT_EMAIL, LegalPage } from "@/components/legal";

export const metadata: Metadata = { title: "Privacy Policy · Vetted" };

export default function Privacy() {
  return (
    <LegalPage title="Privacy Policy">
      <p>
        Vetted (vettedapp.nyc) helps content creators find brands that fit their content and check whether brand, manager and
        promo emails are trustworthy. This policy explains what information we use, why, and the choices you have.
      </p>

      <h2>Information we use</h2>
      <ul>
        <li>
          <b>Account details:</b> the name and email address you enter when you sign up, or the email address and basic profile from
          Google if you sign in with Google.
        </li>
        <li>
          <b>Creator profile:</b> the niches, location and post or video links you choose to give us, used to find brand matches.
        </li>
        <li>
          <b>Gmail (only if you connect it):</b> with your permission, Vetted reads messages from the last 30 days that look like brand
          deals, sponsorships or management offers (sender name and address, subject, date and message text). We read at most a small
          number of recent matching messages each time you open or refresh your Trust inbox. Access is read-only: Vetted never sends,
          deletes, labels or changes your email.
        </li>
        <li>
          <b>Emails you paste:</b> if you paste an email to check, we use its contents the same way.
        </li>
      </ul>

      <h2>How we use it</h2>
      <ul>
        <li>To score each brand email with a Trust Score: checking the sender&apos;s domain against the brand&apos;s real website, looking for public scam reports, lawsuits and court cases, checking whether a named manager or agency exists, and spotting red flags in the email text.</li>
        <li>To find brands that fit your content and show what they publicly pay creators.</li>
        <li>To draft pitch emails when you ask for one.</li>
      </ul>
      <p>
        To run these checks, Vetted sends search queries derived from the email (such as the brand name, sender domain or manager name)
        and, where needed, the email text to our search and AI provider, You.com, which processes them only to return results to us.
        Vetted is hosted on Vercel.
      </p>

      <h2>Google user data</h2>
      <p>
        Vetted&apos;s use and transfer to any other app of information received from Google APIs will adhere to the{" "}
        <a href="https://developers.google.com/terms/api-services-user-data-policy" target="_blank" rel="noreferrer">
          Google API Services User Data Policy
        </a>
        , including the Limited Use requirements. In particular:
      </p>
      <ul>
        <li>We use Gmail data only to provide the Trust Score features you see in the app.</li>
        <li>We do not sell Gmail data, use it for advertising, or use it to train general AI models.</li>
        <li>No person at Vetted reads your email, except with your explicit permission for a support request, for security, or where the law requires it.</li>
        <li>We do not transfer Gmail data to others except as needed to provide the feature (as described above), to comply with the law, or as part of a merger or sale with notice to you.</li>
      </ul>

      <h2>Storage and retention</h2>
      <ul>
        <li>Vetted does not keep a database of your emails. Messages are read when you open your inbox, scored, and not stored on our servers afterwards.</li>
        <li>Your sign-in session and Google access tokens are kept in an encrypted, http-only cookie in your browser.</li>
        <li>Scores and matches are kept in your browser&apos;s session storage and clear when you close the tab or sign out.</li>
        <li>Our providers may keep short-lived logs under their own policies.</li>
      </ul>

      <h2>Your choices</h2>
      <ul>
        <li>
          <b>Disconnect Gmail</b> any time from the Trust inbox. This revokes Vetted&apos;s access with Google. You can also remove access at{" "}
          <a href="https://myaccount.google.com/permissions" target="_blank" rel="noreferrer">
            myaccount.google.com/permissions
          </a>
          .
        </li>
        <li>Sign out to clear your session from this browser.</li>
        <li>Email us to ask what we hold about you or to delete it.</li>
      </ul>

      <h2>Children</h2>
      <p>Vetted is not intended for anyone under 13.</p>

      <h2>Changes</h2>
      <p>If we change this policy, we will update the date above and, for significant changes, tell you in the app.</p>

      <h2>Contact</h2>
      <p>
        Questions or requests: <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
      </p>
    </LegalPage>
  );
}
