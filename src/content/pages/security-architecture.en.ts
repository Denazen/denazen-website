// Blocks are rendered by SecurityArchitecturePage.astro.
// Paragraphs support inline HTML (strong, em, code, a) via set:html.

type Block =
  | { kind: 'p'; html: string }
  | { kind: 'h3'; text: string; id?: string }
  | { kind: 'h4'; text: string }
  | { kind: 'ul'; items: string[] }
  | { kind: 'ol'; items: string[] }
  | { kind: 'table'; headers: string[]; rows: string[][]; className?: string }
  | { kind: 'code'; text: string }
  | { kind: 'callout'; variant: 'status' | 'invariant'; label: string; body: string }
  | { kind: 'figure'; src: string; alt: string; caption: string; width: number; height: number }
  | { kind: 'hr' };

interface Section {
  id: string;
  heading: string;
  blocks: Block[];
}

const content: {
  meta: { title: string; description: string };
  heading: string;
  lead: string;
  plainLang: { before: string; linkText: string; after: string };
  lastUpdated: { before: string; date: string; text: string; between: string; linkText: string };
  draftNotice: { title: string; body: string };
  toc: { heading: string; sections: { id: string; label: string }[] };
  preambleBlocks: Block[];
  sections: Section[];
} = {
  meta: {
    title: 'Penrose',
    description:
      "Penrose's end-to-end encryption architecture: zero-trust content model, post-quantum key exchange (ML-KEM-1024, NIST Level 5), four-tier vault hierarchy, metadata-minimal inbox, and the fail-closed privacy invariant.",
  },
  heading: 'Security & encryption architecture',
  lead:
    "A technical whitepaper describing the end-to-end encryption model used by Penrose. Written for security engineers, cryptographers, and developers evaluating Penrose's privacy guarantees.",
  plainLang: {
    before: 'Prefer the plain-language version? See the ',
    linkText: 'FAQ',
    after: '.',
  },
  lastUpdated: {
    before: 'Last updated ',
    date: '2026-04-23',
    text: 'April 23, 2026',
    between: ' · ',
    linkText: 'View changelog',
  },
  draftNotice: {
    title: 'Draft — not yet ready for technical/research review',
    body: 'This architecture document is a pre-launch working draft. Content, scope, and claims are subject to change before Penrose is publicly available. Do not cite from this version.',
  },
  toc: {
    heading: 'Contents',
    sections: [
      { id: 'threat-model', label: '1. Threat model' },
      { id: 'zero-trust-scope', label: '1.4 Zero-trust scope' },
      { id: 'primitives', label: '2. Cryptographic primitives' },
      { id: 'key-hierarchy', label: '3. Key hierarchy' },
      { id: 'unlock', label: '4. Unlock flow' },
      { id: 'password-strength', label: '4.1 Password strength' },
      { id: 'recovery', label: '4.2 Recovery' },
      { id: 'devices', label: '4.3 Devices' },
      { id: 'auto-relogin', label: '4.4 Device persistence' },
      { id: 'posting', label: '5. Posting: two-tier encryption' },
      { id: 'media-sanitization', label: '5.5 Media sanitization' },
      { id: 'deletion', label: '5.6 Deletion' },
      { id: 'replies', label: '6. Replies & quotes' },
      { id: 'reading', label: '7. Reading: decryption' },
      { id: 'inbox', label: '8. Key exchange & inbox' },
      { id: 'push', label: '8.7 Push notifications' },
      { id: 'invariant', label: '9. Privacy invariant' },
      { id: 'rotation', label: '10. Rotation' },
      { id: 'storage', label: '11. Storage boundaries' },
      { id: 'telemetry', label: '12. Telemetry' },
      { id: 'moderation', label: '13. Abuse & moderation' },
      { id: 'legal-process', label: '14. Legal process' },
      { id: 'audit', label: '15. Audit & disclosure' },
      { id: 'future-work', label: '16. Future work' },
      { id: 'verification', label: '17. Verification story' },
      { id: 'summary', label: '18. Summary' },
      { id: 'glossary', label: 'Appendix A. Glossary' },
    ],
  },
  preambleBlocks: [
    {
      kind: 'p',
      html:
        "Penrose is a privacy-first social client built on the AT Protocol — the open network that powers Bluesky. It pairs public Bluesky-network posts with private posts, direct messages, and circle-shared content that are end-to-end encrypted on the user's device before they touch any server.",
    },
    {
      kind: 'p',
      html:
        "This page describes the encryption architecture: the key hierarchy, the cryptographic primitives, the inbox and key-exchange protocols, and the threat model the design is built to hold against. It is written for a technical audience — security engineers, cryptographers, and developers evaluating Penrose's privacy guarantees.",
    },
    {
      kind: 'p',
      html:
        '<strong>Core claim.</strong> Penrose targets a zero-trust content model. No server, infrastructure provider, or Penrose developer can read plaintext content or key material, and no network attacker — including a compromised Personal Data Server (PDS) — can substitute keys undetected. §1.4 states the exact scope of this claim.',
    },
    { kind: 'hr' },
  ],
  sections: [
    {
      id: 'threat-model',
      heading: '1. Threat model',
      blocks: [
        { kind: 'h3', text: '1.1 Assets protected' },
        {
          kind: 'table',
          headers: ['Asset', 'Protection'],
          rows: [
            ['Post text and images (private mode)', 'Confidentiality + integrity'],
            ['Direct messages', 'Confidentiality + integrity'],
            ['Circle membership (who can read a post)', 'Confidentiality from non-members'],
            ['Contact graph (who messages whom)', 'Obscured from the inbox server'],
            ['Encryption keys at rest (on device and server)', 'Confidentiality + integrity'],
            ['Encryption keys in transit (key exchange)', 'Confidentiality + post-quantum resistance'],
          ],
        },
        { kind: 'h3', text: '1.2 Adversaries considered' },
        {
          kind: 'table',
          headers: ['Adversary', 'Capability', 'Outcome under Penrose'],
          rows: [
            ['Passive network observer', 'TLS interception', 'Sees only ciphertext and TLS-protected traffic'],
            [
              'Bluesky PDS operator',
              "Full read/write on user's repo",
              "Sees ciphertext blobs, key URIs, and metadata only; cannot derive decryption keys; cannot substitute a contact's public key without detection",
            ],
            [
              'Bluesky AppView / Relay',
              'Full social graph visibility',
              'Sees post metadata and follow graph; sees no content and no keys',
            ],
            [
              'Penrose relay / database',
              'Full server-side read',
              'Sees ciphertext payloads, DIDs, and metadata only',
            ],
            [
              'Compromised server-side gateway',
              'Short-term access to requests',
              "Sees transient OAuth-issued access tokens and per-request DPoP proofs for identity verification only; no long-lived secrets. Access tokens are DPoP-bound to per-session keypairs held in users' device secure elements (RFC 9449), so token capture alone does not enable impersonation.",
            ],
            [
              'Penrose developer with database access',
              'Metadata + server ciphertext',
              'Cannot derive plaintext — same position as the server',
            ],
            [
              'Lost or stolen device (locked)',
              'Physical access to device storage',
              'Cannot read key material without device unlock + encryption password',
            ],
            [
              'Future quantum adversary',
              "Shor's algorithm on classical key exchange; Grover's algorithm on symmetric keys",
              'ML-KEM-1024 (NIST Level 5 post-quantum KEM) for all key exchange; AES-256 for all content and key-wrapping',
            ],
          ],
        },
        { kind: 'h3', text: '1.3 Non-goals / explicit limits' },
        {
          kind: 'ul',
          items: [
            '<strong>No perfect forward secrecy for long-lived keys.</strong> Circle keys and messaging keys persist until rotated; compromise of a current messaging key exposes past messages encrypted with that key. Rotation is available but not automatic per-message.',
            "<strong>No protection from a compromised device.</strong> If an attacker has the device unlocked <em>and</em> the user's encryption password, they read everything. This is the standard baseline for end-to-end encrypted systems.",
            '<strong>Metadata is partially visible.</strong> Post counts, timing, and the Bluesky follow graph remain visible to Bluesky itself. The inbox (for direct messages and key shares) is designed to hide sender identity and message type from the server that stores it.',
            "<strong>IP addresses and network-level metadata are visible.</strong> Clients talk directly to Penrose's server and to Bluesky PDSes over TLS; no onion routing, proxy, or sealed-transport layer is applied. Anyone with network-layer visibility sees that a given IP is talking to Penrose, even if they cannot see what is being said. Users who require network-level anonymity should route their traffic through a separate anonymity layer.",
          ],
        },
        { kind: 'h3', text: '1.4 What zero-trust covers — and what it does not', id: 'zero-trust-scope' },
        {
          kind: 'p',
          html:
            "Penrose's “zero-trust content model” is a precise, auditable claim. It is not a claim that nothing is trusted. This subsection states exactly what the claim covers and what it does not, so reviewers can evaluate it against a concrete scope.",
        },
        { kind: 'h4', text: 'What IS zero-trust' },
        {
          kind: 'ul',
          items: [
            '<strong>Content confidentiality.</strong> No server — Bluesky PDS, Penrose relay, Penrose edge function — can read a private post, a DM, or a circle-key share. The ciphertext is opaque at rest and in transit; decryption material lives only on the devices of chosen recipients.',
            "<strong>Key-material confidentiality.</strong> The Vault Key never leaves the device in plaintext. The Master Key reaches Penrose's server only as the EMK (PDK-wrapped). Long-lived symmetric keys — messaging, circle, content, Kyber secret — are wrapped at rest and encrypted under ephemeral shared secrets in transit. No server holds, or can derive, plaintext key material.",
            "<strong>MITM resistance (with out-of-band verification, planned).</strong> Trust-On-First-Use binds a contact's ML-KEM-1024 public key on the first exchange and detects any subsequent substitution. When out-of-band verification ships (see Future work), the residual first-contact window closes and a compromised PDS cannot substitute a contact's public key undetected.",
            "<strong>Inbox sender unlinkability.</strong> The inbox server cannot tell who sent any given message. Sender identity is encrypted under the recipient's post-quantum public key inside the sealed envelope (§8.2.1) and recoverable only by the recipient. Two envelopes from the same sender to the same recipient are ciphertext-indistinguishable.",
            '<strong>The fail-closed privacy invariant (§9).</strong> A user who intends to create a private post cannot silently produce a public one. This is enforced as a structural property of the client, not a policy.',
            '<strong>Forged-acceptance rejection.</strong> A sender-side check validates that incoming acceptances correspond to outgoing requests the user actually sent, so an attacker cannot inject a forged “acceptance from Bob” that Alice never solicited.',
          ],
        },
        { kind: 'h4', text: 'What is NOT zero-trust' },
        {
          kind: 'ul',
          items: [
            "<strong>Metadata and timing.</strong> Bluesky's AppView and Relay see post counts, timestamps, follow graphs, and public post content. The inbox obscures sender identity and message type but not per-user activity timing or message counts.",
            "<strong>Availability.</strong> Penrose's servers and Bluesky's infrastructure must be up for the service to be usable. A malicious operator can deny service; they just cannot read private content.",
            "<strong>Bluesky-layer plaintext posts.</strong> Public posts (<code>app.bsky.feed.post</code> records without the Penrose encryption marker) are plaintext on Bluesky's infrastructure by design — that's what makes them public. Their integrity is whatever Bluesky provides.",
            "<strong>Bluesky account credentials.</strong> The Bluesky password (or passkey, 2FA factor, etc.) is entered on Bluesky's hosted login page and processed by Bluesky's infrastructure. Penrose does not see, touch, or hold these credentials at any point — but their confidentiality is Bluesky's responsibility, not Penrose's. A user who reuses their Bluesky password elsewhere accepts the risks of that reuse. A user whose Bluesky account is compromised at the Bluesky layer will see their Penrose private content remain encrypted (that is what the encryption password protects), but the attacker will be able to authorize a fresh Penrose OAuth session and would then be limited only by the encryption-password barrier.",
            '<strong>First-contact exchanges before out-of-band verification ships.</strong> TOFU detects any key substitution after first contact, but not during it. A PDS operator who substitutes a contact’s key <em>before</em> the first binding can inject themselves; detection requires the OOB verification feature (see Future work).',
            '<strong>User-chosen password equivalence.</strong> Every cryptographic guarantee bottoms out on the entropy of the encryption password (§4.1). A user who picks a low-entropy password accepts a weaker margin against offline attack. The architecture provides tools; it cannot enforce good password choices beyond the 12-character minimum.',
          ],
        },
        { kind: 'h4', text: 'What this means for the trust-root picture' },
        { kind: 'p', html: 'The zero-trust content model collapses the set of parties that must be trusted for confidentiality to:' },
        {
          kind: 'ol',
          items: [
            "<strong>The user's device.</strong> Platform secure storage (iOS Keychain / Android Keystore) holds session-unlocked keys; a compromised device is explicitly out of scope (§1.3).",
            "<strong>The user's encryption password.</strong> Never transmitted. Entropy determines the margin against offline attack (§4.1).",
            "<strong>(Once out-of-band verification ships)</strong> The user's own out-of-band attestation of contact fingerprints — a second channel that doesn't pass through Penrose's or Bluesky's infrastructure.",
          ],
        },
        {
          kind: 'p',
          html:
            "Neither the Bluesky PDS, nor Penrose's relay, nor any third-party operator appears in this list. That is what “zero-trust” means here, and that is its precise scope.",
        },
      ],
    },
    {
      id: 'primitives',
      heading: '2. Cryptographic primitives',
      blocks: [
        {
          kind: 'p',
          html: 'All crypto libraries are either vendored locally or pinned to exact versions to prevent silent algorithm drift.',
        },
        {
          kind: 'table',
          headers: ['Purpose', 'Primitive'],
          rows: [
            ['Password-based key derivation', 'Argon2id (libsodium)'],
            [
              'Authenticated symmetric encryption (key material, DMs, inbox)',
              'XSalsa20-Poly1305 (<code>crypto_secretbox</code>, libsodium)',
            ],
            ['Bulk content encryption (<code>.zen</code> files, images)', 'AES-CBC-256 with PKCS7'],
            ['Post-quantum key exchange', 'ML-KEM-1024 (Kyber), NIST Level 5, audited by Cure53'],
            ['Key-derivation function', 'HKDF-SHA256 (RFC 5869)'],
            ['Keyed hashing', 'HMAC-SHA256'],
            ['Hashing', 'SHA-256, SHA-3'],
            ['Secure random', 'Platform CSPRNG'],
          ],
        },
        { kind: 'p', html: 'Notes:' },
        {
          kind: 'ul',
          items: [
            'AES-CBC is used only for bulk content where possession of the content key is the access-control boundary. All key material and all messages are authenticated via XSalsa20-Poly1305.',
            'ML-KEM-1024 targets NIST Level 5 post-quantum security — the highest parameter set in the standard. It is used only for key encapsulation; derived shared secrets wrap long-lived symmetric keys once and are then discarded.',
            'HKDF-SHA256 is used inside the sealed-sender inbox envelope (§8) to derive per-envelope encryption keys from the post-quantum shared secret, and to derive sub-keys for direct-message conversation IDs from the vault key. Long-lived keys are never used directly as HMAC keys — sub-keys for distinct purposes are always HKDF-derived with a tightly-bound <code>info</code> string (standard cryptographic key separation).',
            "Every symmetric primitive in the stack uses a 256-bit key. Under Grover's algorithm this yields an effective post-quantum security floor of 2^128 per layer.",
          ],
        },
      ],
    },
    {
      id: 'key-hierarchy',
      heading: '3. Key hierarchy',
      blocks: [
        {
          kind: 'p',
          html:
            'Penrose uses a <strong>four-tier vault hierarchy</strong> for key-at-rest protection and a separate family of <strong>content / exchange keys</strong> for messaging and posts.',
        },
        { kind: 'h3', text: '3.1 Vault hierarchy (at rest)' },
        {
          kind: 'figure',
          src: '/images/diagram-vault-hierarchy.svg',
          alt: 'Four-tier vault hierarchy diagram: the encryption password feeds Argon2id to derive the Password-Derived Key. The PDK encrypts the Master Key (stored server-side as EMK). The Master Key encrypts the Vault Key (stored on the PDS as EVK). The Vault Key protects per-record keys — circle, friend, messaging, Kyber secret, and per-post content keys.',
          caption:
            "Figure 1. Four-tier vault hierarchy. Each layer wraps the next; only the encryption password leaves the device in plaintext (in the user's head).",
          width: 720,
          height: 620,
        },
        {
          kind: 'p',
          html: '<strong>Why two hops (PDK → Master → Vault) instead of one?</strong>',
        },
        {
          kind: 'ul',
          items: [
            "The <strong>Master Key</strong> lives on Penrose's server (encrypted by the PDK); the <strong>EVK</strong> lives on the user's Bluesky PDS (encrypted by the Master Key).",
            'To mount an offline brute-force attack against the encryption password, an attacker needs <em>both</em> (a) the EMK from the Penrose server and (b) the EVK plus Argon2 salt and parameters from the PDS. No single server, and no single breached operator, holds enough material to run the attack.',
            'Password changes rewrap the Master Key with a new PDK but leave the Vault Key (and therefore all per-record encryption) untouched — no re-encryption storm.',
          ],
        },
        { kind: 'h3', text: '3.2 Content and exchange keys' },
        {
          kind: 'table',
          headers: ['Key', 'Lifetime', 'Purpose', 'Wrapped by'],
          rows: [
            [
              'Shared secret (ML-KEM-1024)',
              'Ephemeral',
              'Wrap the messaging key during key exchange only',
              'n/a — derived once by encapsulate/decapsulate',
            ],
            [
              'Messaging key (AES-256)',
              'Per contact, long-lived',
              'Encrypt DMs, circle-key shares, friend-key payloads',
              'Shared secret (during exchange); vault key (at rest)',
            ],
            [
              'Circle key (AES-256)',
              'Per circle, long-lived',
              'Wrap per-post content keys',
              'Messaging key (when shared); vault key (at rest)',
            ],
            [
              'Content key (AES-256)',
              'One per post',
              'Encrypt the <code>.zen</code> file attachments of a single post',
              'Circle key',
            ],
          ],
        },
        { kind: 'p', html: 'Rules enforced throughout the codebase:' },
        {
          kind: 'ul',
          items: [
            'Shared secrets are never used to encrypt content — only to wrap the messaging key.',
            'Circle keys are never sent unwrapped; they are always delivered inside a messaging-key-encrypted payload.',
            'The Vault Key never leaves the device in plaintext; only the PDK-wrapped form (EMK) reaches the server.',
          ],
        },
      ],
    },
    {
      id: 'unlock',
      heading: '4. Unlock flow',
      blocks: [
        {
          kind: 'code',
          text: `"Continue with Bluesky" → in-app browser sheet → bsky.social hosted login.
   ▼ (user authenticates with Bluesky on Bluesky's hosted page)
OAuth callback returns DPoP-bound access + refresh tokens.
   ▼
User submits encryption password.
   ▼
Derive PDK = Argon2id(encryption_password, salt).
   ▼
Fetch EMK from Penrose server.
   ▼
Master Key = decrypt(EMK, PDK, XSalsa20-Poly1305).
   MAC failure → "wrong encryption password" (not "no account").
   ▼
Fetch EVK from PDS.
   ▼
Vault Key = decrypt(EVK, Master Key).
   ▼
Store {PDK, Master, Vault} in secure device storage for session.`,
        },
        {
          kind: 'p',
          html:
            "The Bluesky leg of authentication runs on Bluesky's hosted page (<code>bsky.social</code>) inside an OS-managed in-app browser sheet (<code>ASWebAuthenticationSession</code> on iOS, Custom Tabs on Android). Bluesky handles handle / email entry, password (or passkey) input, 2FA, captcha, and email confirmation — Penrose never sees the user's Bluesky credentials. The OAuth flow returns an access token bound to a per-session DPoP keypair (RFC 9449); the keypair is generated on device, persisted non-extractably in iOS Keychain / Android Keystore, and used to sign every PDS request. Token refresh is handled transparently by <code>@atproto/oauth-client-expo</code> with no visible re-prompt.",
        },
        { kind: 'p', html: '<strong>First-time setup</strong> is fail-closed in three phases:' },
        {
          kind: 'ol',
          items: [
            'Generate Master Key, Vault Key, EMK, and EVK in memory — no network I/O yet.',
            'Single server call creates the profile and stores the EMK atomically. On failure: nothing has been written to the PDS, so retry regenerates cleanly.',
            'PDS write: store EVK and Argon2 parameters in the security record. On failure: the only orphan is the EMK on the server, which a clean retry replaces.',
          ],
        },
        { kind: 'p', html: 'At no step is a plaintext key transmitted anywhere.' },
        { kind: 'h3', text: '4.1 Encryption password strength', id: 'password-strength' },
        {
          kind: 'p',
          html:
            "Every cryptographic guarantee in this document ultimately bottoms out on the entropy of the user's encryption password. Argon2id's memory-hardness makes each brute-force guess expensive — even for a quantum adversary, because coherent quantum memory is catastrophically costly — but it cannot create entropy the password itself does not contain.",
        },
        { kind: 'h4', text: 'The policy enforced by the app' },
        {
          kind: 'ul',
          items: [
            '<strong>Minimum length:</strong> 12 characters. This is the only hard requirement for submission.',
            '<strong>No maximum length.</strong> Passphrases are welcome.',
            "<strong>Independent of the Bluesky password.</strong> Bluesky credentials are entered on Bluesky's hosted login page during the OAuth flow and never touch Penrose's process; there is no opportunity for the encryption password to be cross-leaked through Penrose even if the user picks identical strings. (A user is still strongly encouraged to pick distinct, high-entropy passwords for the two systems.)",
          ],
        },
        { kind: 'h4', text: 'The real-time strength meter' },
        {
          kind: 'p',
          html:
            'As the user types, the password field shows a color-coded meter that estimates entropy in bits and categorises it into one of six tiers:',
        },
        {
          kind: 'table',
          className: 'password-tiers',
          headers: ['Tier', 'Entropy', 'Meaning'],
          rows: [
            ['Very weak', '&lt; 50 bits', 'Dictionary-attack trivial'],
            ['Weak', '50–79 bits', 'Unsafe against a determined attacker'],
            ['Fair', '80–99 bits', 'Adequate against casual offline attack'],
            ['Strong', '100–127 bits', 'Classically safe'],
            ['Very strong', '128–159 bits', 'Classically excellent'],
            ['Post-quantum safe', '≥ 160 bits', 'Clears the NIST Level 5 post-quantum floor'],
          ],
        },
        {
          kind: 'p',
          html:
            'The meter uses red / orange / yellow for the lower tiers, green for Strong and Very strong, and the brand purple with a shield-checkmark icon for the Post-quantum safe tier.',
        },
        { kind: 'h4', text: 'Reaching the post-quantum tier' },
        {
          kind: 'p',
          html:
            "160 bits of entropy credits Argon2id's cost factor and memory-hardness penalty against Grover's algorithm, yielding an effective post-quantum work factor that clears the NIST Level 5 floor (≥ 2^128 effective work). Attainable with:",
        },
        {
          kind: 'ul',
          items: [
            '~27 random alphanumeric characters, or',
            '~25 random all-printable characters, or',
            'A 13-word EFF diceware passphrase (strongly encouraged — passphrases carry full random entropy by construction, where human-selected character passwords typically do not).',
          ],
        },
        { kind: 'h4', text: 'What post-quantum means for your password' },
        {
          kind: 'p',
          html:
            "The post-quantum claims elsewhere in this whitepaper apply to the system as deployed with a password that reaches the Post-quantum safe tier. A shorter or lower-entropy password remains protected classically by Argon2id's memory-hardness — offline brute force against a well-chosen 12-character password is still expensive — but its margin against a future quantum adversary shrinks with its entropy. Users who want the strongest guarantee the architecture offers should aim for the top tier.",
        },
        { kind: 'h4', text: 'Argon2id parameters' },
        {
          kind: 'p',
          html:
            'Argon2id memory, iteration, and parallelism parameters are tuned to the minimum-supported mobile hardware and are sized to preserve the entropy bounds above. Final shipping values will be published here once the public build is frozen.',
        },
        { kind: 'h3', text: '4.2 Recovery & account lifecycle', id: 'recovery' },
        {
          kind: 'p',
          html:
            '<strong>Penrose does not offer password recovery.</strong> If a user loses their encryption password, their private content becomes permanently inaccessible:',
        },
        {
          kind: 'ul',
          items: [
            'The PDK cannot be re-derived from a forgotten password.',
            "The EMK on Penrose's server remains ciphertext nobody can unlock.",
            "The EVK on the user's PDS remains ciphertext nobody can unlock.",
            'All private material — past posts, DMs received, circle memberships — is lost to the account.',
          ],
        },
        {
          kind: 'p',
          html:
            "This is intrinsic to the zero-trust design. If a server-side recovery path existed, the server could use it. The “no plaintext ever touches a server” guarantee requires that no party other than the user hold material capable of unlocking the vault.",
        },
        {
          kind: 'p',
          html:
            "Public posts (the Bluesky layer) are unaffected: they live under the AT Protocol identity, which the user can continue to access via Bluesky's own clients and account-recovery flows. Penrose's vault loss does not touch the Bluesky account.",
        },
        { kind: 'h3', text: '4.3 Devices', id: 'devices' },
        {
          kind: 'p',
          html:
            'Penrose is multi-device by design. An account is not bound to a specific phone or a key blob that must be synced between devices; it is bound to a cryptographic identity whose at-rest material lives on public infrastructure:',
        },
        {
          kind: 'ul',
          items: [
            "The <strong>EMK</strong> (encrypted Master Key) lives on Penrose's server, addressable by the user's DID.",
            "The <strong>EVK</strong> (encrypted Vault Key) lives on the user's Bluesky PDS under the security record.",
            'All long-lived symmetric keys — messaging keys, circle keys, friend keys, Kyber secret key — live on the PDS as encrypted records wrapped under the Vault Key.',
          ],
        },
        { kind: 'p', html: 'A new device unlocks the account by completing two flows:' },
        {
          kind: 'ol',
          items: [
            "<strong>Bluesky OAuth</strong> on Bluesky's hosted login page — handle, password (or passkey), 2FA, and any other credential are entered on <code>bsky.social</code> itself. Penrose receives only an OAuth-issued access token bound to a per-session DPoP keypair.",
            '<strong>Encryption password</strong> — to derive the PDK, unlock the EMK, then the EVK, then every per-record key in the vault.',
          ],
        },
        {
          kind: 'p',
          html:
            'There is no device-to-device sync protocol, no paired-device registration, and no long-lived session that needs to migrate. Sign in on any device, unlock the vault, and every key ever received is available from the PDS.',
        },
        {
          kind: 'p',
          html:
            "Signing out clears the PDK, Master Key, and Vault Key from the device, revokes the OAuth tokens server-side, and wipes the OAuth library's local key + token store. Nothing on the device can decrypt content until the next sign-in.",
        },
        { kind: 'h3', text: '4.4 What persists on the device between launches', id: 'auto-relogin' },
        {
          kind: 'p',
          html:
            "Penrose keeps no Bluesky password and no encryption password on the device. After successful unlock, the device's secure storage (iOS Keychain / Android Keystore) holds:",
        },
        {
          kind: 'ul',
          items: [
            'The <strong>derived vault keys</strong> — PDK, Master Key, Vault Key — read at app launch so the user is not re-prompted for the encryption password on every cold start.',
            "The <strong>OAuth library's session material</strong> — the DPoP keypair (non-extractable, generated and held in the secure element), the refresh token, and the most recent DPoP-Nonce. These are managed entirely by <code>@atproto/oauth-client-expo</code> and refreshed transparently on each PDS request.",
          ],
        },
        {
          kind: 'p',
          html:
            "The encryption password itself is held only in process memory long enough to derive the PDK, then dropped. The Bluesky password is never on the device at all — it is entered on Bluesky's hosted page and exchanged for an OAuth session that Bluesky issues directly to the OAuth library.",
        },
        { kind: 'p', html: 'What this means at each device-state boundary:' },
        {
          kind: 'ul',
          items: [
            "<strong>App close (no explicit sign-out).</strong> Vault keys persist in secure storage; OAuth tokens persist in the library's MMKV-backed store. Next launch silently restores both — no prompts.",
            '<strong>Token expiry.</strong> The OAuth library refreshes the access token on its next outbound call. No user-visible re-prompt; no Bluesky-side re-auth.',
            "<strong>Explicit sign-out.</strong> Cached vault keys are wiped from secure storage; OAuth tokens are revoked server-side and the library's local store is cleared. Next launch requires the full Bluesky OAuth + encryption-password flow.",
            '<strong>Compromised, unlocked device.</strong> The vault keys and the OAuth refresh token are hardware-protected at the Keychain / Keystore class. Extracting them requires a compromised OS. The encryption password itself is not stored, so it cannot be extracted from the device — only attacked offline against the EMK + EVK pair, which requires breaching both Penrose\'s server and the user\'s PDS (§3.1).',
            "<strong>Rooted / jailbroken device.</strong> SecureStore's guarantees are weaker on a compromised OS. Vault keys remain wrapped against the OS-level secure store; if that store is compromised the attacker has full access to the session.",
          ],
        },
        {
          kind: 'p',
          html:
            'The post-quantum and zero-trust claims throughout this whitepaper are about what servers hold, not about the device itself. A compromised device is explicitly out of scope (§1.3).',
        },
      ],
    },
    {
      id: 'posting',
      heading: '5. Posting: two-tier content encryption',
      blocks: [
        {
          kind: 'p',
          html: 'Every encrypted post uses <strong>two tiers</strong> of keys so that compromising one post never exposes others.',
        },
        {
          kind: 'figure',
          src: '/images/diagram-two-tier-content.svg',
          alt: "Two-tier content encryption diagram: the circle key (AES-256), shared with circle members, wraps a per-post content key (AES-256, fresh random), which encrypts each .zen file — the post's text, the first image, and any additional images.",
          caption: 'Figure 2. Two-tier content encryption. Compromising one post exposes only that post — not the circle.',
          width: 720,
          height: 460,
        },
        { kind: 'h3', text: '5.1 Compose' },
        {
          kind: 'ol',
          items: [
            'User writes text and/or selects images.',
            'App generates a fresh <strong>content key</strong> (32 random bytes, AES-256).',
            'In parallel: Encrypt post text with the content key → <code>_text.zen</code>. For each image: resize, re-encode, then encrypt with the content key → <code>image_&lt;i&gt;.zen</code>.',
            'Encrypt the content key itself with the selected <strong>circle key</strong> to produce a <strong>content-key record</strong> payload.',
          ],
        },
        { kind: 'h3', text: '5.2 Publish' },
        { kind: 'p', html: 'The post submit handler enforces the <strong>privacy invariant</strong> (see §9) with submit-time checks:' },
        {
          kind: 'ol',
          items: [
            "Write the content-key record to the author's PDS. Payload includes the encrypted content key and a reference to the circle key used. If this write fails, the post is <strong>blocked</strong> — never downgraded to plaintext.",
            'Upload all <code>.zen</code> blobs to the PDS. These are opaque binary blobs to Bluesky; the AppView indexes them only as file attachments.',
            'Publish the post record with: Empty text (the real text lives in <code>_text.zen</code>). A Penrose app marker. An AT URI reference to the circle key used. An AT URI reference to the content-key record. Document embeds for the <code>.zen</code> files.',
            'Patch the content-key record with the final post URI (bidirectional linkage for deletion cleanup).',
          ],
        },
        { kind: 'h3', text: '5.3 .zen file format' },
        {
          kind: 'code',
          text: `{
  "version": 1,
  "type": "encrypted-image" | "encrypted-text",
  "format": "jpg" | "txt",
  "iv": "<hex>",
  "data": "<base64 ciphertext>",
  "encryptedAt": "<iso>"
}`,
        },
        { kind: 'p', html: 'Ciphertext is AES-CBC with PKCS7. The IV is fresh random per file.' },
        { kind: 'h3', text: '5.4 Private post index' },
        {
          kind: 'p',
          html:
            "For feed generation, Penrose's server maintains a <strong>metadata-only index</strong> consisting of <code>{post_uri, key_uri, author_did, indexed_at}</code>. A validation rule enforces that the key URI references the author's own repo, preventing feed poisoning. This index lets a circle member quickly enumerate posts encrypted for them without walking every contact's repo.",
        },
        {
          kind: 'p',
          html:
            "No post content, no key material, and no plaintext of any kind is stored in this index — only references that the member's client then uses to fetch and decrypt on-device.",
        },
        { kind: 'h3', text: '5.5 Media sanitization', id: 'media-sanitization' },
        { kind: 'callout', variant: 'status', label: 'Status', body: 'Under active development.' },
        {
          kind: 'p',
          html:
            'Encrypting an image does not by itself protect a user from metadata embedded inside the image — EXIF tags, GPS coordinates, camera serial numbers, and editing-software fingerprints travel inside the pixel file. A recipient who decrypts the image can extract them.',
        },
        {
          kind: 'p',
          html:
            "Penrose's target behavior is to strip all non-essential metadata from images before encryption, by default, with no user action required. The exact scrubbing policy — which tags are removed and which are preserved (e.g., orientation) — is under active design. Until this is shipped and documented here, users who care about image metadata should strip it on their own device before posting.",
        },
        { kind: 'h3', text: '5.6 Deletion', id: 'deletion' },
        { kind: 'callout', variant: 'status', label: 'Status', body: 'Partially implemented; full semantics under active design.' },
        {
          kind: 'p',
          html:
            "Today, deleting a private post removes the post record, the content-key record, and the <code>.zen</code> attachments from the author's PDS, and removes the corresponding entry from the private-post index on Penrose's server.",
        },
        { kind: 'p', html: 'The following aspects are still being specified:' },
        {
          kind: 'ul',
          items: [
            'Whether recipient devices proactively purge their decryption caches on seeing a deletion event, versus deferred cleanup on next session.',
            'Direct-message deletion (sender-initiated and recipient-initiated), and what each guarantees.',
            'The exact ordering of deletion operations to ensure no observable orphans (a post record without its content-key record, or vice versa).',
          ],
        },
        {
          kind: 'p',
          html:
            "Once finalized, this section will state what deletion does guarantee and what it does not. Some limits are fundamental: a recipient's already-decrypted copy, a screenshot taken before deletion, and any off-device backup the recipient created are permanently outside Penrose's control.",
        },
      ],
    },
    {
      id: 'replies',
      heading: '6. Replies and quotes',
      blocks: [
        { kind: 'p', html: "<strong>Replies</strong> reuse the parent post's content key:" },
        {
          kind: 'ul',
          items: [
            "If the parent is encrypted, the reply's <code>_text.zen</code> is encrypted with the <strong>same content key</strong> the parent used, and the reply's post record points its content-key reference at the parent's content-key record.",
            "This preserves access control: anyone with the parent's circle key automatically reads all replies without separate key exchange.",
            'When a reply is deleted, the content-key record is <strong>not</strong> deleted (the parent still uses it).',
          ],
        },
        {
          kind: 'p',
          html: '<strong>Encrypted quotes</strong> embed the quote reference <em>inside</em> the encrypted text:',
        },
        {
          kind: 'code',
          text: `User's message text
---QUOTE---
{"uri":"at://did:plc:xxx/app.bsky.feed.post/yyy","cid":"bafyrei..."}`,
        },
        {
          kind: 'p',
          html:
            'No public quote embed is attached to the post record, so observers cannot see what is being quoted. After decryption, the client splits on <code>---QUOTE---</code> and fetches the referenced post.',
        },
      ],
    },
    {
      id: 'reading',
      heading: '7. Reading: decryption pipeline',
      blocks: [
        {
          kind: 'code',
          text: `Post with .zen files loads in feed
   ▼
Parse circle-key reference and content-key reference from post record
   ▼
Check decryption cache ── HIT → display
   ▼
┌─── Step 1: resolve circle key (on device only) ───┐
│  - Own post: local circle-key store               │
│  - Friend's post: friend-keys store               │
└───────────────────────────────────────────────────┘
   ▼
┌─── Step 2: fetch & decrypt content key ───────────┐
│  - Fetch content-key record                       │
│  - AES-decrypt with circle key                    │
│  - Result: AES-256 content key                    │
│  - On failure: return null (NEVER fall back       │
│    to circle key as content key)                  │
└───────────────────────────────────────────────────┘
   ▼
┌─── Step 3: fetch & decrypt .zen files ────────────┐
│  Streaming mode: download + decrypt concurrently  │
│  Traditional mode: download → parse → decrypt     │
│  With yield points to keep the UI thread alive    │
└───────────────────────────────────────────────────┘
   ▼
Cache data URI → render → clean up temp files`,
        },
        { kind: 'p', html: 'Key properties:' },
        {
          kind: 'ul',
          items: [
            '<strong>Plaintext never persists.</strong> Decrypted data URIs live in component memory only; nothing is written to persistent storage outside ephemeral temp files that are deleted immediately after decryption.',
            '<strong>Content keys are cached in-session</strong> to avoid refetching on every image of a multi-image post. The cache is cleared on logout.',
            '<strong>Strict two-tier discipline.</strong> If the content-key record exists but fetch or decryption fails, decryption fails. The code never “falls back” to decrypting the <code>.zen</code> file directly with the circle key — that would produce garbage and mask real errors.',
          ],
        },
      ],
    },
    {
      id: 'inbox',
      heading: '8. Key exchange and the encrypted inbox',
      blocks: [
        { kind: 'h3', text: '8.1 ML-KEM-1024 exchange pattern' },
        { kind: 'p', html: 'Every first contact (friend request) and every subsequent circle-key share is built on the same post-quantum key encapsulation pattern:' },
        {
          kind: 'code',
          text: `Sender                                Recipient
------                                ---------
Fetch recipient Kyber pubkey
  (from recipient's security record
   on their PDS)
ml_kem1024.encapsulate(pk)
  → (cipherText, sharedSecret)
Derive envelope keys from shared_secret    (HKDF-SHA256 — see §8.2.1)
Wrap inner payload (messaging_key,
  optional circle_key, …) under the
  envelope keys
Deliver sealed envelope
                                      ml_kem1024.decapsulate(cipherText, sk)
                                        → sharedSecret
                                      Re-derive envelope keys
                                      Open inner payload
                                      Validate messaging_key
                                      Store keys under the vault`,
        },
        {
          kind: 'p',
          html:
            'The shared secret is <strong>used once and discarded.</strong> All future communication with that contact rides on the established messaging key, carried inside the sealed-sender envelope (§8.2.1).',
        },
        { kind: 'h3', text: '8.2 The encrypted inbox' },
        {
          kind: 'p',
          html:
            "Friend requests, circle-key shares, acceptances, and direct messages flow through a <strong>metadata-minimal inbox</strong> rather than through the sender's public PDS. The inbox is designed so that a full server breach reveals essentially nothing about the social graph.",
        },
        { kind: 'p', html: 'Each inbox row contains:' },
        {
          kind: 'table',
          headers: ['Field', 'Visibility', 'Content'],
          rows: [
            ['Message ID', 'Server', 'Random identifier'],
            ['Owner', 'Server', "Recipient's account ID (required for delivery)"],
            ['Read flag', 'Server', 'Boolean'],
            ['Priority', 'Server', 'Client-set routing hint'],
            [
              '<strong>Sealed envelope</strong>',
              '<strong>Opaque</strong>',
              'Two-layer sealed-sender envelope (described below)',
            ],
            ['Encryption info', 'Server', 'Algorithm tag (e.g. <code>sealed-sender-v1/ml-kem-1024+hkdf-sha256+xsalsa20-poly1305</code>)'],
            ['Sender token hash', 'Server', 'SHA-256 of a sender-only random token (for deletion only)'],
            ['Timestamps', 'Server', 'Created and expires (bounded TTL)'],
          ],
        },
        { kind: 'p', html: 'The server <strong>does not know</strong>:' },
        {
          kind: 'ul',
          items: [
            "Who sent the message. The sender's identity is encrypted inside the envelope under the recipient's post-quantum public key — not visible at any layer the server can read. The sender-token hash is unrelated to identity and exists only so the sender can later delete an unread message.",
            'What type of message it is. The type discriminator (friend request, key share, acceptance, direct message) lives inside the envelope.',
            'What the content is.',
            'Whether two inbox rows are related. There is no thread or conversation identifier on the server.',
          ],
        },
        { kind: 'h4', text: '8.2.1 Sealed-sender envelope' },
        {
          kind: 'p',
          html:
            "Each row's payload is a two-layer envelope adapted from Signal's sealed-sender construction to a post-quantum KEM. It carries two independent guarantees: the outer layer hides the sender from the server; the inner layer authenticates the sender to the recipient.",
        },
        {
          kind: 'figure',
          src: '/images/diagram-sealed-sender-envelope.svg',
          alt: "Side-by-side diagram of the sealed-sender envelope's two layers. Layer 1 (left) hides sender identity from the server: ML-KEM-1024 encapsulation against the recipient's public key produces a shared secret, HKDF-SHA256 derives three sub-keys (K_id, K_oob, K_l2_salt), and the sender's identity and a per-envelope OOB_VAL are wrapped under the first two. K_l2_salt feeds Layer 2's HKDF salt. Layer 2 (right) authenticates the sender to the recipient: HKDF-SHA256, keyed by either the per-contact messaging key (established contacts) or the per-envelope OOB_VAL (first contact) and salted by Layer 1, derives K_inner, which encrypts the inner payload (message body and type discriminator) under XSalsa20-Poly1305.",
          caption:
            'Figure 3. Sealed-sender envelope. Layer 1 hides the sender from the server; Layer 2 authenticates the sender to the recipient. K_l2_salt links the two layers so any tampering with Layer 1 invalidates Layer 2.',
          width: 1100,
          height: 580,
        },
        {
          kind: 'p',
          html:
            "<strong>Layer 1 — hide sender identity from the server.</strong> The sender encapsulates against the recipient's ML-KEM-1024 public key, producing a shared secret known only to sender and recipient. HKDF-SHA256 derives three sub-keys, salted by hashes of the recipient's public key and the KEM ciphertext (domain separation). Two of those sub-keys wrap (a) the sender's claimed identity and (b) a per-envelope random value (<code>OOB_VAL</code>). The third feeds into Layer 2's salt so any tampering with Layer 1 invalidates Layer 2.",
        },
        {
          kind: 'p',
          html:
            '<strong>Layer 2 — authenticate sender to recipient.</strong> A second HKDF derivation is keyed by <em>either</em> the per-contact messaging key (for established contacts) <em>or</em> the per-envelope random value from Layer 1 (for first contact). The result encrypts the inner payload (the actual message: friend request, key share, DM body, etc.). The recipient tries the messaging key it has on file for the claimed sender; if that opens the inner ciphertext, the sender provably possessed that key — the recipient binds. If the messaging key fails, the recipient falls back to the per-envelope value (first-contact path).',
        },
        {
          kind: 'p',
          html:
            "<strong>What this means for the recipient:</strong> for an established contact, the only party that could have produced an envelope that opens under that contact's stored messaging key is someone who actually holds that key — i.e. the contact themselves. An impersonator who tries to forge a message under the established-contact path fails to produce an envelope that opens.",
        },
        {
          kind: 'p',
          html:
            "<strong>What this means for the server:</strong> at no layer does the server see, infer, or learn the sender's DID. Even comparing two envelopes from the same sender to the same recipient is ciphertext-indistinguishable — the random per-envelope value and fresh KEM ciphertext re-randomise both layers on every send.",
        },
        {
          kind: 'p',
          html:
            'The first-contact <code>OOB_VAL</code> fallback is an explicitly-accepted residual: an attacker who already possesses the recipient\'s Kyber public key can construct a "first-contact" envelope claiming to be from anyone. This is bounded by the same trust window that out-of-band verification (Future work) closes, and the recipient surfaces it as a first-contact event the user can verify before accepting.',
        },
        { kind: 'h3', text: '8.3 Server-side write authentication' },
        {
          kind: 'p',
          html: 'Most server-side writes — post-index entries, profile mutations, encrypted-master-key storage — go through a single gateway that performs <strong>PDS session verification via DPoP relay</strong> (RFC 9449):',
        },
        {
          kind: 'ol',
          items: [
            "The client sends three headers per request: the OAuth-issued access token, a freshly-minted DPoP proof JWT bound to the upstream PDS request, and the URL of the user's PDS.",
            "The gateway forwards the access token + DPoP proof to the user's PDS at <code>com.atproto.server.getSession</code>. The PDS validates the proof against the access token's <code>cnf.jkt</code> claim — confirming that whoever sent the request holds the DPoP key the token was issued for — and returns the session DID.",
            'The gateway <strong>independently resolves</strong> the returned DID to its canonical PDS service endpoint via <code>plc.directory</code> (for <code>did:plc:</code> identifiers) or <code>https://&lt;host&gt;/.well-known/did.json</code> (for <code>did:web:</code> identifiers).',
            'The gateway asserts that the canonical PDS matches the URL the client submitted. This binding check is the load-bearing mitigation against a malicious PDS returning arbitrary DIDs from <code>getSession</code>; without it, anyone running a PDS could impersonate any user.',
            'Writes are attributed to this verified DID — never to a client claim.',
          ],
        },
        {
          kind: 'p',
          html:
            "DPoP-bound tokens defeat replay: the server-side gateway tracks the proof's <code>jti</code> (JWT ID) in an in-memory cache for the proof's TTL window and rejects any duplicate. A captured request cannot be replayed even within the access token's validity period.",
        },
        {
          kind: 'p',
          html:
            'The gateway also handles the DPoP-Nonce challenge: when the PDS responds with <code>401 use_dpop_nonce</code>, the gateway propagates the fresh nonce back to the client in a <code>DPoP-Nonce</code> response header so the client can rebuild its proof and retry transparently (the standard RFC 9449 §8 single-shot retry).',
        },
        {
          kind: 'p',
          html:
            "<strong>Inbox writes are deliberately exempt</strong> from this gateway authentication. Sender authenticity for inbox messages is proved cryptographically inside the sealed envelope (§8.2.1), not by a server-side identity check on the writer. This is a load-bearing property of sealed-sender: if the server authenticated the writer, it would learn the sender's identity, defeating the very property the envelope is designed to provide. The server therefore accepts inbox writes from any caller and relies on per-recipient unread caps and the cryptographic guarantee that the recipient will reject envelopes that don't authenticate as a known contact or as a well-formed first-contact request.",
        },
        { kind: 'h3', text: '8.4 Confirmed-sender authentication' },
        {
          kind: 'p',
          html: 'Two mechanisms together enforce that the sender of an inbox message is who they claim to be.',
        },
        {
          kind: 'p',
          html:
            "<strong>Layer 2 of the sealed envelope (every message).</strong> Every inbox envelope's inner payload is encrypted under a key derived from the per-contact messaging key (§8.2.1). For an established contact, the only party that can produce an envelope that opens under the recipient's stored messaging key for that contact is someone who actually possesses that key — i.e. the contact themselves. An envelope that fails to open under the bound messaging key is rejected at envelope-open time before any payload is processed.",
        },
        {
          kind: 'p',
          html:
            "<strong>TOFU binding on first acceptance.</strong> When the recipient's client accepts a friend request, it fetches the sender's ML-KEM-1024 public key from the sender's PDS, computes a fingerprint, and stores it alongside the new messaging-key record. Subsequent envelopes — DMs, circle-key shares, rotation notices — are tied to this fingerprint by virtue of being keyed under the bound messaging key. A PDS operator who later substitutes the sender's public key cannot derive that messaging key and therefore cannot produce envelopes the recipient will accept.",
        },
        {
          kind: 'p',
          html:
            'This is <strong>Trust-On-First-Use</strong>: the first key seen for a contact is trusted; substitution on any subsequent exchange is detected. TOFU does not defend against a PDS operator who substitutes a key <em>before</em> the first binding — that residual window is closed by out-of-band verification, which is planned (see Future work). The first-contact path of the sealed envelope (Layer 2 keyed by the per-envelope <code>OOB_VAL</code>) inherits the same residual window and is closed by the same mechanism.',
        },
        {
          kind: 'p',
          html:
            'On the sender side, a separate check validates that incoming acceptances correspond to outgoing requests the user actually sent, so an attacker cannot inject a forged “acceptance from Bob” that Alice never solicited.',
        },
        { kind: 'h3', text: '8.5 Direct-message transport' },
        {
          kind: 'p',
          html:
            'Chat-style direct messages share the same sealed-sender inbox transport as friend requests and key shares. The construction layers as follows:',
        },
        {
          kind: 'ol',
          items: [
            "<strong>Authoritative storage on the user's PDS.</strong> Each delivered DM is also written to the sender's and recipient's own PDS as an opaque record. The record body is XSalsa20-Poly1305 ciphertext of the message text (and any rich-text facets), encrypted under the per-contact messaging key. The PDS sees ciphertext, a per-message timestamp, and nothing else — not the contact, not the message body, not the conversation it belongs to.",
            "<strong>Delivery via the sealed-sender inbox.</strong> Outbound, a DM is wrapped in a sealed envelope (§8.2.1) and deposited into the recipient's inbox. The recipient opens the envelope, validates that it authenticates under the messaging key bound to the claimed sender, then writes the corresponding ciphertext record to its own PDS. Failed deliveries never reach the PDS — the user's repo only ever holds messages that were actually delivered.",
            "<strong>Conversation metadata is vault-encrypted.</strong> Each contact has one conversation record on the user's PDS holding head pointer, last-message preview, and unread count. The record body is XSalsa20-Poly1305 ciphertext encrypted under the <strong>vault key</strong> (not the messaging key) — even a contact whose messaging key was somehow compromised cannot read the user's conversation index.",
            '<strong>Pseudonymous record identifiers.</strong> The conversation record\'s identifier is derived deterministically as <code>HMAC-SHA256(HKDF(vault_key, "denazen-dm-contact-id-v1"), contact_did)</code> truncated to 16 bytes. Same contact always maps to the same identifier on a given account; different accounts (different vault keys) map the same contact to different identifiers. The PDS sees N opaque record identifiers but cannot reverse them to DIDs without the vault key.',
          ],
        },
        { kind: 'p', html: 'What this means for the threat model:' },
        {
          kind: 'ul',
          items: [
            '<strong>The PDS sees</strong> how many conversations the user has (N record identifiers), per-message timing, and ciphertext sizes. It cannot link any record to a specific contact, read any message, or reconstruct the conversation chain.',
            '<strong>The inbox server sees</strong> opaque sealed envelopes addressed to a recipient. It cannot tell DM envelopes apart from friend-request or key-share envelopes — the type discriminator is inside Layer 2.',
            '<strong>Forward chain pointers are device-only.</strong> Each DM payload references the previous message in the chain (encrypted) so that recipients can walk history backward. Forward pointers used for per-message deletion are reconstructed in the device-local cache and never written to the PDS — the PDS cannot reconstruct chains without the messaging key.',
          ],
        },
        { kind: 'h3', text: '8.6 Sender-side deletion tokens' },
        { kind: 'p', html: 'When sending, the client:' },
        {
          kind: 'ol',
          items: [
            'Generates 32 random bytes (the raw sender token).',
            'Sends only the SHA-256 hash of the token to the server.',
            'Stores the raw token locally.',
          ],
        },
        {
          kind: 'p',
          html:
            'To delete a sent message (e.g. after the recipient rejects it), the client presents the raw token; the server re-hashes and deletes only if the hashes match. The server learns nothing about the sender from the hash and cannot forge deletions.',
        },
        { kind: 'h3', text: '8.7 Push notifications', id: 'push' },
        { kind: 'callout', variant: 'status', label: 'Status', body: 'Not yet implemented.' },
        {
          kind: 'p',
          html:
            'Penrose does not currently deliver push notifications via Apple APNs or Google FCM. The posture for push — whether payloads will be opaque wake-up signals, contain encrypted content that an on-device notification-service extension decrypts locally, or include readable previews — is still being designed.',
        },
        {
          kind: 'p',
          html:
            'Push notifications are a well-known metadata surface for end-to-end encrypted applications: Apple and Google can observe the timing and addressing of every notification, along with any readable payload. When push ships on Penrose, this section will state explicitly what APNs and FCM can observe.',
        },
      ],
    },
    {
      id: 'invariant',
      heading: '9. The privacy invariant',
      blocks: [
        { kind: 'p', html: 'Penrose operates under a single, non-negotiable invariant:' },
        {
          kind: 'callout',
          variant: 'invariant',
          label: 'Privacy invariant',
          body: 'A user who intends to create a private post MUST NEVER produce a public one — under any circumstance.',
        },
        { kind: 'p', html: 'This is implemented as a fail-closed discriminated union enforced at submit time:' },
        {
          kind: 'code',
          text: `type ComposeState =
  | { mode: 'public' /* ... */ }
  | { mode: 'private', keyId: string, encryptionReady: true, /* ... */ }`,
        },
        { kind: 'p', html: 'The submit handler:' },
        {
          kind: 'ol',
          items: [
            '<strong>Snapshots</strong> all encryption parameters into immutable local constants before any async work.',
            "Validates the snapshot: if the mode is <code>'private'</code> and any of the required parameters is missing, <strong>throws and blocks</strong> submission.",
            'Passes the snapshot — never live UI state — into the background upload pipeline.',
          ],
        },
        {
          kind: 'p',
          html:
            'The post-creation service independently validates: if any encryption parameter is present, <em>all</em> must be, or it throws. There is no code path that “recovers” by sending a plaintext post, no null-coalescing to public, and no retry that silently downgrades privacy.',
        },
        { kind: 'p', html: 'The same fail-closed discipline extends to:' },
        {
          kind: 'ul',
          items: [
            'Circle-key shares (never sent unwrapped).',
            'Messaging keys in friend requests (must be encrypted under the Kyber-derived shared secret).',
            'Rotation events (rotated keys are re-sent only to retained members, wrapped under their messaging keys).',
            'Circle member list integrity (the shared-with list is updated <em>before</em> a key is transmitted; if that write fails, the key is not sent).',
          ],
        },
      ],
    },
    {
      id: 'rotation',
      heading: '10. Rotation',
      blocks: [
        { kind: 'h3', text: '10.1 Messaging-key rotation' },
        { kind: 'p', html: 'A user may rotate the messaging key they share with any contact:' },
        {
          kind: 'ol',
          items: [
            'Generate a new AES-256 messaging key.',
            'Send it to the contact via the inbox, encrypted with the <em>current</em> messaging key.',
            'Store the new key as “pending” on the sender side; wait for a confirmation message indicating the recipient has stored it.',
            'On confirmation, promote the new key to default and deactivate the old one.',
          ],
        },
        { kind: 'p', html: 'Old keys remain available for decrypting past messages but are never used to encrypt new ones.' },
        { kind: 'h3', text: '10.2 Circle-key rotation' },
        { kind: 'p', html: 'When a user removes a member from a circle, they <strong>rotate the circle key</strong>:' },
        {
          kind: 'ol',
          items: [
            'Generate a new circle key.',
            'Update the shared-with list (removing the unshared member) <em>before</em> any key distribution.',
            "Re-share the new circle key with each retained member via inbox, wrapped under that member's messaging key.",
            'Send a rotate-out notice to the removed member, whose client deletes the old key on receipt.',
            'Future posts use the new key; prior posts remain readable by whoever had the old key at the time they were posted.',
          ],
        },
        {
          kind: 'p',
          html:
            'This is intentionally <strong>not forward-secret for prior posts</strong> — historical content stays decryptable by the members who legitimately had access when it was written.',
        },
        { kind: 'h3', text: '10.3 Kyber key rotation' },
        {
          kind: 'p',
          html:
            "Users can rotate their ML-KEM-1024 key pair from Settings. The new public key is written to the user's security record; the old security record is automatically backed up. Contacts who previously performed a key exchange will need to re-exchange, which triggers a new TOFU binding on their end (§8.4). Out-of-band verification of the new key is planned (see Future work) for users who want to confirm the rotation was not a PDS-operator substitution.",
        },
      ],
    },
    {
      id: 'storage',
      heading: '11. Storage boundaries',
      blocks: [
        {
          kind: 'table',
          headers: ['Store', "What's stored", "What's NEVER stored"],
          rows: [
            [
              'Bluesky PDS',
              'Ciphertext <code>.zen</code> blobs, encrypted key records, encrypted DM records, encrypted conversation-metadata records, EVK, Kyber public key',
              'Plaintext content, plaintext keys, encryption password',
            ],
            ['Bluesky AppView / Relay', 'Post metadata, follow graph', 'Content, keys'],
            [
              'Penrose server',
              'Profile rows (DID + EMK), post-index metadata, sealed-sender inbox rows (opaque envelopes), invites',
              'Sender identity for inbox messages, plaintext content, plaintext keys, passwords, vault keys',
            ],
            [
              'Server-side gateway (in transit)',
              'OAuth-issued access token + per-request DPoP proof (transient, for PDS verification)',
              'Long-lived secrets, content, keys, encryption password, DPoP private key',
            ],
            [
              'Device secure storage',
              'PDK, Master Key, Vault Key, per-account sessions, OAuth refresh token, OAuth DPoP keypair (non-extractable, secure-element-backed)',
              'Bluesky password, encryption password (— this is the trust root)',
            ],
            [
              'Device general storage',
              'Encrypted key cache files (ciphertext only), preferences',
              'Plaintext keys, plaintext content',
            ],
          ],
        },
      ],
    },
    {
      id: 'telemetry',
      heading: '12. Telemetry and privacy',
      blocks: [
        { kind: 'p', html: 'Telemetry is anonymous by construction:' },
        {
          kind: 'ul',
          items: [
            'No user identification — no <code>identify()</code> or profile linking.',
            'Property names that could carry user-identifiable data are listed in an allowlist; a final filter drops them as a last line of defense.',
            'Error strings are mapped to a bounded vocabulary at the call site — raw error messages or API response bodies are never captured.',
            'Session replay is off. Screen-name and touch autocapture are off. GeoIP is disabled.',
          ],
        },
      ],
    },
    {
      id: 'moderation',
      heading: '13. Abuse and moderation',
      blocks: [
        { kind: 'callout', variant: 'status', label: 'Status', body: 'Pre-policy.' },
        {
          kind: 'p',
          html:
            'End-to-end encryption on the private layer means Penrose cannot observe the contents of private posts, DMs, or circle-key payloads. A moderation model for private content therefore must rest on explicit user action: a recipient reports an incident, at which point their client uploads the decrypted message and the sender’s identity for review.',
        },
        {
          kind: 'p',
          html:
            'The specific moderation policy — workflow, standards applied, coordination with Bluesky moderation for public content, and escalation paths for CSAM and other illegal material — is being written. Until the policy is published, the current behavior is:',
        },
        {
          kind: 'ul',
          items: [
            "Public-layer abuse follows Bluesky's existing moderation rails.",
            'Private-layer abuse is addressed by the tools users already have: remove the member from the Circle, block the contact (which revokes key exchange), and report via out-of-band channels.',
          ],
        },
        { kind: 'p', html: 'This section will be expanded when the written policy is available.' },
      ],
    },
    {
      id: 'legal-process',
      heading: '14. Legal process response',
      blocks: [
        { kind: 'callout', variant: 'status', label: 'Status', body: 'Pre-policy.' },
        {
          kind: 'p',
          html:
            "Penrose's zero-trust design dictates what Penrose cannot produce under lawful compulsion, because Penrose never held the material:",
        },
        {
          kind: 'ul',
          items: [
            'No plaintext private content (posts, DMs, images).',
            'No decryption keys of any kind — vault, messaging, circle, content, or Kyber secret.',
            'No encryption password.',
            "No mapping from a user's DID to legal identity beyond what the user has voluntarily associated with the account.",
          ],
        },
        { kind: 'p', html: 'What Penrose does hold, and could therefore be compelled to produce:' },
        {
          kind: 'ul',
          items: [
            "The user's DID and handle.",
            "The EMK — an opaque ciphertext that cannot be unwrapped without the user's encryption password.",
            'Private-post index rows: post URI, key URI, author DID, timestamps.',
            'Inbox rows: opaque encrypted payloads, timestamps, and sender token hashes.',
            'Operational metadata and request timing.',
          ],
        },
        { kind: 'p', html: 'A formal law-enforcement guidelines document and a transparency-report cadence are under development.' },
      ],
    },
    {
      id: 'audit',
      heading: '15. Audit and responsible disclosure',
      blocks: [
        { kind: 'h3', text: 'Third-party audit' },
        {
          kind: 'p',
          html:
            'Individual cryptographic primitives used in Penrose have been independently audited — notably <code>@noble/post-quantum</code> (ML-KEM) by Cure53. The Penrose system as a whole — the vault hierarchy, the posting and inbox protocols, the privacy invariant, and the client implementations — has not yet been independently audited. A system-level audit is a priority for a near-term release; results will be published here when available.',
        },
        { kind: 'h3', text: 'Reporting a vulnerability' },
        {
          kind: 'p',
          html:
            'Security researchers who identify an issue can report it to <strong><a href="mailto:security@denazen.com">security@denazen.com</a></strong>. We aim to acknowledge reports within 72 hours and will coordinate on disclosure timing. Machine-readable contact and policy information is published at <a href="/.well-known/security.txt"><code>/.well-known/security.txt</code></a> per RFC 9116.',
        },
        { kind: 'h3', text: 'Bug bounty' },
        {
          kind: 'p',
          html: 'No formal bug-bounty program is active at this time. We acknowledge valuable reports in release notes and on this page.',
        },
      ],
    },
    {
      id: 'future-work',
      heading: '16. Future work',
      blocks: [
        { kind: 'p', html: 'Four items are explicitly scoped <em>out</em> of the current release and named here rather than left implicit:' },
        {
          kind: 'ul',
          items: [
            "<strong>Out-of-band contact verification.</strong> Safety-number / QR-code UI for users to manually confirm a contact's ML-KEM-1024 public key before Trust-On-First-Use binds (§8.4). TOFU detects key substitution on any subsequent exchange; OOB verification closes the residual first-contact window against a PDS operator who might substitute a key before the first binding. Planned for a near-term release; mirrors Signal's safety-number model when it ships.",
            "<strong>Key transparency.</strong> The industry direction is an append-only public log of post-quantum public keys, letting any user verify that the key Penrose's server attributes to a contact matches what that contact actually published. Penrose ships with TOFU (§8.4) — strong but not equivalent to a transparency log. A future release will add one.",
            '<strong>Reproducible builds and binary attestation.</strong> The open-source codebase is verifiable; the compiled mobile and web binaries are not yet byte-for-byte reproducible from source. Shipping reproducible builds — and, on supported platforms, code-transparency attestations — is planned.',
            '<strong>Formal post-quantum migration protocol.</strong> The <code>.zen</code> format carries a <code>version</code> field (§5.3), and clients negotiate on it: newer clients read older versions, older clients surface an “update required” placeholder for newer ones. A documented rekey-window protocol for moving circle keys and messaging keys across a primitive change is not yet specified; it will be added before the first primitive rotation.',
          ],
        },
      ],
    },
    {
      id: 'verification',
      heading: '17. Verification story',
      blocks: [
        { kind: 'p', html: 'The claim “no server can decrypt” rests on the following testable facts, each verifiable from the codebase:' },
        {
          kind: 'ol',
          items: [
            "<strong>No plaintext key ever crosses a network boundary.</strong> The Vault Key is generated on device; it leaves only as the EVK (wrapped under the Master Key) to the PDS and never reaches Penrose's server. The Master Key leaves only as the EMK (wrapped under the PDK) to the Penrose server.",
            '<strong>No plaintext content ever crosses a network boundary.</strong> Posts are encrypted on device before any upload; <code>.zen</code> blobs are opaque to Bluesky; direct messages and inbox messages are sealed under the recipient\'s Kyber key.',
            "<strong>Server-side gateways see no secrets.</strong> The write gateway handles OAuth access tokens and DPoP proofs only long enough to relay the PDS verification call. It never holds the DPoP private key (which lives in the user's secure element) and never touches vault, messaging, or circle keys. On the inbox-write path it sees neither a session token nor a sender identity — sealed-sender envelopes self-authenticate to the recipient and require no server-side caller authentication.",
            '<strong>Fail-closed discipline.</strong> The privacy invariant (§9) makes it structurally impossible for a private-intended post to become public without an explicit code change.',
            '<strong>Vendored crypto libraries.</strong> All cryptographic primitives are either pinned or copied into the repository; library updates require a deliberate change.',
            '<strong>Independent key-at-rest layer.</strong> The vault hierarchy (§3) means compromising any single server (Bluesky <em>or</em> Penrose) does not yield an offline brute-force target — an attacker needs material from both.',
          ],
        },
      ],
    },
    {
      id: 'summary',
      heading: '18. Summary',
      blocks: [
        {
          kind: 'ul',
          items: [
            '<strong>Four-tier vault</strong> (password → PDK → Master Key → Vault Key) splits key-at-rest material across two servers so no single breach enables offline attack.',
            '<strong>Two-tier content encryption</strong> (circle key → content key → <code>.zen</code> files) isolates the blast radius of any single compromised post to itself.',
            '<strong>Post-quantum key exchange</strong> (ML-KEM-1024, NIST Level 5) protects all first-contact handshakes against future quantum adversaries.',
            '<strong>256-bit symmetric keys everywhere</strong> — content keys, circle keys, messaging keys, and vault keys all use 256-bit keys, maintaining a ≥ 2^128 post-quantum security floor at every symmetric layer.',
            '<strong>Sealed-sender inbox</strong> hides sender identity, message type, and relationships from the server that stores it. Inbox writes are intentionally unauthenticated server-side — sender authenticity is proved cryptographically inside the envelope, recoverable only by the recipient.',
            '<strong>PDS session verification</strong> at the single write gateway ensures callers are who they claim to be before any non-inbox server-side mutation (post-index entries, profile rows, encrypted-master-key storage).',
            "<strong>Confirmed-sender authentication via TOFU fingerprinting and sealed-sender Layer 2</strong> detects any post-first-contact key substitution by a compromised PDS — every envelope must open under the recipient's bound messaging key for the claimed sender. First-contact out-of-band verification is planned (see Future work).",
            '<strong>Fail-closed privacy invariant</strong> prevents silent downgrade from private to public at every layer.',
            "<strong>No plaintext ever touches a server.</strong> The only trust root for content confidentiality is the user's device, the user's encryption password, and (once OOB verification ships) the user's own out-of-band attestation of contact fingerprints. Neither the Bluesky PDS nor the Penrose server is trusted for confidentiality. See §1.4 for a precise statement of what “zero-trust” does and does not cover.",
          ],
        },
        {
          kind: 'p',
          html:
            "Even a fully compromised Bluesky PDS and a fully compromised Penrose server cannot, individually or together, read a single word of a user's private content — today or in a post-quantum future, given a compliant encryption password.",
        },
      ],
    },
    {
      id: 'glossary',
      heading: 'Appendix A. Glossary',
      blocks: [
        { kind: 'p', html: 'Standard AT Protocol and cryptography abbreviations used throughout this page.' },
        {
          kind: 'table',
          headers: ['Term', 'Definition'],
          rows: [
            [
              '<strong>AEAD</strong>',
              'Authenticated Encryption with Associated Data. An encryption scheme providing confidentiality and integrity in one operation. XSalsa20-Poly1305 is AEAD.',
            ],
            [
              '<strong>AppView</strong>',
              'In AT Protocol, a service that indexes records from PDSes to serve queries (timelines, search, notifications). The Bluesky AppView is run by Bluesky Social.',
            ],
            ['<strong>Argon2id</strong>', 'Memory-hard password-hashing function. Winner of the 2015 Password Hashing Competition.'],
            ['<strong>CSPRNG</strong>', 'Cryptographically Secure Pseudorandom Number Generator.'],
            [
              '<strong>DID</strong>',
              'Decentralized Identifier. In AT Protocol, a long-lived, repository-rooted identity string (e.g., <code>did:plc:xxxxxx</code>).',
            ],
            ['<strong>E2EE</strong>', 'End-to-end encrypted.'],
            ['<strong>EMK</strong>', "Encrypted Master Key — the Master Key wrapped under the PDK, stored on Penrose's server."],
            ['<strong>EVK</strong>', "Encrypted Vault Key — the Vault Key wrapped under the Master Key, stored on the user's PDS."],
            [
              '<strong>HKDF</strong>',
              'HMAC-based Key Derivation Function (RFC 5869). Extracts entropy from input keying material and expands it into output sub-keys; an <code>info</code> string scopes each derivation to a specific purpose (domain separation). HKDF-SHA256 uses HMAC-SHA256 internally.',
            ],
            [
              '<strong>HMAC</strong>',
              'Hash-based Message Authentication Code (RFC 2104). Confirms integrity and authenticity under a symmetric key using a hash function. HMAC-SHA256 is the SHA-256 instantiation.',
            ],
            [
              '<strong>KEM</strong>',
              'Key Encapsulation Mechanism. Produces a shared secret plus a ciphertext that only the holder of the matching private key can decapsulate. ML-KEM is a KEM.',
            ],
            ['<strong>MAC</strong>', 'Message Authentication Code. Confirms integrity and authenticity under a symmetric key.'],
            [
              '<strong>ML-KEM</strong>',
              'Module-Lattice-based Key Encapsulation Mechanism — a NIST standard (FIPS 203) derived from Kyber. ML-KEM-1024 is the Level-5 (highest) parameter set.',
            ],
            [
              '<strong>NIST Level 5</strong>',
              "NIST's highest post-quantum security category — at least 256-bit classical-equivalent security against a quantum adversary.",
            ],
            ['<strong>PDK</strong>', 'Password-Derived Key — a 32-byte key derived from the encryption password via Argon2id.'],
            [
              '<strong>PDS</strong>',
              "Personal Data Server. In AT Protocol, the per-user repository server that holds a user's records.",
            ],
            ['<strong>PKCS7</strong>', 'Padding scheme for block ciphers such as AES-CBC.'],
            ['<strong>Relay</strong>', 'In AT Protocol, a firehose service that aggregates and streams records from all PDSes.'],
            [
              '<strong>TOFU</strong>',
              'Trust-On-First-Use. A key-binding model where the first key seen for a contact is trusted, with substitution detected on subsequent exchanges.',
            ],
            [
              '<strong>XSalsa20-Poly1305</strong>',
              "libsodium's default AEAD construction — extended-nonce Salsa20 stream cipher with a Poly1305 MAC.",
            ],
          ],
        },
      ],
    },
  ],
};

export default content;
