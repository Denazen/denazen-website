export default {
  meta: {
    title: 'Denazen — Social media designed for you',
    description:
      'A social network built for real relationships—with private spaces, real control, and no ads or tracking.',
  },
  hero: {
    heading: 'Social media designed for you',
    rotator: {
      prefix: 'The connection of early ',
      words: ['Facebook', 'Instagram'],
      suffix: '.',
    },
    lines: [
      'The privacy of Signal.',
      'The freedom of Bluesky.',
    ],
    tagline: ['Public when you want.', 'Private when it matters.'],
    waitlistButton: 'Request invite',
    waitlistNote: "Invite-only Beta.",
    imagePublic: {
      src: '/images/screenshots/hero-public.webp',
      alt: 'Denazen app on iPhone showing a public feed of posts from Bluesky.',
    },
    imagePrivate: {
      src: '/images/screenshots/hero-private.webp',
      alt: "Denazen app on iPhone showing a private feed with a post tagged 'Shared with your Trusted Friends circle'.",
    },
  },
  whatDenazen: {
    heading: 'Social media used to be about connection.',
    paragraphs: [
      'Performance. Surveillance. And the users became the product.',
    ],
    resolution:
      'Denazen brings it back—and rebuilds it for how the internet should work now.',
    list: [
      'Connect with the people you actually care about',
      'Share privately with trusted circles',
      'Post publicly when you want to reach beyond',
      'No ads. No tracking. No manipulation',
    ],
    image: {
      src: '/images/screenshots/whats-denazen.webp',
      alt: "Denazen's private feed showing a couple's trip post shared with the user's Family circle.",
    },
  },
  privacy: {
    heading: 'Private means private.',
    paragraphs: [
      'Your private posts are end-to-end encrypted—so only the people you choose can see them.',
      'Not us. Not advertisers. Not anyone else.',
    ],
    closer: 'Because real connection requires trust.',
    image: {
      src: '/images/screenshots/private-network.webp',
      alt: "Denazen's Private Network screen on iPhone, explaining end-to-end encryption.",
    },
  },
  freedom: {
    heading: 'You decide what your social experience looks like.',
    intro:
      'Denazen is built on the idea that you should control what you see, how you engage, and where your data lives.',
    list: [
      'No algorithm forcing content on you',
      'No engagement traps or infinite scroll manipulation',
      'No platform lock-in',
    ],
    closing: [
      'You choose what matters. You choose how to experience it.',
      "And because your identity and data are portable, you're never stuck in one place.",
    ],
    bskyNote:
      'A layer on top of Bluesky—log in with your existing account, or create one in the app.',
    image: {
      src: '/images/screenshots/circles.webp',
      alt: "Denazen's circles management screen showing user-defined circles like Closest Friends, Family, and Book Club.",
    },
  },
  values: {
    heading: 'Built differently—on purpose.',
    paragraphs: [
      "Denazen is a Public Benefit Corporation. That means our mission isn't just a promise—it's part of our legal structure.",
      "We're accountable not just to growth, but to people and the world we're building in.",
      "Denazen is free to use. We don't rely on ads, tracking, or attention extraction.",
      "We're building a model based on reciprocity—designed to give back to the people who make this network what it is.",
    ],
  },
};
