# Denazen Encryption Architecture

A technical whitepaper describing the end-to-end encryption model used by Denazen, a privacy-focused Bluesky client. This document is written for a technical audience — security engineers, cryptographers, and developers evaluating Denazen's privacy guarantees.

Denazen targets a **zero-trust content model**: no server, infrastructure provider, or Denazen developer can read plaintext content or key material, and no network attacker — including a compromised Personal Data Server (PDS) — can substitute keys undetected.

Three properties underpin this guarantee:

1. **Separate encryption password.** The vault key hierarchy is derived from an encryption password that is never sent to Bluesky or any other server.
2. **Trust-On-First-Use (TOFU) key binding.** A contact's post-quantum public key is fingerprinted and bound on the first exchange. All subsequent exchanges are checked against the bound fingerprint; a PDS operator who later substitutes the key is detected. First-contact verification via safety numbers / QR code is planned to close the residual first-exchange window — see the Future Work section.
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
- **IP addresses and network-level metadata are visible.** Clients talk directly to Denazen's server and to Bluesky PDSes over TLS; no onion routing, proxy, or sealed-transport layer is applied. Anyone with network-layer visibility sees that a given IP is talking to Denazen, even if they cannot see what is being said. Users who require network-level anonymity should route their traffic through a separate anonymity layer.

### 1.4 What zero-trust covers — and what it does not

Denazen's "zero-trust content model" is a precise, auditable claim. It is not a claim that nothing is trusted. This subsection states exactly what the claim covers and what it does not, so reviewers can evaluate it against a concrete scope.

**What IS zero-trust**

- **Content confidentiality.** No server — Bluesky PDS, Denazen relay, Denazen edge function — can read a private post, a DM, or a circle-key share. The ciphertext is opaque at rest and in transit; decryption material lives only on the devices of chosen recipients.
- **Key-material confidentiality.** The Vault Key never leaves the device in plaintext. The Master Key reaches Denazen's server only as the EMK (PDK-wrapped). Long-lived symmetric keys — messaging, circle, content, Kyber secret — are wrapped at rest and encrypted under ephemeral shared secrets in transit. No server holds, or can derive, plaintext key material.
- **MITM resistance (with out-of-band verification, planned).** Trust-On-First-Use binds a contact's ML-KEM-1024 public key on the first exchange and detects any subsequent substitution. When out-of-band verification ships (see Future work), the residual first-contact window closes and a compromised PDS cannot substitute a contact's public key undetected.
- **The fail-closed privacy invariant (§9).** A user who intends to create a private post cannot silently produce a public one. This is enforced as a structural property of the client, not a policy.
- **Forged-acceptance rejection.** A sender-side check validates that incoming acceptances correspond to outgoing requests the user actually sent, so an attacker cannot inject a forged "acceptance from Bob" that Alice never solicited.

**What is NOT zero-trust**

- **Metadata and timing.** Bluesky's AppView and Relay see post counts, timestamps, follow graphs, and public post content. The inbox obscures sender identity and message type but not per-user activity timing or message counts.
- **Availability.** Denazen's servers and Bluesky's infrastructure must be up for the service to be usable. A malicious operator can deny service; they just cannot read private content.
- **Bluesky-layer plaintext posts.** Public posts (`app.bsky.feed.post` records without the Denazen encryption marker) are plaintext on Bluesky's infrastructure by design — that's what makes them public. Their integrity is whatever Bluesky provides.
- **First-contact exchanges before out-of-band verification ships.** TOFU detects any key substitution after first contact, but not during it. A PDS operator who substitutes a contact's key *before* the first binding can inject themselves; detection requires the OOB verification feature (see Future work).
- **User-chosen password equivalence.** Every cryptographic guarantee bottoms out on the entropy of the encryption password (§4.1). A user who picks a low-entropy password accepts a weaker margin against offline attack. The architecture provides tools; it cannot enforce good password choices beyond the 12-character minimum.

**What this means for the trust-root picture**

The zero-trust content model collapses the set of parties that must be trusted for confidentiality to:

1. **The user's device.** Platform secure storage (iOS Keychain / Android Keystore) holds session-unlocked keys; a compromised device is explicitly out of scope (§1.3).
2. **The user's encryption password.** Never transmitted. Entropy determines the margin against offline attack (§4.1).
3. **(Once out-of-band verification ships)** The user's own out-of-band attestation of contact fingerprints — a second channel that doesn't pass through Denazen's or Bluesky's infrastructure.

Neither the Bluesky PDS, nor Denazen's relay, nor any third-party operator appears in this list. That is what "zero-trust" means here, and that is its precise scope.

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

#### The policy enforced by the app

- **Minimum length:** 12 characters. This is the only hard requirement for submission.
- **No maximum length.** Passphrases are welcome.
- **Must differ from the Bluesky password.** A minimum Levenshtein edit distance is enforced to prevent a PDS operator who captures the Bluesky password from trivially reusing it against captured Argon2id material.

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

Public posts (the Bluesky layer) are unaffected: they live under the AT Protocol identity, which is re-derivable from the handle and Bluesky password.

### 4.3 Devices

Denazen is multi-device by design. An account is not bound to a specific phone or a key blob that must be synced between devices; it is bound to a cryptographic identity whose at-rest material lives on public infrastructure:

- The **EMK** (encrypted Master Key) lives on Denazen's server, addressable by the user's DID.
- The **EVK** (encrypted Vault Key) lives on the user's Bluesky PDS under the security record.
- All long-lived symmetric keys — messaging keys, circle keys, friend keys, Kyber secret key — live on the PDS as encrypted records wrapped under the Vault Key.

A new device unlocks the account by presenting three credentials:

1. **AT Protocol handle** — the account identity.
2. **Bluesky password** — to establish a PDS session and read the user's security record.
3. **Encryption password** — to derive the PDK, unlock the EMK, then the EVK, then every per-record key in the vault.

There is no device-to-device sync protocol, no paired-device registration, and no long-lived session on specific hardware. Sign in on any device, unlock, and every key ever received is available from the vault.

Sessions live in secure device storage only for the duration of use. Signing out clears the PDK, Master Key, and Vault Key from the device, leaving nothing that can decrypt content until the next sign-in.

### 4.4 Auto-re-login and the encryption password at rest

By default, Denazen stores the encryption password alongside the Bluesky password in the device's secure storage (iOS Keychain / Android Keystore) so the app can silently re-authenticate when session tokens expire — users who open the app daily would otherwise be prompted to re-enter both passwords on every expiry. This is controlled by a user-facing setting (**"Keep me signed in"**), on by default; turning it off requires re-entering the encryption password on every launch.

A deliberate UX / threat-model tradeoff lives here:

- **What the server sees:** still nothing. The encryption password never leaves the device. The "no plaintext ever touches a server" guarantee is unaffected.
- **What an attacker with an unlocked, malware-resistant device sees:** the password is hardware-protected (Keychain / Keystore class) — the same class of protection the Vault Key itself enjoys. Extracting it requires a compromised OS.
- **What an attacker with a rooted / jailbroken device sees:** an opportunity. SecureStore's guarantees are weaker on a compromised OS. A user who cares about this threat should turn off "Keep me signed in."
- **What explicit sign-out does:** clears the cached password, the PDK, the Master Key, and the Vault Key from the device. App-close (without explicit sign-out) does not — the password persists so the next launch can re-derive.

The post-quantum and zero-trust claims throughout this whitepaper are about what servers hold, not about the device itself. A compromised device is explicitly out of scope (§1.3). "Keep me signed in" is the knob users can turn if their device-level threat model is stricter than the default.

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

Encrypting an image does not by itself protect a user from metadata embedded inside the image — EXIF tags, GPS coordinates, camera serial numbers, and editing-software fingerprints travel inside the pixel file. A recipient who decrypts the image would otherwise be able to extract them.

Denazen strips all non-structural JPEG metadata from every image before it leaves the device. Two independent layers run in sequence:

1. The platform's native image library (`ImageManipulator`) re-encodes the image as JPEG with the user's target dimensions and quality. Re-encoding through the iOS / Android native image pipelines typically strips EXIF on its own.
2. An in-app byte-level stripper walks the JPEG segment structure and removes APP1–APP15 marker segments (EXIF, XMP, ICC profiles, Photoshop resources, thumbnails, GPS, camera info) and COM (comment) segments. The JFIF header (APP0) and all structural markers (SOF / DQT / DHT / SOS etc.) are preserved. Pixel orientation is baked into the image data by step 1, so no orientation tag is needed.

The second layer runs for **both public and encrypted posts** — encrypted images are stripped before encryption, so the recipient who decrypts the image cannot see the sender's GPS coordinates, device model, or capture timestamp either.

This is a fail-safe design: if the stripper is ever bypassed (e.g. a future code path skips the helper), the preceding native re-encode still removes most metadata. If the native re-encode ever stops stripping (e.g. a library behavior change), the explicit byte-level stripper still catches it.

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
- **Content keys are cached in-session** to avoid refetching on every image of a multi-image post. Cached keys carry a 5-minute TTL, are proactively flushed when the app moves to the background, and are cleared entirely on logout.
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

The gateway also maintains a verified DID↔PDS binding — supporting both `did:plc` and `did:web` identifiers — and caches the mapping for the lifetime of the session. This prevents an attacker who controls a rogue PDS from claiming another user's DID mid-session.

### 8.4 Confirmed-sender authentication

When the recipient's client accepts a friend request or key share, it computes a fingerprint of the sender's ML-KEM-1024 public key and binds it to the local messaging-key record. All subsequent exchanges — DMs, key shares, rotation messages — are checked against the stored fingerprint. If the sender's public key later differs from the bound fingerprint, the message is rejected as a possible key substitution.

This is **Trust-On-First-Use**: the first key seen for a contact is trusted; substitution on any subsequent exchange is detected. TOFU does not defend against a PDS operator who substitutes a key *before* the first binding — that residual window is closed by out-of-band verification, which is planned (see Future work).

On the sender side, a separate check validates that incoming acceptances correspond to outgoing requests the user actually sent, so an attacker cannot inject a forged "acceptance from Bob" that Alice never solicited.

### 8.5 Sender-side deletion tokens

When sending, the client:

1. Generates 32 random bytes (the raw sender token).
2. Sends only the SHA-256 hash of the token to the server.
3. Stores the raw token locally.

To delete a sent message (e.g. after the recipient rejects it), the client presents the raw token; the server re-hashes and deletes only if the hashes match. The server learns nothing about the sender from the hash and cannot forge deletions.

### 8.6 Push notifications

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

Users can rotate their ML-KEM-1024 key pair from Settings. The new public key is written to the user's security record; the old security record is automatically backed up. Contacts who previously performed a key exchange will need to re-exchange, which triggers a new TOFU binding on their end (§8.4). Out-of-band verification of the new key is planned (see Future work) for users who want to confirm the rotation was not a PDS-operator substitution.

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
- **User-submitted in-app feedback** is scrubbed of DIDs, handles, and AT-Protocol URIs on-device before transmission to any third-party classification service.

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

Four items are explicitly scoped *out* of the current release and named here rather than left implicit:

- **Out-of-band contact verification.** Safety-number / QR-code UI for users to manually confirm a contact's ML-KEM-1024 public key before Trust-On-First-Use binds (§8.4). TOFU detects key substitution on any subsequent exchange; OOB verification closes the residual first-contact window against a PDS operator who might substitute a key before the first binding. Planned for a near-term release; mirrors Signal's safety-number model when it ships.
- **Key transparency.** The industry direction is an append-only public log of post-quantum public keys, letting any user verify that the key Denazen's server attributes to a contact matches what that contact actually published. Denazen ships with TOFU (§8.4) — strong but not equivalent to a transparency log. A future release will add one.
- **Reproducible builds and binary attestation.** The open-source codebase is verifiable; the compiled mobile and web binaries are not yet byte-for-byte reproducible from source. Shipping reproducible builds — and, on supported platforms, code-transparency attestations — is planned.
- **Formal post-quantum migration protocol.** The `.zen` format carries a `version` field (§5.3), and clients negotiate on it: newer clients read older versions, older clients surface an "update required" placeholder for newer ones. A documented rekey-window protocol for moving circle keys and messaging keys across a primitive change is not yet specified; it will be added before the first primitive rotation.

---

## 17. Verification story

The claim "no server can decrypt" rests on the following testable facts, each verifiable from the codebase:

1. **No plaintext key ever crosses a network boundary.** The Vault Key is generated on device; it leaves only as the EVK (wrapped under the Master Key) to the PDS and never reaches Denazen's server. The Master Key leaves only as the EMK (wrapped under the PDK) to the Denazen server.
2. **No plaintext content ever crosses a network boundary.** Posts are encrypted on device before any upload; `.zen` blobs are opaque to Bluesky; direct messages and inbox messages are sealed under the recipient's Kyber key.
3. **Server-side gateways see no secrets.** The write gateway handles session tokens only long enough to call the PDS and has no access to vault, messaging, or circle keys.
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
- **Confirmed-sender authentication via TOFU fingerprinting** detects any post-first-contact key substitution by a compromised PDS. First-contact out-of-band verification is planned (see Future work).
- **Fail-closed privacy invariant** prevents silent downgrade from private to public at every layer.
- **No plaintext ever touches a server.** The only trust root for content confidentiality is the user's device, the user's encryption password, and (once OOB verification ships) the user's own out-of-band attestation of contact fingerprints. Neither the Bluesky PDS nor the Denazen server is trusted for confidentiality. See §1.4 for a precise statement of what "zero-trust" does and does not cover.

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
