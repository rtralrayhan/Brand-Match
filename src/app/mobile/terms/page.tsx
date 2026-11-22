import type { Metadata } from "next";
import Link from "next/link";
import { CONTACT_EMAIL, LegalPage } from "@/components/legal";

export const metadata: Metadata = { title: "Terms of Service · Vetted" };

export default function Terms() {
  return (
    <LegalPage title="Terms of Service">
      <p>These terms cover your use of Vetted at vettedapp.nyc. By using Vetted you agree to them.</p>

      <h2>What Vetted does</h2>
      <p>
        Vetted suggests brands that may fit your content and gives brand, manager and promo emails a Trust Score based on public
        information found on the web. Vetted is in early access, and features may change or stop working.
      </p>

      <h2>Scores are guidance, not guarantees</h2>
      <ul>
        <li>A Trust Score reflects public web results at the time of the check. &quot;No reports found&quot; does not mean a sender is safe, and a low score does not prove fraud.</li>
        <li>Pay ranges and brand matches come from public sources and may be incomplete or out of date.</li>
        <li>Vetted is not legal, financial or professional advice. Check any deal yourself before you sign, share account access, click links or send money.</li>
      </ul>

      <h2>Your account and data</h2>
      <ul>
        <li>Give accurate sign-up details and keep access to your account and connected Google account secure.</li>
        <li>
          Connecting Gmail is optional and read-only. How we handle your data is described in our <Link href="/privacy">Privacy Policy</Link>.
        </li>
        <li>You can disconnect Gmail or stop using Vetted at any time.</li>
      </ul>

      <h2>Acceptable use</h2>
      <p>Don&apos;t use Vetted to break the law, harass anyone, scrape or overload the service, or check emails you don&apos;t have the right to share.</p>

      <h2>Liability</h2>
      <p>
        Vetted is provided &quot;as is&quot;. To the extent the law allows, we are not liable for losses from decisions you make based on
        Vetted&apos;s scores or suggestions, or for service interruptions.
      </p>

      <h2>Changes</h2>
      <p>We may update these terms. We will change the date above and, for significant changes, tell you in the app.</p>

      <h2>Contact</h2>
      <p>
        <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
      </p>
    </LegalPage>
  );
}
