export default {
  meta: {
    title: 'Penrose',
    description:
      'A social network built for real relationships, with private spaces, real control, and no ads or tracking.',
  },
  hero: {
    heading: 'Social media, without compromise.',
    linesBefore: ['Privacy inspired by Signal.'],
    rotator: {
      prefix: 'Connection like <em>early</em> ',
      words: ['Facebook', 'Instagram'],
      suffix: '.',
    },
    linesAfter: [
      'Freedom of Bluesky.',
    ],
    tagline: ['The impossible triangle. Solved.'],
    waitlistButton: 'Request invite',
    waitlistNote: 'Invite-only beta launching soon. Help shape the future of social.',
    imagePublic: {
      src: '/images/screenshots/hero-public.webp',
      alt: 'Penrose app on iPhone showing a public feed of posts from Bluesky.',
    },
    imagePrivate: {
      src: '/images/screenshots/hero-private.webp',
      alt: "Penrose app on iPhone showing a private feed with a post tagged 'Shared with your Trusted Friends circle'.",
    },
  },
  whatPenrose: {
    heading: 'Remember when social was social?',
    paragraphs: [
      "Social media started as a way to keep up with the people in your life. The people you'd actually call. Your sister. Your roommate from college. Your closest friends.",
      'Somewhere along the way, the feed stopped being them. It became strangers, performers, and ads. Whatever an algorithm decided would keep you scrolling.',
    ],
    resolution: 'Penrose puts the people back at the center.',
    list: [
      'Build circles for the people who matter: close friends, family, your book club',
      'A chronological feed of the people you actually chose to follow',
      'Share moments meant for a few, not posts engineered for reach',
      'Less performance. More presence.',
    ],
    image: {
      src: '/images/screenshots/whats-denazen.webp',
      alt: "Penrose's private feed showing a couple's trip post shared with the user's Family circle.",
    },
  },
  privacy: {
    heading: 'Private means private.',
    paragraphs: [
      'Posts you share with a circle are encrypted on your device before they leave it. Only the people you trust hold the keys to decrypt them.',
      'Not advertisers. Not AI. Not governments. <em>No one else.</em> Not even us.',
    ],
    closer: 'Privacy by design. Not by promise.',
    image: {
      src: '/images/screenshots/private-network.webp',
      alt: "Penrose's Private Network screen on iPhone, explaining end-to-end encryption.",
    },
  },
  freedom: {
    heading: 'The freedom of an open network.',
    intro:
      "Penrose runs on the AT Protocol, the open social network behind Bluesky and 40+ million people. Dive into any topic you care about and discover what's actually happening, not what an algorithm picked for you.",
    list: [
      'Explore public posts on any topic: politics, art, science, your niche hobby',
      'Bring your existing Bluesky handle, or start fresh in the app',
      'Take your followers, posts, and identity to any AT Protocol app',
    ],
    closing: [
      'You choose what matters. You choose how to experience it.',
      'If we ever stop being the right home for you, your network comes with you.',
    ],
    bskyNote:
      'Current Bluesky users can log in with their existing account, or you can create one in the app.',
    image: {
      src: '/images/screenshots/circles.webp',
      alt: "Penrose's circles management screen showing user-defined circles like Closest Friends, Family, and Book Club.",
    },
  },
  values: {
    heading: 'Built differently. On purpose.',
    paragraphs: [
      "Penrose is a Public Benefit Corporation. That means our mission isn't just a promise. It's part of our legal structure.",
      "We're accountable to the people using the platform and the world we're building in. From day one we will be contributing a portion of profits to causes including conservation and environmental protection, civil & human rights, and privacy.",
      "Penrose is free to use for all, with premium features to enable us to stay independent on not rely on ads, tracking, or attention extraction.",
      "We're building a model based on reciprocity, designed to give back to the people who make this network what it is.",
    ],
  },
};
