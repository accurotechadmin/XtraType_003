# Document Router — What to Read Before You Touch What

Use this as the first routing table for engineering work. Read the listed forward SSOT document **and** the referenced code/legacy/spec sources.

| Change area | Read first | Canonical implementation seams / examples | Foundational or target references |
|---|---|---|---|
| Sidebar UI, navigation refresh, composer, reorderable sections | `02_ANTI_DRIFT_GUARD_DOGS.md`, current status | `ext/sidepanel/index.html`, `app.js`, `style.css`, `ext/service-worker.js` | v.001 architecture map; Seed implementation docs |
| URL/Time/YouTube/GPS/custom anchors | current authority, code map | `ext/core/anchors.js`, `ext/core/schemas.js`, server shared copies, packaged schemas | historical anchor canon; companion XtraType integration/contracts |
| Local persistence / annotation records / blobs | code map, change protocol | `ext/core/db.js`, `records.js` | Annotation v2 / Snapshot v1 canon; storage/sync canon |
| Capture / snapshots / timeline / compare | test/release gates, code map | `ext/core/capture.js`, sidepanel capture UI | v.001 wiring map; historical capture canon |
| Extension commands / omnibox / toolbar badge | code map | `ext/manifest.json`, `ext/service-worker.js`, sidepanel app | current interaction status docs |
| Server APIs / JSON persistence | test/release gates, current status | `server/api/*`, `server/router.php`, `src/server/Repository.php`, `Validation.php` | historical HTTP/storage canon; Seed concern disposition |
| Auth / invitations / admin controls | security gates, decision register | `src/server/Auth.php`, `server/api/auth.php`, `invites.php`, `admin.php` | v.001 current status/foundational decisions; deferred service-plane specs |
| Contacts / DMs / XT Group Chats | security gates, ecosystem scope | `server/api/contacts.php`, `messages.php`, `group-chats.php` | v.001 architecture/status; conversation/message target contracts |
| Synchronization / remote replication | anti-drift + security gates | `ext/core/api.js`, worker sync paths, server annotation APIs | Seed workflows; historical storage/sync; companion deferred services |
| PortaShape host / plugin lifecycle | ecosystem scope + change protocol | no broad runtime implementation yet; add new host code deliberately | companion `01`, `02`, `03`, `10`, `11`, `12`, `13`, contracts/registry |
| Script Studio | ecosystem scope | future plugin/module implementation | companion `05_SCRIPT_STUDIO_PLUGIN.md`, script contracts/examples |
| Stay D.R.Y. | ecosystem scope | future plugin/module implementation | companion `06_STAY_DRY_PLUGIN.md`; consent/exclusion/TTL boundaries |
| Universal Publisher / Bridges | ecosystem scope + effect rules | future core/plugin implementation | companion `07`, destination/publication/plan/receipt/fidelity contracts |
| External connectors | security gates + ecosystem scope | future reviewed connector packages | companion `08`; permissions/grants/invocation/receipt contracts |
| Web/mobile/shared clients | ecosystem scope + code map | current narrow PHP/web assets; future clients | companion `09`; browser-context/representation contracts |
| Documentation-only change | lifecycle + versioning docs | `reference/ssot/`, current `docs/v00N/`, root pointers | preserve v.001/Seed/canon history |
| Release/package | test gates + versioning | manifests, checksums, inventories | v.001 verification policy and evidence discipline |

## Required breadth rule

A small patch may only require the nearest rows. A change to identity, storage, permissions, plugin authority, publication effects, or portable contracts is never “small” just because the diff is short. Those changes require the related foundational canon/specification reading and explicit decision/verification records.

## “I only remember one filename” rescue path

If you are lost, open these in order:

1. root `README.md`;
2. `reference/ssot/README.md`;
3. `reference/ssot/CURRENT_POINTERS.json`;
4. `docs/v003/00_CURRENT_STATUS_2026-10-01T101000-0400.md`;
5. `reference/ssot/02_ANTI_DRIFT_GUARD_DOGS.md`;
6. the row above matching your task.
