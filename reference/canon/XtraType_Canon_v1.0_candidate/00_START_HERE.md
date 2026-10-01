# XtraType — Engineering canon and specification index

**Canon edition:** 1.0 approval candidate · **Baseline:** supplied v2.3 / extension 2.3.0 · **Audit date:** 2026-10-01

This is a fresh, source-grounded engineering documentation set for **XtraType**. It describes the supplied application, identifies defects and incomplete seams, and establishes proposed decisions for its next iteration. It is ready for approval; it is **not represented as already approved**. No application source has been changed.

XtraType attaches comments, quoted text, and images to typed targets, preserves browser-page observations, and resurfaces context through a Chrome extension and a responsive web companion. **PortaShape** names the interoperability, data transformation, and transport concerns beneath that product. The current package has no separate PortaShape SDK, service, or general transformation runtime.

## Read by purpose

| Document | Canonical responsibility |
|---|---|
| [01_AUTHORITY_AND_DECISIONS.md](01_AUTHORITY_AND_DECISIONS.md) | Authority, vocabulary, versioning, executive decisions, approval scope |
| [02_PRODUCT_AND_STATUS.md](02_PRODUCT_AND_STATUS.md) | Product inventory, history evidence, supported surfaces, missing capabilities |
| [03_ARCHITECTURE_AND_SEAMS.md](03_ARCHITECTURE_AND_SEAMS.md) | Runtime topology, concern ownership, shared code, trust and dependency seams |
| [04_RECORD_CONTRACTS.md](04_RECORD_CONTRACTS.md) | Every persisted record, settings, context, media and export shapes |
| [05_ANCHORS_AND_RESOLUTION.md](05_ANCHORS_AND_RESOLUTION.md) | URL/GPS/YouTube/custom semantics, exact keys, contextual matching, parity gaps |
| [06_SCHEMA_SYSTEM.md](06_SCHEMA_SYSTEM.md) | Catalog resolution, installation, primitive form behavior, validation gaps |
| [07_EXTENSION_SURFACES.md](07_EXTENSION_SURFACES.md) | Worker, panel, quick bar and YouTube lifecycles and UI contracts |
| [08_WORKFLOWS_AND_MESSAGES.md](08_WORKFLOWS_AND_MESSAGES.md) | End-to-end write/read flows and all internal message interfaces |
| [09_HTTP_AND_SERVER.md](09_HTTP_AND_SERVER.md) | All routes, filters, status codes, uploads, file persistence helpers |
| [10_STORAGE_AND_SYNC.md](10_STORAGE_AND_SYNC.md) | Durability, state transitions, replication order, overwrite and media hazards |
| [11_CAPTURE_AND_COMPARISON.md](11_CAPTURE_AND_COMPARISON.md) | Capture math, limits, page identity, timeline, pixel score and failure modes |
| [12_WEB_COMPANION.md](12_WEB_COMPANION.md) | Web/mobile behavior, geolocation, target parity, responsive/accessibility concerns |
| [13_SECURITY_AND_OPERATIONS.md](13_SECURITY_AND_OPERATIONS.md) | Trust, privacy, deployment, recovery, troubleshooting and release constraints |
| [14_CONCERN_REGISTER.md](14_CONCERN_REGISTER.md) | Prioritized findings with evidence, reproduction conditions, required outcomes |
| [15_CHANGE_SPECIFICATIONS.md](15_CHANGE_SPECIFICATIONS.md) | Modular fix specifications, target architecture and acceptance gates |
| [16_EXPANSION_AND_USERSCRIPTS.md](16_EXPANSION_AND_USERSCRIPTS.md) | Roadmap and bounded userscript proposal; unconfirmed scope explicitly held open |
| [17_VERIFICATION_AND_APPROVAL.md](17_VERIFICATION_AND_APPROVAL.md) | Checks actually run, missing verification, scenario matrix, approval checklist |
| [18_SOURCE_INVENTORY.md](18_SOURCE_INVENTORY.md) | Complete file inventory, checksums, imports, DOM IDs, configuration and event index |
| [19_SYMBOL_REFERENCE.md](19_SYMBOL_REFERENCE.md) | Source-located named function and handler index |
| [20_PROVENANCE_AND_CORRECTIONS.md](20_PROVENANCE_AND_CORRECTIONS.md) | Supplied-source provenance, prior-report reconciliation and glossary |

## Evidence language

- **CURRENT**: visible in this exact source package. It does not imply browser or server runtime certification.
- **VERIFIED**: reproduced by the checks explicitly reported in document 17.
- **DEFECT / RISK / GAP**: respectively a demonstrable contradiction, a plausible failure requiring additional runtime evidence, or absent functionality.
- **PROPOSED**: an executive specification for approval and subsequent implementation. It is not current behavior.
- **UNRESOLVED**: needs a product decision or external verification. Do not invent a commitment.

Use the structured target as semantic evidence. Do not infer a feature from a schema keyword, store, helper, endpoint, imported function, or label alone. In particular: there is no user-script manager; no snapshot download/restore flow; no event replication; no authenticated identity; and no complete offline image guarantee after annotation sync.

## Most consequential review findings

The local-first write path is valuable and implemented, but later full pulls can replace unsynced data. Successful annotation sync replaces local attachment descriptors with remote descriptors, losing the local Blob linkage. YouTube converts null start times to zero, contrary to the supplied reference, and its observer can be triggered by its own DOM changes. The 140 ms capture delay does not enforce Chrome's capture-rate ceiling. Startup scripts bind to all interfaces while the service has no access controls and its JSON data is beneath the web root.

These findings do not negate the user's working MVP. They establish its boundaries and the order in which to make it dependable before expanding execution capabilities.

## Package layout and use

The numbered Markdown files are the modular source of truth candidate. `evidence/baseline/` is an unchanged source copy for precise review; `evidence/legacy-reports/` and `evidence/legacy-reference.md` preserve historical claims, not new authority. `evidence/characterize.mjs` reproduces selected current quirks. `evidence/verification.json` records this audit's checks. `evidence/source-manifest.json` fingerprints inputs and files.

The companion single-file reading edition is a convenience compilation. On approval, maintain the modular documents and regenerate the compilation. Do not edit both independently.

The user's final phrase ended at “features similar to tampermonkey and”. Only the userscript direction is visible; the missing second comparison and full compatibility scope remain open. That omission does not block approval of the baseline architecture.
