# Seed 1 — PortaShape Contract, Operation and Permission Index

The companion contains **29 record schemas plus `common.schema.json` and `operation-payloads.schema.json` = 31 schema files total**. It defines **40 exact operations with 80 bound input/output definitions**, **15 permissions**, and **52 acceptance cases**. Structural validity is documentation evidence, not proof that a host/runtime executes these contracts.

## Record contracts

| ID | Record type | Owner | Meaning | Schema | Stage | Current Seed 1 truth |
|---|---|---|---|---|---|---|
| CT01 | `Plugin.Manifest` | PS | Package identity, operations, permissions and file hashes | `contracts/plugin-manifest.schema.json` | C1 | SPECIFIED — no PortaShape runtime record store |
| CT02 | `Plugin.Installation` | PS | Desired/effective local package lifecycle | `contracts/installation.schema.json` | C1 | SPECIFIED — no PortaShape runtime record store |
| CT03 | `Host.Grant` | PS | Nonportable local revision/site authority | `contracts/grant.schema.json` | C1 | SPECIFIED — no PortaShape runtime record store |
| CT04 | `Host.Invocation` | PS | Pinned bounded operation request | `contracts/invocation.schema.json` | C1 | SPECIFIED — no PortaShape runtime record store |
| CT05 | `Host.Receipt` | PS | Truthful effect outcome and evidence | `contracts/receipt.schema.json` | C1 | SPECIFIED — no PortaShape runtime record store |
| CT06 | `Host.Event` | PS | Versioned local notification | `contracts/event.schema.json` | C1 | SPECIFIED — no PortaShape runtime record store |
| CT07 | `Core.Object` | PS | Conceptual identity and handle references | `contracts/object.schema.json` | C3 | SPECIFIED — no PortaShape runtime record store |
| CT08 | `Core.Handle` | PS | Locator with type and evidence | `contracts/handle.schema.json` | C3 | SPECIFIED — no PortaShape runtime record store |
| CT09 | `Browser.Context` | PS | Pinned authorized browser context | `contracts/browser-context.schema.json` | C1 | SPECIFIED — no PortaShape runtime record store |
| CT10 | `Context.AnchorBundle` | XT | Passage locator evidence | `contracts/anchor-bundle.schema.json` | C3 | SPECIFIED richer anchor bundle; current typed targets are narrower predecessor |
| CT11 | `Context.AnnotationExtension` | XT | Sidecar for unchanged v2 annotation | `contracts/annotation-extension.schema.json` | C3 | SPECIFIED sidecar; current Annotation v2 remains implemented unchanged |
| CT12 | `Context.Relationship` | XT | Typed contextual relation | `contracts/relationship.schema.json` | C3 | SPECIFIED — no PortaShape runtime record store |
| CT13 | `Context.Conversation` | XT | Local target-linked thread | `contracts/conversation.schema.json` | C3 | SPECIFIED; current reply linkage is narrower predecessor |
| CT14 | `Context.Message` | XT | Local conversation message | `contracts/message.schema.json` | C3 | SPECIFIED; current reply linkage is narrower predecessor |
| CT15 | `Script.Definition` | SS | Stable personal script identity | `contracts/script-definition.schema.json` | C2 | SPECIFIED — no PortaShape runtime record store |
| CT16 | `Script.Revision` | SS | Immutable source and execution metadata | `contracts/script-revision.schema.json` | C2 | SPECIFIED — no PortaShape runtime record store |
| CT17 | `Procedure.TextTemplate` | DRY | Literal text and declared variables | `contracts/text-template.schema.json` | C2 | SPECIFIED — no PortaShape runtime record store |
| CT18 | `Procedure.PatternHypothesis` | DRY | Explained repeated behavior candidate | `contracts/pattern.schema.json` | C2 | SPECIFIED — no PortaShape runtime record store |
| CT19 | `Procedure.Routine` | DRY | Finite reviewed method and conditions | `contracts/routine.schema.json` | C4 | SPECIFIED — no PortaShape runtime record store |
| CT20 | `Procedure.Run` | DRY | Local method execution/checkpoint state | `contracts/routine-run.schema.json` | C4 | SPECIFIED — no PortaShape runtime record store |
| CT21 | `Publish.Publication` | PUB | Canonical authored content/revision | `contracts/publication.schema.json` | C3 | SPECIFIED — no PortaShape runtime record store |
| CT22 | `Publish.Destination` | PUB | Configured platform/account target | `contracts/destination.schema.json` | C3 | SPECIFIED — no PortaShape runtime record store |
| CT23 | `Publish.Plan` | PUB | Frozen preview intent and confirmation digest | `contracts/publish-plan.schema.json` | C3 | SPECIFIED — no PortaShape runtime record store |
| CT24 | `Publish.Representation` | PUB | One external result and provenance | `contracts/representation.schema.json` | C3 | SPECIFIED — no PortaShape runtime record store |
| CT25 | `Publish.ReplicaSet` | PUB | One object with external representations | `contracts/replica-set.schema.json` | C3 | SPECIFIED — no PortaShape runtime record store |
| CT26 | `Evidence.FidelityReport` | PUB | Preserve/approximate/drop/require | `contracts/fidelity.schema.json` | C3 | SPECIFIED — no PortaShape runtime record store |
| CT27 | `Evidence.ProvenanceRecord` | PS | Causal component/version evidence | `contracts/provenance.schema.json` | C1 | SPECIFIED — no PortaShape runtime record store |
| CT28 | `Trust.CredentialReference` | PUB | Opaque local authorized session reference | `contracts/credential-reference.schema.json` | C3 | SPECIFIED — no PortaShape runtime record store |
| CT29 | `Connector.Descriptor` | EXT | Platform operations/locality/conformance | `contracts/connector-descriptor.schema.json` | C3 | SPECIFIED — no PortaShape runtime record store |

`reference/specs/XtraType_PortaShape_Companion_v0.1/contracts/common.schema.json` supplies common definitions. `operation-payloads.schema.json` contains exact input/output shapes for the operation directory. Every record schema has a same-stem example under `examples/`; those examples structurally validated in the supplied companion evidence.

## Operations

| ID | Operation | Provider | Input | Output | Permission | Effect | Stage | Current implementation |
|---|---|---|---|---|---|---|---|---|
| OP01 | `host.describe` | PS | Host query | Availability manifest | none | read | C1 | SPECIFIED; no PortaShape dispatcher implementation |
| OP02 | `package.list` | PS | Local catalog filter | Package summaries | none | read | C1 | SPECIFIED; no PortaShape dispatcher implementation |
| OP03 | `operation.list` | PS | Host/locality filter | Operation declarations and availability | none | read | C1 | SPECIFIED; no PortaShape dispatcher implementation |
| OP04 | `operation.cancel` | PS | Owned active request | Cancellation acknowledgement and effect state | PM03 | local-write | C1 | SPECIFIED; no PortaShape dispatcher implementation |
| OP05 | `receipt.read` | PS | Owned receipt reference | Authorized Host.Receipt | PM03 | read | C1 | SPECIFIED; no PortaShape dispatcher implementation |
| OP06 | `event.subscribe` | PS | Authorized subject/type + after sequence | Event page or retention-gap result | PM03 | read | C1 | SPECIFIED; no PortaShape dispatcher implementation |
| OP07 | `package.export` | PS | Selected package/revision | Inert source/package bundle | PM15 | read | C1 | SPECIFIED; no PortaShape dispatcher implementation |
| OP08 | `package.inspect` | PS | Package ID | Manifest + installation | none | read | C1 | SPECIFIED; no PortaShape dispatcher implementation |
| OP09 | `package.install` | PS | Manifest + file set | Installation + receipt | PM01 | local-write | C1 | SPECIFIED; no PortaShape dispatcher implementation |
| OP10 | `package.enable` | PS | Package revision + reviewed grants | Installation | PM01 | local-write | C1 | SPECIFIED; no PortaShape dispatcher implementation |
| OP11 | `package.disable` | PS | Package ID | Installation + receipt | PM01 | local-write | C1 | SPECIFIED; no PortaShape dispatcher implementation |
| OP12 | `package.update` | PS | Staged revision | Review result + installation | PM01 | local-write | C1 | SPECIFIED; no PortaShape dispatcher implementation |
| OP13 | `package.remove` | PS | Package ID + retention choice | Receipt | PM01 | local-write | C1 | SPECIFIED; no PortaShape dispatcher implementation |
| OP14 | `context.capture` | PS | Pinned browser context request | Browser.Context | PM02 | read | C1 | SPECIFIED; no PortaShape dispatcher implementation |
| OP15 | `storage.get` | PS | Owned namespace/key | Typed local value | PM03 | read | C1 | SPECIFIED; no PortaShape dispatcher implementation |
| OP16 | `storage.put` | PS | Owned namespace/value | Local commit receipt | PM03 | local-write | C1 | SPECIFIED; no PortaShape dispatcher implementation |
| OP17 | `xtratype.readContext` | XT | Target/Object + local scope | Context page | PM07 | read | C3 | SPECIFIED; no PortaShape dispatcher implementation |
| OP18 | `xtratype.proposeDraft` | XT | Typed draft + context ref | Draft reference | PM08 | local-write | C4 | SPECIFIED; no PortaShape dispatcher implementation |
| OP19 | `xtratype.attachExtension` | XT | AnnotationExtension | Local commit receipt | PM09 | local-write | C3 | SPECIFIED; no PortaShape dispatcher implementation |
| OP20 | `xtratype.relate` | XT | Context.Relationship | Local commit receipt | PM09 | local-write | C3 | SPECIFIED; no PortaShape dispatcher implementation |
| OP21 | `script.importDraft` | SS | Source/template + provenance | Disabled Script.Definition | PM03 | local-write | C2 | SPECIFIED; no PortaShape dispatcher implementation |
| OP22 | `script.execute` | SS | Pinned revision + approved context/input | Host.Receipt | PM04 | page-write | C2 | SPECIFIED; no PortaShape dispatcher implementation |
| OP23 | `script.test` | SS | Revision + controlled fixtures | Fixture results | PM03 | local-write | C2 | SPECIFIED; no PortaShape dispatcher implementation |
| OP24 | `dry.observe` | DRY | Eligible committed input/action | Local observation/pattern result | PM05 | local-write | C2 | SPECIFIED; no PortaShape dispatcher implementation |
| OP25 | `dry.saveTemplate` | DRY | Reviewed template/defaults | TextTemplate | PM03 | local-write | C2 | SPECIFIED; no PortaShape dispatcher implementation |
| OP26 | `dry.insert` | DRY | Resolved text + unchanged target | Insertion receipt | PM06 | page-write | C2 | SPECIFIED; no PortaShape dispatcher implementation |
| OP27 | `dry.run` | DRY | Reviewed Routine + explicit values | Procedure.Run | PM13 | page-write | C4 | SPECIFIED; no PortaShape dispatcher implementation |
| OP28 | `dry.promote` | DRY | Reviewed helper/routine | Script Studio draft reference | PM03 | local-write | C4 | SPECIFIED; no PortaShape dispatcher implementation |
| OP29 | `publish.compose` | PUB | Selected text/media | Publication draft | PM10 | local-write | C3 | SPECIFIED; no PortaShape dispatcher implementation |
| OP30 | `publish.preview` | PUB | Publication revision + destinations | Publish.Plan + fidelity | PM10 | local-write | C3 | SPECIFIED; no PortaShape dispatcher implementation |
| OP31 | `publish.confirm` | PUB | Plan digest + explicit user gesture | Local confirmation receipt | PM11 | local-write | C3 | SPECIFIED; no PortaShape dispatcher implementation |
| OP32 | `publish.execute` | PUB | Confirmed plan reference | Per-target results + ReplicaSet | PM11 | external-write | C3 | SPECIFIED; no PortaShape dispatcher implementation |
| OP33 | `publish.retry` | PUB | Reconciled safe target subset | Per-target results | PM11 | external-write | C3 | SPECIFIED; no PortaShape dispatcher implementation |
| OP34 | `publish.cancel` | PUB | Local publish intent | Cancellation receipt | PM11 | local-write | C3 | SPECIFIED; no PortaShape dispatcher implementation |
| OP35 | `connector.preview` | EXT | Publication + destination snapshot | Target payload + fidelity | PM10 | read | C3 | SPECIFIED; no PortaShape dispatcher implementation |
| OP36 | `connector.resolveAccount` | EXT | Authorized pinned local context | Nonsecret account evidence | PM12 | read | C3 | SPECIFIED; no PortaShape dispatcher implementation |
| OP37 | `connector.create` | EXT | Confirmed immutable target intent | Handle/result/unknown outcome | PM11 | external-write | C3 | SPECIFIED; no PortaShape dispatcher implementation |
| OP38 | `connector.inspectResult` | EXT | Intent/handle + local authority | Reconciliation evidence | PM12 | read | C3 | SPECIFIED; no PortaShape dispatcher implementation |
| OP39 | `data.export` | PS | Explicit record selection | Inert hashed bundle | PM15 | read | C1 | SPECIFIED; no PortaShape dispatcher implementation |
| OP40 | `data.import` | PS | Bounded inert bundle | Staging/conflicts/commit receipt | PM01 | local-write | C1 | SPECIFIED; no PortaShape dispatcher implementation |

The operation names are case-sensitive contract identifiers. Similar current XtraType functions (for example page context reads or annotation writes) are **not** silently equivalent to these operations until an actual PortaShape provider/dispatcher implements the defined input/output, permission and receipt semantics.

## Permissions

| ID | Permission | Owner | Scope | Boundary | Stage |
|---|---|---|---|---|---|
| PM01 | `package.manage` | PS | Trusted management UI only | Install/update/remove selected package | C1 |
| PM02 | `context.read` | PS | Origin + document + allowed fields | No full page/field buffer by default | C1 |
| PM03 | `plugin.storage` | PS | Package namespace + revision | No other plugin or XtraType repository access | C1 |
| PM04 | `page.script` | SS | Revision + explicit site patterns | Shared DOM exposure; no privileged bridge initially | C2 |
| PM05 | `input.observe` | DRY | Site + field category + consent | Sensitive exclusions, TTL and pause | C2 |
| PM06 | `input.insert` | DRY | Current gesture + unchanged target | No implicit submit/send | C2 |
| PM07 | `xtratype.read` | XT | Selected local context resource | No implicit full corpus export | C3 |
| PM08 | `xtratype.draft` | XT | User-reviewed draft | Does not authorize commit/publish | C4 |
| PM09 | `xtratype.extend` | XT | Owned annotation/Object references | Sidecar validation; no v2 envelope overwrite | C3 |
| PM10 | `publish.compose` | PUB | Local draft | No external write | C3 |
| PM11 | `publish.execute` | PUB | Confirmed plan digest + exact destinations | Fresh account/context; no uncertain replay | C3 |
| PM12 | `connector.inspect` | EXT | Selected authorized destination | No account-wide scraping | C3 |
| PM13 | `routine.run` | DRY | Reviewed method + current step grants | 25 steps / 120 seconds initial profile | C4 |
| PM14 | `script.bridge` | SS | Trusted script/revision identity + operation | Unavailable until identity/isolation acceptance | C4 |
| PM15 | `data.export` | PS | Explicit selected records/binaries | No grants, secrets or observation buffers | C1 |

Grants are designed to be local, scoped and revision-aware. Exports/imports do not carry execution authority. Hash identity is not a trust signature.

## Decisions that control interpretation

| ID | Authority | Decision | Consequence |
|---|---|---|---|
| DEC-01 | USER | PortaShape is the wraparound plugin service | Supersedes target interpretation of old ADR-002 |
| DEC-02 | DESIGN | Embed first host in existing extension distribution | No assumed daemon/remote service; replaceable deployment ADR |
| DEC-03 | DESIGN | Privileged module/connector code in host release catalog | Users install package state; no arbitrary worker code import |
| DEC-04 | INHERITED | Imports never transfer execution grants | Device-local authority and review |
| DEC-05 | DESIGN | Preserve annotation v2; add linked extension records | No silent incompatible envelope or database rename |
| DEC-06 | DESIGN | Module-owned finite routines and publish sequences | No omitted general runtime dependency |
| DEC-07 | USER | Script Studio and Stay D.R.Y. are plugins | Their source definitions retained within selected scope |
| DEC-08 | USER | Publisher is core; external platforms are plugins | No generic single mandatory platform implementation |
| DEC-09 | USER | Backend/API/identity/sync deferred | Local editions; blocked sharing/remote execution/continuity |
| DEC-10 | DESIGN | DRY three uses / 14 days; bounded evidence | Defaults exposed and versioned; not historical claims |
| DEC-11 | DESIGN | Confirm immutable plan; uncertain effects never blindly retried | Per-target operation identity and reconciliation |
| DEC-12 | DESIGN | Chrome 138+ userscript release floor; initial no bridge | Retains C16 proposal and verifies platform requirements |
| DEC-13 | DESIGN | Publish.Publication is canonical selected name | Resolves POSH.Publication wording inconsistency |
| DEC-14 | DESIGN | New portashape-local DB; old DB untouched | No cross-database atomicity claim |
| DEC-15 | USER | Web/mobile and shared glossary/registry included | No new third-party API program under deferred services |
| DEC-16 | DESIGN | Specific selected seams replace all-to-all graph | Omitted projects absent from active dependencies |
| DEC-17 | DESIGN | Registry JSON + specs are authoring source; workbook is review surface | Reconcile workbook edits in same change |
| DEC-18 | INHERITED | Two qualified live connector targets plus two labeled stubs | Source goal retained; actual platform feasibility unasserted |

## Acceptance truth

`registry/acceptance.csv` contains AT001–AT052. Every row is recorded as **Not run**. Some 2.4 tests are useful prerequisite evidence for future cases (especially baseline protection), but no acceptance row should be marked passed until its exact companion procedure/expected result has actually been exercised and recorded.

## Structural sources

- Contract schemas: `reference/specs/XtraType_PortaShape_Companion_v0.1/contracts/`
- Examples: `.../examples/`
- Exact operation bindings: `.../registry/operation-contracts.json`
- Registry tables: `.../registry/*.csv`
- Combined authoring registry: `.../registry/registry.json`
- Structural validation evidence: `.../registry/validation.json`
- Workbook consistency evidence: `.../registry/workbook-verification.json`
