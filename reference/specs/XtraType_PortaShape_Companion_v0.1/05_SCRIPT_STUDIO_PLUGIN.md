# Script Studio — PortaShape plugin specification

**Edition:** 0.1 · **Date:** 2026-10-01 · **Status:** user-directed scope; target implementation specification, not implemented functionality

## Role and installation

Script Studio supplies exact JavaScript implementations, an editor, testing, a private library and promotion into declared capabilities. It is an installable PortaShape module package, `portashape.script-studio`. It uses the host's package model, permission broker, record contracts and invocation receipts rather than inventing its own authority system.

The user-facing installation model is familiar to userscript managers: inspect source/metadata, install locally, choose sites, enable/disable, edit versions, inspect execution errors and export/remove. Similarity does not promise full Tampermonkey metadata or GM API compatibility.

## Component behavior

| Component | Standardized responsibility |
|---|---|
| Editor | Local JavaScript editing, syntax diagnostics and basic completion; drafts are not executable until saved/reviewed |
| Runner | Manual current-page or controlled-fixture execution through the supported host profile |
| Manifest Editor | Name/version, accepted/produced contract IDs, permissions, triggers, site matches and operation declarations |
| Sandbox/Bridge | Separate user-script context and later explicitly scoped APIs; no arbitrary service-worker evaluation |
| Local Library | Stable script definitions and immutable source revisions with import provenance |
| Package Import/Export | Bounded JSON package with source, manifest, fixtures and hashes; no active grants |
| Trigger Manager | Manual and URL-match first; approved local event/routine invocation later |
| Test Harness | Fixtures, mocked host operations, expected output and expected side-effect assertions |
| Promotion | Scratch to saved script to tested capability/plugin contribution, with explicit review at each transition |
| Diagnostics | Registration state, bounded console output, violations, timing and invocation receipt links |

## Execution profiles

**C2 initial profile:** `USER_SCRIPT` world, `document_idle`, top frame, explicit HTTP(S) site matches and exclusions, manual runs or URL registration. Imported/new scripts start disabled. No XtraType storage/network/capture bridge. `@name`, `@namespace`, `@version`, `@description`, `@match`, `@exclude-match` and `@run-at document-idle` are the initial compatibility profile. Unknown execution-affecting directives are rejected with an explanation; display-only unknown metadata may be preserved inertly.

`@require`, automatic update URLs, arbitrary GM APIs, main-world/all-frame execution and privileged cross-origin fetch are outside this profile. Those are compatibility exclusions within the selected module, not proof that installed code has no DOM/network effects available to ordinary page JavaScript.

**C4 typed profile:** selected operations may be called through a reviewed bridge after trusted script/revision attribution, input/output validation, origin grants and abuse limits are demonstrated. Accepted/produced shapes enable reusable capabilities. Event triggers are restricted to named local events, never arbitrary messages. Routine invocation uses a pinned revision and cannot elevate permissions inherited from the routine author.

## Platform constraint

Chrome's official API requires the userscript permission and applicable host access; the API is available on MV3 from Chrome 120, while 138+ uses a per-extension enablement toggle. Dedicated messaging and update-time registration reconciliation are required. **DESIGN:** retain the prior proposed Chrome 138+ floor for the userscript-capable release and feature-test actual availability. [Chrome userScripts reference](https://developer.chrome.com/docs/extensions/reference/api/userScripts), checked 2026-10-01.

The package implementation strategy in document 01 keeps privileged plugin code in reviewed extension releases. Chrome's MV3 policy permits remote execution only under specified exceptions and documented API purposes; it does not justify a generic downloaded worker-plugin evaluator. [MV3 requirements](https://developer.chrome.com/docs/webstore/program-policies/mv3-requirements), checked 2026-10-01. Revalidate distribution requirements before release; these documents are not a store-approval result.

## Definition and revision

A definition holds `id`, name, namespace, currentRevisionId and desiredEnabled. An immutable revision holds scriptId, revision ID, original UTF-8 source/hash, parsed metadata, normalized matches/exclusions, execution profile, declared I/O, permissions and fixture references. The original source is preserved even when parsing/registration fails. Source changes create a new revision; a changed authority or source digest requires fresh review before activation.

Registration receipts bind browser registration ID to exact source revision, effective match rules and observed status/error. Startup/update reconciliation compares desired state with actual registrations. Disabling prevents future injection; it cannot guarantee cancellation of arbitrary already-running source or undo its changes. Offer page reload guidance where needed.

## Testing and promotion

A fixture declares typed input, page fixture identity, mocked operation responses, expected output and allowed effect calls. Unmocked external effects fail closed during tests. DOM assertions use controlled pages, not promises that a live website's selectors never change. Test history records source hash and host build; changing source invalidates applicability of old results.

Promotion creates a new package/capability draft with explicit manifest, permission diff, tests and provenance link to the source revision. It does not make a userscript trusted worker/UI code. A privileged plugin contribution must be reviewed and included in a host release catalog before it becomes installable as that kind. A script can also remain a personal script indefinitely.

## Failure, storage and privacy

Use the SS namespace for source/revisions/fixture definitions. Diagnostics omit full page text by default and cap individual console messages at 4 KiB and retained run output at 128 KiB. These are DESIGN limits. Unknown outcomes are explicit when a script requests effects before a timeout. An editor crash must not erase saved source; draft autosave is local and visibly separate from the enabled revision.

Removing Script Studio blocks its managed script registrations until an explicit standalone ownership transfer is specified; this edition defines no such transfer. Preserve inert script source for export unless the user separately deletes it. No script source is sent to a backend by this specification.

## Acceptance

Install valid/invalid metadata, denied site grant, changed revision, duplicate namespace/name, unsupported directive, revoked platform toggle, host restart/update, denied broker call, hostile claimed identity, cross-script impersonation, namespace isolation, fixture effect denial, update rollback and disable limitations. Promotion must preserve hashes/tests without creating authority. Full Tampermonkey compatibility remains an unclaimed feature.

## Owned component index

| ID | Component | Responsibility | Status / stage | Source |
| --- | --- | --- | --- | --- |
| SS-C037 | Editor | JavaScript editor with syntax checking and minimal completion. | specified / C2 | LEGACY-C037; W Components!A38:E38; D05 T015R02 |
| SS-C038 | Runner | Execute against current page or typed test fixture. | specified / C2 | LEGACY-C038; W Components!A39:E39; D05 T015R03 |
| SS-C039 | Manifest Editor | Inputs, outputs, permissions, triggers, URL matches, capability names. | specified / C2 | LEGACY-C039; W Components!A40:E40; D05 T015R04 |
| SS-C040 | Sandbox/Bridge | Controlled, separately granted host APIs; initial userscripts have no privileged bridge | specified / C4 | LEGACY-C040; W Components!A41:E41; D05 T015R05 |
| SS-C041 | Local Library | Private scripts and versions. | specified / C2 | LEGACY-C041; W Components!A42:E42; D05 T015R06 |
| SS-C042 | Package Import/Export | Portable JSON/shared contract bundle with code, manifest, tests, metadata. | specified / C2 | LEGACY-C042; W Components!A43:E43; D05 T015R07 |
| SS-C043 | Trigger Manager | Manual, URL-match, event, or workflow-node invocation. | specified / C2 | LEGACY-C043; W Components!A44:E44; D05 T015R08 |
| SS-C044 | Test Harness | Fixture inputs, mocked capabilities, expected output/side-effect assertions. | specified / C4 | LEGACY-C044; W Components!A45:E45; D05 T015R09 |
| SS-C045 | Promotion Workflow | Scratch → personal script → micro-extension → plugin/workflow component. | specified / C4 | LEGACY-C045; W Components!A46:E46; D05 T015R10 |
| SS-C046 | Diagnostics | Console output, permission violations, execution timing, provenance link. | specified / C2 | LEGACY-C046; W Components!A47:E47; D05 T015R11 |

