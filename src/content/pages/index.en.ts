export default {
  meta: {
    title: 'Denazen — Public when you want. Private when it matters.',
    description:
      'A privacy-first social network built on Bluesky. Share publicly when you want to, privately in end-to-end encrypted circles when it matters.',
  },
  hero: {
    headlinePublic: 'Public when you want',
    headlinePrivate: 'Private when it matters',
    lead: 'Some moments are just for your people.',
    encrypted: 'End-to-end encrypted by default.',
    waitlistButton: 'Request invite',
    waitlistNote: 'Invite-only beta. Early spots are limited.',
    trustPillTitle: 'You choose who sees what.',
    trustPillBody: 'A private layer for your social life.',
    imageAltPublic: 'Denazen app on iPhone showing a public feed of posts from Bluesky.',
    imageAltPrivate:
      "Denazen app on iPhone showing a private feed, with a post tagged 'Shared with your Trusted Friends circle'.",
  },
  whyDenazen: {
    heading: 'Why Denazen?',
    body: 'Most social media makes you perform for everyone. Denazen lets you be yourself.',
  },
  publicSection: {
    heading: 'Explore public content without the noise',
    paragraphs: [
      'Denazen is built on Bluesky, so you plug straight into a vibrant network of 40+ million. Find your people and interests. Control your own feed.',
      'Bring your own handle, or create one with Denazen. No ads. No sludge. No clickbait. It’s all under your control. ',
    ],
    imageAlt: "Denazen's public feed, with the Public and Private tabs visible at the top of the screen.",
  },
  privateSection: {
    heading: 'Share privately when it matters',
    paragraphs: [
      'For the moments not everyone needs to see, Denazen adds a private layer to social media. Posts are encrypted on your device before they leave it. Only the people you trust can decrypt them.',
      'No one else can see them. Not even us.',
    ],
    imageAlt:
      "Denazen's Private Network screen on iPhone, explaining end-to-end encryption: 'Not even we can see your private posts.'",
  },
  circlesSection: {
    heading: 'Not everything is for everyone',
    paragraphs: [
      'Create your own private circles. Share with your close friends without broadcasting to coworkers. Share with family without posting for strangers.',
      "You decide who's in each one, and you can revoke access anytime — cryptographically, not as a promise.",
    ],
    imageAlt:
      "Denazen's circles management screen: four circles named Closest Friends, Political Friends, Book Club, and Family, with invite buttons and member counts.",
  },
  features: {
    heading: 'Privacy, without the compromise',
    subheading: "A social network that keeps its promises because it can't break them.",
    cards: [
      {
        title: 'End-to-end encrypted',
        body:
          "Private posts are encrypted on your device with post-quantum cryptography. Decrypted only by the people you've shared with. Data servers see nothing but gibberish. Not even we can see your private posts.",
      },
      {
        title: 'You control the audience',
        body:
          'Circles are one-directional and revocable. Remove someone and they lose access — the cryptography enforces it, not a policy.',
      },
      {
        title: 'Built on AT Protocol',
        body:
          'Open, portable identity. Bring your Bluesky or AT Protocol handle or create a new one. Your public presence stays yours, portable across apps.',
      },
      {
        title: 'Private replies to public posts',
        body:
          'React to anything on Bluesky inside a private circle instead in front of the world. Discuss without broadcasting. Safer commentary without the pile-on.',
      },
    ],
  },
  noAds: {
    heading: 'No ads. No trackers. No algorithm deciding what you see.',
    paragraphs: [
      "Denazen isn't built to keep you scrolling. There are no ads, no behavioral tracking, no feed sorted by what will make you react. Just the people you've chosen to hear from.",
      'Most of what people do online is watched — platforms, data brokers, advertisers, and AI models scraping and analyzing whatever they can. Private content on Denazen is opaque to all of them.',
      "We're not selling your data. We can't even see it.",
    ],
    listAria: "What Denazen doesn't do",
    listItems: ['Ads', 'Behavioral trackers', 'AI training data'],
  },
  ctaSection: {
    heading: 'Join the beta',
    body:
      "Denazen is launching in a closed Beta. Drop your email and we'll let you know when a spot opens up.",
    waitlistButton: 'Request invite',
    waitlistNote: 'No spam. One email when your invite is ready.',
  },
};
