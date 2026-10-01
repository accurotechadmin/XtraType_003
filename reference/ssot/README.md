# XtraType + PortaShape Forward SSOT / Canon Reference System

**Current canonical project version:** **XtraType v.003**  
**Effective:** 2026-10-01 17:26 EDT  
**Role:** mandatory forward-facing navigation, anti-drift, decision, logging, versioning, and documentation-control layer.

This directory is the first place future developers, coding LLMs, reviewers, maintainers, and release operators should look when the question is **“what must I read before changing this?”** It does not replace the sealed Seed 1 / v.001 canon. It is the guard-dog layer that continuously points work back to the right legacy authority, current implementation, current status, target specification, and accepted convention.

## The rule

Every material change from v.002 forward must begin by consulting this directory. A change is not complete merely because code works. It is complete when the implementation, tests/evidence, current-status documents, affected decisions/specifications, logs, and version/authority pointers all agree.

The phrase **“update current docs”** has a standing project meaning from v.002 forward. It means:

1. update `reference/ssot/CURRENT_POINTERS.json` when a current pointer changes;
2. update the applicable mutable SSOT documents in this directory;
3. update the active current-status/version documents under the current `docs/v00N/` directory;
4. update the active root boot prompt and root README when their claims or navigation are affected;
5. add or amend the applicable forward decision/change/log record;
6. update any forward specification delta whose contract or target behavior changed;
7. regenerate the current package authority/checksum manifests;
8. **do not** rewrite retired boot prompts, sealed Seed 1 documents, v.001 landmarks, historical canon, or the original PortaShape companion specification in place.

## Read this directory in this order

1. `00_CURRENT_AUTHORITY.md` — what is authoritative now and how conflicts resolve.
2. `01_DOCUMENT_ROUTER.md` — task-to-document and task-to-code map.
3. `02_ANTI_DRIFT_GUARD_DOGS.md` — invariants that should bark before scope drifts.
4. `03_CHANGE_PROTOCOL.md` — required workflow for code/docs/spec/security changes.
5. `04_CODE_AND_CONTRACT_REFERENCE_MAP.md` — canonical implementation seams and reference examples.
6. `05_DOCUMENT_LIFECYCLE_AND_RETIREMENT.md` — current vs landmark vs legacy rules.
7. `06_DECISION_AND_LOGGING_PROTOCOL.md` — how decisions, logs, and unresolved questions are recorded.
8. `07_BOOT_AND_HANDOFF_PROTOCOL.md` — session start/end and boot-prompt policy.
9. `08_VERSIONING_AND_CURRENT_DOCS_SIGNAL.md` — v.00N rules and “update current docs”.
10. `09_ECOSYSTEM_SCOPE_AND_INTEROPERABILITY.md` — XtraType/PortaShape/Script Studio/Stay D.R.Y./Publisher/connectors scope.
11. `10_TEST_RELEASE_SECURITY_GATES.md` — evidence and widening-audience gates.
12. `11_GLOSSARY_NAMING_AND_IDENTIFIERS.md` — names that must not be casually collapsed or renamed.
13. `CURRENT_POINTERS.json` — machine-readable current pointers.
14. `reference/ssot/decisions/CURRENT_DECISION_REGISTER.md` — current forward decisions and open boundaries.

## Three kinds of truth

- **Current truth:** mutable forward pointers/status describing what is current now.
- **Landmark truth:** timestamped/versioned records that stay true about a specific point in history.
- **Foundational truth:** the sealed Seed 1, v.001, historical canon, selected PortaShape specifications, and source evidence that define origin, compatibility, ethos, and accepted direction.

Newer does not mean “allowed to erase older.” A newer document may supersede a current instruction while the older landmark remains authoritative evidence for how and why the project arrived there.

## Current state in one line

**XtraType v.003 repairs side-panel entry/toggling for Ctrl+Q while retaining Chrome's native toolbar-button toggle and the local-first personal client baseline.** The executable technical patch is 2.5.1; native Chrome acceptance of the repair remains pending, and server-side work remains under heavy development.
