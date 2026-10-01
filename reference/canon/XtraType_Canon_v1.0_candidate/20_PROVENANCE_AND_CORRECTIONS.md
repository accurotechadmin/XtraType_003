# XtraType — Provenance, historical corrections and glossary

**Canon edition:** 1.0 approval candidate · **Baseline:** supplied v2.3 / extension 2.3.0 · **Audit date:** 2026-10-01

## Supplied evidence

| Source | Role in this canon | Preserved location |
|---|---|---|
| `PortaShape_XtraType_SidePanel_MVP_v2.3.zip` | Executable-source baseline; includes 38 files plus directories | `evidence/baseline/` |
| `PortaShape_XtraType_v2.3_Reports.zip` | Three prior feature/technical/summary reports; historical analysis | `evidence/legacy-reports/` |
| `PortaShape_XtraType_v2.3_Codebase_Reference_fresh.md` | Prior comprehensive reference; checked against actual package | `evidence/legacy-reference.md` |
| Current user request | Product name XtraType; PortaShape interoperability role; current working foundation; future userscript direction | Scope/authority documented in01/16 |

Exact input and baseline file SHA-256 hashes are in [source-manifest.json](evidence/source-manifest.json). No commit ID, build provenance chain or repository history was supplied. The legacy reference cites a filename with `(2)` while the actual attachment does not; this canon fingerprints the actual attachment rather than assuming byte identity from the old filename.

## Correction ledger

| Previous claim or implication | Source-grounded replacement | Canon home |
|---|---|---|
| Bare-video annotations have no marker | Intended semantics yes; implementation `Number(null)` creates a finite zero and can render/toast at0 | 05/07; XT-007 |
| Normalizer ensures custom kind | Metadata spread can override `kind:'custom'` | 06; XT-015 |
| Schemas are a supported primitive subset at every ingress | Panel normalizer permits mixed supported/unsupported unions; remote load skips it; server broader | 06; XT-023 |
| Local-first save is a transaction sequence | Individual writes are transactional; aggregate Blob/note/event is not one transaction | 10; XT-018 |
| Local data is safe after failed sync | Initial note retained, but subsequent same-ID remote pull can overwrite dirty data | 10; XT-003 |
| Successful image sync preserves offline attachment access | Remote descriptors replace Blob linkage; bytes remain but normal annotation lookup loses them | 04/10; XT-004 |
| Auto-sync off means no automatic networking | Replies/schema install/load have independent network paths | 10; XT-013 |
| Snapshots are immutable | Normal captures use new IDs; server POST replaces same ID, no immutability enforcement | 04/09/11 |
| Snapshot synchronization is incomplete bidirectional sync | Current client is upload-only; no pull implementation at all | 10/11; XT-031 |
| Events are not fully synchronized | There is no current client event bridge; only full/quick creation logs exist | 04/10 |
| All-query matching handles all exact query sets | Empty chosen list bypasses exact pair-count check | 05; XT-021 |
| GPS coordinates are required/validated everywhere | Blank coerces to0; web omits bounds | 05/12; XT-019 |
| YouTube URL recognition means only genuine YouTube hosts | Substring/loose parsing accepts lookalikes and unrelated web `v` URLs | 05; XT-022 |
| Full page captures up to14000×28000 CSS px | Logical limits are divided by clamped DPR; dimension clipping can be silent; actual canvas uses measured scale | 11 |
| A short settle delay provides safe capture pacing | 140ms is not a limiter for Chrome's two-calls/second ceiling | 11; XT-008 |
| Original scroll is restored | Only on successful tile loop, no finally | 11; XT-010 |
| Full snapshot captures one consistent page state | Context/pixels/extraction occur separately, active-tab identity not pinned | 11; XT-009 |
| Three-image rule applies to all annotation POSTs | Combined count enforced in multipart branch, not JSON-only | 09; XT-014 |
| Health is GET-only | No method guard after common OPTIONS handling | 09 |
| Server default is local only | Inline README command uses localhost, both scripts bind0.0.0.0; data files under served root | 13; XT-002 |
| Browser file access implies file annotation support | File scripting permission and HTTP(S)-only target construction are distinct | 05/13 |
| Prior tests/lints passed, therefore currently verified | This audit reran Node/JSON/characterization only; PHP and live Chrome not run | 17 |
| User quote is a passage anchor | Quote is stored text, no range selector/re-anchoring implementation | 02/04 |

These corrections distinguish intention from implementation. They do not claim the old reports were wholly invalid; most broad feature descriptions agree with the source. Where a difference matters to engineering behavior, the current canon states the exact limitation and a corresponding change gate.

## Terminology

| Term | Canon meaning |
|---|---|
| XtraType | Product and user-facing contextual annotation/capture application |
| PortaShape | Interoperability, transformation and transport concerns; currently distributed among adapters/endpoints |
| Object Click | Historical browser-host capability terminology in supplied architecture; no separate shipped subsystem |
| Anchor / target | Structured description of what context attaches to; target is stored field name |
| Target key | Derived exact identity string; not a replacement for structured target |
| Applicability / context resolution | Predicate determining whether a target is relevant to a live context; can be broader than key equality |
| Bare URL | Current origin/path model with no selected query/fragment identity |
| Bare video | Video target with both times null; differs from zero-second timestamp |
| GPS gate | Inclusive distance threshold using explicit radius or consumer default |
| Custom schema | Declarative target-value vocabulary, not executable plugin |
| Schema catalog | Resolved built-in/local/remote definitions; no authoritative version negotiation yet |
| Annotation | `Context.Annotation` v2 body/quote/media attached to a target |
| Reply | Separate annotation with parent ID and inherited target; not a complete thread UI |
| Snapshot | `Revision.Snapshot` observation with pixels/HTML/text/context; not replayable archive |
| Page key | Default URL key used for snapshot grouping; query/fragment ignored |
| Local-first | Extension writes locally before optional network; does not imply complete sync conflict safety |
| Synced | Current last-success label; no destination/revision proof |
| Mirror/archive | Current server continuity role; no full remote timeline recovery |
| Blob | Binary object stored in IndexedDB, independently from metadata |
| Media descriptor | Server-returned ID/name/type/size/root-relative URL |
| Metadata export | JSON inspection artifact without binary bytes/settings/import |
| Site adapter | Bundled host-DOM integration such as YouTube |
| Userscript | Proposed user-provided executable page behavior with separate registry/grants |
| Canon / SSOT | Approved authoritative modular specification for the declared baseline and future decisions |
| Approval candidate | Review-ready proposed canon; approval has not yet happened |

## External platform references

Only two external primary references were needed to check platform constraints for capture and proposed userscripts. They do not replace the source baseline. Consulted 2026-10-01:

- [Chrome tabs API](https://developer.chrome.com/docs/extensions/reference/api/tabs): active-window screenshot semantics and capture-rate ceiling.
- [Chrome userScripts API](https://developer.chrome.com/docs/extensions/reference/api/userScripts): API availability, permissions, user enablement, isolated world and lifecycle.

Recheck platform/distribution requirements at implementation/release time. The user's incomplete future clause is deliberately not filled from assumptions about a third-party product.
