# XtraType — Verification, engineering acceptance and approval

**Canon edition:** 1.0 approval candidate · **Baseline:** supplied v2.3 / extension 2.3.0 · **Audit date:** 2026-10-01

## Work actually performed

Inspected all supplied source files, schemas, UI shells/styles, launch scripts and tests; reviewed the three reports and reference; traced constructors, matching, local/remote writes, uploads, messages and capture. Preserved an unchanged baseline copy and file hashes. No application source was edited. The audit does not assert exhaustive absence of other defects.

| Check | This audit's result | Scope |
|---|---|---|
| Supplied `node tests/anchors.mjs` | PASS | Six assertion calls covering URL default/selected, GPS gate, YouTube range and custom requiredness success/failure |
| Node JS syntax | PASS: all 9 `.js` files | Extension and web module sources; no browser API execution |
| JSON parsing | PASS: 9 files | Manifest, 4 disk schemas, 4 collection files; collections are empty arrays |
| Targeted characterization | PASS: 11 checks | Existing defects/edge behavior captured, not desired acceptance tests |
| PHP lint / HTTP server / multipart | NOT RUN | PHP executable unavailable in current environment |
| Chrome extension / live YouTube / UI visual QA | NOT RUN | No loaded extension/browser fixture campaign performed |
| Documentation links/inventory | Recorded in verification manifest | Paths, hashes, file coverage, references, packaging checks |

The earlier reports say PHP lint/health/schema checks passed in their review. Those remain **reported historical results**, not revalidated results here. No claim of automated accessibility, security, concurrency, memory, Store compliance or mobile-browser certification is made.

## Reproduce local checks

From the documentation bundle root, with a modern Node runtime:

```bash
node evidence/baseline/tests/anchors.mjs
node evidence/characterize.mjs evidence/baseline
```

The included characterization script imports unmodified pure modules and extracts the worker's pure URL matcher into a VM context. It checks empty-all-query behavior, duplicate query consumption, blank GPS coercion, spoofed YouTube host, null-to-zero marker eligibility, kind metadata override, mixed-type union acceptance, required-only custom validation, fragment key behavior, GPS identity and query-insensitive snapshot grouping. These checks intentionally pass on current buggy behavior. Future fix tests must invert the relevant expectations and retain the old script only as baseline evidence.

JavaScript syntax checks used Node `--input-type=module --check` with each file supplied on stdin. Package tests have no package.json and may depend on modern Node module detection; pin a supported development runtime before CI rollout.

## Required integration matrix — proposed, not run

| ID | Fixture and operation | Required observable outcome | Related findings |
|---|---|---|---|
| QA-01 | Fresh install/restart/native toolbar/context menus | Panel opens without quick-bar injection; failures actionable | XT-042 |
| QA-02 | Draft with selection, tab switch, refresh | Draft binding preserved or explicitly rebound; no stale quote reassignment | XT-011,012 |
| QA-03 | URL policy matrix incl duplicate/empty/fragment/Unicode | Shared key fixtures and contextual predicates agree with approved meanings | XT-020,021,043 |
| QA-04 | GPS blank/zero/bounds/default/explicit radius | Correct validation and separate Exact/Nearby behavior | XT-019,041 |
| QA-05 | Video known/spoofed hosts, Shorts, null/0/range | Strict parser and correct timed projection | XT-007,022 |
| QA-06 | Custom enum/required/union/unsupported/kind spoof | Same typed values or consistent rejection at every ingress | XT-015,023 |
| QA-07 | Full/quick/reply saves with auto-sync off | Network traffic matches explicit setting contract | XT-013,025 |
| QA-08 | IDB fail at Blob/note/event and repeated submit | No false failed-note report or duplicate committed intent | XT-018,044 |
| QA-09 | Image save→sync→offline reload; missing Blob | Image retained; missing media not silently discarded | XT-004,005 |
| QA-10 | Lost response/retry/dirty pull/two clients | Idempotent media, conflict-safe records, truthful results | XT-003,033,034 |
| QA-11 | Switch API destination and delete remotely | No cross-server URL confusion or silent resurrection | XT-016,032 |
| QA-12 | Corrupt collection + concurrent writes | Preserve corruption for repair; correct serialized mutation | XT-017 |
| QA-13 | Invalid records/MIME/oversize/extra files | Nonmutating validation failure and no abandoned committed files | XT-014,033 |
| QA-14 | API auth/media/raw JSON access negatives | Same access policy protects all data paths | XT-001,002 |
| QA-15 | Controlled player DOM churn + SPA navigation | No self-triggered endless render; no stale response overwrite | XT-006,026 |
| QA-16 | Card keyboard/narrow viewport/reply server fail | Dismissable accessible UI and accurate save feedback | XT-025,027,040 |
| QA-17 | Full capture third-tile failure/rate-limit/cancel | Bounded calls, restored scroll, released resources | XT-008,010 |
| QA-18 | Capture tab navigation/active-window switch | Abort or explicit partial result; no mixed-page snapshot | XT-009 |
| QA-19 | Sticky/lazy/smooth/high-DPR/huge page | Coverage/fidelity flags, bounded memory, no false full label | XT-028,029 |
| QA-20 | Diff threshold 60/61, dimensions, mixed modes | Exact documented algorithm and compatibility reporting | XT-030 |
| QA-21 | Remote snapshot restore + binary failure | No restored status until metadata and bytes consistent | XT-031 |
| QA-22 | Export→clean-profile import→compare hashes | Complete records, schemas, binary references restored | XT-036 |
| QA-23 | Large corpus and repeated preview/navigation | Measured acceptable latency/memory within approved budget | XT-035,037 |
| QA-24 | Web unavailable/schema malformed/duplicate submit | Visible recoverable error and preserved draft intent | XT-039,044 |
| QA-25 | Keyboard/screen reader/contrast all surfaces | Focus order, labels, status, errors and file controls usable | XT-040 |

Performance targets are intentionally not invented. Establish representative corpus/page/device fixtures, measure baseline, and approve budgets before declaring scale readiness. PHP integration should run in an isolated copy because endpoint tests mutate JSON/media; never use the preserved evidence baseline as a write target.

## Approval record template

- Canon edition/checksum: ______
- Owner/reviewer/date: ______
- Baseline descriptions accepted: yes / changes listed ______
- ADRs accepted/deferred: ______
- Concern priorities accepted/adjusted: ______
- Stabilization specifications accepted: ______
- Userscript first-slice approved / held for scope completion: ______
- Missing roadmap phrase supplied: ______
- Known runtime verification limitations accepted for documentation approval: ______

Approval of the documents establishes specifications and an issue baseline. It does not sign off production deployment or assert all features pass integration tests. Track code completion against each specification and QA case in subsequent work.
