# Authority Classification Rules

Each file in the current package should conceptually fall into one of these classes.

- **CURRENT_MUTABLE** — active pointers/guidance expected to change when current truth changes.
- **V002_LANDMARK** — v.002 instantiation/status/log/manifest records; immutable after v.002 is superseded.
- **EXECUTABLE_CURRENT** — application source/tests/assets that define current behavior.
- **V001_LANDMARK** — preserved v.001 forward records.
- **SEED_FOUNDATION** — Seed 1 current-truth, runtime docs, evidence, source baseline metadata.
- **HISTORICAL_CANON** — frozen historical audit/canon/reference evidence.
- **TARGET_SPEC_FOUNDATION** — selected PortaShape Companion v0.1 target contracts/specification/registry.
- **PRESERVED_LEGACY** — source snapshots, legacy prompts/reports, retired prompts, pre-promotion document copies.
- **PACKAGE_INTEGRITY** — current/historical checksums, manifests, inventories.

Classification does not rank intrinsic worth. It answers two operational questions: **may this file be edited in place?** and **what kind of claim can it prove?**

Only CURRENT_MUTABLE and EXECUTABLE_CURRENT are normally edited in place. EXECUTABLE_CURRENT edits require tests and current-doc synchronization. Versioned landmarks/foundations are superseded by new artifacts, not rewritten.
