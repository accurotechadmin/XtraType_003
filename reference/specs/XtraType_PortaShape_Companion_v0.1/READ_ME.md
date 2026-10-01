# XtraType and PortaShape — Companion specification set

Edition 0.1, 2026-10-01. Your selected module assignments govern this edition. PortaShape is the wraparound plugin service; XtraType is its first-party Chrome client; Script Studio and Stay D.R.Y. are plugins; Bridges/Universal Publisher is core with platform plugins. Backend/API/identity/sync remains deferred.

Start with [00_READ_ME_AND_AUTHORITY.md](00_READ_ME_AND_AUTHORITY.md). `DESIGN` marks engineering defaults added to make the selected scope implementable and reviewable. Current application behavior remains in the existing XtraType canon.

## Documents

- [00_READ_ME_AND_AUTHORITY.md](00_READ_ME_AND_AUTHORITY.md)
- [01_PORTASHAPE_SERVICE_ARCHITECTURE.md](01_PORTASHAPE_SERVICE_ARCHITECTURE.md)
- [02_PLUGIN_PACKAGE_LIFECYCLE.md](02_PLUGIN_PACKAGE_LIFECYCLE.md)
- [03_SHARED_CONTRACTS_AND_OPERATIONS.md](03_SHARED_CONTRACTS_AND_OPERATIONS.md)
- [04_XTRATYPE_CLIENT_INTEGRATION.md](04_XTRATYPE_CLIENT_INTEGRATION.md)
- [05_SCRIPT_STUDIO_PLUGIN.md](05_SCRIPT_STUDIO_PLUGIN.md)
- [06_STAY_DRY_PLUGIN.md](06_STAY_DRY_PLUGIN.md)
- [07_BRIDGES_UNIVERSAL_PUBLISHER_CORE.md](07_BRIDGES_UNIVERSAL_PUBLISHER_CORE.md)
- [08_EXTERNAL_PLATFORM_PLUGIN_STANDARD.md](08_EXTERNAL_PLATFORM_PLUGIN_STANDARD.md)
- [09_WEB_MOBILE_SURFACES.md](09_WEB_MOBILE_SURFACES.md)
- [10_LOCAL_DATA_AND_DEFERRED_SERVICES.md](10_LOCAL_DATA_AND_DEFERRED_SERVICES.md)
- [11_VERIFICATION_AND_IMPLEMENTATION_SEQUENCE.md](11_VERIFICATION_AND_IMPLEMENTATION_SEQUENCE.md)
- [12_GLOSSARY_REGISTRY_AND_CHANGE_CONTROL.md](12_GLOSSARY_REGISTRY_AND_CHANGE_CONTROL.md)
- [13_SOURCE_TRACEABILITY_AND_DECISIONS.md](13_SOURCE_TRACEABILITY_AND_DECISIONS.md)
- [14_STRUCTURAL_CONTRACT_REFERENCE.md](14_STRUCTURAL_CONTRACT_REFERENCE.md)

## Registry and contracts

- [PortaShape_Relational_Registry_v0.1.xlsx](PortaShape_Relational_Registry_v0.1.xlsx) — 12-sheet index and review workbook.
- [registry/REGISTRY_INDEX.md](registry/REGISTRY_INDEX.md) — complete text inventory.
- [registry/registry.json](registry/registry.json) — normalized registry source.
- [registry/operation-contracts.json](registry/operation-contracts.json) — exact bindings for 40 operations.
- `contracts/` — 29 record schemas, shared definitions and operation payload definitions.
- `examples/` — 29 synthetic structural examples.

Document/registry and authored schema-keyword fixture checks passed. These checks are not full JSON Schema engine certification, application runtime tests or connector qualification. All 52 implementation acceptance cases remain Not run. Workbook formulas were recalculated and exported without formula errors; no desktop Excel execution is claimed. Validation evidence is under `registry/`.

The original comparison and current canon are referenced by provenance; excluded project documents and deferred service implementations are not bundled into the selected specification set.
