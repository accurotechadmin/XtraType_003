# Seed 1 — PortaShape Target Architecture and Module Inventory

This is the Seed 1 bridge from the PortaShape companion registry to present implementation truth. The authoritative target details remain in `reference/specs/XtraType_PortaShape_Companion_v0.1/`; this file adds the current Seed 1 implementation interpretation.

## Product relationship

**XtraType remains the core application and first-party client. PortaShape is the wraparound host/service architecture around it.** PortaShape supplies package installation, local grants, operation routing, receipts/events, bounded storage/UI contributions, interoperability and selected plugin/core capabilities. It is not a rename for XtraType.

Seed 1 includes the PortaShape architecture as first-class repository material, but the host and selected plugin runtimes have not yet been written into the current 2.4 source.

## Modules

| ID | Module | Placement | Responsibility | Companion baseline status |
|---|---|---|---|---|
| PS | PortaShape | Core service | Plugin installation, grants, local invocation and interoperability boundary | New |
| XT | XtraType | First-party client | Context, annotations, anchors and relationships | Existing foundation + specified |
| SS | Script Studio | Plugin | User JavaScript authoring, installation, testing and promotion | Specified |
| DRY | Stay D.R.Y. | Plugin | Consented browser text assistance, patterns and routines | Specified |
| PUB | Bridges / Universal Publisher | Core feature | Canonical publishing, fidelity and replicas | Specified |
| EXT | Platform connector packages | Plugin family | Platform-specific transformations and authorized effects | Specified; providers unqualified |
| UI | Web/mobile surfaces | Shared clients | Local management and supported platform-specific execution | Existing narrow web + specified |
| DOC | Glossary and registry | Documentation | Versioned vocabulary, inventory and change control | Authored |

Current Seed 1 summary: XtraType has the implemented narrow foundation; the current PHP web surface supplies part of UI; documentation/registry assets are physically present; all other PortaShape host/plugin/publishing runtime capabilities remain specified rather than executable.

## All 60 target components with current Seed 1 status

| Component ID | Owner | Component | Responsibility | Stage | Seed 1 implementation truth |
|---|---|---|---|---|---|
| PS-C01 | PS | Installation coordinator | Validate/install/update/disable/remove and reconcile local packages | C1 | SPECIFIED — no runtime implementation in Seed 1 |
| PS-C02 | PS | Operation directory | Exact provider/version declarations and effective availability | C1 | SPECIFIED — no runtime implementation in Seed 1 |
| PS-C03 | PS | Grant broker | Local revision/site/operation authority and revocation | C1 | SPECIFIED — no runtime implementation in Seed 1 |
| PS-C04 | PS | Invocation coordinator | Bounded correlated calls and truthful effect outcomes | C1 | SPECIFIED — no runtime implementation in Seed 1 |
| PS-C05 | PS | Local repository boundary | Namespace transactions, migrations, quota and export | C1 | SPECIFIED — no runtime implementation in Seed 1 |
| PS-C06 | PS | Receipt/event boundary | Causal local receipts and versioned notifications | C1 | SPECIFIED — no runtime implementation in Seed 1 |
| PS-C07 | PS | UI contribution boundary | Packaged accessible contributions and cleanup | C1 | SPECIFIED — no runtime implementation in Seed 1 |
| PS-C08 | PS | Client bridge | Trusted context and XtraType draft/application interfaces | C1 | SPECIFIED — no runtime implementation in Seed 1 |
| SS-C037 | SS | Editor | JavaScript editor with syntax checking and minimal completion. | C2 | SPECIFIED — no runtime implementation in Seed 1 |
| SS-C038 | SS | Runner | Execute against current page or typed test fixture. | C2 | SPECIFIED — no runtime implementation in Seed 1 |
| SS-C039 | SS | Manifest Editor | Inputs, outputs, permissions, triggers, URL matches, capability names. | C2 | SPECIFIED — no runtime implementation in Seed 1 |
| SS-C040 | SS | Sandbox/Bridge | Controlled, separately granted host APIs; initial userscripts have no privileged bridge | C4 | SPECIFIED — no runtime implementation in Seed 1 |
| SS-C041 | SS | Local Library | Private scripts and versions. | C2 | SPECIFIED — no runtime implementation in Seed 1 |
| SS-C042 | SS | Package Import/Export | Portable JSON/shared contract bundle with code, manifest, tests, metadata. | C2 | SPECIFIED — no runtime implementation in Seed 1 |
| SS-C043 | SS | Trigger Manager | Manual, URL-match, event, or workflow-node invocation. | C2 | SPECIFIED — no runtime implementation in Seed 1 |
| SS-C044 | SS | Test Harness | Fixture inputs, mocked capabilities, expected output/side-effect assertions. | C4 | SPECIFIED — no runtime implementation in Seed 1 |
| SS-C045 | SS | Promotion Workflow | Scratch → personal script → micro-extension → plugin/workflow component. | C4 | SPECIFIED — no runtime implementation in Seed 1 |
| SS-C046 | SS | Diagnostics | Console output, permission violations, execution timing, provenance link. | C2 | SPECIFIED — no runtime implementation in Seed 1 |
| XT-C047 | XT | Target Resolver | Resolves one or more Handles to a current target. | C3 | EXISTING-NARROW in XtraType 2.4; companion expansion not implemented |
| XT-C048 | XT | Anchor Bundle | Canonical URL, selected text, nearby text, DOM/path hints, attributes/fingerprints as available. | C3 | SPECIFIED expansion; current XtraType has predecessor seams only where noted |
| XT-C049 | XT | Annotation Object | Body, author, target handles, tags, visibility, timestamps, provenance. | C3 | EXISTING-NARROW in XtraType 2.4; companion expansion not implemented |
| XT-C050 | XT | Context Relationship | Related-to, corrects, warns-about, alternative-to, references, supersedes. | C3 | SPECIFIED expansion; current XtraType has predecessor seams only where noted |
| XT-C051 | XT | Overlay Renderer | Shows contextual markers/threads in the browser host/page UI. | C3 | EXISTING-NARROW in XtraType 2.4; companion expansion not implemented |
| XT-C052 | XT | Capture UI | Create annotation from URL, selection, object, place/time later. | C3 | EXISTING-NARROW in XtraType 2.4; companion expansion not implemented |
| XT-C053 | XT | Visibility/Sharing | Local visibility intention; shared/group/public enforcement blocked by deferred identity/authorization | C3 | BLOCKED/DEFERRED beyond local intent; no shared-authority implementation |
| XT-C054 | XT | Conversation Layer | Local target/annotation threads; remote participants and groups blocked by deferred services | C3 | EXISTING-NARROW in XtraType 2.4; companion expansion not implemented |
| XT-C055 | XT | Alternative Content | Replacement/alternate representation linked to target. | C3 | SPECIFIED expansion; current XtraType has predecessor seams only where noted |
| XT-C056 | XT | Feed/Query API | Retrieve context by handle/object/relation/visibility. | C3 | EXISTING-NARROW in XtraType 2.4; companion expansion not implemented |
| DRY-C057 | DRY | Observation Consent | Per-site/per-surface authorization and clear pause/disable controls. | C2 | SPECIFIED — no runtime implementation in Seed 1 |
| DRY-C058 | DRY | Input Observer | Captures normalized repeated text/input patterns without indiscriminate collection. | C2 | SPECIFIED — no runtime implementation in Seed 1 |
| DRY-C059 | DRY | Action Observer | Captures user-authorized browser events as typed capability invocations. | C4 | SPECIFIED — no runtime implementation in Seed 1 |
| DRY-C060 | DRY | Pattern Detector | Clusters repeated sequences and estimates stable/variable portions. | C2 | SPECIFIED — no runtime implementation in Seed 1 |
| DRY-C061 | DRY | Template Extractor | Converts repeated text into static or parameterized templates. | C2 | SPECIFIED — no runtime implementation in Seed 1 |
| DRY-C062 | DRY | Routine Extractor | Converts repeated action sequences into workflow candidates. | C4 | SPECIFIED — no runtime implementation in Seed 1 |
| DRY-C063 | DRY | Procedure Extractor | Adds inputs, outputs, state, conditions, checkpoints, and stop criteria. | C4 | SPECIFIED — no runtime implementation in Seed 1 |
| DRY-C064 | DRY | Suggestion UI | Explains observed pattern and asks user to save/parameterize/edit. | C2 | SPECIFIED — no runtime implementation in Seed 1 |
| DRY-C065 | DRY | Variable/Default Manager | Fields, defaults, selections, dynamic values, prior-output bindings. | C2 | SPECIFIED — no runtime implementation in Seed 1 |
| DRY-C066 | DRY | Promotion Bridge | Open reviewed routine/template in Script Studio or local routine inspector without activating it | C4 | SPECIFIED — no runtime implementation in Seed 1 |
| EXT-C067 | EXT | Connector Descriptor | Target service/site, versions, supported capability operations, authentication modes. | C3 | SPECIFIED — no connector package runtime |
| EXT-C068 | EXT | Source Adapter | External representation → canonical shape. | C3 | LEGACY/NARROW PRECURSOR ONLY — no PortaShape connector package runtime |
| EXT-C069 | EXT | Target Adapter | Canonical shape → external representation. | C3 | LEGACY/NARROW PRECURSOR ONLY — no PortaShape connector package runtime |
| PUB-C070 | PUB | Canonical Shape Library | Publication, ForumPost, SocialPost, Listing, media/link abstractions. | C3 | SPECIFIED — no runtime implementation in Seed 1 |
| PUB-C071 | PUB | Field Mapping | Correspondence/defaults/normalization rules. | C3 | SPECIFIED — no runtime implementation in Seed 1 |
| PUB-C072 | PUB | Fidelity Report | Preserves/approximates/drops/needs-user-input. | C3 | SPECIFIED — no runtime implementation in Seed 1 |
| PUB-C073 | PUB | Account Binding | Destination configuration referencing a Credential Reference and defaults. | C3 | SPECIFIED — no runtime implementation in Seed 1 |
| PUB-C074 | PUB | Publisher Composer | One compose surface for conceptual Publication. | C3 | SPECIFIED — no runtime implementation in Seed 1 |
| PUB-C075 | PUB | Destination Selector | Select configured targets/accounts and per-target overrides if needed. | C3 | SPECIFIED — no runtime implementation in Seed 1 |
| PUB-C076 | PUB | Preview/Validation | Target-shaped preview, missing-required-field prompt, fidelity warnings. | C3 | SPECIFIED — no runtime implementation in Seed 1 |
| PUB-C077 | PUB | Publish Workflow | Transform → validate → execute → capture external handle → provenance. | C3 | SPECIFIED — no runtime implementation in Seed 1 |
| PUB-C078 | PUB | Replica Set Manager | Associates returned handles with one conceptual Publication. | C3 | SPECIFIED — no runtime implementation in Seed 1 |
| UI-C103 | UI | Web Library | Objects, annotations, scripts/packages, helpers, procedures, replica sets. | C5 | EXISTING-NARROW web behavior; full companion component not implemented |
| UI-C104 | UI | Workflow/Execution View | Run status, steps, inputs, provenance, pause/resume/cancel. | C5 | SPECIFIED — not implemented as companion surface |
| UI-C105 | UI | Package Manager | Import/export/install/update/remove packages. | C5 | SPECIFIED — not implemented as companion surface |
| UI-C106 | UI | Account/Permission Center | Local permissions/session status; centralized account/device administration blocked | C5 | SPECIFIED — not implemented as companion surface |
| UI-C107 | UI | Annotation Feed | Context feed and object-centered views. | C5 | EXISTING-NARROW web behavior; full companion component not implemented |
| UI-C108 | UI | Publisher Web Surface | Compose canonical Publication and choose configured destinations where supported. | C5 | SPECIFIED — not implemented as companion surface |
| UI-C109 | UI | Responsive Mobile Web | Immediate mobile access before native app. | C5 | EXISTING-NARROW web behavior; full companion component not implemented |
| UI-C110 | UI | Native Mobile Shell | Later local share ingestion and explicit location/time capture; sync/remote notifications blocked | C5 | SPECIFIED — not implemented as companion surface |
| DOC-C01 | DOC | Glossary | Selected semantic vocabulary and authority | C1 | INSTANTIATED AS DOCUMENTATION/REGISTRY — not a runtime component |
| DOC-C02 | DOC | Relational registry | Versioned engineering index updated with each change | C1 | INSTANTIATED AS DOCUMENTATION/REGISTRY — not a runtime component |

## Surfaces

| ID | Owner | Surface | Host | Intended behavior | Stage |
|---|---|---|---|---|---|
| SF01 | XT | XtraType side panel | Chrome extension | Primary annotation composer and context | C0 |
| SF02 | PS | Plugin manager | Extension-owned UI | Install/permissions/effective state | C1 |
| SF03 | SS | Script editor/library | Extension-owned UI | Source/revisions/fixtures/registration | C2 |
| SF04 | DRY | Input assistance | Authorized browser fields | Suggestions, variables, insertion and pause | C2 |
| SF05 | PUB | Publisher composer/results | Extension-owned UI | Destination previews and per-target outcomes | C3 |
| SF06 | EXT | Destination configuration | Host contribution slot | Platform fields and account status | C3 |
| SF07 | XT | Anchored context overlay | Authorized page | Local resolved/ambiguous context | C3 |
| SF08 | UI | Web local library | Ordinary web origin | Inert packages/helpers/drafts and available local operations | C5 |
| SF09 | UI | Responsive mobile web | Mobile browser | Same local contracts; no extension privilege | C5 |
| SF10 | UI | Native local share/capture | Selected future native host | Explicit shared content/location/time draft | C5 |
| SF11 | PS | Activity/permissions | Host-local management | Receipts, errors, grants and local sessions | C1 |
| SF12 | XT | Existing PHP companion | Legacy web deployment | Existing Post/All/Nearby/schemas only | C0 |

Only `SF01` (current XtraType side panel) and `SF12` (existing PHP companion) have direct current runtime manifestations. `SF07` has a narrow predecessor through existing page/YouTube projections. The remaining surfaces are target surfaces until code/evidence says otherwise.

## Selected seams / interactions

| ID | Direction | Shared seam | Operations | Boundary |
|---|---|---|---|---|
| IX01 | XT → PS | Current context and reviewed drafts | context.capture / xtratype.proposeDraft | Document generation; user review |
| IX02 | SS → PS | Package install and effective registrations | package.* / script.execute | Revision and site grants |
| IX03 | DRY → PS | Consented observation/insertion | dry.observe / dry.insert | Site/field consent; no implicit submit |
| IX04 | DRY → SS | Helper/routine promotion | dry.promote / script.importDraft | Draft only; no grant transfer |
| IX05 | DRY → XT | Composer assistance | dry.insert | Eligible field and current gesture |
| IX06 | DRY → PUB | Selected text/presets | publish.compose | Draft creation is not posting authority |
| IX07 | PUB → EXT | Transform, preview and publish | connector.* | Pinned account/plan; fidelity; evidence |
| IX08 | PUB → XT | Context on object or representation | xtratype.relate / xtratype.proposeDraft | Explicit target scope and selected content |
| IX09 | SS → XT | Later typed draft proposal | xtratype.proposeDraft | Trusted script identity prerequisite |
| IX10 | SS → EXT | Promote tested adapter code | Package staging | Privileged code requires host release catalog |
| IX11 | UI → PS | Local management and inert import/export | host.describe / package.* / data.* | Host-local availability; no remote channel |
| IX12 | UI → PUB | Local compose/preview/status | publish.compose / publish.preview | Execution only where supported locally |
| IX13 | UI → XT | Context rendering/local drafts | xtratype.readContext | No new private remote feed |
| IX14 | UI → DRY | Local template management | dry.saveTemplate | No system-wide mobile observation |
| IX15 | UI → SS | Inspect source and inactive packages | package.inspect / script.importDraft | Imported source stays disabled |
| IX16 | DOC → PS | Versioned inventory and implementation evidence | Registry release | Planning state never runtime authority |

These interaction rows are architectural constraints, not evidence of a running operation bus.

## Stages

| ID | Stage | Scope | Exit gate |
|---|---|---|---|
| C0 | Baseline protection | Existing XtraType safety/integrity prerequisites | C15 relevant stabilization gates |
| C1 | Host/package boundary | Install, grants, local stores, receipts | Package/isolation/host-unavailable tests |
| C2 | Local assistance | Userscripts and consented text helpers | Site/IME/insertion/registration tests |
| C3 | Context and publishing | Anchors, local relations, qualified connectors | Ambiguity + partial/unknown outcome recovery |
| C4 | Advanced selected behavior | Typed bridges, finite routines, promotion | Identity/isolation/bounds tests |
| C5 | Additional local clients | Web/native local management/share | Inert import and truthful locality |
| D | Service deferral | No new backend/identity/sync implementation | Requires a new owner-approved service specification |

The current 2.4 implementation contains meaningful C0-style stabilization work, but the companion acceptance program has not been executed as the formal C0 gate. Do not declare C0 “passed” from the 2.4 suite alone. C1 host/package runtime is the first major not-yet-implemented platform layer.

## Deferred service boundary

Decision DEC-09 keeps backend/API/identity/sync expansion deferred. This blocks truthful shared/private/group identity enforcement, cross-device grant continuity, remote execution, remote notifications and similar service-dependent behaviors. The existing local PHP JSON API continues to exist, but it must not be relabeled as the deferred service plane.

## Scope exclusions retained

Seed 1 does not activate omitted prototype projects such as a general Runtime, ObjectClick, LLM harvesting, standalone POSH, or an ecosystem-wide control plane. Internal host responsibilities required by the selected architecture do not authorize importing those omitted systems.
