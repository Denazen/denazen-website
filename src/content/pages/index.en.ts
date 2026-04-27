export default {
  meta: {
    title: 'Penrose',
    description:
      'A social network built for real relationships—with private spaces, real control, and no ads or tracking.',
  },
  hero: {
    heading: 'Social media, without compromise.',
    rotator: {
      prefix: 'Connection like <em>early</em> ',
      words: ['Facebook', 'Instagram'],
      suffix: '.',
    },
    lines: [
      'Privacy like Signal.',
      'Control and freedom of Bluesky.',
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
    heading: 'Social media used to be about connection.',
    paragraphs: [
      'It was about friends. Family. Real life.',
      'Then the users became the product, through tracking, advertising, and algorithms maximizing engagement.',
    ],
    resolution:
      'Penrose brings back real connection and adds in privacy and user control.',
    list: [
      'Connect closely with the people you care about',
      'Share privately with trusted circles',
      'Post or explore public when you want to reach beyond',
      'No ads. No tracking. No manipulation.',
    ],
    image: {
      src: '/images/screenshots/whats-denazen.webp',
      alt: "Penrose's private feed showing a couple's trip post shared with the user's Family circle.",
    },
  },
  privacy: {
    heading: 'Reclaim your right to privacy.',
    paragraphs: [
      'With Penrose, your private posts are end-to-end encrypted so that only the people you choose can see them.',
      'Not us. Not advertisers. Not AI. Not <em>anyone</em> else.',
    ],
    closer: 'Because real connection requires trust.',
    image: {
      src: '/images/screenshots/private-network.webp',
      alt: "Penrose's Private Network screen on iPhone, explaining end-to-end encryption.",
    },
  },
  freedom: {
    heading: 'You control what your social experience looks like.',
    intro:
      'Penrose is layered on the Bluesky network, plugging you into a network of 40+ million people. It is built on the idea that you should control what you see and how you engage.',
    list: [
      'No algorithm forcing content on you',
      'No engagement traps or behavioral tracking',
      'No platform lock-in',
      'And no ads'
    ],
    closing: [
      'You choose what matters. You choose how to experience it.',
      "And because your identity and data are portable, you're never stuck in one place.",
    ],
    bskyNote:
      'Current Bluesky users can log in with their existing account, or you can create one in the app.',
    image: {
      src: '/images/screenshots/circles.webp',
      alt: "Penrose's circles management screen showing user-defined circles like Closest Friends, Family, and Book Club.",
    },
  },
  values: {
    heading: 'Built differently—on purpose.',
    paragraphs: [
      "Penrose is a Public Benefit Corporation. That means our mission isn't just a promise. It's part of our legal structure.",
      "We're accountable to the people using the platform and the world we're building in. From day one we will be contributing a portion of profits to causes including conservation and environmental protection, civil & human rights, and privacy.",
      "Penrose is free to use for all, with premium features to enable us to stay independent on not rely on ads, tracking, or attention extraction.",
      "We're building a model based on reciprocity—designed to give back to the people who make this network what it is.",
    ],
  },
};
