# XtraType v.003

**Canonical project version:** **v.003**  
**Current personal client status:** **v.003 side-panel toggle repair implemented; local-first baseline retained; native Chrome acceptance of the repair remains an owner-side gate**  
**Current server status:** **under heavy server-side testing and development**  
**Application technical identifier:** `2.5.1` (corrective client patch for canonical v.003)  
**Forward developer SSOT:** [`reference/ssot/`](reference/ssot/)

**v.003 corrective change:** `Ctrl+Q` is bound to Chrome's reserved `_execute_action` command, matching the supplied working demo. Chrome routes the shortcut through the same native extension-action path as the toolbar button, with `openPanelOnActionClick` enabled. The superseded manual `toggle-xtratype` / context-detection / explicit-close branch has been removed; minimum Chrome is 116.

XtraType is a contextual information system: notes, conversations, snapshots, relationships, and structured records can live beside the page, video, place, moment, selection, or other object they are actually about. PortaShape is the larger framework intended to let XtraType, scripts, plugins, publishing tools, reusable text helpers, connectors, and future clients interoperate without turning them into one inseparable application.

The project deliberately supports both ends of that spectrum. Someone who only wants the local XtraType extension should be able to use it. Someone who wants a script canvas or Stay D.R.Y. helper can use those pieces. A power user or community developer can eventually combine XtraType + PortaShape + Script Studio + Stay D.R.Y. + Universal Publisher/Bridges + connectors into a richer system. **Cohesion is the goal; forced adoption is not.**

---

## Fastest way to try XtraType right now

The personal client-side extension does not require the developing central server for ordinary local use.

1. In Chrome, navigate to `chrome://extensions`.
2. Turn on **Developer mode**.
3. Click **Load unpacked**.
4. Select the repository's `/ext` folder.
5. Open a normal page and use the XtraType extension button or **Ctrl+Q** to toggle the side panel.

Useful shortcuts/current behavior:

- **Ctrl+Q** toggles the XtraType side panel through Chrome's reserved `_execute_action` command; the toolbar extension button uses the same native action/side-panel path.
- Type **`xt`**, press Space in Chrome's address bar, type a comment if desired, then press Enter to open the composer with that text transferred into the comment area; available highlighted page text is also carried into context.
- Built-in attachment targets include **URL, Time, YouTube video, and GPS**.
- Annotations up to seven days old are shown as “young” with a green tree indicator, including your own. Reading does not clear that age signal; **Mark all as old** explicitly resets the current relevant set.
- Quick **Snapshot** defaults to full-page capture; Capture settings can switch the quick behavior to visible-only.

If Chrome reports that an unpacked extension needs reloading after you edit source, return to `chrome://extensions` and click the extension's reload button, then refresh the page you are testing. A stale page/content script can otherwise look like a code regression when it is only an old injected instance.

---

# Current development posture

## Client-side: the stable hands-on baseline

The current extension is designated **tested and working for personal client-side functionality that does not depend on the server**. Its local-first IndexedDB model makes local authoring and contextual use real functionality, not an offline demo mode.

Current client capabilities include:

- MV3 Chrome extension + native side panel;
- local annotation/blob/schema/snapshot/event storage;
- contextual authoring and reading;
- URL, Time, YouTube, GPS, and bounded custom anchors;
- automatic refresh when active tabs or URLs change, including SPA/history/fragment navigation;
- Base URL plus query/fragment controls;
- omnibox and keyboard side-panel entry flows;
- seven-day young/tree/badge presentation with explicit Mark all as old;
- page/YouTube contextual projections;
- visible/full-page capture and snapshot history/compare;
- local-first commit with optional remote synchronization hooks;
- reorderable Author and Annotations sections while the rest of the side panel stays fixed.

“Tested and working” is deliberately narrower than “certified everywhere.” Historical and current verification documents distinguish automated tests, static checks, PHP integration, native/manual acceptance, and target acceptance.

## Server-side: heavy development underway

The repository also contains an increasingly capable PHP/JSON service: contextual APIs, registration/login, first-account administration, single-use invitations, invitation provenance, account/invite enable controls, per-user profile JSON data, contact groups, direct messages, and access-controlled XT Group Chats.

That service is **under heavy development and testing**. Do not interpret existing endpoints as proof of production-grade public hosting, hardened account recovery, generalized cross-device synchronization, distributed conflict handling, E2E messaging, full abuse prevention, or completed public-scale deployment.

A finite owner-established invitation ceiling governs the current testing rollout. Its number is intentionally not stored or inferred in this repository. The per-user invitation-generation cadence in code is a separate rule.

---

# The ecosystem in plain language

## XtraType — context attached to the thing itself

XtraType is the application people see first. Instead of forcing every idea into a feed or silo, it lets context attach to a target: a web page, a video, a place, a moment/timeframe, selected text, and eventually richer portable objects/relationships.

That same machinery can support private notes, team knowledge, public conversation, corrections, alternatives, references, snapshots, machine-generated context, or community discussion—subject to the visibility/permission model actually implemented.

## PortaShape — framework, plugin system, script canvas substrate, and data transportation hub

PortaShape is not a replacement name for XtraType. It is the framework intended to make a broader ecosystem interoperable.

Its selected direction includes:

- package/plugin identity, revisions, installation, enable/disable, lifecycle, cleanup, rollback, and updates;
- explicit capability permissions/grants rather than “installed means trusted”;
- stable typed operations so tools can ask one another for work without private-database coupling;
- namespaced plugin data and controlled UI contributions;
- portable records, relationships, representations, provenance, fidelity, receipts, and compatibility metadata;
- a **data transportation hub** among XtraType, plugins, scripts, local/shared clients, publishing flows, and connectors;
- clear separation between ordinary user-authored code and privileged reviewed host/connector code;
- eventual service/client interoperability without assuming every client has browser-extension privileges.

Think of PortaShape as the common sockets, buses, permission gates, package loader, and shipping containers that let independently useful tools become more powerful together.

## Script Studio — a canvas for scripts and small tools

Script Studio is the selected PortaShape plugin direction for writing, revising, testing, inspecting, installing, and sharing bounded scripts/helpers. A personal script can stay personal. Reusable packages can grow from them. Privileged authority remains a separate review/grant question rather than something a script gains automatically.

## Stay D.R.Y. — reusable text without surrendering control

Stay D.R.Y. is the reusable text/pattern assistance direction. Its core guardrails are consent, exclusions, lifecycle/TTL, explicit insertion, and **no implicit submit**. It should help people avoid repetitive typing without secretly becoming an autonomous posting agent.

## Universal Publisher / Bridges — one composition, many representations

The publishing layer is intended to let users compose canonical content/representations, preview fidelity, choose destinations/accounts, and publish through separate provider connectors. The system should record receipts and distinguish success, failure, and unknown outcomes so an ambiguous network result is never blindly retried as though nothing happened.

## External connectors

Connectors translate PortaShape operations into external platform APIs/effects. Credentials and grants stay local/account scoped; portable packages/data do not smuggle authority between machines.

## Shared clients

Future web/mobile/desktop/local clients can speak the same portable contracts while exposing only capabilities their host actually has. A web client should not pretend it has privileged extension APIs just because the data model is shared.

---

# The forward SSOT/canon system — read this before changing things

v.003 continues the central guard-dog system under **`reference/ssot/`**, established in v.002. Every material future change should consult it first.

Start with:

1. `reference/ssot/README.md` — gateway;
2. `reference/ssot/00_CURRENT_AUTHORITY.md` — conflict resolution/current authority;
3. `reference/ssot/01_DOCUMENT_ROUTER.md` — “what should I read for this task?”;
4. `reference/ssot/02_ANTI_DRIFT_GUARD_DOGS.md` — invariants;
5. `reference/ssot/03_CHANGE_PROTOCOL.md` — implementation workflow;
6. `reference/ssot/04_CODE_AND_CONTRACT_REFERENCE_MAP.md` — canonical code/spec examples;
7. `reference/ssot/CURRENT_POINTERS.json` — machine-readable current pointers.

### Important standing phrase

From v.002 forward, **“update current docs”** has a formal meaning. It tells the developer to run the synchronization checklist in `reference/ssot/08_VERSIONING_AND_CURRENT_DOCS_SIGNAL.md`: current pointers, current status, boot prompt, README, decisions, applicable specification deltas, manifests, and other affected current references must agree.

Versioned old landmarks are not rewritten to look current. They are preserved and the current layer points past them.

---

# “I remember seeing something in the README…” emergency index

This section is intentionally more operational than most READMEs. It exists for the moment when someone vaguely remembers that the repository already explained a problem.

### I don't know which document is authoritative
Read `reference/ssot/00_CURRENT_AUTHORITY.md` and `CURRENT_POINTERS.json`.

### I need to change code but don't know which old canon/spec matters
Use `reference/ssot/01_DOCUMENT_ROUTER.md`.

### A proposed feature feels like it might bend the product out of shape
Run through `reference/ssot/02_ANTI_DRIFT_GUARD_DOGS.md` before coding.

### I changed behavior; which documentation am I supposed to update?
Read `reference/ssot/08_VERSIONING_AND_CURRENT_DOCS_SIGNAL.md`.

### I need a new expert coding session to understand everything
Use root `EXPERT_SESSION_BOOT_PROMPT.md`.

### I need to know why the project looks like this
Trace: `docs/v003/` → `docs/v002/` → `docs/v001/07_PROVENANCE_AND_HOW_WE_GOT_HERE.md` → Seed docs → historical canon → selected PortaShape specification.

### I need to know what actually runs instead of what is planned
Read current source first. Then use the current status and code reference map. Specifications describe targets, not implementations.

### I need to recover from a documentation disagreement
Do not rewrite the older file. Determine its scope/time, preserve it, then fix the active current pointer/status and add a decision/change record if needed.

### I think the extension stopped updating after a source edit
Reload the unpacked extension at `chrome://extensions`, refresh the page, and reopen/toggle the side panel before concluding that a stale content script is a functional regression.

### I need to know where local user data lives
The extension's primary local data is in IndexedDB under database identity `portashape-xtratype`. Server-side development data uses the repository/server JSON storage layout and per-user profile JSON documents. Do not casually delete either while “resetting” a UI problem.

### I am about to rename a record, DB, anchor, permission, or package concept because a new name seems cleaner
Stop and check the guard dogs, historical canon, current code map, and migration requirements. Names are often compatibility surfaces here.

### I am implementing a plugin and want to just `eval` downloaded code
Don't. The selected architecture deliberately separates userscripts, ordinary plugins, and privileged reviewed host/connector code.

### An external publishing request timed out
Treat the effect as potentially **unknown**, not automatically failed. Reconcile before retrying.

### I want to expose the invitation cap in UI/docs
The overall current rollout ceiling is owner-held/confidential. Do not infer or publish it. The per-user invitation cadence is separate.

---

# Versioning: canonical v.003 and technical 2.5.1

The canonical project line uses deliberate v.00N increments before v1.0. Platform-valid Chrome/npm versions remain a separate technical sequence. v.003 is the first code-bearing increment after the v.002 SSOT promotion, so the Chrome/npm/release technical identifier advances from `2.5.0` to `2.5.1`.

The standing mapping rule is now: canonical v.00N records project-development landmarks; technical SemVer fields advance when the executable/package surface changes. Historical files keep the identifiers that were true for their own version.

---

# Historical/canon foundation

The project keeps old authoritative material because “old” and “wrong” are not synonyms.

- `docs/v001/` — first canonical forward instantiation landmark.
- `docs/SEED_*` — Seed 1 project/current-truth reconciliation at that stage.
- `reference/canon/XtraType_Canon_v1.0_candidate/` — historical XtraType baseline/audit/provenance.
- `reference/specs/XtraType_PortaShape_Companion_v0.1/` — selected foundational PortaShape target specification and machine-readable registry/contracts.
- `reference/source-snapshot/` — preserved source provenance.
- `reference/ssot/boot-prompts/retired/` — old onboarding assumptions preserved, not active.

Current work should **route through** these materials, not erase them.

---

# A few principles worth remembering when the repository gets much larger

- **Local capability should stay real.** The server can enrich XtraType without making ordinary personal use hostage to it.
- **Portable data is not portable authority.** Credentials/grants/sessions do not hitchhike inside imported packages or records.
- **Interoperability beats hidden coupling.** Prefer typed operations/contracts over one plugin reading another plugin's private storage.
- **History is a debugging tool.** Preserve why a decision was made, not only what the latest code says.
- **Small conventions are often load-bearing.** IDs, anchor normalization, query/fragment matching, transaction boundaries, permission names, outcome states, and UI acknowledgment rules deserve explicit care.
- **Community extensibility should increase agency, not create invisible privilege.** Scripts and plugins should be inspectable, bounded, revocable, and clear about effects.
- **A partial ecosystem is still useful.** One user may only need XtraType. Another may live in Script Studio. Another may publish through connectors. The architecture should reward combination without punishing selective use.

---

# Current version entry points

- `00_V003_START_HERE.md`
- `docs/v003/00_CURRENT_STATUS_2026-10-01T172600-0400.md`
- `reference/ssot/README.md`
- `EXPERT_SESSION_BOOT_PROMPT.md`
- `V003_INSTANTIATION_MANIFEST.json`

The v.001 root README that immediately preceded this promotion is preserved at `reference/canon/v001-final/README_FINAL_BEFORE_V002_2026-10-01.md`.

**Success from here means the project becomes more capable, safer, more interoperable, more extensible, and more scalable while still looking like a grown version of the system and ethos captured by the Seed/v.001/v.002/v.003 canon.**
