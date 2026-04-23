# Denazen Encryption Architecture — Security Review Package

**Status:** draft whitepaper for external review
**Target audience:** security engineer or cryptographer conducting an independent review
**Public version:** rendered at https://denazen.com/security/architecture/

---

## Brief for the reviewer

Denazen is a pre-launch, invite-only privacy-first social network built on the AT Protocol (Bluesky). It adds an end-to-end encrypted layer ("private circles") on top of the public Bluesky layer. The goal of this document is to describe the cryptographic design in enough detail that a reviewer can evaluate its soundness.

### What to evaluate

- **Threat model (§1).** Is the list of adversaries and assets realistic? Are any meaningful threats missing? Are the stated non-goals defensible, or do any of them need to become goals?
- **Cryptographic primitives (§2).** Are the chosen algorithms, modes, and parameter sets appropriate? Any modern replacements we should be using? Any composition issues (e.g., AEAD vs. non-AEAD for content)?
- **Key hierarchy (§3–§4).** Does the four-tier vault (password → PDK → Master Key → Vault Key) actually deliver the "compromise-both-servers-or-nothing" property we claim? Is the unlock flow fail-closed in the way described? Is the password-strength policy (§4.1) defensible against Grover-equipped adversaries with the stated Argon2id envelope?
- **Content encryption (§5).** Two-tier (circle-key wraps content-key wraps .zen files). Are there patterns where the discipline could break (e.g., partial publish failures, content-key reuse)? Is the submit-time invariant (§9) sufficient to prevent silent downgrade to plaintext?
- **Key exchange and inbox (§8).** ML-KEM-1024 to an inbox with no server-visible sender, authenticated by a PDS-session-verification gateway. Does the confirmed-sender + TOFU + opt-in OOB design actually close the MITM window?
- **Privacy invariant (§9).** Is the fail-closed discriminated-union design sufficient? Are there other places in the codebase that should have the same discipline?
- **Rotation (§10).** Messaging-key rotation requires recipient confirmation; circle-key rotation is triggered by member removal; Kyber rotation requires contact re-exchange. Any gaps?
- **Storage boundaries (§11).** The table lists what's stored where. Any omissions?
- **Verification story (§13 — renumbered to §17 in the whitepaper).** The six claims at the end are presented as codebase-verifiable. Are any of them not actually verifiable from the code alone?
- **Future work (§16).** Key transparency, reproducible builds, crypto-agility are explicitly called out as not-yet-shipped. Are any of these more urgent than the document suggests?

### What is out of scope for this review

- UX decisions (copy, visual design)
- Product-management questions (who the target user is, pricing, growth strategy)
- The website itself (marketing copy, HTML/CSS)
- Bluesky / AT Protocol's own security — we depend on it but don't review it here

### What we want back

- A written assessment, section-by-section where meaningful
- Specific concerns flagged as "must-fix before ship" vs. "nice-to-have" vs. "v2"
- Suggestions for wording changes that reviewers think are misleading, understated, or overclaimed
- Any open questions we should answer before publication

### How to report concerns

Email `security@denazen.com` or respond to whoever handed you this document.

---

# Denazen Encryption Architecture

A technical whitepaper describing the end-to-end encryption model used by Denazen, a privacy-focused Bluesky client. This document is written for a technical audience — security engineers, cryptographers, and developers evaluating Denazen's privacy guarantees.

Denazen targets a **zero-trust content model**: no server, infrastructure provider, or Denazen developer can read plaintext content or key material, and no network attacker — including a compromised Personal Data Server (PDS) — can substitute keys undetected.

Three properties underpin this guarantee:

1. **Separate encryption password.** The vault key hierarchy is derived from an encryption password that is never sent to Bluesky or any other server.
2. **Out-of-band key verification (opt-in).** Users can confirm a contact's post-quantum public key via safety numbers or QR code, closing the Trust-On-First-Use (TOFU) gap against a compromised PDS operator. This mirrors Signal's safety-number model: available for users who need it, not required by default.
3. **Confirmed-sender inbox.** Inbox messages are authenticated against a sender identity proof, so a PDS operator cannot silently rewrite a contact's public key and impersonate them in future exchanges.

---

## 1. Threat model

### 1.1 Assets protected

| Asset | Protection |
|-------|------------|
| Post text and images (private mode) | Confidentiality + integrity |
| Direct messages | Confidentiality + integrity |
| Circle membership (who can read a post) | Confidentiality from non-members |
| Contact graph (who messages whom) | Obscured from the inbox server |
| Encryption keys at rest (on device and server) | Confidentiality + integrity |
| Encryption keys in transit (key exchange) | Confidentiality + post-quantum resistance |

### 1.2 Adversaries considered

| Adversary | Capability | Outcome under Denazen |
|-----------|------------|-----------------------|
| Passive network observer | TLS interception | Sees only ciphertext and TLS-protected traffic |
| Bluesky PDS operator | Full read/write on user's repo | Sees ciphertext blobs, key URIs, and metadata only; cannot derive decryption keys; cannot substitute a contact's public key without detection |
| Bluesky AppView / Relay | Full social graph visibility | Sees post metadata and follow graph; sees no content and no keys |
| Denazen relay / database | Full server-side read | Sees ciphertext payloads, DIDs, and metadata only |
| Compromised server-side gateway | Short-term access to requests | Sees transient OAuth-issued access tokens and per-request DPoP proofs for identity verification only; no long-lived secrets. Access tokens are DPoP-bound to per-session keypairs held in users' device secure elements (RFC 9449), so token capture alone does not enable impersonation. |
| Denazen developer with database access | Metadata + server ciphertext | Cannot derive plaintext — same position as the server |
| Lost or stolen device (locked) | Physical access to device storage | Cannot read key material without device unlock + encryption password |
| Future quantum adversary | Shor's algorithm on classical key exchange; Grover's algorithm on symmetric keys | ML-KEM-1024 (NIST Level 5 post-quantum KEM) for all key exchange; AES-256 for all content and key-wrapping |

### 1.3 Non-goals / explicit limits

- **No perfect forward secrecy for long-lived keys.** Circle keys and messaging keys persist until rotated; compromise of a current messaging key exposes past messages encrypted with that key. Rotation is available but not automatic per-message.
- **No protection from a compromised device.** If an attacker has the device unlocked *and* the user's encryption password, they read everything. This is the standard baseline for end-to-end encrypted systems.
- **Metadata is partially visible.** Post counts, timing, and the Bluesky follow graph remain visible to Bluesky itself. The inbox (for direct messages and key shares) is designed to hide sender identity and message type from the server that stores it.
- **IP addresses and network-level metadata are visible.** Clients talk directly to Denazen's server and to Bluesky PDSes over TLS; no onion routing, proxy, or sealed-transport layer is applied. Anyone with network-layer visibility sees that a given IP is talking to Denazen, even if they cannot see what is being said. Users who require network-level anonymity should route their traffic through a separate anonymity layer.

---

## 2. Cryptographic primitives

All crypto libraries are either vendored locally or pinned to exact versions to prevent silent algorithm drift.

| Purpose | Primitive |
|---------|-----------|
| Password-based key derivation | Argon2id (libsodium) |
| Authenticated symmetric encryption (key material, DMs, inbox) | XSalsa20-Poly1305 (`crypto_secretbox`, libsodium) |
| Bulk content encryption (`.zen` files, images) | AES-CBC-256 with PKCS7 |
| Post-quantum key exchange | ML-KEM-1024 (Kyber), NIST Level 5, audited by Cure53 |
| Hashing | SHA-256, SHA-3 |
| Secure random | Platform CSPRNG |

Notes:

- AES-CBC is used only for bulk content where possession of the content key is the access-control boundary. All key material and all messages are authenticated via XSalsa20-Poly1305.
- ML-KEM-1024 targets NIST Level 5 post-quantum security — the highest parameter set in the standard. It is used only for key encapsulation; derived shared secrets wrap long-lived symmetric keys once and are then discarded.
- Every symmetric primitive in the stack uses a 256-bit key. Under Grover's algorithm this yields an effective post-quantum security floor of 2^128 per layer.

---

## 3. Key hierarchy

Denazen uses a **four-tier vault hierarchy** for key-at-rest protection and a separate family of **content / exchange keys** for messaging and posts.

### 3.1 Vault hierarchy (at rest)

```
Encryption password
     │ Argon2id + per-user salt
     ▼
PDK (Password-Derived Key, 32 bytes)       ── session-only, secure device storage
     │ XSalsa20-Poly1305
     ▼
Master Key (32 bytes, random)              ── long-lived
     │ Encrypted with PDK → stored server-side as EMK
     │ Plaintext copy in secure device storage after unlock
     │ XSalsa20-Poly1305
     ▼
Vault Key (32 bytes, random)               ── long-lived, per account
     │ Encrypted with Master Key → stored on the PDS as EVK
     │ Plaintext copy in secure device storage after unlock
     ▼
Per-record encrypted key material:
   - Circle keys
   - Friend keys
   - Messaging keys
   - Kyber secret key
```

**Why two hops (PDK → Master → Vault) instead of one?**

- The **Master Key** lives on Denazen's server (encrypted by the PDK); the **EVK** lives on the user's Bluesky PDS (encrypted by the Master Key).
- To mount an offline brute-force attack against the encryption password, an attacker needs *both* (a) the EMK from the Denazen server and (b) the EVK plus Argon2 salt and parameters from the PDS. No single server, and no single breached operator, holds enough material to run the attack.
- Password changes rewrap the Master Key with a new PDK but leave the Vault Key (and therefore all per-record encryption) untouched — no re-encryption storm.

### 3.2 Content and exchange keys

| Key | Lifetime | Purpose | Wrapped by |
|-----|----------|---------|------------|
| Shared secret (ML-KEM-1024) | Ephemeral | Wrap the messaging key during key exchange only | n/a — derived once by encapsulate/decapsulate |
| Messaging key (AES-256) | Per contact, long-lived | Encrypt DMs, circle-key shares, friend-key payloads | Shared secret (during exchange); vault key (at rest) |
| Circle key (AES-256) | Per circle, long-lived | Wrap per-post content keys | Messaging key (when shared); vault key (at rest) |
| Content key (AES-256) | One per post | Encrypt the `.zen` file attachments of a single post | Circle key |

Rules enforced throughout the codebase:

- Shared secrets are never used to encrypt content — only to wrap the messaging key.
- Circle keys are never sent unwrapped; they are always delivered inside a messaging-key-encrypted payload.
- The Vault Key never leaves the device in plaintext; only the PDK-wrapped form (EMK) reaches the server.

---

## 4. Unlock flow

```
"Continue with Bluesky" → in-app browser sheet → bsky.social hosted login.
   ▼ (user authenticates with Bluesky on Bluesky's hosted page)
OAuth callback returns DPoP-bound access + refresh tokens.
   ▼
User submits encryption password.
   ▼
Derive PDK = Argon2id(encryption_password, salt).
   ▼
Fetch EMK from Denazen server.
   ▼
Master Key = decrypt(EMK, PDK, XSalsa20-Poly1305).
   MAC failure → "wrong encryption password" (not "no account").
   ▼
Fetch EVK from PDS.
   ▼
Vault Key = decrypt(EVK, Master Key).
   ▼
Store {PDK, Master, Vault} in secure device storage for session.
```

The Bluesky leg of authentication runs on Bluesky's hosted page (`bsky.social`) inside an OS-managed in-app browser sheet (`ASWebAuthenticationSession` on iOS, Custom Tabs on Android). Bluesky handles handle / email entry, password (or passkey) input, 2FA, captcha, and email confirmation — Denazen never sees the user's Bluesky credentials. The OAuth flow returns an access token bound to a per-session DPoP keypair (RFC 9449); the keypair is generated on device, persisted non-extractably in iOS Keychain / Android Keystore, and used to sign every PDS request. Token refresh is handled transparently by `@atproto/oauth-client-expo` with no visible re-prompt.

**First-time setup** is fail-closed in three phases:

1. Generate Master Key, Vault Key, EMK, and EVK in memory — no network I/O yet.
2. Single server call creates the profile and stores the EMK atomically. On failure: nothing has been written to the PDS, so retry regenerates cleanly.
3. PDS write: store EVK and Argon2 parameters in the security record. On failure: the only orphan is the EMK on the server, which a clean retry replaces.

At no step is a plaintext key transmitted anywhere.

### 4.1 Encryption password strength

Every cryptographic guarantee in this document ultimately bottoms out on the entropy of the user's encryption password. Argon2id's memory-hardness makes each brute-force guess expensive — even for a quantum adversary, because coherent quantum memory is catastrophically costly — but it cannot create entropy the password itself does not contain.

#### The policy enforced by the app

- **Minimum length:** 12 characters. This is the only hard requirement for submission.
- **No maximum length.** Passphrases are welcome.
- **Independent of the Bluesky password.** Bluesky credentials are entered on Bluesky's hosted login page during the OAuth flow and never touch Denazen's process; there is no opportunity for the encryption password to be cross-leaked through Denazen even if the user picks identical strings. (A user is still strongly encouraged to pick distinct, high-entropy passwords for the two systems.)

#### The real-time strength meter

As the user types, the password field shows a color-coded meter that estimates entropy in bits and categorises it into one of six tiers:

| Tier | Entropy | Meaning |
|------|---------|---------|
| Very weak | < 50 bits | Dictionary-attack trivial |
| Weak | 50–79 bits | Unsafe against a determined attacker |
| Fair | 80–99 bits | Adequate against casual offline attack |
| Strong | 100–127 bits | Classically safe |
| Very strong | 128–159 bits | Classically excellent |
| **Post-quantum safe** | **≥ 160 bits** | **Clears the NIST Level 5 post-quantum floor** |

The meter uses red / orange / yellow for the lower tiers, green for Strong and Very strong, and the brand purple with a shield-checkmark icon for the Post-quantum safe tier.

#### Reaching the post-quantum tier

160 bits of entropy credits Argon2id's cost factor and memory-hardness penalty against Grover's algorithm, yielding an effective post-quantum work factor that clears the NIST Level 5 floor (≥ 2^128 effective work). Attainable with:

- ~27 random alphanumeric characters, or
- ~25 random all-printable characters, or
- A 13-word EFF diceware passphrase (strongly encouraged — passphrases carry full random entropy by construction, where human-selected character passwords typically do not).

#### What post-quantum means for your password

The post-quantum claims elsewhere in this whitepaper apply to the system as deployed with a password that reaches the Post-quantum safe tier. A shorter or lower-entropy password remains protected classically by Argon2id's memory-hardness — offline brute force against a well-chosen 12-character password is still expensive — but its margin against a future quantum adversary shrinks with its entropy. Users who want the strongest guarantee the architecture offers should aim for the top tier.

#### Argon2id parameters

Argon2id memory, iteration, and parallelism parameters are tuned to the minimum-supported mobile hardware and are sized to preserve the entropy bounds above. Final shipping values will be published here once the public build is frozen.

### 4.2 Recovery & account lifecycle

**Denazen does not offer password recovery.** If a user loses their encryption password, their private content becomes permanently inaccessible:

- The PDK cannot be re-derived from a forgotten password.
- The EMK on Denazen's server remains ciphertext nobody can unlock.
- The EVK on the user's PDS remains ciphertext nobody can unlock.
- All private material — past posts, DMs received, circle memberships — is lost to the account.

This is intrinsic to the zero-trust design. If a server-side recovery path existed, the server could use it. The "no plaintext ever touches a server" guarantee requires that no party other than the user hold material capable of unlocking the vault.

Public posts (the Bluesky layer) are unaffected: they live under the AT Protocol identity, which the user can continue to access via Bluesky's own clients and account-recovery flows. Denazen's vault loss does not touch the Bluesky account.

### 4.3 Devices

Denazen is multi-device by design. An account is not bound to a specific phone or a key blob that must be synced between devices; it is bound to a cryptographic identity whose at-rest material lives on public infrastructure:

- The **EMK** (encrypted Master Key) lives on Denazen's server, addressable by the user's DID.
- The **EVK** (encrypted Vault Key) lives on the user's Bluesky PDS under the security record.
- All long-lived symmetric keys — messaging keys, circle keys, friend keys, Kyber secret key — live on the PDS as encrypted records wrapped under the Vault Key.

A new device unlocks the account by completing two flows:

1. **Bluesky OAuth** on Bluesky's hosted login page — handle, password (or passkey), 2FA, and any other credential are entered on `bsky.social` itself. Denazen receives only an OAuth-issued access token bound to a per-session DPoP keypair.
2. **Encryption password** — to derive the PDK, unlock the EMK, then the EVK, then every per-record key in the vault.

There is no device-to-device sync protocol, no paired-device registration, and no long-lived session that needs to migrate. Sign in on any device, unlock the vault, and every key ever received is available from the PDS.

Signing out clears the PDK, Master Key, and Vault Key from the device, revokes the OAuth tokens server-side, and wipes the OAuth library's local key + token store. Nothing on the device can decrypt content until the next sign-in.

### 4.4 What persists on the device between launches

Denazen keeps no Bluesky password and no encryption password on the device. After successful unlock, the device's secure storage (iOS Keychain / Android Keystore) holds:

- The **derived vault keys** — PDK, Master Key, Vault Key — read at app launch so the user is not re-prompted for the encryption password on every cold start.
- The **OAuth library's session material** — the DPoP keypair (non-extractable, generated and held in the secure element), the refresh token, and the most recent DPoP-Nonce. These are managed entirely by `@atproto/oauth-client-expo` and refreshed transparently on each PDS request.

The encryption password itself is held only in process memory long enough to derive the PDK, then dropped. The Bluesky password is never on the device at all — it is entered on Bluesky's hosted page and exchanged for an OAuth session that Bluesky issues directly to the OAuth library.

What this means at each device-state boundary:

- **App close (no explicit sign-out).** Vault keys persist in secure storage; OAuth tokens persist in the library's MMKV-backed store. Next launch silently restores both — no prompts.
- **Token expiry.** The OAuth library refreshes the access token on its next outbound call. No user-visible re-prompt; no Bluesky-side re-auth.
- **Explicit sign-out.** Cached vault keys are wiped from secure storage; OAuth tokens are revoked server-side and the library's local store is cleared. Next launch requires the full Bluesky OAuth + encryption-password flow.
- **Compromised, unlocked device.** The vault keys and the OAuth refresh token are hardware-protected at the Keychain / Keystore class. Extracting them requires a compromised OS. The encryption password itself is not stored, so it cannot be extracted from the device — only attacked offline against the EMK + EVK pair, which requires breaching both Denazen's server and the user's PDS (§3.1).
- **Rooted / jailbroken device.** SecureStore's guarantees are weaker on a compromised OS. Vault keys remain wrapped against the OS-level secure store; if that store is compromised the attacker has full access to the session.

The post-quantum and zero-trust claims throughout this document are about what servers hold, not about the device itself. A compromised device is explicitly out of scope (§1.3).

---

## 5. Posting: two-tier content encryption

Every encrypted post uses **two tiers** of keys so that compromising one post never exposes others.

```
           ┌──────────────────────────────┐
           │   Circle key (AES-256)       │  ── shared with circle members
           └──────────────┬───────────────┘
                          │ wraps
                          ▼
           ┌──────────────────────────────┐
           │ Content key (AES-256, random)│  ── one per post
           └──────────────┬───────────────┘
                          │ encrypts
                          ▼
  ┌──────────────┬────────────┬───────────────┐
  │ _text.zen    │ image_0.zen│ image_N.zen   │
  └──────────────┴────────────┴───────────────┘
```

### 5.1 Compose

1. User writes text and/or selects images.
2. App generates a fresh **content key** (32 random bytes, AES-256).
3. In parallel:
   - Encrypt post text with the content key → `_text.zen`.
   - For each image: resize, re-encode, then encrypt with the content key → `image_<i>.zen`.
4. Encrypt the content key itself with the selected **circle key** to produce a **content-key record** payload.

### 5.2 Publish

The post submit handler enforces the **privacy invariant** (see §9) with submit-time checks:

1. Write the content-key record to the author's PDS. Payload includes the encrypted content key and a reference to the circle key used. If this write fails, the post is **blocked** — never downgraded to plaintext.
2. Upload all `.zen` blobs to the PDS. These are opaque binary blobs to Bluesky; the AppView indexes them only as file attachments.
3. Publish the post record with:
   - Empty text (the real text lives in `_text.zen`).
   - A Denazen app marker.
   - An AT URI reference to the circle key used.
   - An AT URI reference to the content-key record.
   - Document embeds for the `.zen` files.
4. Patch the content-key record with the final post URI (bidirectional linkage for deletion cleanup).

### 5.3 `.zen` file format

```json
{
  "version": 1,
  "type": "encrypted-image" | "encrypted-text",
  "format": "jpg" | "txt",
  "iv": "<hex>",
  "data": "<base64 ciphertext>",
  "encryptedAt": "<iso>"
}
```

Ciphertext is AES-CBC with PKCS7. The IV is fresh random per file.

### 5.4 Private post index

For feed generation, Denazen's server maintains a **metadata-only index** consisting of `{post_uri, key_uri, author_did, indexed_at}`. A validation rule enforces that the key URI references the author's own repo, preventing feed poisoning. This index lets a circle member quickly enumerate posts encrypted for them without walking every contact's repo.

No post content, no key material, and no plaintext of any kind is stored in this index — only references that the member's client then uses to fetch and decrypt on-device.

### 5.5 Media sanitization

*Status: under active development.*

Encrypting an image does not by itself protect a user from metadata embedded inside the image — EXIF tags, GPS coordinates, camera serial numbers, and editing-software fingerprints travel inside the pixel file. A recipient who decrypts the image can extract them.

Denazen's target behavior is to strip all non-essential metadata from images before encryption, by default, with no user action required. The exact scrubbing policy — which tags are removed and which are preserved (e.g., orientation) — is under active design. Until this is shipped and documented here, users who care about image metadata should strip it on their own device before posting.

### 5.6 Deletion

*Status: partially implemented; full semantics under active design.*

Today, deleting a private post removes the post record, the content-key record, and the `.zen` attachments from the author's PDS, and removes the corresponding entry from the private-post index on Denazen's server.

The following aspects are still being specified:

- Whether recipient devices proactively purge their decryption caches on seeing a deletion event, versus deferred cleanup on next session.
- Direct-message deletion (sender-initiated and recipient-initiated), and what each guarantees.
- The exact ordering of deletion operations to ensure no observable orphans (a post record without its content-key record, or vice versa).

Once finalized, this section will state what deletion does guarantee and what it does not. Some limits are fundamental: a recipient's already-decrypted copy, a screenshot taken before deletion, and any off-device backup the recipient created are permanently outside Denazen's control.

---

## 6. Replies and quotes

**Replies** reuse the parent post's content key:

- If the parent is encrypted, the reply's `_text.zen` is encrypted with the **same content key** the parent used, and the reply's post record points its content-key reference at the parent's content-key record.
- This preserves access control: anyone with the parent's circle key automatically reads all replies without separate key exchange.
- When a reply is deleted, the content-key record is **not** deleted (the parent still uses it).

**Encrypted quotes** embed the quote reference *inside* the encrypted text:

```
User's message text
---QUOTE---
{"uri":"at://did:plc:xxx/app.bsky.feed.post/yyy","cid":"bafyrei..."}
```

No public quote embed is attached to the post record, so observers cannot see what is being quoted. After decryption, the client splits on `---QUOTE---` and fetches the referenced post.

---

## 7. Reading: decryption pipeline

```
Post with .zen files loads in feed
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
Cache data URI → render → clean up temp files
```

Key properties:

- **Plaintext never persists.** Decrypted data URIs live in component memory only; nothing is written to persistent storage outside ephemeral temp files that are deleted immediately after decryption.
- **Content keys are cached in-session** to avoid refetching on every image of a multi-image post. The cache is cleared on logout.
- **Strict two-tier discipline.** If the content-key record exists but fetch or decryption fails, decryption fails. The code never "falls back" to decrypting the `.zen` file directly with the circle key — that would produce garbage and mask real errors.

---

## 8. Key exchange and the encrypted inbox

### 8.1 ML-KEM-1024 exchange pattern

Every first contact (friend request) and every subsequent circle-key share follows the canonical pattern:

```
Sender                                Recipient
------                                ---------
Fetch recipient Kyber pubkey
  (from recipient's security record
   on their PDS)
ml_kem1024.encapsulate(pk)
  → (cipherText, sharedSecret)
Encrypt messaging_key with shared_secret
Optionally encrypt circle_key with shared_secret
Deliver {cipherText, encrypted payload}
                                      ml_kem1024.decapsulate(cipherText, sk)
                                        → sharedSecret
                                      Decrypt messaging_key and circle_key
                                      Validate messaging_key
                                      Store keys under the vault
```

The shared secret is **used once and discarded.** All future communication with that contact uses the now-established messaging key.

### 8.2 The encrypted inbox

Friend requests, key shares, and acceptances flow through a **metadata-minimal inbox** rather than through the sender's public PDS. The inbox is designed so that a full server breach reveals essentially nothing about the social graph.

Each inbox row contains:

| Field | Visibility | Content |
|-------|-----------|---------|
| Message ID | Server | Random identifier |
| Owner | Server | Recipient's account ID (required for delivery) |
| Read flag | Server | Boolean |
| Priority | Server | Client-set routing hint |
| **Encrypted payload** | **Opaque** | ML-KEM ciphertext + authenticated-encryption blob |
| Encryption info | Server | Algorithm tag (e.g. `ml-kem-1024+xsalsa20`) |
| Sender token hash | Server | SHA-256 of a sender-only random token (for deletion only) |
| Timestamps | Server | Created and expires (bounded TTL) |

The server **does not know**:

- Who sent the message. There is no sender column — only a hash of a random sender token.
- What type of message it is. The type discriminator is *inside* the encrypted payload.
- What the content is. It is encrypted under a shared secret derived from the recipient's Kyber key.
- Whether two inbox rows are related. There is no thread or conversation identifier on the server.

### 8.3 Authenticated write gateway

All inbox writes go through a single server-side gateway that performs **PDS session verification via DPoP relay** (RFC 9449):

1. The client sends three headers per request: the OAuth-issued access token, a freshly-minted DPoP proof JWT bound to the upstream PDS request, and the URL of the user's PDS.
2. The gateway forwards the access token + DPoP proof to the user's PDS at `com.atproto.server.getSession`. The PDS validates the proof against the access token's `cnf.jkt` claim — confirming that whoever sent the request holds the DPoP key the token was issued for — and returns the session DID.
3. The gateway **independently resolves** the returned DID to its canonical PDS service endpoint via `plc.directory` (for `did:plc:` identifiers) or `https://<host>/.well-known/did.json` (for `did:web:` identifiers).
4. The gateway asserts that the canonical PDS matches the URL the client submitted. This binding check is the load-bearing mitigation against a malicious PDS returning arbitrary DIDs from `getSession`; without it, anyone running a PDS could impersonate any user.
5. Writes are attributed to this verified DID — never to a client claim.

DPoP-bound tokens defeat replay: the server-side gateway tracks the proof's `jti` (JWT ID) in an in-memory cache for the proof's TTL window and rejects any duplicate. A captured request cannot be replayed even within the access token's validity period.

The gateway also handles the DPoP-Nonce challenge: when the PDS responds with `401 use_dpop_nonce`, the gateway propagates the fresh nonce back to the client in a `DPoP-Nonce` response header so the client can rebuild its proof and retry transparently (the standard RFC 9449 §8 single-shot retry).

### 8.4 Confirmed-sender authentication

Before the recipient's client accepts a friend request or key share, it verifies that the inbox payload's claimed sender corresponds to a public-key binding the recipient has seen before (TOFU) or has out-of-band verified. Combined with §8.5, this prevents a compromised PDS from silently substituting a contact's public key and impersonating them.

Repeat contacts additionally carry a **TOFU pubkey fingerprint** on the local messaging-key record so key substitution between sessions is detectable.

### 8.5 Out-of-band key verification (opt-in)

At first contact, users **may opt in** to confirm a contact's ML-KEM-1024 public key by comparing safety numbers or scanning a QR code. This is the first-contact equivalent of the TOFU fingerprint in §8.4 and closes the residual MITM window against a PDS operator who might try to substitute a public key before TOFU has a chance to bind.

This follows the same posture as Signal's safety numbers: the verification mechanism is always available, but is not required to establish a connection. The default path binds a contact's public key on first use (TOFU); users with higher threat models can additionally perform an out-of-band check before the binding is trusted. Substitution of an already-verified key is detected on subsequent exchanges regardless of whether the initial binding was out-of-band confirmed or TOFU-accepted.

### 8.6 Sender-side deletion tokens

When sending, the client:

1. Generates 32 random bytes (the raw sender token).
2. Sends only the SHA-256 hash of the token to the server.
3. Stores the raw token locally.

To delete a sent message (e.g. after the recipient rejects it), the client presents the raw token; the server re-hashes and deletes only if the hashes match. The server learns nothing about the sender from the hash and cannot forge deletions.

### 8.7 Push notifications

*Status: not yet implemented.*

Denazen does not currently deliver push notifications via Apple APNs or Google FCM. The posture for push — whether payloads will be opaque wake-up signals, contain encrypted content that an on-device notification-service extension decrypts locally, or include readable previews — is still being designed.

Push notifications are a well-known metadata surface for end-to-end encrypted applications: Apple and Google can observe the timing and addressing of every notification, along with any readable payload. When push ships on Denazen, this section will state explicitly what APNs and FCM can observe.

---

## 9. The privacy invariant

Denazen operates under a single, non-negotiable invariant:

> **A user who intends to create a private post MUST NEVER produce a public one — under any circumstance.**

This is implemented as a fail-closed discriminated union enforced at submit time:

```ts
type ComposeState =
  | { mode: 'public' /* ... */ }
  | { mode: 'private', keyId: string, encryptionReady: true, /* ... */ }
```

The submit handler:

1. **Snapshots** all encryption parameters into immutable local constants before any async work.
2. Validates the snapshot: if the mode is `'private'` and any of the required parameters is missing, **throws and blocks** submission.
3. Passes the snapshot — never live UI state — into the background upload pipeline.

The post-creation service independently validates: if any encryption parameter is present, *all* must be, or it throws. There is no code path that "recovers" by sending a plaintext post, no null-coalescing to public, and no retry that silently downgrades privacy.

The same fail-closed discipline extends to:

- Circle-key shares (never sent unwrapped).
- Messaging keys in friend requests (must be encrypted under the Kyber-derived shared secret).
- Rotation events (rotated keys are re-sent only to retained members, wrapped under their messaging keys).
- Circle member list integrity (the shared-with list is updated *before* a key is transmitted; if that write fails, the key is not sent).

---

## 10. Rotation

### 10.1 Messaging-key rotation

A user may rotate the messaging key they share with any contact:

1. Generate a new AES-256 messaging key.
2. Send it to the contact via the inbox, encrypted with the *current* messaging key.
3. Store the new key as "pending" on the sender side; wait for a confirmation message indicating the recipient has stored it.
4. On confirmation, promote the new key to default and deactivate the old one.

Old keys remain available for decrypting past messages but are never used to encrypt new ones.

### 10.2 Circle-key rotation

When a user removes a member from a circle, they **rotate the circle key**:

1. Generate a new circle key.
2. Update the shared-with list (removing the unshared member) *before* any key distribution.
3. Re-share the new circle key with each retained member via inbox, wrapped under that member's messaging key.
4. Send a rotate-out notice to the removed member, whose client deletes the old key on receipt.
5. Future posts use the new key; prior posts remain readable by whoever had the old key at the time they were posted.

This is intentionally **not forward-secret for prior posts** — historical content stays decryptable by the members who legitimately had access when it was written.

### 10.3 Kyber key rotation

Users can rotate their ML-KEM-1024 key pair from Settings. The new public key is written to the user's security record; the old security record is automatically backed up. Contacts who previously performed a key exchange will need to re-exchange, and out-of-band verification (§8.5) confirms the new key.

---

## 11. Storage boundaries

| Store | What's stored | What's NEVER stored |
|-------|---------------|---------------------|
| Bluesky PDS | Ciphertext `.zen` blobs, encrypted key records, EVK, Kyber public key | Plaintext content, plaintext keys, encryption password |
| Bluesky AppView / Relay | Post metadata, follow graph | Content, keys |
| Denazen server | Profile rows (DID + EMK), post-index metadata, inbox rows (opaque ciphertext), invites | Plaintext content, plaintext keys, passwords, vault keys |
| Server-side gateway (in transit) | OAuth-issued access token + per-request DPoP proof (transient, for PDS verification) | Long-lived secrets, content, keys, encryption password, DPoP private key |
| Device secure storage | PDK, Master Key, Vault Key, per-account sessions, OAuth refresh token, OAuth DPoP keypair (non-extractable, secure-element-backed) | Bluesky password, encryption password (— this is the trust root) |
| Device general storage | Encrypted key cache files (ciphertext only), preferences | Plaintext keys, plaintext content |

---

## 12. Telemetry and privacy

Telemetry is anonymous by construction:

- No user identification — no `identify()` or profile linking.
- Property names that could carry user-identifiable data are listed in an allowlist; a final filter drops them as a last line of defense.
- Error strings are mapped to a bounded vocabulary at the call site — raw error messages or API response bodies are never captured.
- Session replay is off. Screen-name and touch autocapture are off. GeoIP is disabled.

---

## 13. Abuse and moderation

*Status: pre-policy.*

End-to-end encryption on the private layer means Denazen cannot observe the contents of private posts, DMs, or circle-key payloads. A moderation model for private content therefore must rest on explicit user action: a recipient reports an incident, at which point their client uploads the decrypted message and the sender's identity for review.

The specific moderation policy — workflow, standards applied, coordination with Bluesky moderation for public content, and escalation paths for CSAM and other illegal material — is being written. Until the policy is published, the current behavior is:

- Public-layer abuse follows Bluesky's existing moderation rails.
- Private-layer abuse is addressed by the tools users already have: remove the member from the Circle, block the contact (which revokes key exchange), and report via out-of-band channels.

This section will be expanded when the written policy is available.

---

## 14. Legal process response

*Status: pre-policy.*

Denazen's zero-trust design dictates what Denazen cannot produce under lawful compulsion, because Denazen never held the material:

- No plaintext private content (posts, DMs, images).
- No decryption keys of any kind — vault, messaging, circle, content, or Kyber secret.
- No encryption password.
- No mapping from a user's DID to legal identity beyond what the user has voluntarily associated with the account.

What Denazen does hold, and could therefore be compelled to produce:

- The user's DID and handle.
- The EMK — an opaque ciphertext that cannot be unwrapped without the user's encryption password.
- Private-post index rows: post URI, key URI, author DID, timestamps.
- Inbox rows: opaque encrypted payloads, timestamps, and sender token hashes.
- Operational metadata and request timing.

A formal law-enforcement guidelines document and a transparency-report cadence are under development.

---

## 15. Audit and responsible disclosure

### Third-party audit

Individual cryptographic primitives used in Denazen have been independently audited — notably `@noble/post-quantum` (ML-KEM) by Cure53. The Denazen system as a whole — the vault hierarchy, the posting and inbox protocols, the privacy invariant, and the client implementations — has not yet been independently audited. A system-level audit is a priority for a near-term release; results will be published here when available.

### Reporting a vulnerability

Security researchers who identify an issue can report it to **security@denazen.com**. We aim to acknowledge reports within 72 hours and will coordinate on disclosure timing. Machine-readable contact and policy information is published at `/.well-known/security.txt` per RFC 9116.

### Bug bounty

No formal bug-bounty program is active at this time. We acknowledge valuable reports in release notes and on this page.

---

## 16. Future work

Three items are explicitly scoped *out* of the current release and named here rather than left implicit:

- **Key transparency.** The industry direction is an append-only public log of post-quantum public keys, letting any user verify that the key Denazen's server attributes to a contact matches what that contact actually published. Denazen ships with TOFU plus opt-in out-of-band verification (§8.4, §8.5) — strong but not equivalent to a transparency log. A future release will add one.
- **Reproducible builds and binary attestation.** The open-source codebase is verifiable; the compiled mobile and web binaries are not yet byte-for-byte reproducible from source. Shipping reproducible builds — and, on supported platforms, code-transparency attestations — is planned.
- **Formal post-quantum migration protocol.** The `.zen` format carries a `version` field (§5.3), and clients negotiate on it: newer clients read older versions, older clients surface an "update required" placeholder for newer ones. A documented rekey-window protocol for moving circle keys and messaging keys across a primitive change is not yet specified; it will be added before the first primitive rotation.

---

## 17. Verification story

The claim "no server can decrypt" rests on the following testable facts, each verifiable from the codebase:

1. **No plaintext key ever crosses a network boundary.** The Vault Key is generated on device; it leaves only as the EVK (wrapped under the Master Key) to the PDS and never reaches Denazen's server. The Master Key leaves only as the EMK (wrapped under the PDK) to the Denazen server.
2. **No plaintext content ever crosses a network boundary.** Posts are encrypted on device before any upload; `.zen` blobs are opaque to Bluesky; direct messages and inbox messages are sealed under the recipient's Kyber key.
3. **Server-side gateways see no secrets.** The write gateway handles OAuth access tokens and DPoP proofs only long enough to relay the PDS verification call. It never holds the DPoP private key (which lives in the user's secure element) and never touches vault, messaging, or circle keys.
4. **Fail-closed discipline.** The privacy invariant (§9) makes it structurally impossible for a private-intended post to become public without an explicit code change.
5. **Vendored crypto libraries.** All cryptographic primitives are either pinned or copied into the repository; library updates require a deliberate change.
6. **Independent key-at-rest layer.** The vault hierarchy (§3) means compromising any single server (Bluesky *or* Denazen) does not yield an offline brute-force target — an attacker needs material from both.

---

## 18. Summary

- **Four-tier vault** (password → PDK → Master Key → Vault Key) splits key-at-rest material across two servers so no single breach enables offline attack.
- **Two-tier content encryption** (circle key → content key → `.zen` files) isolates the blast radius of any single compromised post to itself.
- **Post-quantum key exchange** (ML-KEM-1024, NIST Level 5) protects all first-contact handshakes against future quantum adversaries.
- **256-bit symmetric keys everywhere** — content keys, circle keys, messaging keys, and vault keys all use 256-bit keys, maintaining a ≥ 2^128 post-quantum security floor at every symmetric layer.
- **Metadata-minimal inbox** hides sender identity, message type, and relationships from the server that stores it.
- **PDS session verification** at the single write gateway ensures callers are who they claim to be before any server-side mutation.
- **Confirmed-sender authentication** and **out-of-band key verification** close the first-contact MITM window against a compromised PDS.
- **Fail-closed privacy invariant** prevents silent downgrade from private to public at every layer.
- **No plaintext ever touches a server.** The only trust root is the user's device plus a password that no Denazen server has ever seen.

Even a fully compromised Bluesky PDS and a fully compromised Denazen server cannot, individually or together, read a single word of a user's private content — today or in a post-quantum future, given a compliant encryption password.

---

## Appendix A. Glossary

Standard AT Protocol and cryptography abbreviations used throughout this whitepaper.

| Term | Definition |
|------|------------|
| **AEAD** | Authenticated Encryption with Associated Data. An encryption scheme providing confidentiality and integrity in one operation. XSalsa20-Poly1305 is AEAD. |
| **AppView** | In AT Protocol, a service that indexes records from PDSes to serve queries (timelines, search, notifications). The Bluesky AppView is run by Bluesky Social. |
| **Argon2id** | Memory-hard password-hashing function. Winner of the 2015 Password Hashing Competition. |
| **CSPRNG** | Cryptographically Secure Pseudorandom Number Generator. |
| **DID** | Decentralized Identifier. In AT Protocol, a long-lived, repository-rooted identity string (e.g., `did:plc:xxxxxx`). |
| **E2EE** | End-to-end encrypted. |
| **EMK** | Encrypted Master Key — the Master Key wrapped under the PDK, stored on Denazen's server. |
| **EVK** | Encrypted Vault Key — the Vault Key wrapped under the Master Key, stored on the user's PDS. |
| **KEM** | Key Encapsulation Mechanism. Produces a shared secret plus a ciphertext that only the holder of the matching private key can decapsulate. ML-KEM is a KEM. |
| **MAC** | Message Authentication Code. Confirms integrity and authenticity under a symmetric key. |
| **ML-KEM** | Module-Lattice-based Key Encapsulation Mechanism — a NIST standard (FIPS 203) derived from Kyber. ML-KEM-1024 is the Level-5 (highest) parameter set. |
| **NIST Level 5** | NIST's highest post-quantum security category — at least 256-bit classical-equivalent security against a quantum adversary. |
| **PDK** | Password-Derived Key — a 32-byte key derived from the encryption password via Argon2id. |
| **PDS** | Personal Data Server. In AT Protocol, the per-user repository server that holds a user's records. |
| **PKCS7** | Padding scheme for block ciphers such as AES-CBC. |
| **Relay** | In AT Protocol, a firehose service that aggregates and streams records from all PDSes. |
| **TOFU** | Trust-On-First-Use. A key-binding model where the first key seen for a contact is trusted, with substitution detected on subsequent exchanges. |
| **XSalsa20-Poly1305** | libsodium's default AEAD construction — extended-nonce Salsa20 stream cipher with a Poly1305 MAC. |
