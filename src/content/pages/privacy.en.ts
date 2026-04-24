export default {
  meta: {
    title: 'Privacy Policy — Denazen',
    description:
      "Denazen's privacy policy: what we collect, what we don't, and how end-to-end encryption limits what we could even see.",
  },
  heading: 'Privacy Policy',
  lastUpdatedLabel: 'Last updated: ',
  lastUpdatedDate: '2026-04-18',
  lastUpdatedText: 'to be set at publication',
  placeholderNotice:
    'This is a placeholder template. The final Privacy Policy must be reviewed and finalized by qualified legal counsel before publication.',
  sections: [
    {
      heading: 'Who we are',
      paragraphs: [
        'Denazen (“we”, “us”, “our”) operates the website denazen.com and the Denazen social application. Denazen is built on top of the AT Protocol; some public content you create on Denazen is handled by the AT Protocol / Bluesky infrastructure.',
      ],
    },
    {
      heading: 'Information we collect',
      list: [
        {
          label: 'Account information:',
          body: ' your email address (used for waitlist communication and account access) and your AT Protocol handle.',
        },
        {
          label: 'Public content:',
          body: ' posts, likes, and follows you publish to the public (Bluesky) layer are public by design.',
        },
        {
          label: 'Encrypted private content:',
          body: ' ciphertext of your private posts transits and is stored on our servers, but we cannot read it. We do not hold the decryption keys.',
        },
        {
          label: 'Minimal operational metadata:',
          body: ' timing and size of requests to operate the service, basic device information for troubleshooting.',
        },
      ],
    },
    {
      heading: 'What we do not collect',
      list: [
        { body: 'We do not collect advertising identifiers.' },
        { body: 'We do not track your behavior across other sites or apps.' },
        { body: 'We do not have access to the content of your private (end-to-end encrypted) posts.' },
      ],
    },
    {
      heading: 'How we use information',
      paragraphs: [
        'We use account information to operate the service, communicate with you, and secure your account. We use operational metadata to keep the service running reliably.',
      ],
    },
    {
      heading: 'Sharing',
      paragraphs: [
        'We do not sell your personal information. Limited information is shared with service providers strictly to operate Denazen (e.g., infrastructure hosting, email delivery for account communication). Public content is shared through the AT Protocol network by design.',
      ],
    },
    {
      heading: 'Your choices',
      list: [
        { body: 'You can request deletion of your Denazen account.' },
        { body: "You can revoke a person's access to a Circle; the cryptography will enforce that going forward." },
        { body: 'You can opt out of non-essential email communication.' },
      ],
    },
    {
      heading: 'Security',
      paragraphs: ['Private content is end-to-end encrypted on your device before it reaches our servers.'],
    },
    {
      heading: 'Changes to this policy',
      paragraphs: [
        'We will post material changes here and, where appropriate, notify you by email before they take effect.',
      ],
    },
    {
      heading: 'Contact',
      paragraphs: ['Questions: '],
      contactEmail: 'privacy@denazen.com',
    },
  ],
};
