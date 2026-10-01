# XtraType v.001 — Ecosystem, Extensibility, and Community Guardrails

## 1. Assumption

People will build scripts, modules, plugins, connectors, templates, routines, schemas, and integrations that the core team did not predict. The architecture must welcome that creativity without making every community artifact equivalent to trusted core code.

## 2. Extension classes must stay distinct

### Custom anchor schema

Inert data describing bounded structured target fields. It does not execute code and must never gain capabilities because it came from a trusted person.

### Userscript

User-authored code in a bounded browser/userscript execution profile. It is not privileged host code by default. Future typed bridges require explicit grants and supported operations.

### PortaShape plugin

Installed package with manifest, identity, lifecycle, namespaced storage, declared operations/permissions, UI contributions, and host-mediated invocation. Installation and enablement are not grants.

### Privileged reviewed package/connector

Code that can cause stronger host or external effects. It belongs to a reviewed release/catalog trust path and must not be replaced by arbitrary downloaded worker code or `eval`-style privilege escalation.

### External connector

Provider-specific transform/effect package with qualification fixtures, mapping/fidelity reporting, credential references, previews/confirmation where required, and truthful effect outcomes.

## 3. Capability principles

- Default deny.
- Grant the operation/site/resource actually needed.
- Separate read, write, execute, publish, observe, and external-effect rights.
- Make grants revocable.
- Do not serialize local grants into portable packages.
- Do not treat package metadata as authority.
- Imported package/script data starts inert until locally reviewed.
- Cleanup UI/event registrations when packages disable/update/remove.
- Attribute errors/effects to package + revision + invocation.

## 4. Community safety without killing experimentation

The platform should support a low-friction local experimentation path while drawing a bright line before privileged distribution. A useful ladder is:

1. draft/source;
2. local validation;
3. fixture/test execution;
4. local user grant;
5. installed package/revision;
6. optional shared package export without grants/secrets;
7. reviewed privileged/catalog release where stronger capabilities are involved.

This allows experimentation without teaching the ecosystem that “downloaded code gets extension authority.”

## 5. Data ownership and namespace discipline

Plugins should write to namespaced repositories unless a host operation explicitly authorizes a first-party record mutation. Cross-plugin reads should be operations/capabilities, not filesystem/database spelunking.

Core XtraType records remain XtraType-owned. PortaShape's object/handle/relationship models can link and extend them without forcing a destructive conversion.

## 6. UI contribution discipline

Community UI must be attributable and removable. The host needs ownership of mounting zones, lifecycle cleanup, accessibility expectations, focus behavior, error isolation, and collision handling. Plugins should not permanently mutate unrelated core UI with no uninstall path.

## 7. Automation and Stay D.R.Y.

Text-assistance observation is especially sensitive. Preserve companion requirements around consent, excluded/sensitive inputs, bounded retention, composition/focus/value semantics, expiry/revocation, explicit review, and no implicit submit/send.

Finite routines need explicit step/time bounds. A routine must not become a hidden general-purpose autonomous agent with unbounded authority merely because users find automation useful.

## 8. Publishing and external effects

Use canonical publication data, explicit destination mappings, fidelity reporting, preview/validation, confirmed plans, per-destination receipts, representation/replica tracking, and reconciliation. A lost response creates an **unknown outcome**; it must not trigger blind retry.

## 9. Interoperability and portability

Portable exports should favor stable schemas, IDs, provenance, representations, and links. Credentials, bearer tokens, grants, observation buffers, and machine-local authority should remain local unless a separately designed secure handoff explicitly says otherwise.

## 10. Community governance data to preserve

As the ecosystem grows, keep enough metadata to answer:

- who authored/published the package;
- exact package/revision hash;
- declared dependencies;
- requested vs granted permissions;
- installation/update history;
- invocation/effect receipts;
- compatibility range;
- deprecation/security status;
- data namespaces owned;
- migration/uninstall cleanup behavior.

Do not let popularity become an implicit security primitive.
