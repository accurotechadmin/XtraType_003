# Current Authority — XtraType v.003

**Canonical forward project version:** **v.003**  
**Current application-code baseline:** v.003 corrective client patch; Chrome/npm/release technical identifier `2.5.1`.  
**Current development emphasis:** heavy server-side development, hardening, testing, and service-plane design while the personal client-side extension remains usable without server dependency.

## Conflict-resolution order

When two artifacts appear to disagree, resolve them by scope rather than by casually choosing the newest file:

1. **Executable truth:** current source and tests define what the software actually does.
2. **Current forward truth:** `reference/ssot/`, `docs/v003/`, `00_V003_START_HERE.md`, active root `EXPERT_SESSION_BOOT_PROMPT.md`, and root `README.md` define current status, process, and navigation.
3. **Forward specification truth:** any explicitly versioned post-v.001 specification delta or successor specification governs intended behavior within its declared scope.
4. **Selected foundational target:** `reference/specs/XtraType_PortaShape_Companion_v0.1/` remains the selected foundational PortaShape target where not explicitly superseded.
5. **Perpetual seed/canon truth:** Seed 1, historical canon, v.001 landmarks, preserved source snapshots, and original evidence remain authoritative for their time, compatibility commitments, accepted constraints, and provenance.

A target specification is never proof that code exists. Historical evidence is never automatically a current defect report. Current code is never permission to silently violate a documented foundational invariant.

## Mandatory pre-change check

Before a material change, identify:

- the user-visible behavior being changed;
- the authoritative current source path(s);
- the SSOT guard-dog rule(s) that apply;
- the foundational/legacy document(s) that explain the original contract;
- the target PortaShape/specification document(s), if the change touches future architecture;
- the closest existing test/evidence seam;
- whether the change alters trust, permissions, identity, portable data, network effects, migration, or compatibility.

If those cannot be named, the developer is not yet oriented enough to make the change safely.

## Immutable historical zones

Do not silently edit these to make them describe the present:

- `docs/v001/`
- `00_V001_START_HERE.md`
- `V001_EXPERT_SESSION_BOOT_PROMPT.md`
- `V001_INSTANTIATION_MANIFEST.json`
- original `docs/SEED_*`
- `reference/canon/XtraType_Canon_v1.0_candidate/`
- `reference/specs/XtraType_PortaShape_Companion_v0.1/`
- preserved source snapshots/evidence
- retired boot prompts under `reference/ssot/boot-prompts/retired/`

If a foundational spec requires change, create a successor/delta and update the router/pointers. Do not rewrite history.

## Owner-level standing instructions captured here

- “Update current docs” is a mandatory synchronization signal; see `08_VERSIONING_AND_CURRENT_DOCS_SIGNAL.md`.
- The project should remain recognizably a growing version of the current XtraType/PortaShape ecosystem rather than wander into a differently shaped product.
- The finite invitation ceiling for the current rollout exists but its number is confidential/owner-held and must not be inferred or exposed.
- Client-side personal use is a supported present mode; server-side public/service use is still developmental.
