# XtraType — Security, privacy, deployment and recovery

**Canon edition:** 1.0 approval candidate · **Baseline:** supplied v2.3 / extension 2.3.0 · **Audit date:** 2026-10-01

## Trust model — current

The extension has broad site access. The configured server receives annotations, quotes, GPS targets, screenshots and large rendered HTML/text when the relevant code path syncs. Auto-sync defaults true. Display name is not identity. There is no encrypted application vault, private/public visibility flag, per-origin exclusion, redaction policy or server-ownership verification. Data is protected only by the surrounding browser/OS/network and any deployment controls an operator adds.

| Boundary | Current control | Remaining exposure |
|---|---|---|
| Host page → quick bar | Open Shadow DOM styles; textContent rendering | Page can access shared DOM, observe quote/draft content or alter/remove overlay |
| Content scripts → privileged worker | Extension-internal runtime messages | No operation-level caller/field policy; unsuitable as future userscript bridge |
| Target/schema input → domain | Partial client checks | Server trusts keys/shape; schema dispatch metadata can override custom kind |
| Extension → remote API | User-configured base, Fetch | No auth/TLS requirement/timeout; sensitive content sent to selected endpoint |
| API → stored records | Lock/temp/rename; limited validation | No access control or tenancy; anybody with reachability can use CRUD |
| Uploaded bytes → disk | Count/size/Fileinfo allowlist/generated names | No dimensions/quota/cleanup/transaction with metadata |
| Server webroot → files | Static hosting under `server/` | `data/*.json` and media share served root; API-only protection would not protect raw data |
| Dynamic record → rendering | Escaped HTML / text nodes | Image URLs not governed by origin policy; malformed shapes can crash views |

No arbitrary schema code evaluation, dynamic `eval`, remote script import or user script execution is currently implemented. Do not characterize primitive schema installation as a code-execution feature. Similarly, no external runtime listener or HTTP call to fetch an arbitrary target URL exists; target URL storage is not a server-side scraper.

## Local development

Required by source: Chrome manifest floor 116; PHP 8.1+ due to `never` return type, Fileinfo, JSON and writable filesystem; modern ES-module-capable Node for supplied tests. This audit used Node 24.19.0. There is no package.json, Composer file, dependency install or build step.

From baseline/project root, the contained development command is:

```bash
php -S localhost:8787 -t server
```

Then visit `http://localhost:8787/`; load `ext/` unpacked through Chrome's extension UI. The default extension API base already matches `/api`. Reload extension after manifest/worker/content-script changes and reload host pages to refresh adapters. A loaded panel may retain state until reopened/refreshed.

**Important source difference:** both supplied launcher scripts use `0.0.0.0:8787`, whereas the README's inline command uses localhost. The scripts can expose the unauthenticated service to reachable network peers. The canon recommends loopback as the next default; no source script has been changed in this documentation task. Mobile/LAN testing requires an explicit deployment decision, usable secure context for browser capabilities, and network/access controls. Do not assume phone localhost points to the desktop or that arbitrary LAN HTTP enables geolocation.

Keep the PHP development server for development. A broader deployment needs protected data paths, authenticated/authorized API and media, TLS, restrictive policy, request/resource limits and deployment-specific validation. These are concrete current gaps, not features already supplied.

## Data protection and backup

Stop or quiesce server writes and copy all four JSON collections plus the media directory as a consistent unit. Include installed disk schemas and configuration needed to interpret them. A running multi-file copy is not guaranteed consistent. Preserve original files before manual repairs. Never treat a corrupted collection returning empty as proof the data has been deleted intentionally.

Extension metadata export is not a complete backup. There is no shipped binary export/import. Retain the browser profile/installation through supported environment backup procedures until a full export exists; this package has no selective restore utility. Do not rename the database, change unpacked extension identity/path casually, delete stores, or remove apparent orphan blobs without a verified recovery plan. Changing extension identity can change accessible storage.

Local and remote storage have no retention policy. API deletion does not free media or cascade replies. Manual JSON edits must respect ID/target/key/attachment relationships and keep a prior copy. No schema migration/version history or rollback command exists.

## Operational symptoms

| Symptom | Current explanation / next diagnostic |
|---|---|
| Toolbar opens no panel | Verify loaded manifest version/path, native side-panel support, worker errors and reload; no popup expected |
| Quick bar unavailable | Check site access and protected URL; panel opening does not imply injection capability |
| file URL can be scripted but cannot be saved as URL target | Separate browser file access from HTTP(S)-only anchor constructor |
| Wrong quote/target after tab switch | Panel has no automatic tab event subscription; nonempty old quote can survive refresh |
| Notes absent from Context Here | Exact current form key vs worker applicability; target field changes may not rerender feed |
| Server unavailable | Test saved API base; full composer may have committed local note; inspect syncState before retrying creation |
| Image disappears offline after sync | Remote descriptor replaced Blob link; do not delete original Blob store |
| Sync complete but items still error | Per-item push failures are swallowed and summary is incomplete |
| Timeline missing another device's capture | No snapshot pull/rehydration implemented |
| Full-page screenshot stops/duplicates | Rate ceiling, fixed UI, dynamic page, memory, tile/size caps and scroll restoration gap |
| YouTube page churns or markers at zero | Observer feedback risk and nullable timestamp coercion |
| Book returns after schema delete | Disk schema remains in catalog; local cache can also republish |
| Health succeeds but writes fail | Health is not a storage/upload test; check filesystem and PHP upload settings |
| Nearby is empty | Location permission/context, actual server GPS corpus, radius, coordinate validity, location freshness |

## Observability and production gates — proposed

Add correlation IDs and typed operation outcomes without logging full sensitive page content. Log local commit separately from remote receipt, capture stage, failing record IDs and retry reason. Surface quota/storage errors and corrupt JSON as explicit recovery states. Do not use events as silent remote telemetry.

A production gate must test authorization on API, direct data paths and media; not just CORS. CORS constrains browser cross-origin reads, not all network clients and not ownership. Define allowed image origins, upload/content limits, deployment headers, authenticated principal and tenant/visibility model before enabling remote collaboration. No license is supplied; establish distribution rights and a license decision before redistributing outside the owner's approved context. This is an unresolved project-governance item, not a legal conclusion.
