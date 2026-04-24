export default {
  meta: {
    title: 'FAQ — Denazen',
    description: 'Answers to common questions about Denazen: what it is, how privacy works, and how to get in.',
  },
  heading: 'Frequently asked questions',
  lead: 'The short version: Denazen is a privacy-first social network on Bluesky, with private circles only your chosen recipients can read.',
  groups: [
    {
      heading: 'Product',
      items: [
        {
          q: 'What is Denazen?',
          a: ["Denazen is a social network with two layers. The public layer is standard Bluesky — open posts, open follows, open discovery. The private layer is end-to-end encrypted content that only the people you've added to a circle can read."],
        },
        {
          q: 'How does Denazen relate to Bluesky?',
          a: ['Denazen is built on the AT Protocol, the same open protocol that powers Bluesky. Your public posts live on Bluesky. Your Bluesky handle works here. Your followers come with you. The private layer is an additional capability Denazen adds on top.'],
        },
        {
          q: "What's a Circle?",
          a: ["A Circle is a private group you define. You decide who's in it. Posts shared with a Circle are end-to-end encrypted so only the people in that Circle can read them. You can have many Circles — one for family, one for close friends, one for coworkers — and the same post can be shared with one or several of them."],
        },
        {
          q: 'How is a Circle different from a group chat?',
          a: ["Group chats are for back-and-forth conversation. Circles are for sharing — photos, posts, thoughts — with a chosen audience, the same way you'd post publicly but limited to specific people. Circles are also one-directional: you control who's in yours; they don't have to reciprocate."],
        },
        {
          q: 'Can I reply privately to a public post?',
          a: ['Yes. You can react to anything on the public timeline inside a Circle instead of the open thread — discuss it with your people without broadcasting your opinion to the internet.'],
        },
      ],
    },
    {
      heading: 'Privacy',
      items: [
        {
          q: 'How does end-to-end encryption work here?',
          a: ["Private content is encrypted on your device before it's ever sent. The decryption keys only exist on the devices of people you've shared with. Denazen's servers and Bluesky's servers store the ciphertext but cannot read it."],
        },
        {
          q: 'Can Denazen read my private posts?',
          a: ["No. We never have the keys to decrypt them. That's enforced cryptographically, not by policy."],
        },
        {
          q: "What about Bluesky's servers?",
          a: ["Private content is encrypted before it leaves your device. Whatever path it takes — Bluesky PDSes, Denazen's servers — it's ciphertext everywhere except on the devices of your chosen recipients."],
        },
        {
          q: 'What happens when I remove someone from a Circle?',
          a: ["They immediately lose access to future posts in that Circle. The cryptography gets rotated so anything new can't be read with the old keys. Posts they already downloaded before being removed can't be un-seen — that's a fundamental limit of sharing — but nothing going forward is readable to them."],
        },
        {
          q: 'Are there ads or trackers?',
          a: ["No ads. No trackers. No algorithmic feed optimizing for engagement. The business model doesn't depend on watching you."],
        },
      ],
    },
    {
      heading: 'Launch and access',
      items: [
        {
          q: 'When can I join?',
          a: ["Denazen is in a small invite-only beta right now. Join the waitlist and we'll reach out as we open up more invites."],
        },
        {
          q: 'How does the invite system work?',
          a: ['The invite-only beta is tightly scoped to keep the group close-knit while we work out the product. As we expand, existing members get invite codes they can share with people they trust. Growth is network-driven, not ad-driven.'],
        },
        {
          q: 'Is it free?',
          a: ['Yes. The plan long-term is a freemium model: the free tier covers the core private social experience; a premium tier adds more circles and advanced features.'],
        },
      ],
    },
    {
      heading: 'Account',
      items: [
        {
          q: 'Do I need a Bluesky account?',
          a: ["Yes — Denazen uses AT Protocol identity. If you don't have a Bluesky handle yet, creating one takes a minute and you can use it here."],
        },
        {
          q: 'What about my existing Bluesky handle and follows?',
          a: ["They come with you. Your public posts and follows on Bluesky remain exactly what they are today. Denazen adds the private layer; it doesn't replace the public one."],
        },
        {
          q: 'Do you need my phone number?',
          a: ['No. Identity comes from your AT Protocol handle. Email is used for your account and waitlist communication; no phone number is required.'],
        },
        {
          q: 'What happens if I forget my encryption password?',
          a: [
            'Your private content becomes permanently inaccessible. This is intentional: if Denazen had a way to recover it for you, Denazen would also be able to read your private content — breaking the core promise.',
            'Your public Bluesky identity, handle, and follows are unaffected; those are tied to your Bluesky password, which is recoverable through Bluesky the normal way. But your Circles, past private posts, received DMs, and the keys that decrypt them all depend on the encryption password.',
            'Write the password down somewhere safe, or use a password manager.',
          ],
        },
        {
          q: 'Can I use Denazen on more than one device?',
          a: [
            "Yes. Denazen is multi-device by design. You don't pair devices or sync keys between them manually; your encrypted keys already live on public infrastructure (Denazen's server and your Bluesky PDS), and any device can unlock them with the same three credentials: your Bluesky handle, your Bluesky password, and your Denazen encryption password.",
            "Sign in on a new phone, laptop, or tablet the same way you'd sign in on your existing one. Every Circle, contact, and past message is available. Signing out clears the keys from that device until the next unlock.",
          ],
        },
      ],
    },
  ],
  cta: {
    heading: 'Still have questions?',
    body: "Join the waitlist and we'll be in touch.",
    waitlistButton: 'Request invite',
  },
};
