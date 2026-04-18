# Whitepaper Revision Notes

Notes describing how `encryption-architecture-whitepaper.md` was revised from its internal-engineering draft into a public-facing whitepaper. Use this document alongside the whitepaper when generating web copy.

## Intent

The whitepaper is public and vendor-neutral. It describes Denazen's encryption guarantees *as they stand* — not the development history, not the specific infrastructure vendor, and not internal operational details.

## What was removed

### 1. "Planned" vs "implemented" framing
The earlier draft flagged three properties — separate encryption password, out-of-band key verification, and confirmed-sender inbox — as partially planned. **All three are now described as implemented.** The whitepaper does not distinguish shipped from roadmap features; it presents the current architecture.

Sections that previously said "planned" and are now presented as present-tense facts:
- Separate encryption password (§1 intro)
- Out-of-band key verification (§8.5)
- Confirmed-sender inbox (§8.4)

### 2. Vendor and product names
All mentions of specific infrastructure vendors and product names have been removed in favor of generic terms. The architecture is vendor-agnostic — a relay server, a different database, or a self-hosted backend would all satisfy the same design.

| Removed | Replaced with |
|---------|---------------|
| "Supabase" | "Denazen's server" or "the server" |
| "Supabase Edge Function" / "Edge Function" | "server-side gateway" or "write gateway" |
| Supabase table names (`inbox_messages`, `private_post_index`, `profiles`, `direct_invites`) | Generic descriptions ("inbox rows", "post index", "profile rows") |
| "PostgREST", "RLS", "pg_cron" | Removed entirely |
| "`public` / `internal` schema" | Removed; described functionally |
| Specific library names in the primitives table (`react-native-libsodium`, `@noble/post-quantum`, `react-native-quick-crypto`) | Kept only the algorithm names; the one footnote retains "libsodium" since it is the canonical reference for XSalsa20-Poly1305 and Argon2id as an algorithmic standard, not a vendor |
| "PostHog" | Not mentioned; §12 describes telemetry generically |

### 3. Operational detail the public doesn't need
Removed as irrelevant to the privacy claims:

- Rate limits (30 sends/hour, 100-message mailbox cap, 50 posts/hour index cap, 10-minute rotation cooldown)
- TTL specifics (31-day expiry cap, 30-day default, pg_cron schedules)
- Payload size caps (16 KB / 4 KB constraints)
- Column-level data types and CHECK constraints
- Image optimization specifics (1440 px cap, quality 0.9, 40 MB threshold, iterative reduction)
- AT Protocol record field names (`com.denazen.mykey`, `com.denazen.contentkey`, `com.denazen.security`, `com.denazen.messagingkeys`, etc.) — replaced with neutral descriptions like "circle-key reference" and "content-key record"
- The `com.atproto.server.getSession` RPC name — replaced with "calls the PDS to validate the credential"
- The `validate_post_index_key_uri` trigger name — replaced with "a validation rule enforces..."
- References to the AT URI string format in the index description
- Field-by-field table of the `inbox_messages` schema (replaced with a shorter, conceptual table)
- `X-PDS-URL` / `Authorization: Bearer` HTTP header specifics
- Specific library version numbers and vendoring mechanics

### 4. Historical / comparative context
- Removed the preamble that framed properties as "assume the following mitigations are in place."
- Removed non-goal phrasing that previewed future features as roadmap items.
- Removed all "replaces the old X" or "legacy" callouts.

## What was kept and why

- **Algorithm names and parameters** (Argon2id, XSalsa20-Poly1305, AES-CBC-256 with PKCS7, ML-KEM-1024, SHA-256). Technical audience needs these to evaluate the claims.
- **Key-size conventions** (256-bit keys at every symmetric layer — content, circle, messaging, vault, master). This uniformity is load-bearing for the "post-quantum floor at every layer" claim; render the algorithm/size pairs exactly as written.
- **AT Protocol terminology** (PDS, AppView, Relay, DID). This is Bluesky's public vocabulary and unavoidable when describing how Denazen integrates.
- **The four-tier vault hierarchy diagram**, the two-tier content encryption diagram, the unlock flow, and the decryption pipeline — these are the core architectural claims and cannot be abstracted further without losing meaning.
- **The privacy invariant** (§9) — including the TypeScript snippet, which is a load-bearing description of the fail-closed design.
- **`.zen` file format** — public enough to matter for interoperability discussions.
- **§4.1 Encryption password strength** — do not soften. The "16 characters or 10 diceware words" guidance and the explicit statement that post-quantum claims are conditional on a compliant password are both load-bearing. Understating the requirement would weaken the whitepaper's credibility with reviewers.
- **The verification story** (§13) — this is the "why should you believe this" section for a security audience.

## Tone and structure changes

- Present tense throughout. No "we plan to" or "eventually".
- Confident but not marketing-y. Numbered sections, tables, and diagrams retained for scanability.
- The opening sets the zero-trust framing as a fact, not an aspiration.
- Section 1.2 (adversaries table) is unchanged in structure but one row was renamed from "Supabase / server-side DB" → "Denazen relay / database" to stay vendor-neutral.

## Out-of-band verification is opt-in

§8.5 describes the safety-number / QR-code verification as **opt-in**, explicitly mirroring Signal's posture. When writing web copy:

- Do not describe OOB verification as mandatory or as something every user does.
- The default binding is TOFU (Trust-On-First-Use); OOB is available for users who want stronger assurance.
- This is the correct framing for a general-audience site: adding friction at first contact would hurt adoption, and the TOFU-plus-opt-in model is the industry standard (Signal, WhatsApp).
- If the copy compares Denazen to Signal on this axis, parity is the honest claim — not superiority.

## Post-quantum framing

The whitepaper consistently frames Denazen as **post-quantum by design at every layer**:

- ML-KEM-1024 (NIST Level 5) is the single asymmetric primitive — no classical-only key exchange anywhere in the stack.
- Every symmetric key is 256 bits (content, circle, messaging, master, vault) — Grover's algorithm reduces this to a 2^128 floor, which is the NIST-recognized post-quantum-safe threshold.
- Password-derivation uses Argon2id, whose memory-hardness degrades quantum speedup; the whitepaper is explicit that the post-quantum claim is conditional on adequate password entropy (§4.1).

When writing web copy, prefer framings like "post-quantum-safe at every cryptographic layer" over "resistant to classical attack." The design was picked to clear the NIST Level 5 bar; say so.

## Suggested treatment for the website

- **Lead with §14 (summary) or a condensed version of it** as the hero statement.
- **Turn the four-tier vault diagram (§3.1) and the two-tier content diagram (§5) into graphics.** They are the two strongest visual arguments for the architecture.
- **§1.2 (adversaries table) is the single best quote-the-table candidate** — it directly answers "what does this protect me from?"
- **§13 (verification story)** can become a "how do we back this up?" block or sidebar.
- **Consider pulling §9 (privacy invariant) into a callout block.** The "never under any circumstance" line is strong copy.
- **Give §4.1 (encryption password strength) its own block.** The 16-char / 10-word diceware guidance is the one thing a user reading the site must internalize; it is the user-controlled input that the post-quantum claim depends on.
- Feel free to drop or collapse §6 (replies and quotes) and §10 (rotation) on the landing page — they matter for completeness but are secondary for a first-read audience. Link to the full whitepaper for the deeper cut.
- Keep cryptographic primitive names exact. A technical reader who sees "AES-256" and "ML-KEM-1024" will trust the page more than one who sees "strong modern encryption." NIST parameter-set names (Level 5) are good to foreground; they let a reviewer sanity-check the claim without reading the full spec.
