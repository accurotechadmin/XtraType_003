# XtraType v.001 — Authority, Instantiation, and Perpetual Legacy Seal

**Instantiation:** October 1, 2026 at 09:06:53 EDT (UTC-04:00)  
**Canonical forward designation:** XtraType v.001  
**Predecessor package SHA-256:** `e8dd69c287036c97a421bd8c1b0a5ba2e88c5d5240e87f30a64751dcba57fd8b`  
**Predecessor package:** `XtraType-Seed-1-Repository-updated-2026-10-01-v3(1).zip`

## 1. Executive declaration

XtraType v.001 begins here. The project is not being restarted by discarding its past; it is being restarted **from a sealed, permanent foundation**.

The 260 files that existed immediately before this instantiation are collectively designated the **Perpetual Legacy Seed Standard**. They retain permanent authority as the original instantiated seed, historical canon, target specification corpus, implementation baseline, verification record, and provenance evidence. Their exact bytes are sealed in `V001_LEGACY_SEED_SHA256SUMS.txt` and enumerated in `V001_LEGACY_BASELINE_MANIFEST.json`.

No predecessor document is retroactively edited by this instantiation. No predecessor source file is renamed, moved, or modified. The existing root `README.md`, `SEED_MANIFEST.json`, `release-manifest.json`, `EXPERT_SESSION_BOOT_PROMPT.md`, `docs/SEED_*`, `reference/canon/*`, and `reference/specs/*` are therefore read as **time-stamped predecessor authority**, not as the forward current-status router.

## 2. Authority layers from v.001 forward

Use the following precedence by claim type.

| Claim type | First authority | Supporting authority |
|---|---|---|
| What is current at v.001 | `01_CURRENT_STATUS_2026-10-01T090653-0400.md` | current source tree + v.001 manifest |
| What the product is for | `03_PRODUCT_ETHOS_PURPOSE_AND_LONG_HORIZON.md` | sealed Seed 1 canon/specs and owner direction |
| How current code is wired | current source + `02_ARCHITECTURE_WIRING_HARNESS_COMPONENT_MAP.md` | predecessor component/workflow indexes |
| How future work changes | `04_CHANGE_CONTROL_VERSIONING_AND_FIDELITY.md` | companion change-control rules + legacy decisions |
| How scripts/modules/plugins may grow | `05_ECOSYSTEM_EXTENSIBILITY_AND_COMMUNITY_GUARDRAILS.md` | PortaShape companion package/grant/operation specs |
| What is verified | named current evidence | preserved predecessor verification, explicitly historical |
| Historical implementation/audit truth | sealed predecessor file at its original path | baseline hash manifest |
| PortaShape target semantics not yet implemented | sealed companion specification corpus | v.001 forward decisions when explicitly added later |
| How did we get here? | `07_PROVENANCE_AND_HOW_WE_GOT_HERE.md` | all sealed predecessor provenance/evidence |

A specification does not prove implementation. A test does not prove untested native behavior. A newer status document does not erase an older fact about what existed at its timestamp.

## 3. Meaning of “perpetual legacy”

“Legacy” here is a preservation classification, **not a demotion**. It means:

- frozen and immutable;
- always admissible as provenance and original design evidence;
- never silently rewritten to match later behavior;
- always available as a reset point for product identity and compatibility reasoning;
- subordinate to newer documents only for questions that explicitly ask what changed *after* the snapshot;
- never deleted while XtraType/PortaShape continues as this project lineage.

The project may outgrow implementations, but it must not outgrow its ability to explain why those implementations and constraints existed.

## 4. v.001 status vocabulary

Use these labels literally: **IMPLEMENTED**, **VERIFIED-NOW**, **RECORDED-VERIFIED**, **SPECIFIED**, **PARTIAL**, **DEFERRED**, **HISTORICAL/PERPETUAL-LEGACY**, **OPERATIONAL-POLICY**, and **UNRESOLVED**.

The phrase **CANONICAL FORWARD** means the current v.001-and-later authority chain. The phrase **PERPETUAL LEGACY STANDARD** means immutable predecessor authority.

## 5. Compatibility and lineage rule

A forward change is presumed valid only when it can be described as one of:

- a compatible extension of an existing concept;
- a defect correction that preserves intended identity;
- an explicitly versioned migration with rollback/recovery and provenance;
- implementation of an already selected PortaShape/XtraType target contract;
- an owner-approved new capability recorded with its scope, trust boundary, data model, and acceptance criteria.

Wholesale replacement, silent identifier churn, history rewriting, privilege widening, or rebranding that makes XtraType/PortaShape unrecognizable requires explicit owner approval and a recorded architectural decision.

## 6. Confidential invitation-capacity policy

The owner has established a **finite invitation-capacity ceiling** for the current testing/scaling phase. The numeric ceiling is intentionally not recorded in this repository. Treat the existence of that ceiling as **OPERATIONAL-POLICY**. Do not infer, expose, guess, or hard-code a number without explicit owner direction.

The current source enforces per-user invite cadence and administrative controls but does **not** itself prove enforcement of that confidential total ceiling. Deployment procedures must respect the owner-held limit until code-level enforcement is explicitly requested.

## 7. Owner-authorized root README promotion — 2026-10-01 10:10 EDT

The owner subsequently directed that root `README.md` be updated into the forward-facing overview for the completed v.001 instantiation. This is an explicit exception to the original statement that the predecessor root README would remain unchanged in place.

The original root README content is preserved verbatim at `reference/canon/V001_ROOT_README_PRE_PROMOTION_2026-10-01.md`; its historical SHA-256 remains recorded in `V001_LEGACY_SEED_SHA256SUMS.txt`. The root path now belongs to the `V001_FORWARD` authority layer for project overview/status routing. This exception does not authorize silent rewriting of any other perpetual-legacy file.
