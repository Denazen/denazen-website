export default {
  meta: {
    title: 'Terms of Service — Denazen',
    description:
      "Denazen's terms of service — the rules for using the service, covering acceptable use, accounts, content, and liability.",
  },
  heading: 'Terms of Service',
  lastUpdatedLabel: 'Last updated: ',
  lastUpdatedDate: '2026-04-18',
  lastUpdatedText: 'to be set at publication',
  placeholderNotice:
    'This is a placeholder template. The final Terms of Service must be reviewed and finalized by qualified legal counsel before publication.',
  sections: [
    {
      heading: '1. Agreement',
      paragraphs: ['By using Denazen, you agree to these Terms. If you do not agree, do not use the service.'],
    },
    {
      heading: '2. Eligibility',
      paragraphs: ['You must meet the minimum age required by applicable law in your jurisdiction to use Denazen.'],
    },
    {
      heading: '3. Accounts',
      paragraphs: [
        'Denazen uses AT Protocol identity. You are responsible for the security of your credentials and the devices that hold your encryption keys. If you lose access to your keys, you may permanently lose access to your private content.',
      ],
    },
    {
      heading: '4. Acceptable use',
      list: [
        { body: 'No illegal content or activity.' },
        { body: 'No abuse, harassment, or targeted harm.' },
        { body: 'No attempts to circumvent the security or encryption of the service.' },
        { body: 'No automated scraping or bulk extraction that violates platform limits.' },
      ],
      trailingParagraphs: [
        'Because private content is end-to-end encrypted, enforcement is limited to what is cryptographically visible to us. Violations within Circles are matters between the participants; we will act on reports involving the public layer.',
      ],
    },
    {
      heading: '5. Content',
      paragraphs: [
        'You retain rights to the content you post. You grant Denazen the limited rights needed to operate the service (store, transmit, and display your content to the audiences you specify).',
      ],
    },
    {
      heading: '6. AT Protocol & third-party services',
      paragraphs: [
        'The public layer is delivered over the AT Protocol / Bluesky network and subject to the terms of those services for the public content you publish there.',
      ],
    },
    {
      heading: '7. Termination',
      paragraphs: [
        'You may close your account at any time. We may suspend or terminate accounts that violate these Terms.',
      ],
    },
    {
      heading: '8. Disclaimers',
      paragraphs: [
        'The service is provided “as is.” We do not warrant that the service will be uninterrupted or error-free. Cryptography provides strong guarantees but is not a substitute for the good judgment of the people in your Circles.',
      ],
    },
    {
      heading: '9. Limitation of liability',
      paragraphs: [
        'To the maximum extent permitted by law, Denazen is not liable for indirect, incidental, or consequential damages arising from use of the service.',
      ],
    },
    {
      heading: '10. Changes',
      paragraphs: [
        'We may update these Terms. Material changes will be posted on this page and, where appropriate, communicated by email before they take effect.',
      ],
    },
    {
      heading: '11. Contact',
      paragraphs: ['Questions: '],
      contactEmail: 'legal@denazen.com',
    },
  ],
};
