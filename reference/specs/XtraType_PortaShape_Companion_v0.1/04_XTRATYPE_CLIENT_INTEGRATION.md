# XtraType — PortaShape client and context-layer specification

**Edition:** 0.1 · **Date:** 2026-10-01 · **Status:** user-directed scope; target implementation specification, not implemented functionality

## Client role and preserved foundation

XtraType is the first-party Chrome extension client and owner of contextual content, not an installable third-party plugin. Its existing side-panel composer remains primary. PortaShape plugin controls, text assistance and publishing are supporting surfaces. XtraType continues to own URL/GPS/YouTube/custom targets, quote/body/images, local history/capture and the current PHP companion behavior documented in the original canon.

Do not rename `portashape-xtratype`, record types, message names or storage keys as a branding operation. Do not change `Context.Annotation` v2's single `target`, derived `targetKey`, display `author`, quote/media or parent ID without a separate migration. Snapshots do not become generic workflow runs and current reply records do not suddenly become a complete Conversation model.

## Client bridge

Expose selected operations through an application-layer adapter: read approved current context, resolve target applicability, propose a draft, list authorized local context, attach an extension record and open the appropriate XtraType view. Existing worker messages remain internal compatibility interfaces. New plugins MUST NOT send arbitrary `xtratype:*` messages or manufacture a trusted tab ID.

A proposed draft contains its own ID, source provider/revision, original context reference, suggested body/quote/target and intended attachments. The user reviews it in XtraType. Commit uses the common annotation creation service proposed in existing C15 SP-02. Navigation does not silently retarget an open draft. Reject an inaccessible or changed document with a rebind choice.

## Component requirements

Target Resolver retains existing typed-target applicability and adds optional Object/Handle lookup only through explicit mappings. Anchor Bundle adds redundant passage evidence. Annotation Object preserves v2 and gains a separate extension record. Context Relationship stores typed links. Overlay Renderer displays resolved local context with accessibility and cleanup. Capture UI creates context from page, selection or selected Object. Visibility/Sharing keeps the source meaning but shared modes remain blocked by backend deferral. Conversation Layer supports local threads first. Alternative Content is a linked representation, not arbitrary executable replacement. Feed/Query exposes the appropriate locally authorized views.

## AnchorBundle and resolution

**DESIGN:** an anchor bundle contains source URL, optional canonical URL supplied as evidence, captured time, exact selected text, prefix/suffix text, optional DOM selector hints, optional text-position hint and optional content fingerprint. Canonical URL is not automatically trusted to change current target identity. Store original quote separately from normalized matching text.

Initial text normalization: Unicode NFC, normalize CRLF to LF and collapse runs of whitespace for the **derived matching string only**. Preserve source text bytes/content independently. Prefix/suffix are capped at 256 Unicode code points each. Do not capture form field contents as passage context through this operation.

Resolution order is deterministic: validate page applicability; try a still-valid DOM hint and verify text; find exact normalized text with matching prefix/suffix; otherwise enumerate exact-text candidates; return `resolved` only for one qualifying candidate. Multiple plausible candidates return `ambiguous`; absent text returns `missing`; changed page identity returns `stale-context`. No fuzzy automatic rebinding in the first implementation. Later fingerprint/fuzzy matching needs its own acceptance threshold and visible confidence evidence.

A user may rebind an ambiguous/missing anchor. Preserve the previous bundle and explicit rebind provenance; never rewrite the annotation's identity behind the scenes. URL, GPS and video notes with no text anchor remain valid. Whole-video versus zero-second semantics stay distinct.

## Context extension, relationships and aliases

`Context.AnnotationExtension` links one current annotation to optional Object, anchor bundle, tags, local visibility intention and extension revision. `Context.Relationship` has `fromRef`, `relationType`, `toRef`, author local principal, timestamps and optional explanation. Initial relation types: `related-to`, `corrects`, `warns-about`, `alternative-to`, `references`, `supersedes`. Direction is meaningful. Reject self-supersession and supersession cycles; other cycles may exist but queries must be bounded.

A Handle alias means “asserted locator for this Object,” not proof of equivalence. User-approved alias merge preserves old IDs and a merge receipt; conflicting assertions are shown for review. No automatic merge based solely on similar titles, URLs or selected text. Page applicability and conceptual identity remain separate indexes.

## Conversation and alternative-content behavior

Local Conversation references a target/Object and ordered Message records. Existing annotations/replies can be displayed as a legacy thread projection using parent IDs, but this projection does not mutate their envelope. Explicit conversion creates a Conversation and records legacy message references. Deleted or missing parents display a recoverable orphan state. Cap initial page size at 50 messages with a stable `(createdAt,id)` cursor.

Local-only threads have no remote participants. Direct messages, groups, shared/public visibility, moderation, membership and authenticated authors remain specified intentions **blocked by deferred identity/authorization services**. The UI must not advertise a local visibility label as enforced server privacy; the legacy PHP collection remains governed by its existing limitations.

Alternative content is stored as a referenced text/media representation with a relationship to the target. The initial renderer supports escaped plain text and explicitly validated media, with an obvious original/alternative switch. It cannot replace page content or run scripts without separate user action and operation grants.

## Rendering and shared-page coexistence

Owned overlay roots carry provider and instance identity. Renderers are idempotent, ignore their own mutation notifications, coalesce host changes and dispose listeners/observers on document change or disable. Stay D.R.Y. suggestion UI must not become input evidence, and script/connector overlays must not be captured as unnoticed annotation content. XtraType screenshot capture follows its own explicit overlay inclusion policy.

Markers/cards require keyboard access, meaningful accessible labels and reliable dismiss behavior. Async results are discarded if their context generation is stale. Existing YouTube null-time and observer issues must be fixed before building more integrations on those seams.

## Persistence and interoperability

New XtraType companion records live in an XT-owned namespace within the new local PortaShape store, leaving existing DB v1 untouched. Cross-database writes cannot be declared atomic: commit the annotation first, persist a reconciliation task/intent in the new store, then attach the extension; display extension-pending/failure independently of note success. On recovery, link only to an existing matching annotation. Never delete a committed note because an optional sidecar write failed.

Package export can include selected notes, sidecars and binary content through explicit user selection, preserving legacy IDs. Plugin package export by itself does not include the user's annotation corpus. Shared transport for these new records is blocked until a versioned authenticated service is selected.

## Acceptance boundary

Test existing target families unchanged; old note/media/reply round-trip; plugin disabled/host unavailable; context generation race; duplicate quote; moved/deleted text; canonical URL disagreement; SPA cleanup; missing parent; supersession cycle; sidecar failure after committed note; export privacy and inaccessible shared-mode controls. Existing capture and sync stabilization gates remain prerequisites, not automatically completed by this integration.

## Owned component index

| ID | Component | Responsibility | Status / stage | Source |
| --- | --- | --- | --- | --- |
| XT-C047 | Target Resolver | Resolves one or more Handles to a current target. | existing-narrow / C3 | LEGACY-C047; W Components!A48:E48; D06 T015R02 |
| XT-C048 | Anchor Bundle | Canonical URL, selected text, nearby text, DOM/path hints, attributes/fingerprints as available. | specified / C3 | LEGACY-C048; W Components!A49:E49; D06 T015R03 |
| XT-C049 | Annotation Object | Body, author, target handles, tags, visibility, timestamps, provenance. | existing-narrow / C3 | LEGACY-C049; W Components!A50:E50; D06 T015R04 |
| XT-C050 | Context Relationship | Related-to, corrects, warns-about, alternative-to, references, supersedes. | specified / C3 | LEGACY-C050; W Components!A51:E51; D06 T015R05 |
| XT-C051 | Overlay Renderer | Shows contextual markers/threads in the browser host/page UI. | existing-narrow / C3 | LEGACY-C051; W Components!A52:E52; D06 T015R06 |
| XT-C052 | Capture UI | Create annotation from URL, selection, object, place/time later. | existing-narrow / C3 | LEGACY-C052; W Components!A53:E53; D06 T015R07 |
| XT-C053 | Visibility/Sharing | Local visibility intention; shared/group/public enforcement blocked by deferred identity/authorization | blocked-dependency / C3 | LEGACY-C053; W Components!A54:E54; D06 T015R08 |
| XT-C054 | Conversation Layer | Local target/annotation threads; remote participants and groups blocked by deferred services | existing-narrow / C3 | LEGACY-C054; W Components!A55:E55; D06 T015R09 |
| XT-C055 | Alternative Content | Replacement/alternate representation linked to target. | specified / C3 | LEGACY-C055; W Components!A56:E56; D06 T015R10 |
| XT-C056 | Feed/Query API | Retrieve context by handle/object/relation/visibility. | existing-narrow / C3 | LEGACY-C056; W Components!A57:E57; D06 T015R11 |

