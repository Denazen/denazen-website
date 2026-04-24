export default {
  meta: {
    title: 'About — Denazen',
    description: "Why we're building Denazen: a social network where privacy is the default, not a setting.",
  },
  hero: {
    heading: 'A social network where privacy is the default.',
    lead: "Most people don't post what they really think. Not because they have nothing to say — but because they know who's watching, and it isn't just the people they want to talk to.",
  },
  problem: {
    heading: 'The problem',
    paragraphs: [
      'Mainstream social media collapsed every relationship we have into one audience. Family, coworkers, close friends, strangers, algorithms, advertisers — everyone reads the same post. So we self-censor. We perform. We share the safe version, or we don\'t share at all.',
      'Encrypted messaging apps (like Signal) solved the private side of this, but they\'re disconnected from the social side. Group chats are for direct conversation, not for sharing a photo with "the people who\'d care about this." There\'s no way to live publicly online <em>and</em> keep a private life with specific people — at the same time, in the same app.',
      "There's another layer: whatever you post on mainstream platforms doesn't just reach people — it feeds ad profiles, data-broker dossiers, and AI models training on whatever they can scrape. What you share becomes someone else's asset. Denazen is designed so private content simply never does.",
    ],
  },
  whyDenazen: {
    heading: 'Why Denazen',
    intro: 'Denazen splits the network into two layers:',
    list: [
      {
        label: 'Public:',
        body: ' standard Bluesky. Open, discoverable, portable. Bring your handle; post like always.',
      },
      {
        label: 'Private:',
        body: ' end-to-end encrypted circles. Share with exactly the people you choose. Nobody else — not the network, not the servers, not us — can read it.',
      },
    ],
    trailing:
      "The private layer isn't a promise we're asking you to trust. It's built on cryptography: content is encrypted on your device before it leaves, with keys only your chosen recipients hold. Remove someone from a circle and they lose access for real.",
  },
  whyBuiltThisWay: {
    heading: "Why it's built this way",
    paragraphs: [
      "We picked the AT Protocol because it's open, portable, and not owned by anyone. You can take your identity somewhere else if we stop being worth using. That's the right default for a social network, and it's the opposite of how most platforms work.",
      'We picked end-to-end encryption because "we respect your privacy" isn\'t enough. The only honest way to promise we can\'t read your posts is to make it cryptographically impossible.',
    ],
  },
  pbc: {
    heading: 'A public benefit corporation',
    paragraphs: [
      "Denazen is a Public Benefit Corporation. The structure legally binds us to pursue a public mission — so the privacy-first commitment isn't just talk. It's load-bearing to the company's charter.",
      "The business model follows from that. We don't sell data and we don't run ads. Denazen is funded by the people who use the platform, not by what they can be manipulated into seeing. A portion of profits is committed, from day one, to charitable work — protecting natural ecosystems and supporting vulnerable communities — and will grow as we do.",
    ],
  },
  team: {
    heading: 'Who we are',
    intro: 'Denazen is built by two people.',
    founders: [
      {
        photo: '/images/team/cory.webp',
        photoAlt: 'Cory Welch',
        name: 'Cory Welch.',
        bio:
          ' Engineering and business graduate degrees from MIT. Spent his career on the clean-energy transition. Started Denazen because the social-media landscape is broken and it\'s the next thing that needs fixing.',
      },
      {
        photo: '/images/team/ian.webp',
        photoAlt: 'Ian Tassin',
        name: 'Ian Tassin.',
        bio:
          ' PhD student in computer science at Oregon State. Originator of the idea and the initial encryption architecture. Believes privacy is a right, not a feature.',
      },
    ],
  },
  whereWeAre: {
    heading: 'Where we are',
    body:
      "Denazen is pre-launch, running a small invite-only beta. If the pitch resonates, join the waitlist — we'll reach out when a spot opens up.",
  },
  cta: {
    heading: 'Join the beta',
    body: 'Small groups, closed invites. Help shape the private layer of social media.',
    waitlistButton: 'Request invite',
  },
};
