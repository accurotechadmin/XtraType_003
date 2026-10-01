# XtraType v.001 — Product Ethos, Purpose, and Long-Horizon Charter

## 1. Core purpose

XtraType exists to let people attach durable, typed context to the things they actually mean: pages, moments, places, videos, structured handles, and eventually richer relationships between objects and representations. It should make context portable and inspectable without forcing every interaction into a single website's native comment system.

PortaShape exists to let that contextual core grow into a trustworthy host for tools, modules, scripts, plugins, transformations, publication, and interoperable representations without turning XtraType itself into an unbounded monolith.

## 2. The recognizable-product test

A future XtraType/PortaShape build is in family when a user of this v.001 baseline can reasonably say: “This is the same system, grown up.” Growth may be dramatic, but the lineage should remain legible.

That implies continuity of:

- context-first authoring and retrieval;
- local-first durability where the host can provide it;
- typed, explainable attachment/handle semantics;
- explicit provenance and versioned records;
- user control over what executes, publishes, syncs, or gains access;
- modularity rather than hidden all-powerful runtimes;
- truthful distinction among local state, replicated state, target specifications, and verified behavior;
- compatibility/migration discipline rather than casual identity replacement.

## 3. Product values translated into engineering behavior

### Context should remain understandable

A note's target should be inspectable. Matching/applicability rules should be deterministic enough to debug. Richer future anchors may be composed, but they should not become mystical opaque relevance scores that replace explicit user intent.

### User agency precedes automation

Automation can assist, suggest, transform, and execute bounded routines, but grants, publishing, sensitive observation, and external effects need understandable control surfaces. The system should not smuggle new authority through convenience.

### Local capability is real capability

The extension's local store, browser context, capture abilities, and local plugin host are not merely degraded versions of a cloud service. Remote services may add continuity, collaboration, and scale, but they should not erase the value or semantics of local operation.

### History is append-only in spirit

Old evidence stays old. New truth is added with dates, migrations, decisions, and status changes. Documentation should make corrections explicit rather than rewriting earlier artifacts so the project appears to have always known the future.

### Failure should be truthful

Unknown external effect outcome is not success. Failed sync is not lost local content. Missing media is not silently omitted. A plugin that lacks a grant is unavailable, not partially privileged. A client that cannot execute a capability should say so.

## 4. Horizontal growth

Horizontal growth means more kinds of people, contexts, surfaces, platforms, scripts, plugins, connectors, community modules, and collaborative structures. The architecture should support this by adding explicit packages/contracts/permissions and by keeping extensions composable.

Horizontal growth must not create an “everything can see everything” privilege mesh. New capability should be opt-in, locally reviewable where possible, and scoped to the resource/site/operation it needs.

## 5. Vertical growth

Vertical growth means stronger implementations of existing capabilities: better sync, richer identity, stronger conflict handling, better capture fidelity, more expressive context graphs, more robust testing, native clients, hardened deployment, larger repositories, observability, migrations, and production operations.

Vertical growth should strengthen existing seams before bypassing them. Example: a future database can replace JSON behind a repository/service contract, but should not silently change record meaning.

## 6. Community extensibility

Community-created scripts/modules/plugins are an intended strength, not an edge case. Therefore the platform must assume some packages are buggy, experimental, abandoned, surprising, or malicious.

The host should make the safe path the easy path:

- inert package inspection before execution;
- explicit manifest/identity/revision;
- operation-level permissions;
- site/resource scoping;
- revocation;
- bounded execution and cleanup;
- versioned dependencies;
- import/export without inherited grants or credentials;
- diagnostics that identify which package caused an effect;
- separation between ordinary userscripts and privileged reviewed host packages.

## 7. Collaboration and social growth

Invitations, contacts, DMs, and XT Group Chats are the first bounded social layer. As collaboration grows, preserve clear distinctions among:

- identity/authentication;
- membership/access control;
- local copies versus centrally revocable resources;
- interpersonal messaging versus contextual annotations;
- private/group/public visibility;
- transport encryption versus end-to-end content encryption;
- operational invitation capacity versus code-level invite cadence.

Do not let a friendly small-group prototype accidentally become an assumed public social-network security model.

## 8. PortaShape's role

PortaShape should remain a wraparound capability host, common contract boundary, and plugin ecosystem. It should not erase XtraType's first-party contextual semantics. XtraType can consume PortaShape services and publish richer sidecars/relationships while retaining its own compatibility-critical records.

The platform should grow by clear ownership:

- XtraType owns contextual annotation experience and its stable records.
- PortaShape host owns package lifecycle, grants, invocation routing, receipts/events, namespaces, and contribution cleanup.
- Plugins own their namespaced data/behavior inside granted capabilities.
- Connector packages own provider-specific transforms/effects and qualification.
- Shared clients only claim capabilities their host actually has.

## 9. The anti-drift test

Before accepting a large change, ask:

1. Can we point to the v.001 concept this grows from?
2. Is the owner-visible benefit clear?
3. Does it preserve or explicitly migrate identity/data?
4. Does it make trust more explicit rather than more implicit?
5. Does it keep XtraType recognizable and PortaShape modular?
6. Can failure and recovery be explained?
7. Can a future engineer trace the decision and undo/revise it?
8. Does it respect the preserved legacy seed and selected target architecture?

If several answers are “no,” the change is presumptively drift, not evolution.
