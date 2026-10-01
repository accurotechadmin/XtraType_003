# Versioning and the “Update Current Docs” Signal

## Canonical project version

The current canonical project-development version is **XtraType v.003**.

v.003 is a code-bearing corrective client increment. The Chrome/npm/release technical identifier is **2.5.1**. Canonical v.00N project naming and platform-valid SemVer fields remain separate concerns: v.00N records project-development landmarks, while technical SemVer advances when the executable/package surface changes.

## Tiny increments are intentional

The project expects many v.00N increments before v1.0/public maturity. A version may be documentation-only, test-only, client-only, server-only, specification-only, or mixed. Each increment should say which.

## Standing signal: “update current docs”

From v.002 forward, any owner/developer instruction to **update current docs** means perform a documentation synchronization pass, not a single-file edit.

At minimum check:

- root `README.md`;
- root `EXPERT_SESSION_BOOT_PROMPT.md`;
- `reference/ssot/CURRENT_POINTERS.json`;
- `reference/ssot/00_CURRENT_AUTHORITY.md`;
- `reference/ssot/01_DOCUMENT_ROUTER.md` if paths/ownership changed;
- `reference/ssot/02_ANTI_DRIFT_GUARD_DOGS.md` if a new invariant emerged;
- `reference/ssot/decisions/CURRENT_DECISION_REGISTER.md`;
- current `docs/v00N/` status/register files;
- affected forward spec deltas;
- manifests/authority indexes/checksums.

Then decide whether other current SSOT docs are affected. “No change needed” is acceptable only after checking.

## Version promotion

When v.00N becomes v.00N+1:

1. preserve the outgoing current state as a landmark;
2. create the new start-here/status/manifest/log set;
3. update current SSOT pointers to the new version;
4. retire the old active boot prompt and activate the new one;
5. update README current status/version;
6. keep older versioned docs unchanged;
7. record whether application code changed;
8. generate a new package checksum/authority index.

## “Current” is a role, not a filename age

A v.001 document can remain foundational forever but no longer be “current.” A mutable `CURRENT_*` document can be newer and operationally authoritative without demoting the older artifact's historical/foundational value.
