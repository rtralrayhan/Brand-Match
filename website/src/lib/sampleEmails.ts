import type { EmailInput } from "./types";

/**
 * Demo inbox. One lookalike scam on a made-up domain, one unverified manager,
 * one real brand writing from its real domain. Edit freely for your demo.
 */
export const SAMPLE_EMAILS: EmailInput[] = [
  {
    id: "lodge-lookalike",
    fromName: "Lodge Cast Iron Partnerships",
    fromEmail: "partners@lodge-castiron-collab.com",
    subject: "Paid collab: $8,000 for 1 reel, confirm today",
    time: "9:41 AM",
    body: `Hi Maya,

We love your cast-iron content and want to offer you a paid collaboration: $8,000 for one Instagram reel featuring our new skillet.

To view the contract and lock in your spot, sign in with your Instagram account here within 24 hours:
https://lodge-castiron-collab.com/contract-login

Spots are limited, so please confirm today.

Best,
Ava Brooks
Partnerships, Lodge Cast Iron`,
  },
  {
    id: "brightline-manager",
    fromName: "Jordan Lee, Brightline Talent",
    fromEmail: "jordan@brightlinetalentgroup.co",
    subject: "I can get you 3x your rate",
    time: "8:12 AM",
    body: `Hey Maya,

I manage food creators at Brightline Talent and I've been talking with a few cookware brands about you. I can get you 3x your current rate if you sign exclusive representation with us this week.

I'll handle every brand conversation going forward, so just send me your brand contacts and rate card.

Talk soon,
Jordan Lee
Brightline Talent`,
  },
  {
    id: "misen-real",
    fromName: "Misen Creator Team",
    fromEmail: "creators@misen.com",
    subject: "Holiday cookware series brief",
    time: "Sat",
    body: `Hi Maya,

We're putting together a small group of home cooks for a holiday series with our carbon steel pan and would love to include you.

The brief: two short videos in December, your recipes, your voice. Happy to share our standard rate card and usage terms on a call.

You can see our current creator program at https://misen.com.

Cheers,
The Misen Creator Team`,
  },
];
