export default {
  meta: {
    title: 'Security Policy — Denazen',
    description: 'How to report a security vulnerability in Denazen and what to expect from us in return.',
  },
  heading: 'Security Policy',
  draftNotice: {
    title: 'Draft — not yet ready for technical/research review',
    body: 'This policy is a pre-launch working draft. Content, scope, and claims are subject to change before Denazen is publicly available. Do not cite from this version.',
  },
  leadBefore: 'Denazen is built around strong privacy and encryption guarantees. We publish our ',
  leadArchitectureLink: 'encryption architecture',
  leadAfter: ' in detail and welcome scrutiny from the security research community.',
  intro: 'This page describes how to report a security issue and what you can expect from us in return.',

  reporting: {
    heading: 'Reporting a vulnerability',
    p1Before: 'If you believe you have found a security vulnerability in Denazen, please report it privately by emailing ',
    reportEmail: 'security@denazen.com',
    p1After: '.',
    p2: 'Please do not disclose the issue publicly before giving us a reasonable chance to respond. We will acknowledge your report within 72 hours and will coordinate with you on a disclosure timeline.',
    p3Before: 'For machine-readable contact and policy information, see ',
    securityTxtLinkText: 'security.txt',
    p3Between: ', published per ',
    rfcLinkText: 'RFC 9116',
    p3After: '.',
  },

  whatToInclude: {
    heading: 'What to include in your report',
    list: [
      'A description of the issue and its potential impact',
      'Steps to reproduce, or a proof-of-concept',
      'The version of the app or the date you tested',
      'Any relevant environment details (platform, device)',
      'Your preferred contact address and whether you want public credit',
    ],
    trailing: 'The more detail you provide, the faster we can triage.',
  },

  whatWellDo: {
    heading: "What we'll do",
    steps: [
      'Acknowledge receipt within 72 hours.',
      'Triage the report and confirm whether we consider it a vulnerability.',
      'Keep you updated on progress at reasonable intervals, typically every 7–14 days.',
      'Coordinate a disclosure timeline with you. Our default is to ship a fix and then publicly disclose within 90 days of the initial report. We are flexible on complex issues.',
    ],
    step5Before: 'Credit you publicly on our ',
    step5Link: 'acknowledgments page',
    step5After: ' if you want to be named, or keep your report anonymous if you prefer.',
  },

  scope: {
    heading: 'Scope',
    inScopeHeading: 'In scope',
    inScope: [
      {
        kind: 'linked',
        before: 'The published ',
        linkText: 'encryption architecture whitepaper',
        after: ' — design-level flaws in the protocol, key hierarchy, inbox envelope, key exchange pattern, or privacy invariant.',
      },
      {
        kind: 'plain',
        text: 'The Denazen mobile app published to the App Store and Google Play — cryptographic, authentication, authorization, or data-handling bugs in the shipping build.',
      },
      {
        kind: 'plain',
        text: 'Denazen server endpoints — the API gateway, the inbox, the post index, friend request handling. Includes authentication bypass, authorization flaws, injection, and data-leak issues.',
      },
      {
        kind: 'code',
        before: 'Data stored in user-accessible AT Protocol records (',
        code: 'com.denazen.*',
        after: ' collections).',
      },
    ],
    outOfScopeHeading: 'Out of scope',
    outOfScope: [
      "Physical attacks on devices under the user's control (an unlocked stolen device is outside our threat model).",
      'Social engineering of Denazen staff or users.',
      'Denial-of-service testing against production infrastructure. Report DoS concerns analytically, not via actual load attacks.',
      'Vulnerabilities in third-party services we integrate with (Bluesky PDS, AT Protocol relays, app store infrastructure). Report those to the respective vendor.',
      'Vulnerabilities that require an attacker to already possess your encryption password or vault key.',
      'Reports generated purely by automated scanners with no demonstrated impact.',
      'Missing security headers or cookie flags on non-sensitive marketing pages.',
    ],
    askBefore: 'If you are uncertain whether a specific test is within scope, please ask first by emailing ',
    askAfter: ' before testing.',
  },

  safeHarbor: {
    heading: 'Safe harbor',
    intro: 'We consider security research conducted in good faith under this policy to be:',
    considerations: [
      'Authorized under our Terms of Service',
      'Exempt from any claim we might otherwise pursue under the Computer Fraud and Abuse Act or equivalent laws',
      'Exempt from any claim under relevant anti-circumvention laws',
    ],
    noPursuit: 'We will not pursue legal action against researchers who:',
    conditions: [
      'Make a good-faith effort to comply with this policy',
      'Avoid privacy violations, data destruction, and service disruption',
      'Use only accounts they own or have explicit permission to access',
      'Give us a reasonable time to address the issue before public disclosure',
      'Do not exploit the issue beyond what is necessary to demonstrate it',
    ],
  },

  bugBounty: {
    heading: 'Bug bounty',
    body: 'Denazen does not currently offer paid bug bounties. We provide public acknowledgment for valid reports and may offer other forms of recognition as the product matures. A paid bounty program is planned post-launch.',
  },

  acknowledgments: {
    heading: 'Acknowledgments',
    before: 'Researchers who have responsibly reported issues to Denazen are listed on our ',
    linkText: 'acknowledgments page',
    after: '.',
  },

  changelog: {
    heading: 'Changelog',
    before: "Material changes to Denazen's public security documents — including the encryption architecture whitepaper — are logged on the ",
    linkText: 'security changelog',
    after: ". If you've reviewed Denazen's security posture before, that's the quickest way to see what's changed.",
  },
};
