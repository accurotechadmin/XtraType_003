# XtraType v.001

**Canonical forward version:** XtraType **v.001**  
**Baseline date:** 2026-10-01  
**Current client status:** **tested and working as the project’s client-side, non-server-dependent baseline**  
**Current server status:** **server-side testing and development underway**  
**Ecosystem direction:** XtraType + PortaShape + Script Studio + Stay D.R.Y. + Universal Publisher / Bridges + connector packages + shared local clients, designed to work together as one coherent system while remaining useful in smaller combinations or as individual features.

XtraType is the contextual layer at the center of this project: a way to attach notes, conversations, images, snapshots, relationships, and other structured context to the things people encounter—web pages, URLs, YouTube videos, places, moments in time, selected text, and eventually richer objects and representations.

PortaShape is the framework growing around that center. It is intended to become the package/plugin host, capability boundary, interoperability layer, script-and-tool canvas, local data transportation hub, operation router, and common connective tissue that lets XtraType and the rest of the ecosystem cooperate without turning everything into one inseparable monolith.

The design goal is **cohesion without forced complexity**. A person who only wants XtraType should be able to use XtraType. A person who wants a text helper can use Stay D.R.Y. A developer can write a script or plugin. A publisher can use the publishing/bridge layer. A power user can combine all of them. The full system should become more useful as its pieces cooperate, but no one should have to adopt every piece just to benefit from one.

---

## Current v.001 status

This repository begins the canonical forward **v.001** line. It was instantiated from the sealed Seed 1 / inherited `2.5.0` working tree, and the historical seed/canon/specification material remains permanently preserved as foundational authority.

### Client-side baseline: tested and working

The current Chrome extension codebase is designated as the working v.001 client-side baseline for functionality that does **not require the server**. Its local-first design means a user can create and work with contextual annotations locally even when server synchronization, accounts, invitations, direct messages, or other central services are unavailable.

The implemented client includes, among other things:

- a Manifest V3 Chrome extension and native Chrome side panel;
- local IndexedDB persistence for annotations, blobs, schemas, snapshots, and events;
- contextual annotation authoring and contextual reading;
- URL, Time, YouTube video, GPS, and bounded custom-schema anchors;
- automatic side-panel context refresh when tabs or URLs change, including history-state and fragment navigation;
- `Ctrl+Q` as the extension-action / side-panel toggle;
- `xt` omnibox entry, including transfer of omnibox text into the annotation comment textarea and capture of available highlighted page text;
- URL Base URL controls plus query/fragment handling;
- seven-day “young” annotation signaling with green tree indicators and toolbar badge counts, reset explicitly by **Mark all as old** rather than by merely reading;
- local quick-comment and page/YouTube projection paths;
- visible-viewport and full-page snapshot capture, with full-page as the default quick Snapshot behavior;
- local snapshot history/timeline and pixel comparison tools;
- custom bounded anchor-schema installation;
- reorderable Author and Annotations sections while the remainder of the side-panel layout stays fixed;
- optional synchronization hooks that do not replace the local-first commit path.

“Tested and working” here is a project designation for this client-side baseline, supported by the preserved automated, static, PHP-integration, parity, and packaging checks from the v.001 lineage. It is **not** a claim that every browser/OS/site combination has been exhaustively certified. The verification documents remain authoritative for exactly which automated and native/manual checks have or have not been run.

### Server side: implemented in part, actively being tested and developed

The repository also contains a PHP/JSON companion service and a growing account/social layer. Those server-side capabilities are **not yet the project’s finished public-service platform**. They are under active testing and development.

The current server work includes:

- annotation/schema/snapshot/event HTTP APIs;
- JSON/file-backed repository storage with locking and staged replacement;
- validated media handling;
- registration and login;
- first-account seed administration;
- single-use invitation codes;
- invitation provenance and per-user invitation history;
- per-user enable/invite permissions plus global administrator controls;
- an invitation cadence of at most one generated invitation per enabled user per fixed-EST calendar day;
- private per-user profile JSON documents;
- user contact groups;
- direct messages;
- access-controlled XT Group Chats with case-sensitive five-character codes and canonical `xtratype.com/gc/#####` addresses.

A separate owner-held finite invitation ceiling governs the current testing rollout. Its numeric value is intentionally not stored in this repository.

The existence of these server features does **not** mean production-scale hosting, hardened public deployment, generalized cross-device synchronization, complete remote backup/restore, end-to-end encrypted messaging, distributed conflict resolution, or a mature public identity platform has been completed. Those require further architecture, security, deployment, abuse-resistance, migration, recovery, and acceptance work.

---

# The ecosystem

## 1. XtraType — contextual information where the thing actually is

XtraType is the first-party contextual application and the present working foundation.

Its central idea is simple: information becomes more useful when it can travel with, point to, or appear beside the thing it is about.

A conventional post exists primarily inside the application that hosts it. An XtraType annotation is designed around a **target**. That target can be a URL, a video, a geographic place, a moment or range in time, selected text, or eventually a richer object/relationship described through PortaShape contracts.

That lets XtraType grow toward uses such as:

- notes and discussion attached to a page;
- commentary on a specific video or time range;
- observations tied to a location;
- posts that are intentionally anchored only to a moment in time;
- warnings, corrections, alternatives, references, and superseding context;
- snapshots of how a page looked at an earlier moment;
- community knowledge that can be discovered from the object or context it concerns instead of only from a feed.

The long-term XtraType model does not require every contextual object to be social or public. The same machinery can support private notes, local workflows, team context, public discussion, machine-generated context, or portable structured records subject to the permissions and visibility models that are ultimately implemented.

## 2. PortaShape — the framework around the applications

PortaShape is **not a rename for XtraType**. XtraType remains the contextual application. PortaShape is the surrounding framework intended to make many tools, records, scripts, modules, plugins, clients, and external systems interoperable.

PortaShape is being designed to provide several roles at once:

### Plugin and package framework

PortaShape will define package identity, installation, enablement, revisions, dependencies, namespaced data, lifecycle, UI contributions, permissions/grants, cleanup, updates, rollback, and host-mediated invocation.

The goal is to let community and first-party modules grow around XtraType without giving arbitrary downloaded code unrestricted extension authority.

### Capability and permission boundary

Installation will not automatically mean authority. PortaShape’s host model separates package presence from effective grants and separates ordinary user/community scripts from privileged reviewed host or connector code.

Operations should be explicit, revocable, attributable, and bounded by the resource/site/action actually required.

### Operation and interoperability bus

PortaShape is intended to expose stable typed operations that allow components to ask one another for work without reaching directly into each other’s private storage or implementation details.

Examples include capturing current context, proposing an XtraType draft, saving a Stay D.R.Y. template, composing or previewing a publication, executing a script, installing a package, or asking a connector to transform a representation.

That operation layer is how the ecosystem can remain composable even while individual pieces evolve independently.

### Script canvas and tool-building environment

The script-building surface is principally delivered through **Script Studio**, hosted within the PortaShape architecture. Together, PortaShape + Script Studio are intended to provide a practical canvas where users can create, revise, test, install, inspect, share, and promote bounded scripts and helpers.

A script can begin as a personal local tool. With the correct review and capability boundaries it can later become a reusable package or contribute logic to another part of the ecosystem—without pretending that user-authored source code is automatically trusted privileged code.

### Data transportation and portability hub

PortaShape is also intended to become a common transportation layer for structured data between XtraType, plugins, local clients, scripts, publishing flows, and external connectors.

Portable data should carry stable IDs, schemas, provenance, relationships, representations, and compatibility information. It should **not** casually carry machine-local grants, credentials, bearer tokens, observation buffers, or privileged state.

This is a core design principle: **data may travel farther than authority**.

### UI and client bridge

PortaShape will provide explicit mounting/contribution surfaces so plugins can participate in the user experience without permanently or invisibly mutating unrelated core UI.

It is also intended to bridge browser-extension, ordinary-web, responsive/mobile-web, and selected future native/local clients. A client only receives the operations its host can truthfully provide; a normal web page does not acquire Chrome extension privileges just because it understands the same records.

### Receipts, provenance, and effect truth

Operations—especially external effects—need attributable outcomes. PortaShape’s target architecture therefore includes invocation IDs, receipts/events, package/revision identity, effect status, and explicit handling for uncertain outcomes.

If a remote publish request may have succeeded but the response is lost, the result is not safely “failed.” It is **unknown outcome**, and the system should reconcile before retrying rather than blindly duplicating an external action.

---

## 3. Script Studio — make the system programmable

Script Studio is the planned first-class environment for bounded user JavaScript and related local tooling.

It is intended to provide:

- source editing;
- revision history;
- fixtures and testing;
- package/manifest metadata;
- diagnostics;
- site/operation grants;
- installation and registration;
- import/export of inert source/packages;
- promotion paths from experiments to reviewed reusable components.

The governing principle is that experimentation should be easy **without making privilege accidental**. A script can be useful locally without becoming a privileged PortaShape package, and a shared package can remain inert until the receiving user reviews and grants it.

Script Studio is one of the ways PortaShape becomes a genuine community construction surface rather than only an internal plugin system.

---

## 4. Stay D.R.Y. — reusable human text intelligence

Stay D.R.Y. (“Don’t Repeat Yourself”) is the planned consent-based text assistance system.

Its purpose is to help people capture and reuse the patterns in what they repeatedly type: phrases, structures, templates, variables, routines, and other bounded text helpers.

The target design includes:

- explicitly consented observation;
- excluded/sensitive input handling;
- pattern/template extraction;
- variables and defaults;
- suggestions;
- safe insertion into eligible fields;
- pause/revoke/expiry behavior;
- bounded finite routines;
- promotion of useful helpers into Script Studio for inspection or further development.

Stay D.R.Y. can assist XtraType’s own composer, ordinary browser fields, or publishing workflows where permission exists. It should never turn text assistance into hidden submission authority.

Someone who mainly wants Stay D.R.Y. should not need to become a heavy XtraType social user. Within the completed PortaShape host, it is intended to be useful as its own focused tool as well as part of the larger system.

---

## 5. Universal Publisher / Bridges — one idea, many representations

The Universal Publisher / Bridges layer is intended to let a person compose a canonical publication or object once, preview how it maps to different destinations, understand fidelity differences, explicitly confirm effects, and retain a record of the representations that resulted.

Instead of every destination becoming its own unrelated workflow, the publishing layer aims to provide:

- a canonical source shape;
- destination-specific mappings;
- fidelity reporting;
- preview and validation;
- explicit confirmation;
- per-destination outcomes;
- representation/replica tracking;
- reconciliation for partial or unknown outcomes.

XtraType can then attach context not only to the canonical object but also to one or more resulting representations.

Stay D.R.Y. can contribute reusable text/templates to a publication. Script Studio can help create or test transformation logic. PortaShape provides the permissions, package boundaries, operation routing, receipts, and data transport. Connector packages handle the provider-specific edge.

---

## 6. Connector packages — the edge between PortaShape and external systems

External connectors are intended to be separate, qualified packages rather than ad-hoc provider automation buried inside core XtraType.

A connector may provide:

- destination/service metadata;
- source-to-canonical transforms;
- canonical-to-destination transforms;
- authentication/credential references;
- capability declarations;
- validation and preview;
- provider-specific effect execution;
- conformance fixtures;
- receipts and reconciliation behavior.

Stronger external-effect packages belong to a reviewed trust path. Popularity or package metadata alone must never become a security primitive.

---

## 7. Shared web, mobile, and future local clients

The ecosystem is intended to share contracts without lying about host capability.

A browser extension can capture active-tab state and screenshots because the user and browser have granted those privileges. An ordinary web page cannot. A future native client may have different abilities again.

PortaShape therefore aims for **portable records and explicit operations**, not fake platform equivalence.

Possible clients include:

- the Chrome extension;
- the PHP/web companion;
- responsive web/mobile local-management surfaces;
- future native share/capture clients;
- specialized tools that only understand a subset of the ecosystem.

The records can interoperate while each client remains honest about what it can actually do.

---

# How the pieces fit together

```text
                         ┌─────────────────────────┐
                         │      Community / User   │
                         │ scripts, modules, data  │
                         └────────────┬────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────┐
│                              PortaShape                             │
│                                                                     │
│ package/plugin lifecycle • grants • operations • repositories       │
│ UI contributions • receipts/events • import/export • provenance     │
│ interoperability • local data transportation • client bridges       │
└───────┬──────────────────┬──────────────────┬───────────────────────┘
        │                  │                  │
        ▼                  ▼                  ▼
┌──────────────┐   ┌────────────────┐  ┌──────────────────────────┐
│   XtraType   │   │ Script Studio  │  │      Stay D.R.Y.        │
│ context +    │   │ scripts/tools  │  │ text patterns/templates │
│ annotations  │   │ test/revision  │  │ suggestions/routines    │
└──────┬───────┘   └───────┬────────┘  └───────────┬──────────────┘
       │                   │                       │
       └──────────────┬────┴───────────────┬───────┘
                      │                    │
                      ▼                    ▼
             ┌────────────────────────────────────┐
             │ Universal Publisher / Bridges      │
             │ canonical objects • mappings       │
             │ previews • fidelity • replicas     │
             └────────────────┬───────────────────┘
                              │
                              ▼
                   ┌─────────────────────┐
                   │ Connector packages  │
                   │ external services   │
                   └─────────────────────┘
```

This diagram shows the intended **cohesive** system, not a requirement that every feature be installed or active.

A few valid future usage patterns are:

- **XtraType only:** local contextual annotation, snapshots, anchors, and reading/writing context.
- **XtraType + account service:** invitations, central identity, DMs, group chats, and synchronization where supported.
- **PortaShape + Script Studio:** build/test local scripts and packages without needing to be an active XtraType social user.
- **PortaShape + Stay D.R.Y.:** personal reusable text assistance.
- **Publisher + connectors:** canonical composition and controlled multi-destination publishing.
- **Everything together:** contextual authoring, reusable personal tools, scripts, plugins, publishing, portable data, external integrations, and contextual relationships operating through common contracts and trust boundaries.

Using only one feature is not a second-class mode. Modularity is a product requirement.

---

# Community growth model

The ecosystem is intentionally being designed for uses the core team cannot fully predict.

Community extensibility is expected to include several distinct classes:

1. **Custom anchor schemas** — inert structured data definitions; no code execution.
2. **Userscripts** — bounded user-authored code with explicit local grants.
3. **PortaShape plugins** — packaged modules with lifecycle, storage namespaces, operations, permissions, and UI contributions.
4. **Privileged reviewed packages** — stronger components that require a reviewed trust path.
5. **Connector packages** — provider-specific transforms/effects with qualification and receipt semantics.

Those classes must remain distinct. A JSON schema must not become executable because it came from a trusted source. A userscript must not inherit host authority because it is convenient. A plugin import must not transfer someone else’s permissions or secrets.

The intended ladder is:

**draft → local validation → fixture/test execution → local grant → installed package/revision → optional portable export → reviewed privileged release when stronger authority is required.**

That gives people room to invent without making experimentation indistinguishable from platform privilege.

---

# Data and trust philosophy

Several rules are foundational across the ecosystem:

- **Local-first where practical.** Local authoring should not fail merely because an optional service is absent.
- **Data may travel farther than authority.** Exported/imported data does not carry grants, secrets, bearer tokens, or automatic execution rights.
- **Stable identity matters.** Existing XtraType record identity and compatibility anchors are preserved unless a deliberate migration is approved.
- **Capabilities are explicit.** Read, write, execute, observe, publish, and external effects should be separately understandable and revocable.
- **Plugins own namespaced data.** Cross-component cooperation should happen through contracts/operations rather than by rummaging through another module’s private files or databases.
- **Effects are truthful.** Success, failure, and unknown outcomes are different states.
- **History stays history.** Old canon/specifications/evidence are not rewritten to pretend they always described later behavior.
- **New functionality should look like growth.** A future build should still be explainable as XtraType/PortaShape growing from this baseline rather than drifting into an unrelated system with familiar names.

---

# Source-of-truth and project lineage

This repository intentionally carries both a **perpetual legacy foundation** and a **forward v.001 authority layer**.

The original Seed 1 / canon / companion specification / implementation evidence is not discarded when a new current-status document appears. It remains the permanent evidence for origin, intent, earlier implementation truth, compatibility, and why the project has the shape it does.

From v.001 forward, begin with:

1. `00_V001_START_HERE.md`
2. `docs/v001/00_AUTHORITY_AND_INSTANTIATION.md`
3. `docs/v001/01_CURRENT_STATUS_2026-10-01T090653-0400.md`
4. `docs/v001/02_ARCHITECTURE_WIRING_HARNESS_COMPONENT_MAP.md`
5. `docs/v001/03_PRODUCT_ETHOS_PURPOSE_AND_LONG_HORIZON.md`
6. `docs/v001/04_CHANGE_CONTROL_VERSIONING_AND_FIDELITY.md`
7. `docs/v001/05_ECOSYSTEM_EXTENSIBILITY_AND_COMMUNITY_GUARDRAILS.md`
8. `docs/v001/06_VERIFICATION_SECURITY_SCALE_AND_RELEASE_GATES.md`
9. `docs/v001/07_PROVENANCE_AND_HOW_WE_GOT_HERE.md`
10. `docs/v001/08_RESET_RECOVERY_AND_BASELINE_COMPARISON.md`
11. `docs/v001/10_FOUNDATIONAL_DECISIONS_AND_OPEN_BOUNDARIES.md`
12. `V001_EXPERT_SESSION_BOOT_PROMPT.md` for a fresh expert development session.

The original root README that existed at the v.001 seal has been preserved verbatim at `reference/canon/V001_ROOT_README_PRE_PROMOTION_2026-10-01.md`. This root README was then explicitly promoted by owner direction on 2026-10-01 into the forward-facing project entrance. The original legacy hash record remains intentionally historical.

For target PortaShape semantics, the detailed machine-readable and prose specifications remain under `reference/specs/XtraType_PortaShape_Companion_v0.1/`. For historical audit/canon evidence, see `reference/canon/`.

---

# Running the current baseline

For client-side/local development, the Chrome extension lives in `ext/` and is loaded unpacked in a compatible Chrome build. Local annotations are stored in IndexedDB and the core local authoring path does not require the PHP service.

The PHP companion can be started with the repository launchers (`start-server.sh` / `start-server.bat`) in an appropriate PHP 8.2+ environment. Treat that server as a development/testing surface, not a production public deployment simply because account and messaging features exist.

Before using existing owner data, read `docs/UPGRADE_AND_RECOVERY.md`.

For verification details, read `docs/v001/06_VERIFICATION_SECURITY_SCALE_AND_RELEASE_GATES.md` and the preserved test/evidence documents. Do not replace those exact records with a vague “everything is certified” statement.

---

# Where this is going

The long-term destination is not “a browser extension with a lot of buttons.”

It is a system where context, tools, scripts, personal automation, structured data, publishing, external representations, and community-built capabilities can be connected without losing provenance, user control, or modularity.

XtraType supplies the contextual language and user-facing center. PortaShape supplies the framework and interoperability substrate. Script Studio makes that substrate programmable. Stay D.R.Y. turns repeated human text/work patterns into reusable helpers. Universal Publisher / Bridges transports canonical ideas into multiple representations. Connector packages speak the languages of external systems. Shared clients make the same records usable in the environments that can truthfully support them.

Together, those pieces should feel like one ecosystem because they share contracts, identity, operations, provenance, and deliberate seams.

Separately, each piece should still be worth using.

That is the standard from which v.001 grows.
