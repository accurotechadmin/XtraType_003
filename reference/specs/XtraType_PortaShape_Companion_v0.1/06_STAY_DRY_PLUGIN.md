# Stay D.R.Y. — Browser text assistance and procedure extraction

**Edition:** 0.1 · **Date:** 2026-10-01 · **Status:** user-directed scope; target implementation specification, not implemented functionality

## Role and scope

Stay D.R.Y., package `portashape.stay-dry`, helps with browser text-input interactions by converting authorized repetition into inspectable helpers, templates, routines and procedures. It observes and proposes; PortaShape mediates allowed browser operations and Script Studio provides exact user-authored logic when needed. The broader action/procedure extraction from D07 remains selected, with text assistance as its primary initial surface.

“All browser text input interactions” means a consistent assistance model across supported editable surfaces, not an authority to collect every field. Unsupported, inaccessible or excluded fields must be identified honestly. Observation is off by default and site-scoped. Installing the plugin does not enable observation.

## Consent and input eligibility

A consent record binds exact origin/site match, supported field categories, permitted event classes, retention choice, source revision and time. Separate choices govern observation, suggestions, insertion and routine execution. The user can pause a site, exclude a field, clear evidence or disable the plugin. Disabling prevents new observations immediately; retained evidence can be separately erased.

Initial supported surfaces: eligible text/search/email/URL/telephone inputs, textareas and ordinary contenteditable elements in authorized top-frame documents. Rich editors require an explicitly tested adapter. Cross-origin frames, closed shadow roots, browser-internal pages and fields inaccessible to the host are unsupported in the first profile. Do not install broad cross-frame observation to hide that limitation.

Exclude password fields and fields with credential, payment, one-time-code or other explicitly sensitive semantics. Also honor user field exclusions and `autocomplete` hints such as current/new password, one-time-code and payment fields. Heuristics are imperfect: show observation state, keep collection minimized and provide immediate deletion. The product must never claim that heuristics guarantee all sensitive text is recognized. Incognito observation is disabled in this edition.

## Text interaction lifecycle

Before proposing insertion, pin document/frame/origin, element identity, current value/selection and editable state. Preserve user cursor/selection. During IME composition, do not normalize, replace or suggest over the composing text. After composition completes, observe the committed value only if eligible. A helper preview displays exact replacement text and variable values before insertion.

Insertion requires a current user gesture and a successful unchanged-field check. If focus/value/context changed, return `CONTEXT_CHANGED` and preserve the draft. Use the native input/editor adapter path and appropriate input/change semantics; do not claim that every page accepts synthetic events. Preserve undo where the adapter supports it and declare the limitation otherwise. Never submit the form, press Enter, click Send or publish solely because a text helper was inserted.

## Components and data flow

| Component | Input → output | Boundary |
|---|---|---|
| Observation Consent | Site/field choices → local consent | No default collection |
| Input Observer | Eligible committed input → bounded observation | No indiscriminate keystroke/transcript recording |
| Action Observer | Separately allowed input-associated actions → typed event sequence | Raw selectors are hints, not durable authority |
| Pattern Detector | Local observations → PatternHypothesis | Confidence/explanation, no automatic execution |
| Template Extractor | Reviewed repetition → TextTemplate | Preserve exact text and explicit variables |
| Routine Extractor | Reviewed finite actions → Routine candidate | No hidden replay macro |
| Procedure Extractor | Routine + I/O/state/conditions → bounded procedure metadata | No dependency on an omitted execution project |
| Suggestion UI | Hypothesis/evidence summary → accept/edit/dismiss | Shows why suggestion appeared |
| Variable/Default Manager | Definitions + current user choices → resolved values | Required missing values block insertion |
| Promotion Bridge | Selected helper/routine → Script Studio draft | No auto-install/enable or grant transfer |

## Pattern detection standard

**DESIGN initial algorithm:** maintain a site-local rolling evidence window; normalize CRLF and trim surrounding whitespace for comparison, while retaining exact content only when the user permits it. Do not lowercase, strip punctuation or collapse interior spaces for insertion. Require at least **three distinct committed uses** of a repeated normalized text within **14 days** before proposing a helper. A single typing session/debounce does not count as multiple uses. Ignore empty and fewer-than-eight-character candidates by default.

Keep at most **200 observations per site**, expire after **14 days**, and retain at most **64 KiB of text per site**. Store normalized hashes and aggregate counts when full text is unnecessary. A usable suggestion may retain one representative text only with the corresponding observation consent. These thresholds are versioned configurable defaults, not claims from D07. A field exclusion or consent revocation purges associated evidence when the user requests deletion.

First sequence detection compares exact normalized sequences of **2–5 authorized actions** and applies the same three-occurrence rule. It does not infer arbitrary causal procedures. The suggestion identifies stable steps and asks the user to choose variables. Later sequence alignment/confidence refinements must publish their algorithm version and preserve explainability. Dismissed patterns remain suppressed until explicitly reset or their meaningful pattern revision changes.

## Templates and variables

`Procedure.TextTemplate` has ID/version, literal template, variable definitions, defaults and provenance. Placeholders use `{{identifier}}`; identifiers are ASCII letters/underscore followed by letters/digits/underscore. No expression evaluation, property traversal or code interpolation. Unknown placeholders, duplicate variable definitions and unmatched braces are validation errors. Literal braces can be escaped with `\{{` and rendered back as `{{`.

Variables have scalar type, label, required flag and optional default. Defaults never override a current explicit value, including zero/false/empty where allowed. Current selection, date/time and prior step output require declared bindings and preview. No hidden clipboard/page scraping supplies a missing variable. Text insertion is text, not HTML. For a text-only template, nonstring scalars render using explicit stable string conversion shown in preview.

## Routines and procedure extraction

A routine contains declared input/output, ordered step references, variable bindings, per-step pre/postconditions, checkpoint intent and stop limits. **DESIGN first execution profile:** manual start, at most **25 steps**, at most **120 seconds total**, no recursion, parallel branch, remote provider or unbounded loop. Supported predicates are equals, contains and numeric comparison over declared scalar state. Failed precondition pauses for review; failed postcondition marks failure/uncertainty as appropriate. The local DRY sequence runner calls PortaShape operations individually; it is not a general workflow engine.

Every mutating step requires current grants and context revalidation. External publishing is not inferred from observed text/actions; it invokes the Publisher review flow and requires its confirmation. Resume begins from a persisted reviewed checkpoint only after checking the page and whether prior effects occurred. Unknown outcomes never trigger blind step replay. Later bounded repetition, richer inference, event triggers and drift diagnostics remain selected-module extensions requiring their own local profile; no chat-specific loop is included.

## Cross-module integration

XtraType composer assistance uses the same consented text model as other fields but defaults to user-invoked helpers, without treating private notes as training data automatically. Publisher can reuse user-selected field presets; learning a destination/account preference does not authorize posting. Promotion opens the reviewed method in Script Studio with explicit scope and tests. If Script Studio is absent, templates and supported local routines remain usable and the promotion action explains its dependency.

Web/mobile can manage imported local templates and assist only inside their own accessible input surfaces. System-wide mobile keyboard integration is not specified. Team templates, cross-device pattern sync and shared libraries remain blocked by deferred services.

## Acceptance

Test consent-off, pause/revoke, sensitive-field exclusion, field replacement, IME, Unicode, multiline/selection/cursor behavior, read-only/disabled fields, unsupported editors/frames, one session counted once, threshold boundaries, TTL/quota, dismissal, missing variable, literal braces, unsafe HTML as text, context change before insertion, no implicit submit, bounded routine termination, uncertain resume and promotion without authority transfer.

## Owned component index

| ID | Component | Responsibility | Status / stage | Source |
| --- | --- | --- | --- | --- |
| DRY-C057 | Observation Consent | Per-site/per-surface authorization and clear pause/disable controls. | specified / C2 | LEGACY-C057; W Components!A58:E58; D07 T015R02 |
| DRY-C058 | Input Observer | Captures normalized repeated text/input patterns without indiscriminate collection. | specified / C2 | LEGACY-C058; W Components!A59:E59; D07 T015R03 |
| DRY-C059 | Action Observer | Captures user-authorized browser events as typed capability invocations. | specified / C4 | LEGACY-C059; W Components!A60:E60; D07 T015R04 |
| DRY-C060 | Pattern Detector | Clusters repeated sequences and estimates stable/variable portions. | specified / C2 | LEGACY-C060; W Components!A61:E61; D07 T015R05 |
| DRY-C061 | Template Extractor | Converts repeated text into static or parameterized templates. | specified / C2 | LEGACY-C061; W Components!A62:E62; D07 T015R06 |
| DRY-C062 | Routine Extractor | Converts repeated action sequences into workflow candidates. | specified / C4 | LEGACY-C062; W Components!A63:E63; D07 T015R07 |
| DRY-C063 | Procedure Extractor | Adds inputs, outputs, state, conditions, checkpoints, and stop criteria. | specified / C4 | LEGACY-C063; W Components!A64:E64; D07 T015R08 |
| DRY-C064 | Suggestion UI | Explains observed pattern and asks user to save/parameterize/edit. | specified / C2 | LEGACY-C064; W Components!A65:E65; D07 T015R09 |
| DRY-C065 | Variable/Default Manager | Fields, defaults, selections, dynamic values, prior-output bindings. | specified / C2 | LEGACY-C065; W Components!A66:E66; D07 T015R10 |
| DRY-C066 | Promotion Bridge | Open reviewed routine/template in Script Studio or local routine inspector without activating it | specified / C4 | LEGACY-C066; W Components!A67:E67; D07 T015R11 |

