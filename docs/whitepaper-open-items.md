# Whitepaper Open Items

A living list of items still **TBD, partial, or deferred** in the public encryption-architecture whitepaper (`encryption-architecture-whitepaper.md`) and related security pages. Intended as a running punch list for engineering, documentation, and policy work.

**Last synced with whitepaper:** 2026-04-21 (against whitepaper commit `95d7c78` + three uncommitted patches on branch `preview`)

**Related files:**
- [encryption-architecture-whitepaper.md](encryption-architecture-whitepaper.md) — the whitepaper itself
- [website-updates.md](website-updates.md) — change-propagation queue: whitepaper → denazen.com
- [public-changelog.md](public-changelog.md) — dated record of material security-doc changes
- [security-website-agent-prompt.md](security-website-agent-prompt.md) — one-time setup prompt

---

## Engineering TBDs — security-relevant, still open

### HIGH: the items that block system-level audit

#### 1. Out-of-band contact verification
- **Whitepaper refs:** §1.4 (zero-trust scope caveat), §8.4 (TOFU hedge), §16 (Future work #1)
- **What's missing:** Safety-number / QR-based manual verification of ML-KEM-1024 public keys on first contact. Without it, a malicious PDS operator can substitute pubkeys *before* TOFU binds, and the whitepaper has to keep hedging throughout §1.4 and §8.4.
- **Closure path:**
  1. Derive a stable fingerprint from both parties' ML-KEM-1024 pubkeys (SHA-256 → word list or 60-digit numeric — match Signal's pattern).
  2. Add a "Verify contact" screen reachable from friend detail + DM header.
  3. Promote the messaging-key record's trust state from `tofu` → `verified` when verification completes.
  4. Show a badge in DM and circle-member UIs for verified contacts.
- **Estimated scope:** ~1–2 weeks (fingerprint utility + UI + DB field).
- **Blocks:** §15 system-level audit (this is the last unresolved crypto-design TBD).

#### 2. ~~Media sanitization (EXIF / GPS stripping)~~ — CLOSED 2026-04-21
- **Whitepaper refs:** §5.5 — now describes the implemented behavior
- **Status:** Implemented via `src/services/imageMetadataService.ts` in the app repo. Strips all APP1–APP15 and COM segments from JPEGs. Runs on both public and encrypted image paths — encrypted images are stripped *before* encryption so the recipient also cannot see GPS / camera data. Unit-tested via `src/__tests__/exif-stripping.test.ts` (8 tests covering APP1/APP13/COM/large-EXIF/SOS preservation/idempotence/non-JPEG rejection). Defense-in-depth: runs after the native `ImageManipulator` JPEG re-encode which typically already strips metadata on iOS/Android.
- **Remaining:** none on the engineering side. An optional "Keep metadata" per-post toggle for photographers was considered and deferred — no user has asked for it yet; revisit if a use case emerges.

#### 3. Deletion semantics finalization
- **Whitepaper refs:** §5.6 ("Partially implemented; full semantics under active design"), impacts §14 legal-process answers
- **What's missing:** Crystallized ordering contract and recipient-side cache purge policy. Unspecified today: proactive vs deferred recipient cache purge, DM deletion semantics, orphan prevention.
- **Closure path:**
  1. **Design decision** — recommend *deferred* recipient-cache purge with server-side index removal + client TTL. Proactive requires either push (unreliable — see §8.6) or polling (leaks patterns).
  2. **Design decision** — DM deletion: local-only vs tombstone-then-purge-on-recipient. Recommend tombstone.
  3. **Ordering contract** — index row → content-key record → `.zen` blobs. Fallback on orphaned content-key records: refuse to decrypt (fail-closed).
  4. Implement + rewrite §5.6 + update §14.
- **Estimated scope:** ~1 week design + 1–2 weeks implementation.

---

### MEDIUM: opportunistic wins

#### 4. Argon2id parameter publication
- **Whitepaper ref:** §4.1 ("Final shipping values will be published here once the public build is frozen")
- **Closure path:** Freeze the public-build memory cost / iterations / parallelism, replace the hedge with the actual numbers, bump a version marker. ~30-minute doc edit.

#### 5. Push notifications posture
- **Whitepaper ref:** §8.6 ("Not yet implemented. The posture for push is still being designed")
- **Reality check:** `expo-notifications` native bridge is broken on iOS (deserialization bug in 0.32.16). Local notifications are disabled in the app. The whitepaper's "not yet implemented" is accurate but incomplete — it doesn't disclose the upstream bug or the intended posture.
- **Closure path (pick one):**
  - (a) Remove §8.6 from "Future work" until there's a credible plan with a working native bridge.
  - (b) Document the *intended* posture now: opaque wake-up pings with payload-free content; client fetches from inbox on wake; server never decrypts. **Do not imply push is imminent** — the native bridge has no upstream fix.
- **Recommendation:** (b), but frame as "target design" rather than "roadmap."

#### 6. System-level audit
- **Whitepaper ref:** §15 ("A system-level audit is a priority; results to be published")
- **Blocked by:** Item #1 (OOB verification). Auditors will flag the TOFU-first-contact window otherwise.
- **Closure path:** After #1 ships, scope an 8–12 week engagement. Candidate vendors: **Cure53** (already audited the ML-KEM library — ramp cost is lower) or **Trail of Bits** (stronger on systems-level review). Publish a summary + any mitigation commits.

---

### LOWER / LONG-HORIZON

#### 7. Key transparency log
- **Whitepaper ref:** §16 Future work #2
- Real value only emerges at user-base scale where TOFU-by-one-person isn't a sufficient control. Park until post-launch and not before.

#### 8. Reproducible builds + binary attestation
- **Whitepaper ref:** §16 Future work #3
- Expo build reproducibility is non-trivial infra work — 3–6 months. Desirable for trust but not on the critical path. Park until user base justifies.

#### 9. Post-quantum rekey-window protocol
- **Whitepaper ref:** §16 Future work #4
- The `.zen` format carries a version field, which is enough to support negotiation. A documented rekey-window protocol is only needed when a primitive is actually being rotated. **Ship the spec with the first rotation, not before** — premature protocol specs tend to be wrong.

---

## Policy TBDs — legal / ops, not engineering

#### 10. Abuse and moderation policy
- **Whitepaper ref:** §13 ("pre-policy")
- **Gap:** Denazen cannot observe private content, so moderation must rest on recipient reports (client uploads decrypted content + sender identity). The mechanism exists; the *policy* around it does not.
- **Closure path:** Engage counsel; draft a moderation policy that covers (a) report intake, (b) review criteria, (c) enforcement actions (limited, since Denazen can't silence encrypted content — only remove the reporting user's account or publish hashes of reported abusers to help clients pre-filter). Publish before any public marketing push.

#### 11. Legal-process response guidelines
- **Whitepaper ref:** §14 ("pre-policy")
- **Gap:** §14 enumerates what Denazen *can* and *cannot* produce under compulsion, but lacks a formal law-enforcement guidelines document and transparency-report cadence.
- **Closure path:** Engage counsel; draft the guidelines doc in the style of Signal's / Apple's. Commit to an annual or biannual transparency report. Publish alongside the moderation policy (item #10).

---

## Whitepaper ↔ public website propagation (not an engineering item — admin task)

Three patches were applied to the whitepaper on 2026-04-21 (currently uncommitted on branch `preview`):
1. **§7** — content-key cache TTL (5-min) + background flush — closes MED-2 in the disclosed-behavior layer.
2. **§8.3** — DID↔PDS binding + did:web support — closes CRIT-2 follow-up (`054ca0d`) in the disclosed-behavior layer.
3. **§12** — feedback body scrub before external classifier — closes MED-3 in the disclosed-behavior layer.

Once committed, add an entry to [website-updates.md](website-updates.md) so the changes also land on `denazen.com/security/architecture/` and so the [public-changelog.md](public-changelog.md) gets a dated note.

---

## Out of scope for this file

- Items already **fully implemented and documented** in the whitepaper (post-quantum migration, two-password system, inbox-based friend requests, auth gateway, sender-token hashing, acceptance validation, private-post-index scoping, privacy invariant, rotation, storage boundaries, telemetry sanitization). See the reconciliation plan at `~/.claude/plans/i-d-like-to-read-ancient-piglet.md` (internal) for the commit-by-commit cross-reference.
- General project feature work that is not security-relevant (feed UX, onboarding, theming, etc.).

---

## Suggested review cadence

- **Before each public-facing whitepaper release:** re-read this file and confirm nothing that shipped has been left as TBD in the whitepaper, and nothing that's been removed still lives here as an open item.
- **On every quarterly security-posture review:** re-prioritize if needed (e.g., audit timing, new threats, user-base growth).
