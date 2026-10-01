# XtraType / PortaShape Coherency, Consistency, Accuracy & Current-Truth Audit

**Audit date:** 2026-10-01  
**Scope:** all four supplied artifacts, including the complete extracted source trees and structured evidence.  
**Question answered:** whether the documentation's claims about what is *current*, *implemented*, *verified*, *approved*, *specified*, and *deferred* agree with the latest supplied code and with one another.

## 1. Executive conclusion

The project is **substantially more coherent and self-aware than a superficial reading of the mixed versions would suggest**, but it has one consequential documentation-governance defect: **the authority chain is temporally stale**.

The canon and boot prompt correctly freeze and describe **XtraType v2.3 / extension 2.3.0**. The companion correctly describes itself as a **v0.1 target implementation specification** and repeatedly warns that its components are not implemented. However, a separately supplied and materially changed **XtraType 2.4.0** tree now exists. Once that tree is admitted as the newest supplied implementation, statements such as “current application behavior remains in the existing XtraType canon” and the boot prompt's definition of “current behavior” as v2.3 cease to be globally current. They remain true only as historical statements about the canon's frozen baseline.

The latest implementation is best described exactly as its own release manifest describes it: **XtraType 2.4.0, local-single-user stabilization candidate**. It is not a PortaShape implementation, not a public multiuser service, not an identity/sync backend, and not a production-certified browser release. The 2.4.0 package is explicit about those limits and I found no source contradiction to them.

I found **no evidence that the project fabricates implemented modules or knowingly converts proposed/target behavior into shipped behavior**. The dominant discrepancy class is **temporal/status drift**, not fictitious capability. Intent cannot be inferred from source artifacts, so this report makes no claim about intent.

### Bottom-line status

| Area | Truthfully current status from supplied evidence | Coherency finding |
|---|---|---|
| XtraType application | 2.4.0 stabilization candidate, local/single-user | **Current implementation source**; materially newer than canon baseline |
| XtraType canon | v1.0 approval candidate describing v2.3 / ext 2.3.0 | **Historically coherent, no longer latest implementation truth** |
| PortaShape companion | v0.1 target implementation specification | **Internally coherent and candidly unimplemented** |
| PortaShape host | No implementation in 2.4.0 | Specified only |
| Script Studio | No implementation in 2.4.0 | Specified only |
| Stay D.R.Y. | No implementation in 2.4.0 | Specified only |
| Universal Publisher / Bridges | No companion implementation in 2.4.0 | Specified only |
| External connector framework | No companion implementation in 2.4.0 | Specified only |
| Web client | Existing XtraType web companion, improved in 2.4.0 | Implemented narrow/local surface |
| Native mobile shell | No implementation | Specified only |
| Identity / account / cross-device sync plane | Deferred; not implemented | Correctly disclosed |
| Existing PHP API | Local JSON API exists | Must not be confused with deferred service plane |
| Native Chrome/YouTube acceptance for 2.4.0 | Not run successfully | Correctly disclosed |
| Companion acceptance AT001–AT052 | All `Not run` | Correctly disclosed |

## 2. Source identity and coverage

### Supplied archives

| Artifact | Observed SHA-256 | Package result |
|---|---|---|
| `XtraType_Canon_v1.0_Approval_Candidate.zip` | `91c8136b958cc34e779d99ab53e3e43fa28317aa1f0d0a275e5dd1c610f77eeb` | Matches boot-prompt expected identity |
| `XtraType_PortaShape_Companion_v0.1.zip` | `f17270562f080ea403395de37a7ce103e78bae9326d4571d95c90e04987332ac` | Matches boot-prompt expected identity |
| `XtraType-2.4.0.zip` | `6582239444dbe2177796bbeb5bca162e0f3890e8f5017bc02a7a5e34cc5e7537` | Newer supplied implementation; no boot-prompt expected hash to compare |

The canon archive has 70 entries and its `SHA256SUMS.txt` covers 69 files (everything except itself) with no mismatch. Its `evidence/source-manifest.json` names 38 frozen baseline files, and all 38 hashes match those files.

The companion archive has 96 entries. `package-manifest.json` accounts for 95 package files (excluding itself) with matching sizes/hashes. Registry inventory counts match the package's claims: 8 modules, 60 components, 29 contracts, 40 operations, 15 permissions, 16 interactions, 12 surfaces, 7 stages, 52 acceptance cases, 18 decisions, and 16 traceability rows.

The XtraType 2.4.0 tree contains 65 files. `SHA256SUMS.txt` covers the other 64 files with no mismatch.

No archive path traversal issue was found during extraction.

## 3. The central discrepancy: “current” has two meanings in the package set

The boot/canon model says that “current behavior” is the exact v2.3 source frozen into the canon. That was a defensible rule when the canon was authored. The companion inherits that authority model and tells readers that current application behavior remains in the canon.

But `XtraType-2.4.0` is a later supplied implementation that explicitly says it is based on v2.3 plus the canon and contains stabilization changes. Therefore:

1. **v2.3 remains the canon's historical baseline truth.**
2. **v2.4.0 is the latest supplied implementation truth.**
3. **The companion remains target truth, not runtime truth.**
4. Any document that uses “current” without version qualification must now be interpreted carefully or updated.

This is the most important coherence issue because it changes how every later defect, verification, and status claim should be read.

## 4. Is 2.4.0 a real implementation change or merely a relabel?

It is a substantial implementation change.

The v2.3 preserved baseline contains 38 files. Comparing same-relative-path files against 2.4.0:

- 33 paths exist in both trees.
- **29 of those 33 changed.**
- Only the four shipped server anchor-schema JSON files are byte-identical.
- 2.4.0 adds **32 paths**, including `ext/core/capture.js`, `ext/core/records.js`, `src/server/Repository.php`, `src/server/Validation.php`, a restricted router/media boundary, regression/integration tests, package/lock files, release evidence, upgrade guidance, and private `var/` data/media locations.
- Five old `server/data/*` / `server/media/.gitkeep` paths disappear because runtime data/media moved under `var/`.

So the version shift materially changes the truth of many canon findings.

## 5. Current 2.4.0 implementation truth, checked against source

### 5.1 Version and identity

`release-manifest.json`, `package.json`, and `ext/manifest.json` agree on **2.4.0**. Manifest V3 is retained. The IndexedDB identity remains `portashape-xtratype`, version 1, with stores `annotations`, `blobs`, `schemas`, `snapshots`, and `events`. `Context.Annotation` v2 and `Revision.Snapshot` v1 remain retained record families.

The historical `portashape-xtratype` database name is **not evidence that PortaShape is implemented**. The documentation explicitly preserves that existing identifier for compatibility.

### 5.2 Server/storage

The source agrees with the 2.4.0 claim that JSON remains the server storage engine and SQL is not implemented. `src/server/Repository.php` introduces serialized collection mutation, shared/exclusive locking, fail-closed malformed JSON handling, sibling temporary writes, and rename replacement. This is a real mitigation of several canon concurrency/corruption findings, not a database migration.

Runtime JSON and media locations are moved outside `server/` to `var/data/` and `var/media/`. The default launchers bind to loopback. The development router restricts what can be served. These source facts contradict old v2.3 “current defect” prose that described all-interface launch and raw data beneath the web root; that prose remains accurate only for the frozen v2.3 baseline.

The API still lacks account authentication and account/ACL authorization. Origin/host/client-header checks are **deployment hardening, not user authentication**. The 2.4.0 docs state this correctly.

### 5.3 Local data and sync

2.4.0 adds aggregate IndexedDB transaction helpers and record construction code, protects dirty/error local records during pulls, preserves stable attachment/blob linkage, rejects sync when a required local binary is missing, and adds request timeouts/error reporting. These directly supersede several canon findings.

It still does **not** implement distributed conflict resolution, deletion tombstones, full restore/import, replicated event sourcing, or snapshot download/hydration. The 2.4.0 README states these limits.

### 5.4 Capture and projection

Capture behavior now includes explicit bounds, tile calculation, worker-side pacing, tab/window/document/URL/metric pinning, and cleanup/restoration paths. YouTube behavior contains fixes for null-vs-zero markers and avoids the old self-observing mutation loop pattern.

Those improvements are covered by source-level/mocked tests. They are **not equivalent to native Chrome/real YouTube acceptance**, and the verification document explicitly says native browser acceptance was not completed.

### 5.5 Schema behavior

2.4.0 still implements a deliberately bounded schema profile, not a full JSON Schema engine. It adds stronger typed primitive handling, reserved-kind protections, and server-side validation. The documentation accurately avoids claiming complete JSON Schema semantics.

### 5.6 PortaShape scope absence

Search and source traversal found no PortaShape host runtime, no `portashape-local` database, no Script Studio runtime, no Stay D.R.Y. runtime, no Universal Publisher runtime, and no `chrome.userScripts` implementation in 2.4.0. The release manifest's statement “Existing XtraType core features only. No PortaShape or companion modules” is consistent with the code.

## 6. Verification truth

### Canon v2.3 audit

The canon's evidence is internally consistent:

- 45 concern IDs, `XT-001` through `XT-045`, are present in both the register and JSON evidence.
- 117 named-symbol entries are present in both `symbols.json` and the symbol reference.
- Its verification record distinguishes 22 passed recorded checks from two unrun categories.
- It explicitly says PHP/HTTP and live Chrome/YouTube/UI verification were not performed in that audit.
- The 11 characterization checks intentionally preserve some buggy baseline behavior; the canon correctly warns that passing them is not feature acceptance.

This is good evidence discipline.

### 2.4.0 recorded tests

The shipped `docs/evidence/test-results.txt` records **32 tests, 32 passed, 0 failed, 0 skipped**, matching `docs/VERIFICATION.md` and `release-manifest.json`. Test names align with the described HTTP, repository, client, worker, schema, sync, capture, and baseline cases.

The ZIP deliberately excludes `node_modules`. In this audit, source/static checks and dependency-free portions were inspectable, and PHP-backed integration/repository tests could run; a complete independent rerun of the jsdom/fake-indexeddb client suite was not established because the development dependencies were not present in the package/runtime. Therefore the correct epistemic status is:

- **Recorded 32-pass evidence is internally consistent and traceable.**
- **It is not being relabeled here as a complete independent rerun by this audit.**
- **Native Chrome/real YouTube acceptance remains unrun, exactly as the project says.**

### Companion verification

All 31 schema files are valid Draft 2020-12 schemas. All 29 same-stem example documents validate against their schemas using a format checker and offline resolution of the package's schema IDs. The operation registry has 40 operation IDs and all 80 input/output bindings resolve to definitions in `operation-payloads.schema.json`.

All 11 workbook data sheets match the corresponding CSV registries row-for-row. The workbook has the claimed 12 sheets. The package's workbook verification correctly records `nativeDesktopExcelTest: false`.

All **52 acceptance cases AT001–AT052 remain `Not run`**. Structural schema/workbook checks therefore do not establish runtime implementation. The companion states this distinction correctly.

## 7. Canon document-by-document currentness audit

The canon is internally scoped by its repeated header: **edition 1.0 approval candidate; baseline supplied v2.3 / extension 2.3.0; audit date 2026-10-01**. Within that scope, I found it coherent. The table below evaluates whether each document can still be treated as a description of the *latest supplied implementation*.

| Canon document | As-authored assessment | Latest-implementation assessment |
|---|---|---|
| `00_START_HERE.md` | Accurate entry point for frozen canon | **Stale as a latest-code entry point**; should route readers to 2.4.0 release docs before historical canon |
| `01_AUTHORITY_AND_DECISIONS.md` | Coherent authority/ADR history | Historical authority remains useful; “current” precedence needs a 2.4 layer |
| `02_PRODUCT_AND_STATUS.md` | Accurate v2.3 status snapshot | **Superseded for current status** by 2.4.0 release manifest/README |
| `03_ARCHITECTURE_AND_SEAMS.md` | Strong v2.3 architecture description | Core topology remains, but storage/server/capture safety seams changed materially |
| `04_RECORD_CONTRACTS.md` | Baseline contracts accurately distinguished | Mostly still applicable; 2.4 adds/strengthens runtime handling without replacing v2 records |
| `05_ANCHORS_AND_RESOLUTION.md` | Accurate v2.3 behavior including defects | Several edge behaviors fixed in 2.4; identity rules intentionally retained in other areas |
| `06_SCHEMA_SYSTEM.md` | Accurate shallow/bounded v2.3 behavior | Partly superseded by stronger bounded validation; still not a full JSON Schema engine |
| `07_EXTENSION_SURFACES.md` | Accurate v2.3 surface inventory | Surfaces persist; lifecycle, stale-state, projection and capture behavior changed |
| `08_WORKFLOWS_AND_MESSAGES.md` | Accurate v2.3 flows | Message family persists but save/sync/error/authority handling is stronger in 2.4 |
| `09_HTTP_AND_SERVER.md` | Accurate v2.3 local PHP server analysis | **Materially stale for 2.4**: loopback/private data/router/validation/fail-closed behavior changed; lack of identity still current |
| `10_STORAGE_AND_SYNC.md` | Accurate v2.3 defects/limits | **Materially stale for several defects** fixed/mitigated in 2.4; distributed reconciliation gaps remain |
| `11_CAPTURE_AND_COMPARISON.md` | Accurate v2.3 capture/diff limits | **Partly superseded** by pacing/pinning/bounds/cleanup; native capture acceptance still pending |
| `12_WEB_COMPANION.md` | Accurate v2.3 web behavior | Existing surface retained and hardened; still server-first and not an offline/native client |
| `13_SECURITY_AND_OPERATIONS.md` | Accurate v2.3 risk model | **Partly superseded** by local hardening; no account identity/public-service authorization remains |
| `14_CONCERN_REGISTER.md` | Complete v2.3 concern baseline | **Historical issue baseline, not current defect list**; reconcile against 2.4 concern dispositions |
| `15_CHANGE_SPECIFICATIONS.md` | Proposed remedies to v2.3 findings | Many stabilization items now implemented/partially implemented; proposal status needs implementation reconciliation |
| `16_EXPANSION_AND_USERSCRIPTS.md` | Target/proposal material, not baseline implementation | Still unimplemented in 2.4; companion gives the newer target architecture |
| `17_VERIFICATION_AND_APPROVAL.md` | Accurate record of the canon audit | **Historical verification only**; 2.4 has new automated/PHP evidence while native browser remains unrun |
| `18_SOURCE_INVENTORY.md` | Exact inventory of frozen 38-file v2.3 baseline | **Not an inventory of 2.4.0** |
| `19_SYMBOL_REFERENCE.md` | Exact 117-symbol v2.3 navigation aid | **Not a current 2.4.0 symbol reference** |
| `20_PROVENANCE_AND_CORRECTIONS.md` | Coherent provenance/correction record | Still historically valid; should gain a successor link to 2.4.0 |
| `XtraType_Canon_Reading_Edition.md` | Convenience compilation, not independent authority | Same status as modular canon; should not be mistaken for latest implementation docs |

### Canon evidence/reference files

`evidence/concerns.json`, `verification.json`, `source-manifest.json`, `symbols.json`, `characterize.mjs`, the three legacy reports, and `legacy-reference.md` are internally coherent as **historical evidence**. Their greatest currentness risk is not false content but a reader treating them as 2.4.0 runtime evidence.

The preserved `evidence/baseline/README.md`, `docs/ARCHITECTURE.md`, `docs/SCHEMAS.md`, `ext/INSTALL.txt`, and `tests/README.md` are legacy source documentation and are appropriately subordinated by the canon. They should never override the later canon corrections or 2.4.0 source.

## 8. Companion document-by-document audit

| Companion document | Coherency / truthfulness finding |
|---|---|
| `READ_ME.md` | Scope is coherent; **sentence saying current application behavior remains in existing XtraType canon is temporally stale once 2.4.0 is supplied** |
| `00_READ_ME_AND_AUTHORITY.md` | Excellent implemented-vs-target discipline; v2.3 foundation references are historical, not latest-code references |
| `01_PORTASHAPE_SERVICE_ARCHITECTURE.md` | Coherent target architecture; no evidence it exists at runtime, and document correctly says it does not |
| `02_PLUGIN_PACKAGE_LIFECYCLE.md` | Coherent target lifecycle and trust model; no implementation in 2.4.0 |
| `03_SHARED_CONTRACTS_AND_OPERATIONS.md` | Structurally coherent vocabulary/protocol; operation/schema registry validates; runtime absent |
| `04_XTRATYPE_CLIENT_INTEGRATION.md` | Correctly preserves v2 compatibility concept; target extension/anchor sidecars unimplemented; baseline references need 2.4 reconciliation |
| `05_SCRIPT_STUDIO_PLUGIN.md` | Target only; no runtime. Current Chrome `userScripts` platform assumptions checked and remain plausible/current |
| `06_STAY_DRY_PLUGIN.md` | Target only; consent/exclusion/bounded-execution requirements are specifications, not evidence |
| `07_BRIDGES_UNIVERSAL_PUBLISHER_CORE.md` | Target only; named destination examples are not support claims; document explicitly says qualification is required |
| `08_EXTERNAL_PLATFORM_PLUGIN_STANDARD.md` | Target only; no connector is shown implemented or qualified |
| `09_WEB_MOBILE_SURFACES.md` | Correctly distinguishes local/web/native/remote availability; existing web baseline should now cite 2.4.0 rather than v2.3 canon as latest implementation |
| `10_LOCAL_DATA_AND_DEFERRED_SERVICES.md` | Coherent distinction between proposed `portashape-local` and existing XtraType storage; deferred services remain absent |
| `11_VERIFICATION_AND_IMPLEMENTATION_SEQUENCE.md` | Strong evidence discipline; stages are not dates/releases; all 52 acceptance cases remain Not run |
| `12_GLOSSARY_REGISTRY_AND_CHANGE_CONTROL.md` | Registry terminology is internally consistent and matches structured inventories |
| `13_SOURCE_TRACEABILITY_AND_DECISIONS.md` | Strong provenance separation; references an earlier comparison ZIP not supplied here, so original D/W source contents cannot be independently re-read in this audit |
| `14_STRUCTURAL_CONTRACT_REFERENCE.md` | Generated structural reference is consistent with schemas; correctly warns that examples are synthetic and structure is not semantic/runtime proof |
| `READING_EDITION.md` | Exact convenience compilation of modular companion docs; no independent implementation authority |

### Companion structured artifacts

- **31 schemas:** structurally valid Draft 2020-12.
- **29 examples:** validate against their corresponding record schemas.
- **40 operations / 80 I/O definitions:** all bindings resolve.
- **Registry JSON/CSV:** counts and IDs are coherent.
- **Workbook:** all 11 data sheets match their CSV source tables; Summary formulas/counts are consistent; native desktop Excel was not tested and the package says so.
- **Acceptance:** AT001 through AT052 are all `Not run`; this remains truthful.
- **Package manifest:** file hash/size coverage is coherent.
- **Source fingerprints:** canon fingerprint matches supplied canon. The comparison/prototype sources themselves are not all supplied here, so their contents are not independently re-verifiable from this session.

## 9. XtraType 2.4.0 documentation audit

| 2.4 artifact | Finding |
|---|---|
| `README.md` | **High currentness/coherency.** Claims about scope, JSON storage, loopback, private data paths, preserved DB identity, no PortaShape, no auth, sync/export limits match source |
| `docs/ARCHITECTURE.md` | Matches source topology and boundaries; does not pretend local protections are account security |
| `docs/CONCERN_DISPOSITION.md` | Complete mapping of all 45 canon IDs; candid about partial/deferred/native gates; source/test references exist |
| `docs/FEATURE_PARITY.md` | Appropriate compatibility document; should be read as feature/parity analysis, not native acceptance certification |
| `docs/SCHEMAS.md` | Accurate bounded profile; does not overclaim full JSON Schema support |
| `docs/SOURCE_BASELINE.json` | Internally consistent with canon fingerprints and 38-file baseline. `prototypeMatchesCanonBaseline: true` is not independently re-verifiable here because the original prototype ZIP is not among current uploads |
| `docs/UPGRADE_AND_RECOVERY.md` | Conservative and coherent; importantly, upgrade safety remains a procedure/gate rather than a claim that every real owner profile has been migrated successfully |
| `docs/VERIFICATION.md` | Strong evidence hygiene: distinguishes recorded automated tests, mocks, native-browser failure, and unrun release gates |
| `docs/evidence/test-results.txt` | Internally consistent 32/32/0/0 recorded run; not silently treated here as an independent rerun |
| `docs/evidence/static-checks.json` | Consistent with package structure and source references; static checks are not runtime certification |
| `release-manifest.json` | Accurate summary of version, scope, local candidate status, JSON storage, absence of SQL/PortaShape, and verification limits |
| `package.json` / `package-lock.json` | Version and test/dependency metadata agree; no runtime npm dependency is required by server/extension |
| `tests/README.md` | Correctly describes developer-test workflow; ZIP excludes installed dependencies |
| `ext/INSTALL.txt` | Consistent with unpacked-extension/local-server delivery model |

I found no major claim in the 2.4.0 release documentation that is contradicted by the supplied 2.4.0 source. Its principal epistemic limitations are **explicitly disclosed**, rather than hidden.

## 10. All 45 canon concerns: latest status

The 2.4.0 concern-disposition table preserves every canon ID. The counts are:

- **29** dispositions whose leading status is implemented.
- **7** partial/mitigation/refactor dispositions.
- **9** deferred, retained, clarified, bounded/conservative, or known-limit dispositions.

This means the canon concern register must not be used as a present-tense defect list for 2.4.0.

| ID | 2.4.0 disposition | Audit interpretation |
|---|---|---|
| XT-001 | Deferred / local mitigation | No auth/ACL; exposure reduced locally, not solved for public use |
| XT-002 | Implemented; local HTTP tested | Old all-interface/raw-webroot defect is no longer current under supplied launcher/router |
| XT-003 | Implemented; regression tested | Dirty local merge protection exists; no distributed conflict protocol |
| XT-004 | Implemented; regression tested | Blob-link preservation added; preexisting lost binaries unrecoverable |
| XT-005 | Implemented; regression tested | Missing binary blocks sync instead of silent drop |
| XT-006 | Implemented; DOM tested | Feedback-loop mitigation exists; real YouTube acceptance still pending |
| XT-007 | Implemented; regression tested | Null whole-video time no longer collapses to zero |
| XT-008 | Implemented; mocked test | Capture pacing added; actual Chrome behavior unverified |
| XT-009 | Implemented; mocked test | Capture identity pinning added; real race acceptance unverified |
| XT-010 | Implemented; failure fixture | Cleanup/restoration path added; document loss can still prevent restoration |
| XT-011 | Implemented; DOM tested | Invalid context no longer falls back to example.com |
| XT-012 | Partial mitigation | Stale-draft safeguards improved; quoted selection still not durable reanchoring |
| XT-013 | Implemented; regression tested | Autosync-off automatic paths hardened; explicit network actions remain networked |
| XT-014 | Implemented bounded profile; HTTP tested | Stronger ingress validation; not full schema engine/auth |
| XT-015 | Implemented; regression tested | Reserved schema identity/kind protections added |
| XT-016 | Conservative guard; tested | Destination change blocked when local data exists; no migration UI |
| XT-017 | Implemented; HTTP tested | Malformed collections fail closed; old overwrite hazard superseded |
| XT-018 | Implemented; transaction tested | Aggregate local transactions added for note/blob/event and snapshot/blob |
| XT-019 | Implemented; tested | Blank GPS rejected; numeric zero retained |
| XT-020 | Implemented; tested | Shared query/fragment anchor logic improves parity |
| XT-021 | Implemented; tested | Empty all-query no longer wildcard-matches extra query |
| XT-022 | Implemented; tested | YouTube host/parser recognition tightened |
| XT-023 | Implemented limited profile; tested | Primitive typed constraints improved; unsupported semantics remain explicit |
| XT-024 | Implemented; DOM tested | Invalid/stale contextual projections guarded |
| XT-025 | Implemented; tested | Reply validation/status semantics improved |
| XT-026 | Implemented; DOM tested | YouTube lifecycle race mitigations added; real SPA acceptance pending |
| XT-027 | Implemented; manual visual gate | Code supports dismissal/focus/clamp; native visual/keyboard acceptance pending |
| XT-028 | Implemented bounds; native gate | Capture limits/flags added; sticky/fixed fidelity caveat remains |
| XT-029 | Partial mitigation | Memory/image budgets bounded; native stress and local oversize behavior remain |
| XT-030 | Implemented; source reviewed | Unequal dimensions rejected; native visual acceptance pending |
| XT-031 | Deferred gap retained | Snapshot download/restore and event sync absent |
| XT-032 | Deferred gap retained | No tombstone/deletion reconciliation |
| XT-033 | Partial mitigation; HTTP tested | Validate-before-write and content addressing added; metadata failure can leave orphan media |
| XT-034 | Implemented; failure tests | Timeout/error summaries improved; real stalled-network gate remains |
| XT-035 | Partial mitigation | Object URL/bitmap cleanup improved; no orphan-media GC |
| XT-036 | Deferred gap; recovery documented | Manual backup/rollback only; no complete import/migration system |
| XT-037 | Known scaling limit retained | Whole-file JSON storage remains |
| XT-038 | Boundary documented / mitigated | Intended data exposure paths remain; not a secrecy boundary from page/server |
| XT-039 | Implemented; DOM/HTTP tested | Web failure handling improved; web remains online/server-first |
| XT-040 | Partial mitigation | Accessibility improvements exist; full assistive-tech audit unrun |
| XT-041 | Clarified limitation | GPS preference semantics made explicit; exact-vs-Nearby behavior remains limited |
| XT-042 | Partial mitigation | Lockfile/tests added; CI/native E2E/license still unresolved |
| XT-043 | Deferred identity change | Existing canonicalization retained for compatibility; collision/precision caveats remain |
| XT-044 | Implemented UI guards; tested | Duplicate-submit/stale-file mitigations added; no distributed exactly-once guarantee |
| XT-045 | Partial refactor | Shared/modules split improved; no broad platform rewrite |

The disposition language itself is appropriately cautious; I did not find it claiming that mocked/source-level verification equals native browser acceptance.

## 11. External platform facts checked against current Chrome documentation

The companion's userscript design relies on a dated external platform assumption. Current Chrome documentation confirms:

- `chrome.userScripts` is available in Manifest V3 from Chrome 120+.
- Before Chrome 138, users need Developer Mode to enable the API; Chrome 138+ uses an extension-specific **Allow User Scripts** toggle.
- `userScripts.execute()` is Chrome 135+.

Thus the companion's choice to design around a Chrome 138+ experience is not evidence that the API starts at 138; it is a design floor/UX assumption. The companion treats it as a design decision rather than shipped behavior, which is coherent.

Chrome's Side Panel API is available earlier, but `sidePanel.open()` is Chrome 116+. Therefore XtraType 2.4.0's declared Chrome 116 floor is consistent with the behavior it uses.

Chrome also documents `tabs.captureVisibleTab()` as capped at two calls per second, which supports the canon/2.4 concern about capture pacing and the later 2.4 serialization mitigation.

## 12. Development-stage truth

The project should presently be described as follows:

### XtraType core

**Stage:** stabilization candidate after the v2.3 canon audit.  
**Implemented:** the established extension/web/local-JSON product plus numerous integrity, validation, sync, capture, lifecycle and local-server hardening changes.  
**Not established:** native browser release acceptance, real YouTube acceptance, public/multiuser security, distributed conflict safety, cross-device identity/sync, full backup/restore, production scale.

Mapping this to the companion's stage vocabulary, 2.4.0 clearly performs work that belongs to **C0 Baseline protection**, but the companion's formal C0 acceptance program has not been run as such. It would therefore be inaccurate to declare “C0 passed” solely from the 2.4 test suite.

### PortaShape and selected modules

- **C1 host/package boundary:** not implemented in supplied source.
- **C2 Script Studio/DRY local assistance:** not implemented.
- **C3 companion context/publishing:** not implemented as companion architecture; XtraType retains its existing narrower context functions.
- **C4 advanced behavior:** not implemented.
- **C5 additional local clients:** existing responsive web XtraType surface is present, but the specified package/permission management and native shell are not implemented.
- **Deferred service plane D:** remains deferred/unimplemented; existing local PHP routes are not a substitute.

## 13. Project self-awareness assessment

### Strong areas

1. **Implementation/specification separation:** the companion repeatedly says “target implementation specification, not implemented functionality.” This is borne out by the source.
2. **Evidence-class separation:** canon characterization, 2.4 automated tests, companion structural validation, and unrun native/acceptance gates are not conflated.
3. **Risk retention:** 2.4 carries all 45 canon IDs forward rather than deleting the historical problem register.
4. **Security honesty:** 2.4 explicitly says local/single-user, unauthenticated identities, no account ACL, and no public deployment certification.
5. **Scope honesty:** 2.4 explicitly excludes PortaShape and companion modules; source confirms it.
6. **Data-limit honesty:** snapshot upload-only, sparse events, no tombstones, no complete binary restore, and retained JSON scaling limits are stated.
7. **Registry honesty:** the companion's 52 acceptance cases are still Not run; structural correctness is not presented as runtime certification.

### Weak area

The project lacks a **single current-truth router** that says, in effect:

> “Canon v1.0 is the frozen v2.3 audit baseline. XtraType 2.4.0 is the latest supplied implementation descendant. Companion v0.1 remains the unimplemented target architecture. For current runtime behavior, consult 2.4.0 first; for historical defect/provenance context consult canon; for target requirements consult companion.”

Without that layer, a diligent reader following the boot prompt can be led to call known-fixed v2.3 behavior “current,” because the boot prompt was written before or independently of the 2.4.0 package.

## 14. Discrepancy register

| ID | Severity | Discrepancy | Truthful resolution |
|---|---|---|---|
| D-01 | High | Boot prompt defines current behavior as v2.3 while 2.4.0 is also supplied | Treat boot definition as canon-baseline scope only; add 2.4 as current implementation authority |
| D-02 | High | Companion says current application behavior remains in canon | Update wording: canon = frozen v2.3 baseline; 2.4 docs/source = latest implementation |
| D-03 | High | Canon concern register reads as current if version header is ignored | Always pair with `2.4.0/docs/CONCERN_DISPOSITION.md` for current defect status |
| D-04 | Medium | Canon HTTP/security/storage prose includes defects fixed/mitigated in 2.4 | Preserve historical text; add successor status links rather than rewriting history |
| D-05 | Medium | Canon verification says PHP/HTTP unrun, while 2.4 has a new PHP HTTP suite | Keep both records with explicit version/evidence dates; never merge them into one audit |
| D-06 | Medium | Canon source inventory/symbol reference can be mistaken for 2.4 navigation | Label as v2.3-only; create a 2.4 inventory/symbol index if needed |
| D-07 | Medium | Companion registry remains tied conceptually to v2.3 foundation | Reconcile prerequisites/references to 2.4 without marking target components implemented |
| D-08 | Low/Medium | New 2.4 evidence is not linked into companion AT001–AT052 | Add evidence links where relevant, but keep an AT case `Not run` until its exact acceptance procedure is executed |
| D-09 | Low | `prototypeMatchesCanonBaseline: true` cannot be independently rechecked without original prototype archive | Retain as provenance assertion backed by canon manifest; mark external source unavailable in current review |
| D-10 | Low | Recorded 32-pass suite can be mistaken for native browser certification | 2.4 docs already prevent this; preserve that language |
| D-11 | Low | Historical database name contains “portashape” | Do not infer host implementation from legacy storage identity; existing docs already warn against this |

No discrepancy found requires concluding that PortaShape is secretly implemented, that 2.4 is production-ready, or that the companion acceptance suite has run.

## 15. Recommended documentation correction order

This report does not propose changing historical canon content. The minimum coherence repair is a **successor/currentness overlay**, not a rewrite:

1. Add a top-level `CURRENT_STATUS.md` (or equivalent) that names 2.4.0 as latest supplied implementation and explicitly scopes canon to v2.3.
2. Update boot prompt “current behavior” language to distinguish **frozen canon baseline** from **latest supplied implementation**.
3. Update companion `READ_ME.md` and authority doc so “current application behavior” points first to 2.4.0, while canon remains historical baseline/provenance authority.
4. Cross-link every canon concern to its 2.4 disposition; do not edit away the original v2.3 finding.
5. Keep companion AT001–AT052 Not run until each exact acceptance case is executed; attach relevant 2.4 tests only as supporting evidence/prerequisites.
6. Add a 2.4 source/symbol inventory if the project wants the same navigation quality the canon provides for v2.3.

## 16. Claim-evaluation rules used

To avoid false contradictions, claims were classified before evaluation:

- **Historical factual claim:** checked against the preserved v2.3 source/evidence, not against desired architecture.
- **Current implementation claim:** checked against the newest supplied 2.4.0 source.
- **Target/normative claim (`MUST`, `SHOULD`, DESIGN):** evaluated for internal consistency, contract resolvability, and whether it is falsely presented as implemented.
- **Recorded test claim:** checked against preserved test/evidence artifacts and scope statements; not upgraded to an independent rerun unless actually rerun.
- **Structural-contract claim:** checked against schemas/examples/registry/workbook; not treated as semantic/runtime proof.
- **External platform claim:** checked against current official Chrome documentation where material.

This distinction is essential: a specification can be coherent and truthful without being implemented, and a historical defect can remain truthful history after it is fixed.

## 17. Final assessment

**Coherency:** High within each versioned layer; reduced when all layers are treated as one undifferentiated “current” corpus.  
**Consistency:** Strong for hashes, inventories, IDs, schemas, registry/workbook, concern continuity, and release metadata.  
**Accuracy:** Strong within stated version scopes. The principal inaccuracies arise only when v2.3-present-tense prose is reused as if it described 2.4.0.  
**Truthfulness of implementation claims:** Strong. Companion features are not falsely claimed as implemented; 2.4 limitations are unusually explicit.  
**Awareness of development stage:** Strong in 2.4.0 and companion documents themselves; **cross-document currentness awareness is incomplete** because authority routing was not updated after the 2.4.0 stabilization package appeared.  
**Release maturity:** XtraType 2.4.0 is a local/single-user stabilization candidate with meaningful automated/PHP evidence but unfinished native acceptance and known architectural gaps. PortaShape and its selected plugin/publishing ecosystem remain target specifications.

The most accurate one-sentence project status is:

> **XtraType 2.4.0 is the latest supplied local stabilization implementation descended from the canon's v2.3 baseline; the canon remains historical audit truth, while PortaShape companion v0.1 remains a structurally coherent but unimplemented target architecture.**

