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
| Compromised server-side gateway | Short-term access to requests | Sees transient Bluesky session tokens for identity verification only; no long-lived secrets |
| Denazen developer with database access | Metadata + server ciphertext | Cannot derive plaintext — same position as the server |
| Lost or stolen device (locked) | Physical access to device storage | Cannot read key material without device unlock + encryption password |
| Future quantum adversary | Shor's algorithm on classical key exchange; Grover's algorithm on symmetric keys | ML-KEM-1024 (NIST Level 5 post-quantum KEM) for all key exchange; AES-256 for all content and key-wrapping |

### 1.3 Non-goals / explicit limits

- **No perfect forward secrecy for long-lived keys.** Circle keys and messaging keys persist until rotated; compromise of a current messaging key exposes past messages encrypted with that key. Rotation is available but not automatic per-message.
- **No protection from a compromised device.** If an attacker has the device unlocked *and* the user's encryption password, they read everything. This is the standard baseline for end-to-end encrypted systems.
- **Metadata is partially visible.** Post counts, timing, and the Bluesky follow graph remain visible to Bluesky itself. The inbox (for direct messages and key shares) is designed to hide sender identity and message type from the server that stores it.

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
User submits Bluesky password → Bluesky session established.
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

**First-time setup** is fail-closed in three phases:

1. Generate Master Key, Vault Key, EMK, and EVK in memory — no network I/O yet.
2. Single server call creates the profile and stores the EMK atomically. On failure: nothing has been written to the PDS, so retry regenerates cleanly.
3. PDS write: store EVK and Argon2 parameters in the security record. On failure: the only orphan is the EMK on the server, which a clean retry replaces.

At no step is a plaintext key transmitted anywhere.

### 4.1 Encryption password strength

Every cryptographic guarantee in this document ultimately bottoms out on the entropy of the user's encryption password. Argon2id's memory-hardness makes each brute-force guess expensive — even for a quantum adversary, because coherent quantum memory is catastrophically costly — but it cannot create entropy the password itself does not contain.

Denazen enforces a minimum of **16 characters** or a **10-word diceware passphrase** (EFF large list). Both target ~160 bits of random entropy, which is the threshold at which an offline attack remains infeasible for a Grover-equipped adversary after Argon2id's cost factor and memory-hardness penalty are credited. This matches the NIST Level 5 post-quantum security floor (≥ 2^128 effective work).

Passphrase mode is strongly encouraged: a 10-word diceware passphrase carries full random entropy by construction, while human-selected character passwords typically do not. The password field shows real-time entropy feedback calibrated against the post-quantum target rather than the classical one.

The post-quantum claims throughout this whitepaper apply to the system as deployed with a compliant password. A weaker password remains protected classically by Argon2id's memory-hardness, but its margin against a future quantum adversary shrinks with its entropy.

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

All inbox writes go through a single server-side gateway that performs **PDS session verification**:

1. The client presents its Bluesky session credential along with the URL of its PDS.
2. The gateway calls the PDS to validate the credential.
3. The DID returned by the PDS — not a client claim — is used for all subsequent operations.
4. Writes are attributed to this verified DID.

This means a malicious client cannot impersonate another user when writing to the inbox.

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
| Server-side gateway (in transit) | Bluesky session credential (transient, for PDS verification) | Long-lived secrets, content, keys |
| Device secure storage | PDK, Master Key, Vault Key, per-account sessions | — (this is the trust root) |
| Device general storage | Encrypted key cache files (ciphertext only), preferences | Plaintext keys, plaintext content |

---

## 12. Telemetry and privacy

Telemetry is anonymous by construction:

- No user identification — no `identify()` or profile linking.
- Property names that could carry user-identifiable data are listed in an allowlist; a final filter drops them as a last line of defense.
- Error strings are mapped to a bounded vocabulary at the call site — raw error messages or API response bodies are never captured.
- Session replay is off. Screen-name and touch autocapture are off. GeoIP is disabled.

---

## 13. Verification story

The claim "no server can decrypt" rests on the following testable facts, each verifiable from the codebase:

1. **No plaintext key ever crosses a network boundary.** The Vault Key is generated on device; it leaves only as the EVK (wrapped under the Master Key) to the PDS and never reaches Denazen's server. The Master Key leaves only as the EMK (wrapped under the PDK) to the Denazen server.
2. **No plaintext content ever crosses a network boundary.** Posts are encrypted on device before any upload; `.zen` blobs are opaque to Bluesky; direct messages and inbox messages are sealed under the recipient's Kyber key.
3. **Server-side gateways see no secrets.** The write gateway handles session tokens only long enough to call the PDS and has no access to vault, messaging, or circle keys.
4. **Fail-closed discipline.** The privacy invariant (§9) makes it structurally impossible for a private-intended post to become public without an explicit code change.
5. **Vendored crypto libraries.** All cryptographic primitives are either pinned or copied into the repository; library updates require a deliberate change.
6. **Independent key-at-rest layer.** The vault hierarchy (§3) means compromising any single server (Bluesky *or* Denazen) does not yield an offline brute-force target — an attacker needs material from both.

---

## 14. Summary

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
